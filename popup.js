const saveBtn = document.getElementById("saveCache");
const downloadBtn = document.getElementById("downloadCSV");
const clearBtn = document.getElementById("clearCache");

function notify(msg) {
  // простое уведомление на странице вместо alert
  const notice = document.createElement("div");
  notice.textContent = msg;
  notice.style.position = "fixed";
  notice.style.bottom = "10px";
  notice.style.left = "50%";
  notice.style.transform = "translateX(-50%)";
  notice.style.background = "#333";
  notice.style.color = "#fff";
  notice.style.padding = "8px 12px";
  notice.style.borderRadius = "5px";
  notice.style.zIndex = 9999;
  document.body.appendChild(notice);
  setTimeout(() => document.body.removeChild(notice), 2500);
}

const headers = ["Персонаж", "Пользователь", "LVL", "Убийства", "ILVL", "GS", "AP", "Раса", "Класс", "Ранг"];

saveBtn.addEventListener("click", async () => {
  chrome.tabs.query({active: true, currentWindow: true}, tabs => {
    chrome.tabs.sendMessage(tabs[0].id, {action: "getTableData"}, response => {
      if (!response || !response.data || response.data.length === 0) {
        notify("Не удалось получить данные с текущей страницы");
        return;
      }

      chrome.storage.local.get(["csv_data"], (result) => {
        let existing = result.csv_data || "";

        if (!existing) {
          existing = headers.join(";") + "\n";
        }

        const csvChunk = response.data.map(row => row.join(";")).join("\n") + "\n";

        const updated = existing + csvChunk;

        chrome.storage.local.set({csv_data: updated}, () => {
          notify("Данные добавлены в кэш");
        });
      });
    });
  });
});

downloadBtn.addEventListener("click", () => {
  chrome.storage.local.get(["csv_data"], (result) => {
    const all = result.csv_data || "";
    if (!all) {
      notify("Кэш пуст, нечего скачивать");
      return;
    }
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const blob = new Blob([bom, all], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "guild_members.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notify("Файл скачан");
  });
});

clearBtn.addEventListener("click", () => {
  chrome.storage.local.remove("csv_data", () => {
    notify("Кэш очищен");
  });
});
