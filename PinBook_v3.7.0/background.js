/* Background service worker — handles global keyboard shortcuts
   (chrome://extensions/shortcuts) so they work from any tab, not just
   while the popup/fullview page is open. Reuses the same db.js the
   popup/fullview pages use, so data stays in one place. */

importScripts("db.js");

function randomTilt() {
  return (Math.random() * 3 - 1.5).toFixed(2) + "deg";
}

function flashBadge(text, color) {
  chrome.action.setBadgeText({ text });
  chrome.action.setBadgeBackgroundColor({ color });
  setTimeout(() => chrome.action.setBadgeText({ text: "" }), 1400);
}

async function quickSaveActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.url || !/^https?:\/\//i.test(tab.url)) {
    flashBadge("✕", "#d16a5f");
    return;
  }

  const title = tab.title && tab.title.trim() ? tab.title.trim() : tab.url;

  const allBookmarks = await PinDB.getAllBookmarks();
  const unfiled = allBookmarks.filter((b) => (b.folderId ?? null) === null);
  const order = unfiled.length ? Math.max(...unfiled.map((b) => b.order ?? 0)) + 1 : 1;

  await PinDB.addBookmark({
    title,
    url: tab.url,
    image: null,
    folderId: null, // always goes to "Chưa phân loại", per spec
    createdAt: Date.now(),
    order,
    tilt: randomTilt(),
  });

  chrome.runtime.sendMessage({ type: "pinbook-refresh" }).catch(() => {
    /* no open popup/fullview page listening — nothing to do */
  });

  flashBadge("✓", "#4f8a6d");
}

function openFullview() {
  chrome.tabs.create({ url: chrome.runtime.getURL("fullview.html") });
}

chrome.commands.onCommand.addListener((command) => {
  if (command === "quick-save-unfiled") {
    quickSaveActiveTab();
  } else if (command === "open-fullview") {
    openFullview();
  }
});
