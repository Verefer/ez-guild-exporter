function parseNumber(str) {
  return str?.replace(/[\s\u202F]/g, "").trim() || "0";
}

function extractTableData() {
  const rows = Array.from(document.querySelectorAll("table.ipb_table.characters tr.character"));
  return rows.map(row => {
    const tds = row.querySelectorAll("td");
    const name = row.querySelector(".character-name a")?.textContent.trim();
    const user = row.querySelector(".member span[itemprop='name']")?.textContent.trim();
    const desc = row.querySelector(".character-name .desc")?.textContent.trim();
    const lvl = tds[2]?.textContent.trim();
    const kills = parseNumber(tds[3]?.textContent);
    const ilvl = tds[4]?.textContent.trim();
    const gs = parseNumber(tds[5]?.innerText);
    const ap = parseNumber(tds[6]?.textContent);
    const race = row.querySelector(".character-race")?.getAttribute("title");
    const cls = row.querySelector(".character-class")?.getAttribute("title")?.split("(")[1]?.replace(")", "").trim();

    return [name, user, lvl, kills, ilvl, gs, ap, race, cls, desc];
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getTableData") {
    const data = extractTableData();
    sendResponse({data});
  }
});
