/* PinBook app logic — shared by popup.html and fullview.html */

const els = {
  sidebar: document.getElementById("sidebar"),
  listBreadcrumb: document.getElementById("listBreadcrumb"),
  listItems: document.getElementById("listItems"),
  viewListBtn: document.getElementById("viewListBtn"),
  viewGridBtn: document.getElementById("viewGridBtn"),
  searchInput: document.getElementById("searchInput"),
  filterHasImage: document.getElementById("filterHasImage"),
  filterNoImage: document.getElementById("filterNoImage"),
  searchModesRow: document.getElementById("searchModesRow"),
  btnAdd: document.getElementById("btnAdd"),
  btnSaveTab: document.getElementById("btnSaveTab"),

  overlay: document.getElementById("modalOverlay"),
  modalTitle: document.getElementById("modalTitle"),
  fieldTitle: document.getElementById("fieldTitle"),
  fieldUrl: document.getElementById("fieldUrl"),
  fieldFolder: document.getElementById("fieldFolder"),
  btnCloseModal: document.getElementById("btnCloseModal"),
  btnCancel: document.getElementById("btnCancel"),
  btnSave: document.getElementById("btnSave"),

  folderModalOverlay: document.getElementById("folderModalOverlay"),
  folderModalTitle: document.getElementById("folderModalTitle"),
  folderNameInput: document.getElementById("folderNameInput"),
  btnCloseFolderModal: document.getElementById("btnCloseFolderModal"),
  btnFolderModalCancel: document.getElementById("btnFolderModalCancel"),
  btnFolderModalSave: document.getElementById("btnFolderModalSave"),

  srcTabs: document.querySelectorAll(".src-tab"),
  srcUpload: document.getElementById("srcUpload"),
  srcCapture: document.getElementById("srcCapture"),
  srcUrl: document.getElementById("srcUrl"),
  fileInput: document.getElementById("fileInput"),
  btnCapture: document.getElementById("btnCapture"),
  imageUrlInput: document.getElementById("imageUrlInput"),
  btnFetchImageUrl: document.getElementById("btnFetchImageUrl"),

  imagePreview: document.getElementById("imagePreview"),
  imagePreviewEmpty: document.getElementById("imagePreviewEmpty"),
  btnRemoveImage: document.getElementById("btnRemoveImage"),

  toast: document.getElementById("toast"),
  hoverPreview: document.getElementById("hoverPreview"),
  hoverPreviewImg: document.getElementById("hoverPreviewImg"),

  btnMenu: document.getElementById("btnMenu"),
  menuDropdown: document.getElementById("menuDropdown"),
  menuExpand: document.getElementById("menuExpand"), // absent on the full-tab page
  menuImport: document.getElementById("menuImport"),
  menuExport: document.getElementById("menuExport"),
  menuImportJson: document.getElementById("menuImportJson"),
  menuExportJson: document.getElementById("menuExportJson"),
  importFileInput: document.getElementById("importFileInput"),
  importJsonFileInput: document.getElementById("importJsonFileInput"),

  listView: document.getElementById("listView"),
  contextMenu: document.getElementById("contextMenu"),
  ctxAddBookmark: document.getElementById("ctxAddBookmark"),
  ctxAddFolder: document.getElementById("ctxAddFolder"),

  itemMenu: document.getElementById("itemMenu"),
  itemMenuEdit: document.getElementById("itemMenuEdit"),
  itemMenuDelete: document.getElementById("itemMenuDelete"),
  itemMenuCut: document.getElementById("itemMenuCut"),
  itemMenuCopy: document.getElementById("itemMenuCopy"),
  itemMenuPaste: document.getElementById("itemMenuPaste"),
  itemMenuShowInFolder: document.getElementById("itemMenuShowInFolder"),

  undoToast: document.getElementById("undoToast"),
  undoToastMessage: document.getElementById("undoToastMessage"),
  undoToastBtn: document.getElementById("undoToastBtn"),
  undoToastClose: document.getElementById("undoToastClose"),

  multiSelectBanner: document.getElementById("multiSelectBanner"),
  multiSelectCount: document.getElementById("multiSelectCount"),

  menuShortcuts: document.getElementById("menuShortcuts"),
  shortcutsOverlay: document.getElementById("shortcutsOverlay"),
  btnCloseShortcuts: document.getElementById("btnCloseShortcuts"),
};

let bookmarks = [];
let folders = []; // {id, name, order, createdAt}
let editingId = null;
let currentImageData = null; // dataURL string held while modal open
let activeFilter = "all"; // "all" | "none" | <folderId number>
let viewMode = "list"; // "list" | "grid" (persisted in chrome.storage.local)
let filterHasImage = false; // when true, only bookmarks WITH a preview image show (folders unaffected) — persisted
let filterNoImage = false; // when true, only bookmarks WITHOUT a preview image show (folders unaffected) — persisted; mutually exclusive with filterHasImage
let searchMode = "normal"; // one of SEARCH_MODES' ids — persisted

const SEARCH_MODES = [
  {
    id: "normal",
    label: "Bình thường",
    info: "Tìm các mục chứa đủ tất cả các từ trong ô tìm kiếm, không cần đúng thứ tự và không cần các từ nằm liền nhau.",
  },
  {
    id: "exact-order",
    label: "Đúng thứ tự",
    info: "Tìm các mục chứa đủ tất cả các từ, đúng theo thứ tự bạn gõ từ trái sang phải — nhưng các từ không cần nằm liền nhau, có thể xen nội dung khác ở giữa.",
  },
  {
    id: "any-word",
    label: "Bất kỳ từ nào",
    info: "Tìm các mục chứa ít nhất 1 trong các từ bạn gõ, không cần có đủ tất cả — cho nhiều kết quả rộng hơn chế độ Bình thường.",
  },
  {
    id: "exact-match",
    label: "Liền nhau",
    info: "Tìm các mục chứa đúng cụm từ bạn gõ, theo đúng thứ tự và liền nhau — không tách rời từng từ.",
  },
  {
    id: "title-only",
    label: "Chỉ tên",
    info: "Chỉ tìm theo tên bookmark/thư mục, bỏ qua đường link URL — hữu ích khi từ khóa trùng với nội dung trong URL nhưng bạn chỉ muốn tìm theo tên.",
  },
];

function matchesQuery(text, q) {
  const terms = q.split(/\s+/).filter(Boolean);
  if (searchMode === "exact-order") return termsInOrder(text, terms);
  if (searchMode === "any-word") return terms.some((t) => text.includes(t));
  if (searchMode === "exact-match") return text.includes(q); // "Liền nhau": đúng cụm, đúng thứ tự, liền nhau
  return terms.every((t) => text.includes(t)); // "normal" and "title-only" both use AND-of-words
}

// Each term must occur in "text", each one starting only after the previous
// term's match ends — so all the words show up left-to-right in the order
// given, but (unlike "exact-match"/"Liền nhau") don't need to sit right
// next to each other.
function termsInOrder(text, terms) {
  let pos = 0;
  for (const t of terms) {
    const idx = text.indexOf(t, pos);
    if (idx === -1) return false;
    pos = idx + t.length;
  }
  return true;
}

// ---------- Search mode pills (below the search bar) ----------
let openSearchModeTooltipEl = null;

function closeSearchModeTooltip() {
  if (openSearchModeTooltipEl) {
    openSearchModeTooltipEl.remove();
    openSearchModeTooltipEl = null;
  }
}

function toggleSearchModeTooltip(pill, mode) {
  const alreadyOpenOnThisPill = openSearchModeTooltipEl && openSearchModeTooltipEl.parentElement === pill;
  closeSearchModeTooltip();
  if (alreadyOpenOnThisPill) return;
  const tip = document.createElement("div");
  tip.className = "search-mode-tooltip";
  tip.textContent = mode.info;
  pill.appendChild(tip);
  openSearchModeTooltipEl = tip;
}

function setSearchMode(id) {
  if (searchMode === id) return;
  searchMode = id;
  if (els.searchModesRow) {
    els.searchModesRow.querySelectorAll(".search-mode-pill").forEach((p) => {
      p.classList.toggle("active", p.dataset.mode === id);
    });
  }
  closeSearchModeTooltip();
  try {
    chrome.storage.local.set({ pinbookSearchMode: searchMode });
  } catch {
    /* preference just won't persist */
  }
  renderMainList();
  writeStateToUrl(false);
}

function renderSearchModePills() {
  if (!els.searchModesRow) return;
  els.searchModesRow.querySelectorAll(".search-mode-pill").forEach((p) => p.remove());
  for (const mode of SEARCH_MODES) {
    const pill = document.createElement("button");
    pill.type = "button";
    pill.className = "search-mode-pill" + (mode.id === searchMode ? " active" : "");
    pill.dataset.mode = mode.id;

    const label = document.createElement("span");
    label.textContent = mode.label;

    const info = document.createElement("span");
    info.className = "search-mode-info";
    info.textContent = "i";

    pill.append(label, info);
    pill.addEventListener("click", (e) => {
      if (e.target === info) {
        e.stopPropagation();
        toggleSearchModeTooltip(pill, mode);
        return;
      }
      setSearchMode(mode.id);
    });
    els.searchModesRow.appendChild(pill);
  }
}

document.addEventListener("click", (e) => {
  if (openSearchModeTooltipEl && !e.target.closest(".search-mode-pill")) closeSearchModeTooltip();
});
let selectedItems = []; // [{ type, id }, ...] in no particular order — the multi-select state
let selectionAnchorKey = null; // "type:id" of the last plain (non-shift) click — where a Shift+Click range starts from
// When true, applySelectionClasses() skips its own auto URL-write. Used by
// flows that change the selection as one step of a larger navigation (e.g.
// clicking into a folder, or "Hiển thị trong thư mục") which already end
// with their own explicit writeStateToUrl(push) call — without this, that
// intermediate write would make the final one a no-op (same URL already
// written), silently swallowing what should have been a Back/Forward step.
let suppressSelectionUrlWrite = false;
let suppressClickOnce = false; // set right after a drag ends on the same row, to avoid it also toggling selection
let clipboard = null; // { mode: "cut" | "copy", items: [{ type, id }, ...] }

// Preserve resolution; only shrink very large images. Never distorts aspect ratio.
const MAX_IMG_WIDTH = 1600;
const JPEG_QUALITY = 0.85;

// ---------- Utilities ----------

function toast(message) {
  els.toast.textContent = message;
  els.toast.hidden = false;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => (els.toast.hidden = true), 2200);
}

// ---------- Undo (delete / drag-reorder / cut+paste move / copy+paste) ----------
// A single action-based undo slot — same UX as before (bottom-left snackbar,
// also Ctrl+Z), just no longer limited to deletions: dragging to reorder,
// cutting+pasting (move), and copying+pasting are all undoable too now.
// Only the single most recent action can be undone; undoing or performing
// another undoable action replaces it.

let lastAction = null; // { type: "delete"|"reorder"|"move"|"paste-copy", label, ...payload }
let undoToastTimer = null;

function recordAction(action) {
  lastAction = action;
  showUndoToast(action.message);
}

// Kept for the two existing delete call sites — builds a "delete" action.
function recordDeletion(label, deletedFolders, deletedBookmarks) {
  recordAction({
    type: "delete",
    folders: deletedFolders,
    bookmarks: deletedBookmarks,
    message: `"${label}" đã bị xóa`,
  });
}

function showUndoToast(message) {
  els.undoToastMessage.textContent = message;
  els.undoToast.hidden = false;
  clearTimeout(undoToastTimer);
  undoToastTimer = setTimeout(() => {
    els.undoToast.hidden = true;
  }, 8000);
}

function hideUndoToast() {
  els.undoToast.hidden = true;
  clearTimeout(undoToastTimer);
}

async function undoLastAction() {
  if (!lastAction) return;
  const action = lastAction;
  lastAction = null;
  hideUndoToast();

  if (action.type === "delete") {
    // put() with each item's original id resurrects it exactly as it was —
    // folders first so any code that assumes a parent exists stays
    // consistent, though order doesn't strictly matter since ids are being
    // restored as-is.
    for (const f of action.folders) await PinDB.updateFolder(f);
    for (const b of action.bookmarks) await PinDB.updateBookmark(b);
  } else if (action.type === "reorder") {
    // Put every affected sibling's order value back to what it was right
    // before the drag.
    for (const entry of action.snapshot) {
      const collection = entry.type === "folder" ? folders : bookmarks;
      const item = collection.find((x) => x.id === entry.id);
      if (item && typeof entry.order === "number" && item.order !== entry.order) {
        item.order = entry.order;
        await (entry.type === "folder" ? PinDB.updateFolder(item) : PinDB.updateBookmark(item));
      }
    }
  } else if (action.type === "move") {
    // Put each cut+pasted item back in its original folder, at its original
    // position there.
    for (const entry of action.items) {
      if (entry.type === "folder") {
        const f = folders.find((x) => x.id === entry.id);
        if (f) {
          f.parentId = entry.prevParent;
          f.order = entry.prevOrder;
          await PinDB.updateFolder(f);
        }
      } else {
        const b = bookmarks.find((x) => x.id === entry.id);
        if (b) {
          b.folderId = entry.prevParent;
          b.order = entry.prevOrder;
          await PinDB.updateBookmark(b);
        }
      }
    }
  } else if (action.type === "paste-copy") {
    // The pasted copies are entirely new items (new ids) — undoing just
    // removes them, same as a regular delete of that fresh batch.
    for (const id of action.bookmarkIds) await PinDB.removeBookmark(id);
    for (const id of action.folderIds) await PinDB.removeFolder(id);
  }

  clearSelection();
  await loadAll();
  toast("Đã hoàn tác");
}

els.undoToastBtn.addEventListener("click", undoLastAction);
els.undoToastClose.addEventListener("click", hideUndoToast);

// Floating, original-aspect-ratio preview that pops out larger than the
// card's cropped thumbnail. Positioned near the hovered card, clamped so it
// never runs off the edge of the popup/tab viewport.
function showHoverPreview(anchorEl, imgSrc) {
  els.hoverPreviewImg.src = imgSrc;
  els.hoverPreview.classList.add("visible");

  const position = () => {
    const anchorRect = anchorEl.getBoundingClientRect();
    const pw = els.hoverPreview.offsetWidth;
    const ph = els.hoverPreview.offsetHeight;

    let left = anchorRect.left + anchorRect.width / 2 - pw / 2;
    let top = anchorRect.top - ph - 10;
    if (top < 8) top = anchorRect.bottom + 10; // not enough room above, flip below

    left = Math.max(8, Math.min(left, window.innerWidth - pw - 8));
    top = Math.max(8, Math.min(top, window.innerHeight - ph - 8));

    els.hoverPreview.style.left = left + "px";
    els.hoverPreview.style.top = top + "px";
  };

  // Position twice: immediately (in case the image is already decoded) and
  // once more on load, since natural size affects the preview's box size.
  position();
  els.hoverPreviewImg.onload = position;
  requestAnimationFrame(position);
}

function hideHoverPreview() {
  els.hoverPreview.classList.remove("visible");
}

function getDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function displayUrl(url) {
  return String(url).replace(/^https?:\/\//i, "");
}

function passesImageFilter(b) {
  if (filterHasImage) return !!b.image;
  if (filterNoImage) return !b.image;
  return true;
}

function randomTilt() {
  return (Math.random() * 3 - 1.5).toFixed(2) + "deg";
}

// Scales down only if larger than maxWidth; never upscales, never crops/stretches.
function resizeDataUrl(dataUrl, maxWidth = MAX_IMG_WIDTH, quality = JPEG_QUALITY) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width);
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function folderName(id) {
  const f = folders.find((x) => x.id === id);
  return f ? f.name : null;
}

// Folders and bookmarks that share a parent now live in ONE interleaved
// order sequence (so they can be freely reordered relative to each other,
// not just within their own type).
function nextItemOrder(parentId) {
  const key = parentId ?? null;
  const inFolders = folders.filter((f) => (f.parentId ?? null) === key).map((f) => f.order ?? 0);
  const inBookmarks = bookmarks.filter((b) => (b.folderId ?? null) === key).map((b) => b.order ?? 0);
  const all = inFolders.concat(inBookmarks);
  return all.length ? Math.max(...all) + 1 : 1;
}

// Kept as thin aliases: existing call sites already pass the right parent
// scope for either type, and both now resolve through the same shared
// sequence.
function nextFolderOrder(parentId) {
  return nextItemOrder(parentId);
}
function nextBookmarkOrder(folderId) {
  return nextItemOrder(folderId);
}

// Backfills/repairs the shared order sequence for every parent scope:
//   - Brand new items with no `order` yet get one assigned.
//   - Upgrading from an older version where folders and bookmarks each had
//     their OWN separate 1..N sequence would otherwise collide once merged
//     — detected and renumbered (folders first, then bookmarks, preserving
//     the old visual arrangement as the starting point; freely
//     draggable/interleaveable from then on).
async function ensureItemOrders() {
  const groups = new Map(); // key: parentId (number) or null -> { folders: [], bookmarks: [] }
  function group(parentId) {
    const key = parentId ?? null;
    if (!groups.has(key)) groups.set(key, { folders: [], bookmarks: [] });
    return groups.get(key);
  }
  for (const f of folders) group(f.parentId).folders.push(f);
  for (const b of bookmarks) group(b.folderId).bookmarks.push(b);

  function hasCollision(gf, gb) {
    const seen = new Set();
    for (const item of [...gf, ...gb]) {
      if (typeof item.order !== "number") continue;
      if (seen.has(item.order)) return true;
      seen.add(item.order);
    }
    return false;
  }

  for (const { folders: gf, bookmarks: gb } of groups.values()) {
    const needsWork =
      gf.some((f) => typeof f.order !== "number") || gb.some((b) => typeof b.order !== "number") || hasCollision(gf, gb);
    if (!needsWork) continue;

    gf.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    gb.sort((a, b) => (a.order ?? -a.createdAt) - (b.order ?? -b.createdAt) || b.createdAt - a.createdAt);

    let i = 1;
    for (const f of gf) {
      if (f.order !== i) {
        f.order = i;
        await PinDB.updateFolder(f);
      }
      i++;
    }
    for (const b of gb) {
      if (b.order !== i) {
        b.order = i;
        await PinDB.updateBookmark(b);
      }
      i++;
    }
  }
}

async function createFolder(name, parentId = null) {
  const folder = { name, parentId: parentId ?? null, order: nextFolderOrder(parentId), createdAt: Date.now() };
  const id = await PinDB.addFolder(folder);
  folder.id = id;
  folders.push(folder);
  return folder;
}

// Anything an import would otherwise dump straight into "Chưa phân loại"
// (root-level bookmarks/folders in the source file) goes into this
// dedicated top-level folder instead, so repeated imports don't clutter
// "Chưa phân loại" with a growing pile of unrelated items. Reused (not
// duplicated) across separate import runs.
async function getOrCreateImportedFolder() {
  let f = folders.find((x) => (x.parentId ?? null) === null && x.name === "Imported");
  if (!f) f = await createFolder("Imported", null);
  return f.id;
}

// Inside "Imported", bookmarks that were originally in "Chưa phân loại"
// (before the export) go into their own "Chưa phân loại" subfolder, kept
// first among "Imported"'s children so it's easy to spot. Reused across
// import runs, same as "Imported" itself.
async function getOrCreateImportedUnfiledFolder(importedRootFolderId) {
  let f = folders.find((x) => x.parentId === importedRootFolderId && x.name === "Chưa phân loại");
  if (f) return f.id;

  f = await createFolder("Chưa phân loại", importedRootFolderId);
  const siblingOrders = folders
    .filter((x) => x.parentId === importedRootFolderId && x.id !== f.id)
    .map((x) => x.order ?? 0);
  const minOrder = siblingOrders.length ? Math.min(...siblingOrders) : f.order;
  if (f.order > minOrder - 1) {
    f.order = minOrder - 1;
    await PinDB.updateFolder(f);
  }
  return f.id;
}

function childFolders(parentId) {
  return folders
    .filter((f) => (f.parentId ?? null) === (parentId ?? null))
    .sort((a, b) => a.order - b.order);
}

// Recursively collects a folder's id plus every descendant id (used when
// counting/filtering bookmarks "inside" a folder including its subfolders).
function folderAndDescendantIds(id) {
  const ids = [id];
  for (const child of childFolders(id)) {
    ids.push(...folderAndDescendantIds(child.id));
  }
  return ids;
}

// ---------- Rendering: folder tree ----------

const collapsedFolders = new Set(); // folder ids currently collapsed — persisted, see persistCollapsedFolders()

function persistCollapsedFolders() {
  try {
    chrome.storage.local.set({ pinbookCollapsedFolders: [...collapsedFolders] });
  } catch {
    /* preference just won't persist */
  }
}

function renderFolderTree() {
  els.sidebar.innerHTML = "";

  const allCount = bookmarks.length;
  els.sidebar.appendChild(
    buildFolderRow({ depth: 0, label: "Tất cả", count: allCount, isActive: activeFilter === "all", hasChildren: false, onClick: () => setFilter("all") })
  );

  const noneCount = bookmarks.filter((b) => (b.folderId ?? null) === null).length;
  els.sidebar.appendChild(
    buildFolderRow({ depth: 0, label: "Chưa phân loại", count: noneCount, isActive: activeFilter === "none", hasChildren: false, onClick: () => setFilter("none") })
  );

  function renderLevel(parentId, depth) {
    for (const f of childFolders(parentId)) {
      const kids = childFolders(f.id);
      const recursiveCount = bookmarks.filter((b) => folderAndDescendantIds(f.id).includes(b.folderId)).length;
      const collapsed = collapsedFolders.has(f.id);

      els.sidebar.appendChild(
        buildFolderRow({
          depth,
          label: f.name,
          count: recursiveCount,
          isActive: activeFilter === f.id,
          hasChildren: kids.length > 0,
          collapsed,
          onToggle: () => {
            // "Thu gọn" is remembered for next time PinBook opens; clicking
            // "Mở rộng" again clears that and goes back to "Tự động" (the
            // default — expanded — same as before this was rememberd at all).
            if (collapsed) collapsedFolders.delete(f.id);
            else collapsedFolders.add(f.id);
            persistCollapsedFolders();
            renderFolderTree();
          },
          onClick: () => setFilter(f.id),
          onAddChild: () => addFolderPrompt(f.id),
          onRename: () => renameFolder(f.id),
          onDelete: () => deleteFolder(f.id),
        })
      );

      if (!collapsed) renderLevel(f.id, depth + 1);
    }
  }
  renderLevel(null, 0);

  const addBtn = document.createElement("button");
  addBtn.type = "button";
  addBtn.className = "folder-tree-add";
  addBtn.textContent = "+ Thư mục gốc";
  addBtn.addEventListener("click", () => addFolderPrompt(null));
  els.sidebar.appendChild(addBtn);
}

function buildFolderRow({ depth, label, count, isActive, hasChildren, collapsed, onToggle, onClick, onAddChild, onRename, onDelete }) {
  const row = document.createElement("div");
  row.className = "folder-row" + (isActive ? " active" : "");
  row.style.paddingLeft = 6 + depth * 16 + "px";

  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "folder-toggle";
  toggle.textContent = hasChildren ? (collapsed ? "▸" : "▾") : "";
  toggle.disabled = !hasChildren;
  toggle.title = hasChildren ? (collapsed ? "Mở rộng" : "Thu gọn") : "";
  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    if (onToggle) onToggle();
  });

  const text = document.createElement("span");
  text.className = "folder-row-label";
  text.textContent = label;
  const countSpan = document.createElement("span");
  countSpan.className = "folder-row-count";
  countSpan.textContent = ` (${count})`;
  text.appendChild(countSpan);

  row.append(toggle, text);
  row.addEventListener("click", onClick);

  if (onAddChild || onRename || onDelete) {
    const actions = document.createElement("span");
    actions.className = "folder-row-actions";
    const mk = (label2, title, handler) => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = label2;
      b.title = title;
      b.addEventListener("click", (e) => {
        e.stopPropagation();
        handler();
      });
      return b;
    };
    if (onAddChild) actions.appendChild(mk("+", "Thêm thư mục con", onAddChild));
    if (onRename) actions.appendChild(mk("✎", "Đổi tên thư mục", onRename));
    if (onDelete) actions.appendChild(mk("🗑", "Xóa thư mục", onDelete));
    row.appendChild(actions);
  }

  return row;
}

function setFilter(filter, opts = {}) {
  activeFilter = filter;
  els.searchInput.value = "";
  suppressSelectionUrlWrite = true;
  clearSelection();
  suppressSelectionUrlWrite = false;
  renderFolderTree();
  renderMainList();
  if (!opts.skipUrlUpdate) writeStateToUrl(true);
}

function keyOf(type, id) {
  return `${type}:${id}`;
}

function isItemSelected(type, id) {
  return selectedItems.some((it) => it.type === type && it.id === id);
}

function applySelectionClasses() {
  document.querySelectorAll(".list-row.selected, .tile.selected").forEach((n) => n.classList.remove("selected"));
  for (const it of selectedItems) {
    const el = els.listItems.querySelector(`[data-item-key="${keyOf(it.type, it.id)}"]`);
    if (el) el.classList.add("selected");
  }
  if (selectedItems.length > 1) {
    els.multiSelectCount.textContent = String(selectedItems.length);
    els.multiSelectBanner.hidden = false;
  } else {
    els.multiSelectBanner.hidden = true;
  }
  // Keeps the URL's "sel" param in sync with whatever's now selected — a
  // refinement of the current view, not a new Back/Forward step, so it
  // replaces the current history entry (push=false). Does NOT affect the
  // tab title — updateDocumentTitle() deliberately ignores selection.
  if (!suppressSelectionUrlWrite) writeStateToUrl(false);
}

// Scrolls the given item to the vertical center of its list, instead of
// just-barely-into-view — so an item further down a long folder doesn't
// need a manual scroll to find after jumping to it (e.g. from "Hiển thị
// trong thư mục"). Deferred a frame so it runs after the browser has laid
// out whatever was just rendered.
function scrollItemToCenter(type, id) {
  requestAnimationFrame(() => {
    const el = els.listItems.querySelector(`[data-item-key="${keyOf(type, id)}"]`);
    if (el) el.scrollIntoView({ block: "center" });
  });
}

// Same idea as scrollItemToCenter, but for the current (possibly multi-item)
// selection as a whole — used after something rebuilds the list (e.g.
// switching List/Grid view) so the selected item(s) stay visible, centering
// on whichever selected item is topmost/first in rendered order.
function scrollSelectionToCenter() {
  if (selectedItems.length === 0) return;
  requestAnimationFrame(() => {
    const selectedKeys = new Set(selectedItems.map((it) => keyOf(it.type, it.id)));
    const rendered = Array.from(els.listItems.children).filter((n) => n.dataset.itemKey);
    const selectedEls = rendered.filter((n) => selectedKeys.has(n.dataset.itemKey));
    if (selectedEls.length === 0) return;
    selectedEls[0].scrollIntoView({ block: "center" });
  });
}

function selectSingle(type, id) {
  selectedItems = [{ type, id }];
  selectionAnchorKey = keyOf(type, id);
  applySelectionClasses();
}

// Selects every item between the current anchor and (type, id), inclusive,
// in the order they're currently rendered — this is what makes "Shift+Click
// the last item" grab everything in between, not just the two endpoints.
function selectRangeTo(type, id) {
  const rendered = Array.from(els.listItems.children).filter((n) => n.dataset.itemKey);
  const anchorIdx = rendered.findIndex((n) => n.dataset.itemKey === selectionAnchorKey);
  const toKey = keyOf(type, id);
  const toIdx = rendered.findIndex((n) => n.dataset.itemKey === toKey);
  if (anchorIdx === -1 || toIdx === -1) {
    selectSingle(type, id);
    return;
  }
  const [from, to] = anchorIdx <= toIdx ? [anchorIdx, toIdx] : [toIdx, anchorIdx];
  selectedItems = rendered.slice(from, to + 1).map((n) => {
    const [t, idStr] = n.dataset.itemKey.split(":");
    return { type: t, id: Number(idStr) };
  });
  // Anchor stays put, so further Shift+Clicks keep extending/shrinking from
  // the same starting point (standard file-explorer behavior).
  applySelectionClasses();
}

function clearSelection() {
  selectedItems = [];
  selectionAnchorKey = null;
  applySelectionClasses();
}

// Adds/removes a single item from the current selection without touching
// the rest of it (Ctrl+Click) — lets discontiguous items across the list
// be selected together, unlike Shift+Click's contiguous range. Also
// becomes the new anchor, so a later Shift+Click ranges from here.
function toggleSelect(type, id) {
  const idx = selectedItems.findIndex((it) => it.type === type && it.id === id);
  if (idx === -1) selectedItems.push({ type, id });
  else selectedItems.splice(idx, 1);
  selectionAnchorKey = keyOf(type, id);
  applySelectionClasses();
}

// Returns `items` (a selection of { type, id }) sorted by their actual
// position among their siblings (the "order" field) rather than the order
// they happened to be clicked/selected in. A discontiguous multi-selection
// (built via Ctrl+Click) is always stored/pasted/moved in this original
// left-to-right order, so Cắt/Sao chép/Dán and Kéo-thả land the items
// contiguous and correctly ordered at their destination, regardless of
// which one the user happened to Ctrl+Click first.
function sortByOriginalOrder(items) {
  return items.slice().sort((a, b) => {
    const da = (a.type === "folder" ? folders : bookmarks).find((x) => x.id === a.id);
    const db = (b.type === "folder" ? folders : bookmarks).find((x) => x.id === b.id);
    return (da?.order ?? 0) - (db?.order ?? 0);
  });
}

// Click once to select/highlight a bookmark; click the same one again to
// open it in a new tab. Shift+Click selects the whole range from the last
// plain click. Ctrl+Click toggles just that one item in/out of the
// selection, leaving the rest of it untouched (discontiguous multi-select).
// Clicking plainly while several items are selected collapses back down to
// just the clicked one (standard multi-select convention).
function handleBookmarkClick(el, b, shiftKey, ctrlKey) {
  if (suppressClickOnce) {
    suppressClickOnce = false;
    return;
  }
  if (shiftKey && selectionAnchorKey) {
    selectRangeTo("bookmark", b.id);
    return;
  }
  if (ctrlKey) {
    toggleSelect("bookmark", b.id);
    return;
  }
  if (selectedItems.length === 1 && isItemSelected("bookmark", b.id)) {
    hideHoverPreview();
    chrome.tabs.create({ url: b.url });
    return; // selection stays as-is — opening a link no longer clears it
  }
  selectSingle("bookmark", b.id);
}

// Same click-to-select parity as bookmarks: first click just selects
// (bolds) the folder. Clicking the already-selected folder again — or
// double-clicking it — navigates into it. Ctrl+Click toggles it in/out of
// a discontiguous multi-selection instead of navigating.
function handleFolderClick(el, f, shiftKey, ctrlKey) {
  if (suppressClickOnce) {
    suppressClickOnce = false;
    return;
  }
  if (shiftKey && selectionAnchorKey) {
    selectRangeTo("folder", f.id);
    return;
  }
  if (ctrlKey) {
    toggleSelect("folder", f.id);
    return;
  }
  if (selectedItems.length === 1 && isItemSelected("folder", f.id)) {
    els.searchInput.value = "";
    suppressSelectionUrlWrite = true;
    clearSelection();
    suppressSelectionUrlWrite = false;
    setFilter(f.id);
    return;
  }
  selectSingle("folder", f.id);
}

function handleFolderDblClick(f) {
  els.searchInput.value = "";
  suppressSelectionUrlWrite = true;
  clearSelection();
  suppressSelectionUrlWrite = false;
  setFilter(f.id);
}

// Both "Thêm thư mục mới" and "Đổi tên thư mục" now share the exact same
// modal (title changes to match) — including Enter-to-save — instead of
// "Thêm thư mục mới" using a plain browser prompt() like before.
let folderModalMode = "rename"; // "rename" | "add"
let folderRenameTargetId = null;
let folderAddParentId = null;

function addFolderPrompt(parentId) {
  folderModalMode = "add";
  folderAddParentId = parentId;
  folderRenameTargetId = null;
  els.folderModalTitle.textContent = "Thêm thư mục mới";
  els.folderNameInput.value = "";
  els.folderModalOverlay.hidden = false;
  els.folderNameInput.focus();
}

function renameFolder(id) {
  const f = folders.find((x) => x.id === id);
  if (!f) return;
  folderModalMode = "rename";
  folderRenameTargetId = id;
  folderAddParentId = null;
  els.folderModalTitle.textContent = "Đổi tên thư mục";
  els.folderNameInput.value = f.name;
  els.folderModalOverlay.hidden = false;
  els.folderNameInput.focus();
  els.folderNameInput.select();
}

function closeFolderRenameModal() {
  els.folderModalOverlay.hidden = true;
  folderRenameTargetId = null;
  folderAddParentId = null;
}

async function saveFolderRename() {
  const name = els.folderNameInput.value.trim();
  if (!name) {
    toast("Vui lòng nhập tên thư mục");
    return;
  }

  if (folderModalMode === "add") {
    const parentId = folderAddParentId;
    const folder = await createFolder(name, parentId);
    if (parentId != null) collapsedFolders.delete(parentId);
    renderFolderTree();
    renderMainList();
    toast(`Đã tạo thư mục "${folder.name}"`);
    closeFolderRenameModal();
    return;
  }

  const f = folders.find((x) => x.id === folderRenameTargetId);
  if (!f) {
    closeFolderRenameModal();
    return;
  }
  if (name !== f.name) {
    f.name = name;
    await PinDB.updateFolder(f);
    renderFolderTree();
    renderMainList();
  }
  closeFolderRenameModal();
}

// The actual mutation, with no confirm/toast/render — reused by both the
// single-item delete (below) and bulk multi-select delete.
// Gathers a folder plus every descendant folder and bookmark inside it
// (at any depth) — used both to actually delete them and to snapshot them
// for undo.
function collectFolderSubtree(id) {
  const folderIds = [id];
  const stack = [id];
  while (stack.length) {
    const cur = stack.pop();
    for (const child of folders.filter((f) => (f.parentId ?? null) === cur)) {
      folderIds.push(child.id);
      stack.push(child.id);
    }
  }
  const collectedFolders = folders.filter((f) => folderIds.includes(f.id)).map((f) => ({ ...f }));
  const collectedBookmarks = bookmarks
    .filter((b) => b.folderId != null && folderIds.includes(b.folderId))
    .map((b) => ({ ...b }));
  return { collectedFolders, collectedBookmarks };
}

// Deletes a folder AND everything inside it (subfolders, bookmarks, at any
// depth) — no more "promote children up" behavior. Returns the snapshot
// (pre-deletion clones) so the caller can offer Undo.
async function performFolderDeletion(id) {
  const { collectedFolders, collectedBookmarks } = collectFolderSubtree(id);

  for (const b of collectedBookmarks) await PinDB.removeBookmark(b.id);
  for (const f of collectedFolders) await PinDB.removeFolder(f.id);

  const deletedBookmarkIds = new Set(collectedBookmarks.map((b) => b.id));
  const deletedFolderIds = new Set(collectedFolders.map((f) => f.id));
  bookmarks = bookmarks.filter((b) => !deletedBookmarkIds.has(b.id));
  folders = folders.filter((f) => !deletedFolderIds.has(f.id));

  if (deletedFolderIds.has(activeFilter)) {
    activeFilter = "all";
    writeStateToUrl(false); // in case the deleted folder was the one currently open
  }

  let collapsedChanged = false;
  for (const id of deletedFolderIds) {
    if (collapsedFolders.delete(id)) collapsedChanged = true;
  }
  if (collapsedChanged) persistCollapsedFolders();

  return { collectedFolders, collectedBookmarks };
}

async function deleteFolder(id) {
  const f = folders.find((x) => x.id === id);
  if (!f) return;

  const { collectedFolders, collectedBookmarks } = await performFolderDeletion(id);
  clearSelection();
  renderFolderTree();
  renderMainList();
  recordDeletion(f.name, collectedFolders, collectedBookmarks);
}

// ---------- Rendering: main list (right pane) ----------

function renderMainList() {
  hideHoverPreview();
  renderBreadcrumb();

  const q = els.searchInput.value.trim().toLowerCase();

  if (q) {
    renderListBody(buildSearchResultItems(q, activeFilter), "Không tìm thấy bookmark hoặc thư mục phù hợp.");
    return;
  }

  if (activeFilter === "all") {
    // "order" is only meaningful among siblings of the same folder; this
    // view mixes bookmarks from every folder, so keep it newest-first.
    const list = bookmarks.filter(passesImageFilter).sort((a, b) => b.createdAt - a.createdAt);
    renderListBody(
      list.map((b) => ({ type: "bookmark", data: b })),
      'Bảng ghim còn trống. Nhấn "+ Thêm" hoặc "+ Tab này" để bắt đầu.'
    );
    return;
  }

  if (activeFilter === "none") {
    const list = bookmarks
      .filter((b) => (b.folderId ?? null) === null && passesImageFilter(b))
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    renderListBody(
      list.map((b) => ({ type: "bookmark", data: b })),
      "Chưa có bookmark nào ở đây."
    );
    return;
  }

  // A specific folder: subfolders and bookmarks now share one order
  // sequence, so they can be interleaved (not folders-then-bookmarks).
  // Subfolders are never filtered by "Ảnh Preview" — only bookmarks are.
  const subFolders = childFolders(activeFilter);
  const list = bookmarks.filter((b) => b.folderId === activeFilter && passesImageFilter(b));
  const items = [
    ...subFolders.map((f) => ({ type: "folder", data: f, order: f.order ?? 0 })),
    ...list.map((b) => ({ type: "bookmark", data: b, order: b.order ?? 0 })),
  ]
    .sort((a, b) => a.order - b.order)
    .map(({ type, data }) => ({ type, data }));
  renderListBody(items, "Thư mục này chưa có mục nào.");
}

// Search results, ordered top-to-bottom the same way the sidebar tree is
// ordered: walk the folder tree depth-first (respecting each folder's own
// sort order), and for every folder that matches — or that directly
// contains a matching bookmark — show that folder immediately followed by
// its own matching bookmarks, before moving on to the next folder. This
// keeps results grouped folder-by-folder instead of "all folders, then all
// bookmarks".
function buildSearchResultItems(q, scope) {
  // scope mirrors whatever's currently selected in the sidebar — "all",
  // "none", or a specific folder id — so the search only looks inside
  // whatever's currently open. Picking "Tất cả" is what searches
  // everywhere, the same range the search bar always used to cover.
  const matchFolder = (f) => matchesQuery(f.name.toLowerCase(), q);
  const matchBookmark = (b) => {
    const text = searchMode === "title-only" ? b.title.toLowerCase() : `${b.title} ${b.url}`.toLowerCase();
    return matchesQuery(text, q);
  };
  const items = [];

  // Within any given folder, only items whose OWN name matches are shown —
  // a non-matching folder is never shown just because something inside it
  // matches; it's simply skipped over (while still descending into it to
  // find deeper matches). Matching subfolders come before matching
  // bookmarks of that same parent, same as a normal folder view. Folders
  // are never affected by the "Ảnh Preview" filter — only bookmarks are.
  function processFolder(folder) {
    const subs = childFolders(folder.id);
    const ownBookmarks = bookmarks.filter((b) => b.folderId === folder.id);
    const combined = [
      ...subs.map((f) => ({ type: "folder", data: f, order: f.order ?? 0 })),
      ...ownBookmarks.map((b) => ({ type: "bookmark", data: b, order: b.order ?? 0 })),
    ].sort((a, b) => a.order - b.order);

    for (const entry of combined) {
      if (entry.type === "folder") {
        if (matchFolder(entry.data)) items.push({ type: "folder", data: entry.data });
        processFolder(entry.data);
      } else if (matchBookmark(entry.data) && passesImageFilter(entry.data)) {
        items.push({ type: "bookmark", data: entry.data });
      }
    }
  }

  if (scope === "none") {
    // "Chưa phân loại" has no subfolders — only its own bookmarks are in scope.
    const unfiled = bookmarks
      .filter((b) => (b.folderId ?? null) === null && matchBookmark(b) && passesImageFilter(b))
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    for (const b of unfiled) items.push({ type: "bookmark", data: b });
    return items;
  }

  if (typeof scope === "number") {
    // A specific folder: search only its own subtree — not sibling
    // folders, not "Chưa phân loại", and not the folder itself (its name
    // isn't tested against the query since you're already inside it).
    const folder = folders.find((f) => f.id === scope);
    if (folder) processFolder(folder);
    return items;
  }

  // scope === "all" — the original, unscoped range: "Chưa phân loại" first
  // (mirroring how it sits above the real folder tree in the sidebar),
  // then the whole folder tree from the root down.
  const unfiled = bookmarks
    .filter((b) => (b.folderId ?? null) === null && matchBookmark(b) && passesImageFilter(b))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  for (const b of unfiled) items.push({ type: "bookmark", data: b });

  for (const f of childFolders(null)) {
    if (matchFolder(f)) items.push({ type: "folder", data: f });
    processFolder(f);
  }

  return items;
}

function renderBreadcrumb() {
  els.listBreadcrumb.innerHTML = "";
  const q = els.searchInput.value.trim();

  const addCrumb = (label, clickFilter, isCurrent, extraClass) => {
    if (els.listBreadcrumb.children.length > 0) {
      const sep = document.createElement("span");
      sep.className = "crumb-sep";
      sep.textContent = "›";
      els.listBreadcrumb.appendChild(sep);
    }
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "crumb" + (isCurrent ? " current" : " clickable") + (extraClass ? ` ${extraClass}` : "");
    btn.textContent = label;
    if (!isCurrent) {
      btn.addEventListener("click", () => {
        els.searchInput.value = "";
        setFilter(clickFilter);
      });
    }
    els.listBreadcrumb.appendChild(btn);
  };

  if (q) {
    let scopeLabel;
    if (activeFilter === "all") {
      scopeLabel = "Tất cả";
    } else if (activeFilter === "none") {
      scopeLabel = "Chưa phân loại";
    } else {
      const f = folders.find((x) => x.id === activeFilter);
      scopeLabel = f ? f.name : "Tất cả";
    }
    addCrumb(`Kết quả tìm kiếm cho "${q}" trong ${scopeLabel}`, null, true, "crumb-search-current");
    return;
  }
  if (activeFilter === "all") {
    addCrumb("Tất cả", "all", true);
    return;
  }
  if (activeFilter === "none") {
    addCrumb("Chưa phân loại", "none", true);
    return;
  }

  const chain = [];
  let cur = folders.find((f) => f.id === activeFilter);
  while (cur) {
    chain.unshift(cur);
    cur = folders.find((f) => f.id === (cur.parentId ?? null));
  }
  addCrumb("Tất cả", "all", false);
  chain.forEach((f, i) => addCrumb(f.name, f.id, i === chain.length - 1));
}

function renderListBody(items, emptyMessage) {
  els.listItems.innerHTML = "";
  els.listItems.classList.toggle("grid-mode", viewMode === "grid");

  if (items.length === 0) {
    const p = document.createElement("div");
    p.className = "list-empty";
    p.textContent = emptyMessage;
    els.listItems.appendChild(p);
    return;
  }

  const buildFolder = viewMode === "grid" ? buildFolderTile : buildFolderListRow;
  const buildBookmark = viewMode === "grid" ? buildBookmarkTile : buildBookmarkListRow;

  for (const item of items) {
    els.listItems.appendChild(item.type === "folder" ? buildFolder(item.data) : buildBookmark(item.data));
  }
}

function setViewMode(mode) {
  if (mode === viewMode) return;
  viewMode = mode;
  els.viewListBtn.classList.toggle("active", mode === "list");
  els.viewGridBtn.classList.toggle("active", mode === "grid");
  try {
    chrome.storage.local.set({ pinbookViewMode: mode });
  } catch {
    /* ignore storage errors, preference just won't persist */
  }
  renderMainList();
  applySelectionClasses(); // renderMainList rebuilds the DOM from scratch — the
                            // previously-selected item(s) need their "selected"
                            // class reapplied here, or the switch would silently
                            // drop the selection visually
  scrollSelectionToCenter();
}

els.viewListBtn.addEventListener("click", () => setViewMode("list"));
els.viewGridBtn.addEventListener("click", () => setViewMode("grid"));

// ---------- Drag-and-drop reorder (full-tab view, List View only) ----------
// Reordering only makes sense among siblings of the same type currently
// visible in the list (folders among folders, bookmarks among bookmarks) —
// the list view only ever shows one folder's contents at a time, so this
// is a same-folder reorder, not a move between folders (Cắt/Dán covers
// that case instead).

let dropIndicatorEl = null;

function showDropIndicator(referenceEl, position) {
  if (!dropIndicatorEl) {
    dropIndicatorEl = document.createElement("div");
    dropIndicatorEl.className = "drop-indicator";
    els.listItems.appendChild(dropIndicatorEl);
  }
  const containerRect = els.listItems.getBoundingClientRect();
  const refRect = referenceEl.getBoundingClientRect();
  const y = (position === "before" ? refRect.top : refRect.bottom) - containerRect.top + els.listItems.scrollTop;
  dropIndicatorEl.style.top = y + "px";
}

function hideDropIndicator() {
  if (dropIndicatorEl) {
    dropIndicatorEl.remove();
    dropIndicatorEl = null;
  }
}

// Pure function (unit-tested separately): given the current visual order of
// sibling items — each { type, id }, folders and bookmarks mixed together —
// works out where the dragged item(s) end up after being inserted relative
// to `insertion.referenceType`/`insertion.referenceId`. Accepts one or
// several dragged items (multi-select drag); their relative order among
// themselves is preserved at the new spot.
function computeReorderedItems(siblingItems, draggedItems, insertion) {
  if (!insertion) return siblingItems;
  const isDragged = (it) => draggedItems.some((d) => d.type === it.type && d.id === it.id);
  const withoutDragged = siblingItems.filter((it) => !isDragged(it));
  const idx = withoutDragged.findIndex((it) => it.type === insertion.referenceType && it.id === insertion.referenceId);
  if (idx === -1) return siblingItems;
  const insertAt = insertion.position === "before" ? idx : idx + 1;
  const orderedDragged = siblingItems.filter(isDragged); // preserve their original relative order
  const result = withoutDragged.slice();
  result.splice(insertAt, 0, ...orderedDragged);
  return result;
}

async function applyReorder(draggedItems, insertion) {
  const siblingItems = Array.from(els.listItems.children)
    .filter((n) => n.dataset.itemKey)
    .map((n) => {
      const [type, idStr] = n.dataset.itemKey.split(":");
      return { type, id: Number(idStr) };
    });

  const newOrderItems = computeReorderedItems(siblingItems, draggedItems, insertion);
  if (JSON.stringify(newOrderItems) === JSON.stringify(siblingItems)) return;

  // Snapshot every affected sibling's order BEFORE touching it, so Ctrl+Z
  // can put them all back exactly where they were.
  const snapshot = siblingItems.map((it) => {
    const item = (it.type === "folder" ? folders : bookmarks).find((x) => x.id === it.id);
    return { type: it.type, id: it.id, order: item ? item.order : undefined };
  });

  for (let i = 0; i < newOrderItems.length; i++) {
    const { type, id } = newOrderItems[i];
    const collection = type === "folder" ? folders : bookmarks;
    const updateFn = type === "folder" ? PinDB.updateFolder : PinDB.updateBookmark;
    const item = collection.find((x) => x.id === id);
    if (item && item.order !== i + 1) {
      item.order = i + 1;
      await updateFn(item);
    }
  }
  recordAction({ type: "reorder", snapshot, message: "Đã sắp xếp lại" });
  renderMainList();
  applySelectionClasses(); // renderMainList rebuilt the DOM from scratch — the
                            // dragged item(s) need their "selected" class reapplied
  renderFolderTree(); // keeps the sidebar's folder order in sync immediately
                       // (it was previously stale until the next full reload/F5)
}

function wireDrag(el, type, id) {
  el.addEventListener("mousedown", (e) => {
    if (e.button !== 0) return;
    if (e.target.closest(".list-row-actions")) return;

    // Always suppress native text-selection-via-drag on rows, even when
    // reordering itself won't actually happen right now (popup/grid view,
    // or while search results are shown) — otherwise attempting to drag
    // still highlights the row's text with nothing else visibly happening.
    e.preventDefault();

    if (!document.body.classList.contains("fullview") || viewMode !== "list") return;
    if (els.searchInput.value.trim() !== "") return; // no reordering while viewing search results

    // Dragging a row that's part of the current multi-selection drags the
    // whole selection together; dragging an unselected row drags just that
    // one. Figure out which items are being dragged WITHOUT touching
    // selection state yet — a plain click (no actual drag) must fall
    // through to the normal click handler unchanged.
    const isPartOfMultiSelection = selectedItems.length > 1 && isItemSelected(type, id);
    const draggedItems = isPartOfMultiSelection ? selectedItems.slice() : [{ type, id }];
    const draggedKeys = new Set(draggedItems.map((it) => keyOf(it.type, it.id)));
    const draggedEls = Array.from(els.listItems.children).filter((n) => draggedKeys.has(n.dataset.itemKey));

    const startX = e.clientX;
    const startY = e.clientY;
    let dragging = false;
    let pill = null;
    let pendingInsertion = null;

    function allOtherSiblings() {
      return Array.from(els.listItems.children).filter((n) => n.dataset.itemKey && !draggedKeys.has(n.dataset.itemKey));
    }

    function referenceOf(sib) {
      const [refType, refIdStr] = sib.dataset.itemKey.split(":");
      return { referenceType: refType, referenceId: Number(refIdStr) };
    }

    function onMove(ev) {
      if (!dragging) {
        if (Math.abs(ev.clientX - startX) < 6 && Math.abs(ev.clientY - startY) < 6) return;
        dragging = true;
        if (!isPartOfMultiSelection) selectSingle(type, id); // now that a real drag is happening
        for (const dEl of draggedEls) dEl.classList.add("drag-source");
        els.listItems.classList.add("dragging"); // suppresses :hover highlight on rows the cursor passes over
        pill = document.createElement("div");
        pill.className = "drag-pill";
        pill.textContent =
          draggedItems.length > 1
            ? `${draggedItems.length} mục đã chọn`
            : el.querySelector(".list-row-title")?.textContent || "";
        document.body.appendChild(pill);
      }
      pill.style.left = ev.clientX + "px";
      pill.style.top = ev.clientY + "px";

      const siblings = allOtherSiblings();
      let matched = false;
      for (const sib of siblings) {
        const rect = sib.getBoundingClientRect();
        if (ev.clientY >= rect.top && ev.clientY <= rect.bottom) {
          const position = ev.clientY < rect.top + rect.height / 2 ? "before" : "after";
          pendingInsertion = { ...referenceOf(sib), position };
          showDropIndicator(sib, position);
          matched = true;
          break;
        }
      }
      if (!matched && siblings.length) {
        const first = siblings[0];
        const last = siblings[siblings.length - 1];
        if (ev.clientY < first.getBoundingClientRect().top) {
          pendingInsertion = { ...referenceOf(first), position: "before" };
          showDropIndicator(first, "before");
        } else if (ev.clientY > last.getBoundingClientRect().bottom) {
          pendingInsertion = { ...referenceOf(last), position: "after" };
          showDropIndicator(last, "after");
        }
      }
    }

    async function onUp() {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      if (pill) pill.remove();
      for (const dEl of draggedEls) dEl.classList.remove("drag-source");
      els.listItems.classList.remove("dragging");
      hideDropIndicator();

      if (dragging) {
        suppressClickOnce = true;
        if (pendingInsertion) await applyReorder(draggedItems, pendingInsertion);
      }
    }

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  });
}

function buildFolderListRow(f) {
  const row = document.createElement("div");
  row.className = "list-row";
  row.dataset.itemKey = `folder:${f.id}`;

  const icon = document.createElement("div");
  icon.className = "list-row-icon";
  icon.textContent = "📁";

  const main = document.createElement("div");
  main.className = "list-row-main";
  const title = document.createElement("div");
  title.className = "list-row-title";
  title.textContent = f.name;
  const meta = document.createElement("div");
  meta.className = "list-row-meta";
  const itemCount = childFolders(f.id).length + bookmarks.filter((b) => b.folderId === f.id).length;
  meta.textContent = `${itemCount} mục`;
  main.append(title, meta);

  const actions = document.createElement("div");
  actions.className = "list-row-actions";
  const moreBtn = document.createElement("button");
  moreBtn.textContent = "⋮";
  moreBtn.title = "Tùy chọn";
  moreBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    openItemMenu(e, "folder", f.id, row);
  });
  actions.append(moreBtn);

  row.append(icon, main, actions);
  row.addEventListener("click", (e) => handleFolderClick(row, f, e.shiftKey, e.ctrlKey || e.metaKey));
  row.addEventListener("dblclick", () => handleFolderDblClick(f));
  wireDrag(row, "folder", f.id);
  return row;
}

function buildBookmarkListRow(b) {
  const row = document.createElement("div");
  row.className = "list-row";
  row.dataset.itemKey = `bookmark:${b.id}`;

  const thumb = document.createElement(b.image ? "img" : "div");
  if (b.image) {
    thumb.src = b.image;
    thumb.className = "list-row-thumb";
    thumb.alt = b.title;
    thumb.addEventListener("mouseenter", () => showHoverPreview(thumb, b.image));
    thumb.addEventListener("mouseleave", hideHoverPreview);
  } else {
    thumb.className = "list-row-icon";
    thumb.textContent = "🔗";
  }

  const main = document.createElement("div");
  main.className = "list-row-main";
  const title = document.createElement("div");
  title.className = "list-row-title";
  title.textContent = b.title || "(Không có tên)";
  const meta = document.createElement("div");
  meta.className = "list-row-meta";
  meta.textContent = displayUrl(b.url);
  main.append(title, meta);

  const actions = document.createElement("div");
  actions.className = "list-row-actions";
  const moreBtn = document.createElement("button");
  moreBtn.textContent = "⋮";
  moreBtn.title = "Tùy chọn";
  moreBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    openItemMenu(e, "bookmark", b.id, row);
  });
  actions.append(moreBtn);

  row.append(thumb, main, actions);
  row.addEventListener("click", (e) => handleBookmarkClick(row, b, e.shiftKey, e.ctrlKey || e.metaKey));
  wireDrag(row, "bookmark", b.id);
  return row;
}

// Prevents Shift+Click (range-select) and plain click-drag from triggering
// the browser's native text-selection highlighting on a tile/row. List rows
// already get this via wireDrag's own mousedown handler; Grid View tiles
// have no drag system, so they need it wired directly.
function suppressTextSelectOnMousedown(el) {
  el.addEventListener("mousedown", (e) => {
    if (e.button !== 0) return;
    if (e.target.closest(".tile-actions")) return;
    e.preventDefault();
  });
}

function buildFolderTile(f) {
  const tile = document.createElement("div");
  tile.className = "tile";
  tile.dataset.itemKey = `folder:${f.id}`;

  const thumbWrap = document.createElement("div");
  thumbWrap.className = "tile-thumb-wrap";
  const icon = document.createElement("div");
  icon.className = "tile-folder-icon";
  icon.textContent = "📁";
  thumbWrap.appendChild(icon);

  const title = document.createElement("div");
  title.className = "tile-title";
  title.textContent = f.name;
  const meta = document.createElement("div");
  meta.className = "tile-meta";
  const itemCount = childFolders(f.id).length + bookmarks.filter((b) => b.folderId === f.id).length;
  meta.textContent = `${itemCount} mục`;

  const actions = document.createElement("div");
  actions.className = "tile-actions";
  const moreBtn = document.createElement("button");
  moreBtn.textContent = "⋮";
  moreBtn.title = "Tùy chọn";
  moreBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    openItemMenu(e, "folder", f.id, tile);
  });
  actions.append(moreBtn);
  thumbWrap.appendChild(actions);

  tile.append(thumbWrap, title, meta);
  tile.addEventListener("click", (e) => handleFolderClick(tile, f, e.shiftKey, e.ctrlKey || e.metaKey));
  tile.addEventListener("dblclick", () => handleFolderDblClick(f));
  suppressTextSelectOnMousedown(tile);
  return tile;
}

function buildBookmarkTile(b) {
  const tile = document.createElement("div");
  tile.className = "tile";
  tile.dataset.itemKey = `bookmark:${b.id}`;

  const thumbWrap = document.createElement("div");
  thumbWrap.className = "tile-thumb-wrap";
  if (b.image) {
    const img = document.createElement("img");
    img.src = b.image;
    img.className = "tile-thumb";
    img.alt = b.title;
    img.addEventListener("mouseenter", () => showHoverPreview(img, b.image));
    img.addEventListener("mouseleave", hideHoverPreview);
    thumbWrap.appendChild(img);
  } else {
    const icon = document.createElement("div");
    icon.className = "tile-link-icon";
    icon.textContent = "🔗";
    thumbWrap.appendChild(icon);
  }

  const title = document.createElement("div");
  title.className = "tile-title";
  title.textContent = b.title || "(Không có tên)";
  const meta = document.createElement("div");
  meta.className = "tile-meta";
  meta.textContent = displayUrl(b.url);

  const actions = document.createElement("div");
  actions.className = "tile-actions";
  const moreBtn = document.createElement("button");
  moreBtn.textContent = "⋮";
  moreBtn.title = "Tùy chọn";
  moreBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    openItemMenu(e, "bookmark", b.id, tile);
  });
  actions.append(moreBtn);
  thumbWrap.appendChild(actions);

  tile.append(thumbWrap, title, meta);
  tile.addEventListener("click", (e) => handleBookmarkClick(tile, b, e.shiftKey, e.ctrlKey || e.metaKey));
  suppressTextSelectOnMousedown(tile);
  return tile;
}

// ---------- Data operations ----------

async function loadAll() {
  [bookmarks, folders] = await Promise.all([PinDB.getAllBookmarks(), PinDB.getAllFolders()]);
  await ensureItemOrders();
  renderFolderTree();
  renderMainList();
}

async function performBookmarkDeletion(id) {
  await PinDB.removeBookmark(id);
  bookmarks = bookmarks.filter((x) => x.id !== id);
}

async function deleteBookmark(id) {
  const b = bookmarks.find((x) => x.id === id);
  if (!b) return;
  const snapshot = { ...b };
  await performBookmarkDeletion(id);
  clearSelection();
  renderFolderTree();
  renderMainList();
  recordDeletion(b.title, [], [snapshot]);
}

// ---------- Modal ----------

let lastSelectedFolderValue = "";

function populateFolderSelect(selectedFolderId) {
  els.fieldFolder.innerHTML = "";

  const noneOpt = document.createElement("option");
  noneOpt.value = "";
  noneOpt.textContent = "Chưa phân loại";
  els.fieldFolder.appendChild(noneOpt);

  function walk(parentId, depth) {
    for (const f of childFolders(parentId)) {
      const opt = document.createElement("option");
      opt.value = String(f.id);
      opt.textContent = "　".repeat(depth) + (depth > 0 ? "└ " : "") + f.name;
      els.fieldFolder.appendChild(opt);
      walk(f.id, depth + 1);
    }
  }
  walk(null, 0);

  const newOpt = document.createElement("option");
  newOpt.value = "__new__";
  newOpt.textContent = "+ Tạo thư mục mới…";
  els.fieldFolder.appendChild(newOpt);

  els.fieldFolder.value = selectedFolderId != null ? String(selectedFolderId) : "";
  lastSelectedFolderValue = els.fieldFolder.value;
}

els.fieldFolder.addEventListener("change", async () => {
  if (els.fieldFolder.value !== "__new__") {
    lastSelectedFolderValue = els.fieldFolder.value;
    return;
  }
  // Creating from inside an already-selected folder makes it a subfolder of
  // that folder, so nested folders can be created right from this form too.
  const parentId = lastSelectedFolderValue ? Number(lastSelectedFolderValue) : null;
  const name = (prompt("Tên thư mục mới:") || "").trim();
  if (!name) {
    els.fieldFolder.value = lastSelectedFolderValue;
    return;
  }
  const folder = await createFolder(name, parentId);
  populateFolderSelect(folder.id);
});

function openModal(bookmark) {
  editingId = bookmark ? bookmark.id : null;
  currentImageData = bookmark ? bookmark.image : null;

  els.modalTitle.textContent = bookmark ? "Sửa bookmark" : "Thêm bookmark";
  els.fieldTitle.value = bookmark ? bookmark.title : "";
  els.fieldUrl.value = bookmark ? bookmark.url : "";
  els.imageUrlInput.value = "";
  els.fileInput.value = "";

  populateFolderSelect(bookmark ? bookmark.folderId ?? null : activeFilter === "none" || activeFilter === "all" ? null : activeFilter);

  updateImagePreview();
  switchSourceTab("upload");
  els.overlay.hidden = false;
  els.fieldTitle.focus();
}

function closeModal() {
  els.overlay.hidden = true;
  editingId = null;
  currentImageData = null;
}

function updateImagePreview() {
  if (currentImageData) {
    els.imagePreview.src = currentImageData;
    els.imagePreview.hidden = false;
    els.imagePreviewEmpty.hidden = true;
    els.btnRemoveImage.hidden = false;
  } else {
    els.imagePreview.hidden = true;
    els.imagePreviewEmpty.hidden = false;
    els.btnRemoveImage.hidden = true;
  }
}

els.btnRemoveImage.addEventListener("click", () => {
  currentImageData = null;
  els.fileInput.value = "";
  els.imageUrlInput.value = "";
  updateImagePreview();
  toast("Đã xóa ảnh preview");
});

function switchSourceTab(name) {
  els.srcTabs.forEach((t) => t.classList.toggle("active", t.dataset.src === name));
  els.srcUpload.hidden = name !== "upload";
  els.srcCapture.hidden = name !== "capture";
  els.srcUrl.hidden = name !== "url";
}

async function saveFromModal() {
  const title = els.fieldTitle.value.trim();
  const url = els.fieldUrl.value.trim();

  if (!url) {
    toast("Vui lòng nhập URL");
    return;
  }
  try {
    new URL(url);
  } catch {
    toast("URL không hợp lệ");
    return;
  }

  const folderRaw = els.fieldFolder.value;
  const folderId = folderRaw === "" || folderRaw === "__new__" ? null : Number(folderRaw);

  const existing = editingId ? bookmarks.find((b) => b.id === editingId) : null;
  const folderChanged = existing ? (existing.folderId ?? null) !== (folderId ?? null) : false;

  const bookmark = {
    title: title || getDomain(url),
    url,
    image: currentImageData || null,
    folderId,
    createdAt: existing ? existing.createdAt : Date.now(),
    order: existing && !folderChanged ? existing.order : nextBookmarkOrder(folderId),
    tilt: existing ? existing.tilt || randomTilt() : randomTilt(),
  };

  if (editingId) {
    bookmark.id = editingId;
    await PinDB.updateBookmark(bookmark);
    toast("Đã cập nhật bookmark");
  } else {
    await PinDB.addBookmark(bookmark);
    toast("Đã lưu bookmark");
  }

  closeModal();
  await loadAll();
}

// ---------- Image source handlers ----------

els.fileInput.addEventListener("change", async () => {
  const file = els.fileInput.files[0];
  if (!file) return;
  try {
    const raw = await blobToDataUrl(file);
    currentImageData = await resizeDataUrl(raw);
    updateImagePreview();
  } catch {
    toast("Không đọc được ảnh này");
  }
});

els.btnCapture.addEventListener("click", () => {
  chrome.tabs.captureVisibleTab(null, { format: "jpeg", quality: 92 }, async (dataUrl) => {
    if (chrome.runtime.lastError || !dataUrl) {
      toast("Không chụp được tab. Thử lại trên tab đang mở.");
      return;
    }
    currentImageData = await resizeDataUrl(dataUrl);
    updateImagePreview();
  });
});

els.btnFetchImageUrl.addEventListener("click", async () => {
  const url = els.imageUrlInput.value.trim();
  if (!url) return;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("bad status");
    const blob = await res.blob();
    if (!blob.type.startsWith("image/")) throw new Error("not image");
    const raw = await blobToDataUrl(blob);
    currentImageData = await resizeDataUrl(raw);
    updateImagePreview();
  } catch {
    toast("Không tải được ảnh từ link này");
  }
});

els.srcTabs.forEach((tab) => {
  tab.addEventListener("click", () => switchSourceTab(tab.dataset.src));
});

// ---------- Top-level actions ----------

els.btnAdd.addEventListener("click", () => openModal(null));

els.btnSaveTab.addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.url) {
    toast("Không lấy được thông tin tab hiện tại");
    return;
  }
  openModal(null);
  els.fieldTitle.value = tab.title || "";
  els.fieldUrl.value = tab.url;

  // Auto-suggest a screenshot of the current tab as the default preview.
  chrome.tabs.captureVisibleTab(null, { format: "jpeg", quality: 92 }, async (dataUrl) => {
    if (chrome.runtime.lastError || !dataUrl) return;
    currentImageData = await resizeDataUrl(dataUrl);
    updateImagePreview();
    switchSourceTab("capture");
  });
});

// ---------- Ctrl+V: paste the internal Cắt/Sao chép clipboard ----------
// This is now a plain, unambiguous paste: if PinBook's internal Cắt/Sao
// chép clipboard has something in it, Ctrl+V pastes that (full-fidelity —
// image, structure, etc.), regardless of what happens to be on the OS
// clipboard at that moment. No more guessing based on OS clipboard text —
// that guess used to occasionally miss (e.g. multi-item selections, where
// the OS-clipboard mirror text didn't line up in time), silently breaking
// paste. Quick-saving a URL is now its own dedicated shortcut, see the
// Ctrl+Shift+K handler further down.

document.addEventListener("paste", async (e) => {
  const active = document.activeElement;
  const tag = active ? active.tagName : "";
  const isEditable = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || (active && active.isContentEditable);
  if (isEditable) return; // let normal paste behave normally in text fields
  if (!els.overlay.hidden || !els.folderModalOverlay.hidden) return; // a modal is open, don't hijack

  const clip = await readClipboard();
  if (!clip || clip.items.length === 0) return; // nothing in the internal clipboard, ignore silently

  e.preventDefault();
  await pasteClipboard();
});

// ---------- Ctrl+Shift+K: quick-save a link from the OS clipboard ----------
// Reads the OS clipboard directly (independent of Cắt/Sao chép/Dán) and, if
// it contains a URL, saves it as a bookmark right after the currently
// selected bookmark/folder (or at the end of the current folder if nothing
// is selected) — without opening the Add-bookmark modal.

async function quickSaveLinkFromClipboard() {
  let text = "";
  try {
    text = ((await navigator.clipboard.readText()) || "").trim();
  } catch {
    toast("Không đọc được khay nhớ tạm — hãy cho phép PinBook truy cập clipboard");
    return;
  }
  if (!text) return;

  let url;
  try {
    url = new URL(text).href;
  } catch {
    toast("Khay nhớ tạm không chứa link hợp lệ");
    return;
  }

  // Default: append to the currently open folder. But if exactly one item
  // is selected right now, save into ITS parent instead, right after it.
  let folderId = typeof activeFilter === "number" ? activeFilter : null;
  let afterRef = null;
  if (selectedItems.length === 1) {
    const sel = selectedItems[0];
    if (sel.type === "folder") {
      const f = folders.find((x) => x.id === sel.id);
      if (f) {
        folderId = f.parentId ?? null;
        afterRef = { type: "folder", id: f.id };
      }
    } else {
      const b = bookmarks.find((x) => x.id === sel.id);
      if (b) {
        folderId = b.folderId ?? null;
        afterRef = { type: "bookmark", id: b.id };
      }
    }
  }

  const bookmark = {
    title: url, // "chưa đặt tên thì lấy tên như link gốc"
    url,
    image: null,
    folderId,
    createdAt: Date.now(),
    tilt: randomTilt(),
  };
  bookmark.id = await PinDB.addBookmark(bookmark);
  bookmarks.push(bookmark);
  await insertSiblingAfter(folderId, afterRef, "bookmark", bookmark.id);
  await loadAll();
  toast(`Đã lưu nhanh: ${getDomain(url)}`);
}

document.addEventListener("keydown", (e) => {
  const active = document.activeElement;
  const tag = active ? active.tagName : "";
  const isEditable = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || (active && active.isContentEditable);
  if (isEditable) return;
  if (!els.overlay.hidden || !els.folderModalOverlay.hidden || !els.shortcutsOverlay.hidden) return;

  const mod = e.ctrlKey || e.metaKey;
  if (mod && e.shiftKey && e.key.toLowerCase() === "k") {
    e.preventDefault();
    quickSaveLinkFromClipboard();
  }
});

els.btnCloseModal.addEventListener("click", closeModal);
els.btnCancel.addEventListener("click", closeModal);
els.btnSave.addEventListener("click", saveFromModal);
els.overlay.addEventListener("click", (e) => {
  if (e.target === els.overlay) closeModal();
});
els.overlay.addEventListener("keydown", (e) => {
  if (e.key !== "Enter" || e.shiftKey) return;
  if (document.activeElement === els.imageUrlInput) {
    e.preventDefault();
    els.btnFetchImageUrl.click(); // Enter here fetches the pasted image link, not an immediate save
    return;
  }
  e.preventDefault();
  saveFromModal();
});

els.btnCloseFolderModal.addEventListener("click", closeFolderRenameModal);
els.btnFolderModalCancel.addEventListener("click", closeFolderRenameModal);
els.btnFolderModalSave.addEventListener("click", saveFolderRename);
els.folderModalOverlay.addEventListener("click", (e) => {
  if (e.target === els.folderModalOverlay) closeFolderRenameModal();
});
els.folderModalOverlay.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    saveFolderRename();
  }
});

els.searchInput.addEventListener("input", () => {
  renderMainList();
  writeStateToUrl(false);
});

// Called after the "Ảnh Preview"/"Không Preview" filter changes: some
// selected bookmarks may have just been hidden by renderMainList() (folders
// are never affected by this filter). Drops exactly those from the
// selection, keeps the rest selected and re-highlighted, and — like
// switching List/Grid view — scrolls so the topmost still-selected item is
// centered.
function syncSelectionAfterImageFilterChange() {
  if (selectedItems.length === 0) return;
  selectedItems = selectedItems.filter((it) => {
    if (it.type === "folder") return folders.some((f) => f.id === it.id);
    const b = bookmarks.find((x) => x.id === it.id);
    return b && passesImageFilter(b);
  });
  if (selectedItems.length === 0) selectionAnchorKey = null;
  applySelectionClasses();
  scrollSelectionToCenter();
}

els.filterHasImage.addEventListener("change", () => {
  filterHasImage = els.filterHasImage.checked;
  if (filterHasImage) {
    filterNoImage = false;
    els.filterNoImage.checked = false;
  }
  try {
    chrome.storage.local.set({ pinbookFilterHasImage: filterHasImage, pinbookFilterNoImage: filterNoImage });
  } catch {
    /* preference just won't persist */
  }
  renderMainList();
  syncSelectionAfterImageFilterChange();
  writeStateToUrl(false);
});

els.filterNoImage.addEventListener("change", () => {
  filterNoImage = els.filterNoImage.checked;
  if (filterNoImage) {
    filterHasImage = false;
    els.filterHasImage.checked = false;
  }
  try {
    chrome.storage.local.set({ pinbookFilterHasImage: filterHasImage, pinbookFilterNoImage: filterNoImage });
  } catch {
    /* preference just won't persist */
  }
  renderMainList();
  syncSelectionAfterImageFilterChange();
  writeStateToUrl(false);
});

els.listItems.addEventListener("click", (e) => {
  if (e.target === els.listItems && selectedItems.length > 0) {
    clearSelection();
  }
});

// ---------- Right-click context menu + per-item "⋮" action menu ----------
// Both are simple floating dropdowns positioned near a point, clamped to
// stay inside the viewport — shared positioning logic, different triggers.

function showFloatingMenu(menuEl, x, y) {
  menuEl.hidden = false;
  requestAnimationFrame(() => {
    const w = menuEl.offsetWidth;
    const h = menuEl.offsetHeight;
    const left = Math.max(8, Math.min(x, window.innerWidth - w - 8));
    const top = Math.max(8, Math.min(y, window.innerHeight - h - 8));
    menuEl.style.left = left + "px";
    menuEl.style.top = top + "px";
  });
}

function showContextMenu(x, y) {
  showFloatingMenu(els.contextMenu, x, y);
}
function hideContextMenu() {
  els.contextMenu.hidden = true;
}

// Right-clicking an item behaves exactly like clicking its own "⋮" button.
// Right-clicking inside the sidebar or the list view's empty background
// does nothing extra (native menu suppressed, nothing shown). The
// "+ Thêm bookmark / + Thêm thư mục" menu now only appears when
// right-clicking OUTSIDE both panels (the margin around them, or the
// topbar/search bar) — not inside the list view anymore.
document.addEventListener("contextmenu", (e) => {
  const itemEl = e.target.closest(".list-row, .tile");
  if (itemEl) {
    e.preventDefault();
    const [type, idStr] = itemEl.dataset.itemKey.split(":");
    openItemMenu(e, type, Number(idStr), itemEl);
    return;
  }

  if (e.target.closest(".explorer")) {
    // Inside the sidebar or the list view's empty background — suppress
    // the native menu, but there's nothing of ours to show here.
    e.preventDefault();
    hideContextMenu();
    hideItemMenu();
    return;
  }

  e.preventDefault();
  hideItemMenu();
  showContextMenu(e.clientX, e.clientY);
});

document.addEventListener("click", (e) => {
  if (!els.contextMenu.hidden && !els.contextMenu.contains(e.target)) hideContextMenu();
  if (!els.itemMenu.hidden && !els.itemMenu.contains(e.target)) hideItemMenu();
});
document.addEventListener("scroll", () => {
  hideContextMenu();
  hideItemMenu();
}, true);
window.addEventListener("blur", () => {
  hideContextMenu();
  hideItemMenu();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    hideContextMenu();
    hideItemMenu();
  }
});

els.ctxAddBookmark.addEventListener("click", () => {
  hideContextMenu();
  openModal(null);
});

els.ctxAddFolder.addEventListener("click", () => {
  hideContextMenu();
  // "Trong thư mục đang mở": nest under the folder currently being viewed,
  // or create a top-level folder when viewing Tất cả / Chưa phân loại / search.
  const parentId = typeof activeFilter === "number" ? activeFilter : null;
  addFolderPrompt(parentId);
});

// ---------- Per-item "⋮" menu: Sửa / Xóa / Cắt / Sao chép / Dán ----------
// Right-clicking an item behaves exactly like clicking its own "⋮" button
// (see the document-level contextmenu handler above). Opening the menu
// selects the item — unless it's already part of a multi-selection, in
// which case the menu applies to the WHOLE selection and "Chỉnh sửa" is
// hidden (editing several items at once isn't supported).

function openItemMenu(e, type, id, el) {
  hideContextMenu();
  const alreadyInMultiSelection = selectedItems.length > 1 && isItemSelected(type, id);
  if (!alreadyInMultiSelection) {
    selectSingle(type, id);
  }
  const multi = selectedItems.length > 1;
  const searching = els.searchInput.value.trim() !== "";
  els.itemMenuEdit.hidden = multi;
  els.itemMenuShowInFolder.hidden = multi || !searching;
  showFloatingMenu(els.itemMenu, e.clientX, e.clientY);
}

function hideItemMenu() {
  els.itemMenu.hidden = true;
}

function editSelection() {
  if (selectedItems.length !== 1) return;
  const [it] = selectedItems;
  if (it.type === "bookmark") {
    const b = bookmarks.find((x) => x.id === it.id);
    if (b) openModal(b);
  } else {
    renameFolder(it.id);
  }
}

async function deleteSelectionItems() {
  if (selectedItems.length === 0) return;
  if (selectedItems.length === 1) {
    const [it] = selectedItems;
    if (it.type === "bookmark") deleteBookmark(it.id);
    else deleteFolder(it.id);
    return;
  }
  const selectedCount = selectedItems.length; // each selected item counts as 1, even a folder with lots inside
  const allFolders = [];
  const allBookmarks = [];
  for (const it of selectedItems) {
    if (it.type === "bookmark") {
      const b = bookmarks.find((x) => x.id === it.id);
      if (!b) continue;
      allBookmarks.push({ ...b });
      await performBookmarkDeletion(it.id);
    } else {
      const { collectedFolders, collectedBookmarks } = await performFolderDeletion(it.id);
      allFolders.push(...collectedFolders);
      allBookmarks.push(...collectedBookmarks);
    }
  }
  clearSelection();
  renderFolderTree();
  renderMainList();
  recordDeletion(`${selectedCount} mục`, allFolders, allBookmarks);
}

// The in-app cut/copy "clipboard" now lives in chrome.storage.local (not
// just a page-local JS variable), so copying an item in one PinBook tab
// (e.g. a fullview tab) and pasting in another (the popup, or a different
// fullview tab) carries the full title/name — not just a plain-text URL
// via the OS clipboard, which is a lossier fallback for outside PinBook.
async function setClipboard(mode, items) {
  clipboard = { mode, items };
  try {
    await chrome.storage.local.set({ pinbookClipboard: clipboard });
  } catch {
    /* still works for pasting within this same tab even if persisting fails */
  }
}

async function readClipboard() {
  try {
    const stored = await chrome.storage.local.get("pinbookClipboard");
    clipboard = stored.pinbookClipboard || null;
  } catch {
    /* fall back to whatever this tab already has in memory */
  }
  return clipboard;
}

async function clearClipboard() {
  clipboard = null;
  try {
    await chrome.storage.local.remove("pinbookClipboard");
  } catch {
    /* ignore */
  }
}

async function cutSelectionItems() {
  if (selectedItems.length === 0) return;
  await setClipboard("cut", sortByOriginalOrder(selectedItems));

  // Mirror to the OS clipboard too (same as copy) — this is also what lets
  // paste tell "the internal clipboard is still current" apart from "the
  // user copied something else since", see readClipboard()/the paste
  // handler below.
  const text = clipboardPlainText(clipboard.items);
  if (text) {
    navigator.clipboard.writeText(text).catch(() => {
      /* clipboard write can fail if the page isn't focused — the in-app
         paste (Ctrl+V inside PinBook) still works regardless */
    });
  }

  toast(
    selectedItems.length === 1
      ? "Đã cắt — vào thư mục đích rồi Dán (Ctrl+V)"
      : `Đã cắt ${selectedItems.length} mục — vào thư mục đích rồi Dán (Ctrl+V)`
  );
}

// Builds the plain-text form of the copied item(s) for the OS clipboard:
// a folder's name, or a bookmark's URL — one per line for multi-select.
function clipboardPlainText(items) {
  const lines = [];
  for (const it of items) {
    if (it.type === "bookmark") {
      const b = bookmarks.find((x) => x.id === it.id);
      if (b) lines.push(b.url);
    } else {
      const f = folders.find((x) => x.id === it.id);
      if (f) lines.push(f.name);
    }
  }
  return lines.join("\n");
}

async function copySelectionItems() {
  if (selectedItems.length === 0) return;
  await setClipboard("copy", sortByOriginalOrder(selectedItems));

  // Also mirror it to the OS clipboard as plain text, so Ctrl+V outside
  // PinBook pastes the folder's name / the bookmark's URL.
  const text = clipboardPlainText(clipboard.items);
  if (text) {
    navigator.clipboard.writeText(text).catch(() => {
      /* clipboard write can fail if the page isn't focused — the in-app
         paste (Ctrl+V inside PinBook) still works regardless */
    });
  }

  toast(
    selectedItems.length === 1
      ? "Đã sao chép — vào thư mục đích rồi Dán (Ctrl+V)"
      : `Đã sao chép ${selectedItems.length} mục — vào thư mục đích rồi Dán (Ctrl+V)`
  );
}

// Is `candidateId` folder equal to, or nested inside, `ancestorId` folder?
// Used to block moving a folder into its own descendant (would create a cycle).
function isSameOrDescendant(candidateId, ancestorId) {
  let cur = folders.find((f) => f.id === candidateId);
  while (cur) {
    if (cur.id === ancestorId) return true;
    cur = cur.parentId != null ? folders.find((f) => f.id === cur.parentId) : null;
  }
  return false;
}

// Places (type,id) as a sibling within parentId, positioned right after
// `afterRef` ({type,id}) — or at the end if afterRef is null/not found.
// Renumbers that parent's shared order sequence to make room. Returns
// {type,id} of the item just placed, so a caller pasting several items in a
// row can chain each subsequent one after the previous.
async function insertSiblingAfter(parentId, afterRef, type, id) {
  const subFolders = folders.filter((f) => (f.parentId ?? null) === (parentId ?? null) && f.id !== id);
  const subBookmarks = bookmarks.filter((b) => (b.folderId ?? null) === (parentId ?? null) && b.id !== id);
  const combined = [
    ...subFolders.map((f) => ({ type: "folder", id: f.id, order: f.order ?? 0 })),
    ...subBookmarks.map((b) => ({ type: "bookmark", id: b.id, order: b.order ?? 0 })),
  ].sort((a, b) => a.order - b.order);

  const afterIdx = afterRef ? combined.findIndex((it) => it.type === afterRef.type && it.id === afterRef.id) : -1;
  const insertAt = afterIdx === -1 ? combined.length : afterIdx + 1;
  combined.splice(insertAt, 0, { type, id });

  for (let i = 0; i < combined.length; i++) {
    const entry = combined[i];
    if (entry.type === "folder") {
      const f = folders.find((x) => x.id === entry.id);
      if (f && f.order !== i + 1) {
        f.order = i + 1;
        await PinDB.updateFolder(f);
      }
    } else {
      const b = bookmarks.find((x) => x.id === entry.id);
      if (b && b.order !== i + 1) {
        b.order = i + 1;
        await PinDB.updateBookmark(b);
      }
    }
  }
  return { type, id };
}

// Deep-copies a folder: the folder itself (optionally under a different
// name — used for the top-level "(bản sao)" suffix, while nested
// subfolders keep their original names) plus every subfolder and bookmark
// inside it, recursively, in the same relative order they had.
// createdIds, if passed, gets every newly created folder/bookmark id pushed
// into it (used so a paste can be undone by deleting exactly this batch).
async function duplicateFolderDeep(src, targetParentId, nameOverride, createdIds) {
  const created = await createFolder(nameOverride ?? src.name, targetParentId);
  if (createdIds) createdIds.folderIds.push(created.id);
  const subFolders = childFolders(src.id);
  const subBookmarks = bookmarks.filter((b) => b.folderId === src.id);
  const combined = [
    ...subFolders.map((f) => ({ type: "folder", data: f, order: f.order ?? 0 })),
    ...subBookmarks.map((b) => ({ type: "bookmark", data: b, order: b.order ?? 0 })),
  ].sort((a, b) => a.order - b.order);

  for (const entry of combined) {
    if (entry.type === "folder") {
      await duplicateFolderDeep(entry.data, created.id, undefined, createdIds);
    } else {
      const b = entry.data;
      const newBookmark = {
        title: b.title,
        url: b.url,
        image: b.image,
        folderId: created.id,
        createdAt: Date.now(),
        order: nextItemOrder(created.id),
        tilt: randomTilt(),
      };
      newBookmark.id = await PinDB.addBookmark(newBookmark);
      bookmarks.push(newBookmark);
      if (createdIds) createdIds.bookmarkIds.push(newBookmark.id);
    }
  }
  return created;
}

async function pasteClipboard() {
  const clip = await readClipboard();
  if (!clip || clip.items.length === 0) return false;
  const { mode, items } = clip;

  // Default: paste into the currently open folder, appended at the end.
  let targetFolderId = typeof activeFilter === "number" ? activeFilter : null;
  // But if exactly one OTHER item is selected right now, paste into ITS
  // parent instead, positioned right after it.
  let afterRef = null;
  if (selectedItems.length === 1) {
    const sel = selectedItems[0];
    if (sel.type === "folder") {
      const f = folders.find((x) => x.id === sel.id);
      if (f) {
        targetFolderId = f.parentId ?? null;
        afterRef = { type: "folder", id: f.id };
      }
    } else {
      const b = bookmarks.find((x) => x.id === sel.id);
      if (b) {
        targetFolderId = b.folderId ?? null;
        afterRef = { type: "bookmark", id: b.id };
      }
    }
  }

  let done = 0;
  let skipped = 0;
  const moveSnapshot = []; // mode === "cut": { type, id, prevParent, prevOrder } per moved item, for undo
  const createdIds = { folderIds: [], bookmarkIds: [] }; // mode === "copy": every newly created id, for undo

  for (const it of items) {
    if (it.type === "bookmark") {
      const src = bookmarks.find((x) => x.id === it.id);
      if (!src) {
        skipped++;
        continue;
      }
      let placedId;
      if (mode === "cut") {
        moveSnapshot.push({ type: "bookmark", id: src.id, prevParent: src.folderId ?? null, prevOrder: src.order });
        src.folderId = targetFolderId;
        await PinDB.updateBookmark(src);
        placedId = src.id;
      } else {
        const newBookmark = {
          title: src.title,
          url: src.url,
          image: src.image,
          folderId: targetFolderId,
          createdAt: Date.now(),
          tilt: randomTilt(),
        };
        newBookmark.id = await PinDB.addBookmark(newBookmark);
        bookmarks.push(newBookmark);
        createdIds.bookmarkIds.push(newBookmark.id);
        placedId = newBookmark.id;
      }
      afterRef = await insertSiblingAfter(targetFolderId, afterRef, "bookmark", placedId);
      done++;
    } else {
      const src = folders.find((x) => x.id === it.id);
      if (!src) {
        skipped++;
        continue;
      }
      if (mode === "cut" && (src.id === targetFolderId || (targetFolderId != null && isSameOrDescendant(targetFolderId, src.id)))) {
        skipped++;
        continue;
      }
      let placedId;
      if (mode === "cut") {
        moveSnapshot.push({ type: "folder", id: src.id, prevParent: src.parentId ?? null, prevOrder: src.order });
        src.parentId = targetFolderId;
        await PinDB.updateFolder(src);
        placedId = src.id;
      } else {
        const created = await duplicateFolderDeep(src, targetFolderId, `${src.name} (bản sao)`, createdIds);
        placedId = created.id;
      }
      afterRef = await insertSiblingAfter(targetFolderId, afterRef, "folder", placedId);
      done++;
    }
  }

  if (mode === "cut") await clearClipboard(); // one-shot; copy can be pasted again elsewhere

  if (done > 0) {
    if (mode === "cut") {
      recordAction({ type: "move", items: moveSnapshot, message: `Đã chuyển ${done} mục` });
    } else {
      recordAction({ type: "paste-copy", ...createdIds, message: `Đã dán ${done} mục` });
    }
  }

  clearSelection();
  await loadAll();

  const verb = mode === "cut" ? "chuyển" : "dán bản sao";
  toast(skipped ? `Đã ${verb} ${done} mục (bỏ qua ${skipped} mục không hợp lệ)` : `Đã ${verb} ${done} mục vào đây`);
  return true;
}

// Navigates to the folder one level above the selected item (its parent),
// and highlights the item there — only meaningful/shown from search
// results, where an item's actual location isn't otherwise visible.
function showInFolder() {
  if (selectedItems.length !== 1) return;
  const it = selectedItems[0];
  let parentId;
  if (it.type === "bookmark") {
    const b = bookmarks.find((x) => x.id === it.id);
    if (!b) return;
    parentId = b.folderId ?? null;
  } else {
    const f = folders.find((x) => x.id === it.id);
    if (!f) return;
    parentId = f.parentId ?? null;
  }

  els.searchInput.value = "";
  if (parentId != null) {
    activeFilter = parentId;
  } else if (it.type === "bookmark") {
    activeFilter = "none"; // unfiled bookmarks live in "Chưa phân loại"
  } else {
    // A root-level folder has no "one level up" list view of its own —
    // show its own contents instead, the closest available equivalent.
    activeFilter = it.id;
  }

  // Tag the history entry we're leaving (the search results) with which
  // item this was, so Back can re-highlight and re-center that exact item
  // when returning to it — otherwise it's just an unmarked list again.
  if (URL_SYNC_ENABLED) {
    const state = { ...(history.state || { pinbook: true }), revealedItem: { type: it.type, id: it.id } };
    history.replaceState(state, "", window.location.pathname + window.location.search);
  }

  renderFolderTree();
  renderMainList();
  suppressSelectionUrlWrite = true;
  selectSingle(it.type, it.id);
  suppressSelectionUrlWrite = false;
  scrollItemToCenter(it.type, it.id);
  writeStateToUrl(true);
}

els.itemMenuEdit.addEventListener("click", () => {
  hideItemMenu();
  editSelection();
});
els.itemMenuShowInFolder.addEventListener("click", () => {
  hideItemMenu();
  showInFolder();
});
els.itemMenuDelete.addEventListener("click", () => {
  hideItemMenu();
  deleteSelectionItems();
});
els.itemMenuCut.addEventListener("click", () => {
  hideItemMenu();
  cutSelectionItems();
});
els.itemMenuCopy.addEventListener("click", () => {
  hideItemMenu();
  copySelectionItems();
});
els.itemMenuPaste.addEventListener("click", () => {
  hideItemMenu();
  pasteClipboard();
});

// ---------- Keyboard shortcuts for the selected item(s) ----------
// (Ctrl+V and Ctrl+Shift+K are each handled in their own listener above.)

document.addEventListener("keydown", (e) => {
  const tag = (e.target.tagName || "").toLowerCase();
  if (tag === "input" || tag === "textarea" || tag === "select" || e.target.isContentEditable) return;
  if (!els.overlay.hidden || !els.shortcutsOverlay.hidden || !els.folderModalOverlay.hidden) return;

  const mod = e.ctrlKey || e.metaKey;

  if (mod && e.key.toLowerCase() === "z") {
    e.preventDefault();
    undoLastAction();
    return;
  }

  if (mod && e.key.toLowerCase() === "a" && document.body.classList.contains("fullview")) {
    e.preventDefault();
    selectAllInView();
    return;
  }

  if (e.key === "ArrowUp" || e.key === "ArrowDown") {
    if (selectedItems.length !== 1) return;
    e.preventDefault();
    moveSelectionByArrow(e.key === "ArrowUp" ? -1 : 1);
    return;
  }

  if (selectedItems.length === 0) return;

  if (e.key === "Enter") {
    e.preventDefault();
    activateSelection();
  } else if (mod && e.key.toLowerCase() === "q") {
    e.preventDefault();
    editSelection();
  } else if (mod && e.key.toLowerCase() === "x") {
    e.preventDefault();
    cutSelectionItems();
  } else if (mod && e.key.toLowerCase() === "c") {
    e.preventDefault();
    copySelectionItems();
  } else if (e.key === "Delete" || e.key === "Backspace") {
    e.preventDefault();
    deleteSelectionItems();
  }
});

// Enter on the current selection: a single folder navigates into it (same
// as clicking it a second time), a single bookmark opens it in a new tab,
// and multiple selected items open every selected BOOKMARK in its own new
// tab (folders in the mix are just skipped — there's no meaningful "open"
// for several folders at once).
function activateSelection() {
  if (selectedItems.length === 1) {
    const it = selectedItems[0];
    if (it.type === "folder") {
      const f = folders.find((x) => x.id === it.id);
      if (f) handleFolderDblClick(f);
    } else {
      const b = bookmarks.find((x) => x.id === it.id);
      if (b) {
        hideHoverPreview();
        chrome.tabs.create({ url: b.url });
      }
    }
    return;
  }
  hideHoverPreview();
  for (const it of selectedItems) {
    if (it.type !== "bookmark") continue;
    const b = bookmarks.find((x) => x.id === it.id);
    if (b) chrome.tabs.create({ url: b.url });
  }
}

// Selects every item currently shown in the list view (bookmarks and
// folders alike) — mirrors Ctrl+A's usual "select everything visible"
// meaning, scoped to the folder currently open on the right.
function selectAllInView() {
  const rendered = Array.from(els.listItems.children).filter((n) => n.dataset.itemKey);
  if (rendered.length === 0) return;
  const items = rendered.map((n) => {
    const [type, idStr] = n.dataset.itemKey.split(":");
    return { type, id: Number(idStr) };
  });
  selectedItems = items;
  selectionAnchorKey = keyOf(items[0].type, items[0].id);
  applySelectionClasses();
}

// Moves a single-item selection to the item immediately above/below it in
// the currently rendered list (no wraparound at the edges).
function moveSelectionByArrow(direction) {
  const rendered = Array.from(els.listItems.children).filter((n) => n.dataset.itemKey);
  const currentKey = keyOf(selectedItems[0].type, selectedItems[0].id);
  const idx = rendered.findIndex((n) => n.dataset.itemKey === currentKey);
  if (idx === -1) return;
  const nextIdx = idx + direction;
  if (nextIdx < 0 || nextIdx >= rendered.length) return;
  const nextEl = rendered[nextIdx];
  const [type, idStr] = nextEl.dataset.itemKey.split(":");
  selectSingle(type, Number(idStr));
  nextEl.scrollIntoView({ block: "nearest" });
}

// ---------- Shortcuts reference table ----------

if (els.menuShortcuts) {
  els.menuShortcuts.addEventListener("click", () => {
    els.menuDropdown.hidden = true;
    els.shortcutsOverlay.hidden = false;
  });
}
els.btnCloseShortcuts.addEventListener("click", () => {
  els.shortcutsOverlay.hidden = true;
});
els.shortcutsOverlay.addEventListener("click", (e) => {
  if (e.target === els.shortcutsOverlay) els.shortcutsOverlay.hidden = true;
});

// ---------- Overflow menu (expand / import) ----------

if (els.btnMenu) {
  els.btnMenu.addEventListener("click", (e) => {
    e.stopPropagation();
    els.menuDropdown.hidden = !els.menuDropdown.hidden;
  });

  document.addEventListener("click", (e) => {
    if (!els.menuDropdown.hidden && !els.menuDropdown.contains(e.target) && e.target !== els.btnMenu) {
      els.menuDropdown.hidden = true;
    }
  });
}

if (els.menuExpand) {
  els.menuExpand.addEventListener("click", () => {
    chrome.tabs.create({ url: chrome.runtime.getURL("fullview.html") });
    els.menuDropdown.hidden = true;
  });
}

if (els.menuImport) {
  els.menuImport.addEventListener("click", () => {
    els.menuDropdown.hidden = true;
    els.importFileInput.click();
  });
}

if (els.menuExport) {
  els.menuExport.addEventListener("click", () => {
    els.menuDropdown.hidden = true;
    exportBookmarksToHtml();
  });
}

if (els.menuImportJson) {
  els.menuImportJson.addEventListener("click", () => {
    els.menuDropdown.hidden = true;
    els.importJsonFileInput.click();
  });
}

if (els.menuExportJson) {
  els.menuExportJson.addEventListener("click", () => {
    els.menuDropdown.hidden = true;
    exportBookmarksToJson();
  });
}

// ---------- Export bookmarks to a standard Netscape-format HTML file ----------
// Same format "Export bookmarks" produces in Chrome/Firefox/Edge, so the
// file can be re-imported into any of them (or back into PinBook itself).

function escapeHtmlText(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildNetscapeBookmarkHtml() {
  const lines = [
    "<!DOCTYPE NETSCAPE-Bookmark-file-1>",
    '<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">',
    "<TITLE>Bookmarks</TITLE>",
    "<H1>Bookmarks</H1>",
    "<DL><p>",
  ];

  // Folders and bookmarks share one interleaved order sequence per parent
  // (same as what the grid/list renders), so walk them combined and sorted
  // by that shared "order" — not bookmarks-then-folders — otherwise the
  // exported file (and anything re-imported from it) loses whatever
  // arrangement the user actually left things in.
  function walk(parentId, indent) {
    const subFolders = childFolders(parentId);
    const subBookmarks = bookmarks.filter((x) => (x.folderId ?? null) === (parentId ?? null));
    const combined = [
      ...subFolders.map((f) => ({ type: "folder", data: f, order: f.order ?? 0 })),
      ...subBookmarks.map((b) => ({ type: "bookmark", data: b, order: b.order ?? 0 })),
    ].sort((a, b) => a.order - b.order);

    for (const entry of combined) {
      if (entry.type === "bookmark") {
        const b = entry.data;
        const addDate = Math.floor((b.createdAt || Date.now()) / 1000);
        lines.push(`${indent}<DT><A HREF="${escapeHtmlText(b.url)}" ADD_DATE="${addDate}">${escapeHtmlText(b.title)}</A>`);
      } else {
        const f = entry.data;
        const addDate = Math.floor((f.createdAt || Date.now()) / 1000);
        lines.push(`${indent}<DT><H3 ADD_DATE="${addDate}">${escapeHtmlText(f.name)}</H3>`);
        lines.push(`${indent}<DL><p>`);
        walk(f.id, indent + "    ");
        lines.push(`${indent}</DL><p>`);
      }
    }
  }

  walk(null, "    ");
  lines.push("</DL><p>");
  return lines.join("\n");
}

function exportBookmarksToHtml() {
  if (bookmarks.length === 0 && folders.length === 0) {
    toast("Chưa có bookmark nào để xuất");
    return;
  }
  const html = buildNetscapeBookmarkHtml();
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const stamp = new Date().toISOString().slice(0, 10);
  const a = document.createElement("a");
  a.href = url;
  a.download = `pinbook-bookmarks-${stamp}.html`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
  toast("Đã xuất file bookmark");
}

// ---------- Export/Import bookmarks WITH preview images (PinBook's own JSON format) ----------
// The standard Netscape HTML format above has no room for a full custom
// preview image (only a tiny favicon), so a full-fidelity backup — folders,
// bookmarks, and the actual uploaded/captured preview images — uses a
// PinBook-specific JSON file instead.

function exportBookmarksToJson() {
  if (bookmarks.length === 0 && folders.length === 0) {
    toast("Chưa có bookmark nào để xuất");
    return;
  }
  const payload = {
    pinbookExport: true,
    version: 1,
    exportedAt: new Date().toISOString(),
    folders: folders.map((f) => ({ id: f.id, name: f.name, parentId: f.parentId ?? null, order: f.order ?? 0 })),
    bookmarks: bookmarks.map((b) => ({
      id: b.id,
      title: b.title,
      url: b.url,
      image: b.image || null,
      folderId: b.folderId ?? null,
      order: b.order ?? 0,
      createdAt: b.createdAt ?? Date.now(),
    })),
  };
  const json = JSON.stringify(payload);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const stamp = new Date().toISOString().slice(0, 10);
  const a = document.createElement("a");
  a.href = url;
  a.download = `pinbook-bookmarks-with-images-${stamp}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
  toast("Đã xuất file bookmark kèm ảnh Preview");
}

async function importFromJsonFile(file) {
  let payload;
  try {
    const text = await file.text();
    payload = JSON.parse(text);
  } catch {
    toast("File không đúng định dạng — cần đúng file JSON do PinBook xuất ra");
    return;
  }
  if (!payload || !Array.isArray(payload.folders) || !Array.isArray(payload.bookmarks)) {
    toast("File không đúng định dạng — cần đúng file JSON do PinBook xuất ra");
    return;
  }

  toast("Đang nhập bookmark kèm ảnh Preview…");

  const importedRootFolderId = await getOrCreateImportedFolder();
  let importedUnfiledFolderId = null;
  async function unfiledTarget() {
    if (importedUnfiledFolderId == null) {
      importedUnfiledFolderId = await getOrCreateImportedUnfiledFolder(importedRootFolderId);
    }
    return importedUnfiledFolderId;
  }

  const exportedFoldersById = new Map(payload.folders.map((f) => [f.id, f]));
  const resolvedFolderIds = new Map(); // exported folder id -> real folder id in this PinBook
  const mergeCache = new Map(); // "parentId::name" -> real folder id, to merge with folders that already exist here
  for (const f of folders) mergeCache.set(`${f.parentId ?? "root"}::${f.name}`, f.id);

  // Folders and bookmarks share one interleaved order sequence per parent in
  // PinBook's data model (same thing the grid/list renders from), and the
  // export keeps each item's original "order" value. Newly created/imported
  // items are tracked here — grouped by their *real* resolved parent — so
  // their relative order (folders and bookmarks interleaved, exactly as
  // exported) can be reapplied in one pass at the end, instead of every
  // folder ending up before every bookmark just because folders happen to
  // get created first.
  const importedItems = []; // { kind: "folder"|"bookmark", realId, realParentId, sourceOrder }

  // Resolves an exported folder to a real one here, creating it (and its
  // ancestors, as needed) if it doesn't already exist. Folders with the
  // same name under the same resolved parent are merged rather than
  // duplicated, same policy as the HTML import. Root-level folders resolve
  // under "Imported" (exportedId == null here always means a FOLDER's
  // parentId — bookmarks' folderId == null is handled separately via
  // unfiledTarget(), landing in "Chưa phân loại" *inside* "Imported").
  async function resolveFolder(exportedId) {
    if (exportedId == null) return importedRootFolderId;
    if (resolvedFolderIds.has(exportedId)) return resolvedFolderIds.get(exportedId);
    const exp = exportedFoldersById.get(exportedId);
    if (!exp) return importedRootFolderId;

    const parentRealId = await resolveFolder(exp.parentId);
    const mergeKey = `${parentRealId ?? "root"}::${exp.name}`;
    let realId = mergeCache.get(mergeKey);
    if (realId === undefined) {
      const created = await createFolder(exp.name, parentRealId);
      realId = created.id;
      mergeCache.set(mergeKey, realId);
      importedItems.push({ kind: "folder", realId, realParentId: parentRealId ?? null, sourceOrder: exp.order ?? 0 });
    }
    resolvedFolderIds.set(exportedId, realId);
    return realId;
  }

  for (const f of payload.folders) {
    await resolveFolder(f.id);
  }

  // Bookmarks are always added fresh (matches the HTML import's policy of
  // keeping duplicates rather than skipping them), appended after whatever
  // already exists in their resolved target folder.
  let imported = 0;
  for (const b of payload.bookmarks) {
    if (!b || typeof b.url !== "string" || !/^https?:\/\//i.test(b.url)) continue;
    const folderId = b.folderId == null ? await unfiledTarget() : await resolveFolder(b.folderId);
    const newBookmark = {
      title: b.title || getDomain(b.url),
      url: b.url,
      image: b.image || null,
      folderId,
      // Reuse the original creation time from the export (falls back to now
      // for older export files that didn't include it) so the "Tất cả" view
      // — which sorts purely by createdAt, newest first, since it spans
      // every folder — keeps the exact same relative order it had before
      // the export, instead of everything bunching up at "now".
      createdAt: typeof b.createdAt === "number" ? b.createdAt : Date.now(),
      order: nextItemOrder(folderId), // temporary — corrected below once every item's real parent is known
      tilt: randomTilt(),
    };
    newBookmark.id = await PinDB.addBookmark(newBookmark);
    bookmarks.push(newBookmark);
    importedItems.push({ kind: "bookmark", realId: newBookmark.id, realParentId: folderId ?? null, sourceOrder: b.order ?? 0 });
    imported++;
  }

  // Reapply the original interleaved order (folders and bookmarks together)
  // per real parent folder, now that every imported item has a resolved
  // real id and real parent. Anything already sitting in a target folder
  // (existing items, or an existing folder that got merged into rather than
  // freshly created) keeps its place; imported items are appended after it,
  // in their original relative order.
  const groups = new Map(); // realParentId ("null" for top-level) -> items[]
  for (const item of importedItems) {
    const key = item.realParentId ?? "null";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  }
  for (const [key, items] of groups) {
    const parentId = key === "null" ? null : key;
    const importedIds = new Set(items.map((it) => it.realId));
    const existingFolderOrders = folders
      .filter((f) => (f.parentId ?? null) === (parentId ?? null) && !importedIds.has(f.id))
      .map((f) => f.order ?? 0);
    const existingBookmarkOrders = bookmarks
      .filter((b) => (b.folderId ?? null) === (parentId ?? null) && !importedIds.has(b.id))
      .map((b) => b.order ?? 0);
    const existingMax = Math.max(0, ...existingFolderOrders, ...existingBookmarkOrders);

    items.sort((a, b) => a.sourceOrder - b.sourceOrder);
    let next = existingMax + 1;
    for (const item of items) {
      if (item.kind === "folder") {
        const f = folders.find((x) => x.id === item.realId);
        if (f) {
          f.order = next;
          await PinDB.updateFolder(f);
        }
      } else {
        const b = bookmarks.find((x) => x.id === item.realId);
        if (b) {
          b.order = next;
          await PinDB.updateBookmark(b);
        }
      }
      next++;
    }
  }

  await loadAll();
  toast(`Đã nhập ${imported} bookmark kèm ảnh Preview`);
}

if (els.importFileInput) {
  els.importFileInput.addEventListener("change", async () => {
    const file = els.importFileInput.files[0];
    els.importFileInput.value = "";
    if (!file) return;
    await importFromHtmlFile(file);
  });
}

if (els.importJsonFileInput) {
  els.importJsonFileInput.addEventListener("change", async () => {
    const file = els.importJsonFileInput.files[0];
    els.importJsonFileInput.value = "";
    if (!file) return;
    await importFromJsonFile(file);
  });
}

// ---------- Import bookmarks (+ folder structure) from a Netscape-format HTML file ----------
// This is the format Chrome/Firefox/Edge produce via "Export bookmarks".
// We scan the raw markup as a token stream (rather than relying on how the
// browser's HTML parser reinterprets this legacy, non-standard nesting),
// tracking <DL>/</DL> depth to know which folder each <A> belongs to.

const TOP_LEVEL_CONTAINERS = new Set([
  "bookmarks bar",
  "bookmarks toolbar",
  "other bookmarks",
  "mobile bookmarks",
  "bookmarks menu",
]);

function decodeHtmlEntities(str) {
  const ta = document.createElement("textarea");
  ta.innerHTML = str;
  return ta.value;
}

function stripTags(str) {
  return decodeHtmlEntities(str.replace(/<[^>]*>/g, "")).trim();
}

function extractAttr(attrString, name) {
  const m = new RegExp(name + '\\s*=\\s*"([^"]*)"', "i").exec(attrString);
  return m ? m[1] : null;
}

async function importFromHtmlFile(file) {
  let text;
  try {
    text = await file.text();
  } catch {
    toast("Không đọc được file này");
    return;
  }

  const tokenRe = /<H3[^>]*>([\s\S]*?)<\/H3>|<A\s+([^>]*)>([\s\S]*?)<\/A>|<DL[^>]*>|<\/DL>/gi;
  const matches = [...text.matchAll(tokenRe)];
  if (matches.length === 0) {
    toast("Không tìm thấy bookmark nào trong file");
    return;
  }

  toast("Đang nhập bookmark…");

  const importedRootFolderId = await getOrCreateImportedFolder();
  let importedUnfiledFolderId = null;
  async function unfiledTarget() {
    if (importedUnfiledFolderId == null) {
      importedUnfiledFolderId = await getOrCreateImportedUnfiledFolder(importedRootFolderId);
    }
    return importedUnfiledFolderId;
  }

  // Cache so re-importing the same file merges into existing folders
  // instead of creating duplicates. Keyed by "parentId::name", since with a
  // real tree, two different folders can validly share the same name as
  // long as they sit under different parents.
  const folderCache = new Map();
  for (const f of folders) {
    folderCache.set(`${f.parentId ?? "root"}::${f.name}`, f.id);
  }

  async function getOrCreateFolder(parentId, name) {
    const key = `${parentId ?? "root"}::${name}`;
    if (folderCache.has(key)) return folderCache.get(key);
    const folder = await createFolder(name, parentId);
    folderCache.set(key, folder.id);
    return folder.id;
  }

  // Stack entries: { folderId: number|null }. A "transparent" scope (the
  // root wrapper, or a known top-level container like "Bookmarks bar")
  // doesn't create a folder of its own — children attach directly to
  // whatever folder the transparent scope inherited. The root itself is
  // "Imported": new folders encountered at the top level are created right
  // inside "Imported", while bookmarks sitting directly at the root (no
  // enclosing folder at all) instead go into "Chưa phân loại" *inside*
  // "Imported" — see the folderId === importedRootFolderId check below.
  const stack = [{ folderId: importedRootFolderId }];
  let pendingHeader = null; // { name, isTransparent }

  // Fallback for bookmarks whose file has no (or an invalid) ADD_DATE:
  // assign strictly *decreasing* timestamps as we walk the file top to
  // bottom, so — among those fallback items only — the one seen first in
  // the file still ends up on top of the newest-first "Tất cả" view.
  let fallbackOrderCounter = Date.now();
  const importOrderCounters = new Map();
  function nextImportOrder(folderId) {
    const key = folderId ?? "null";
    if (!importOrderCounters.has(key)) importOrderCounters.set(key, nextBookmarkOrder(folderId));
    const val = importOrderCounters.get(key);
    importOrderCounters.set(key, val + 1);
    return val;
  }
  let imported = 0;
  let skipped = 0;

  for (const m of matches) {
    const full = m[0];

    if (/^<H3/i.test(full)) {
      const name = stripTags(m[1] || "");
      const isTransparent = TOP_LEVEL_CONTAINERS.has(name.toLowerCase());
      pendingHeader = { name, isTransparent };
      continue;
    }

    if (/^<DL/i.test(full)) {
      const top = stack[stack.length - 1];
      if (pendingHeader && !pendingHeader.isTransparent) {
        const folderId = await getOrCreateFolder(top.folderId, pendingHeader.name);
        stack.push({ folderId });
      } else {
        // Transparent container, or a <DL> with no preceding header —
        // inherit the parent's current folder context unchanged.
        stack.push({ folderId: top.folderId });
      }
      pendingHeader = null;
      continue;
    }

    if (full === "</DL>" || /^<\/DL/i.test(full)) {
      if (stack.length > 1) stack.pop();
      continue;
    }

    if (/^<A\s/i.test(full)) {
      const attrs = m[2] || "";
      const inner = m[3] || "";
      const rawUrl = (extractAttr(attrs, "href") || "").trim();
      if (!/^https?:\/\//i.test(rawUrl)) {
        skipped++;
        continue;
      }

      const title = stripTags(inner) || getDomain(rawUrl);
      const icon = extractAttr(attrs, "icon");
      const image = icon && icon.startsWith("data:image") ? icon : null;
      const currentFolder = stack[stack.length - 1];
      // A bookmark sitting directly under the root scope (not inside any
      // real folder) was originally in "Chưa phân loại" — route it into
      // the "Chưa phân loại" subfolder inside "Imported" rather than
      // straight into "Imported" itself, same policy as the JSON import.
      const targetFolderId = currentFolder.folderId === importedRootFolderId ? await unfiledTarget() : currentFolder.folderId;

      // ADD_DATE is the standard Netscape-format field for creation time
      // (Unix seconds) — PinBook's own HTML export writes the bookmark's
      // real createdAt into it, and Chrome/Firefox/Edge exports carry their
      // own real dates too. Reusing it (rather than a synthetic value based
      // on file position) is what keeps the "Tất cả" view — sorted newest
      // first, across every folder — in the same order it was before.
      const addDateAttr = extractAttr(attrs, "add_date");
      const parsedAddDate = addDateAttr && /^\d+$/.test(addDateAttr) ? Number(addDateAttr) * 1000 : null;

      const bookmark = {
        title,
        url: rawUrl,
        image,
        folderId: targetFolderId,
        createdAt: parsedAddDate ?? fallbackOrderCounter--,
        order: nextImportOrder(targetFolderId),
        tilt: randomTilt(),
      };

      try {
        await PinDB.addBookmark(bookmark);
        imported++;
      } catch {
        skipped++;
      }
    }
  }

  await loadAll();
  toast(
    imported > 0
      ? `Đã nhập ${imported} bookmark${skipped ? `, bỏ qua ${skipped} liên kết không hợp lệ` : ""}`
      : `Không có bookmark mới nào để nhập (${skipped} bị bỏ qua)`
  );
}

// ---------- Init ----------
chrome.runtime.onMessage.addListener((message) => {
  if (message && message.type === "pinbook-refresh") {
    loadAll();
  }
});

// ---------- URL state (deep-linking) ----------
// Only meaningful in the full-tab view — the popup's URL isn't visible or
// shareable, and the popup closes as soon as it loses focus anyway. Reflects
// the current folder, search keyword, search mode, image filter, and the
// currently selected item(s), in the query string, so reloading, bookmarking,
// sharing, or using Back/Forward on that tab reproduces the exact same view.
const URL_SYNC_ENABLED = document.body.classList.contains("fullview");

// Captured once at startup from the URL's "sel" param (if any) and applied
// after loadAll() — selection restore needs bookmarks/folders to already be
// loaded, unlike the other URL params which can be applied immediately.
let initialSelectionParam = null;

// Turns the current selection into a compact URL-safe token: "f12" for
// folder id 12, "b7" for bookmark id 7, comma-separated for a multi-select
// (e.g. "b7,f12,b9") — order matches selectedItems, i.e. left-to-right.
function selectionToUrlParam(items) {
  if (!items || items.length === 0) return null;
  return items.map((it) => (it.type === "folder" ? "f" : "b") + it.id).join(",");
}

function parseSelectionUrlParam(str) {
  if (!str) return [];
  return str
    .split(",")
    .map((tok) => ({ type: tok[0] === "f" ? "folder" : "bookmark", id: Number(tok.slice(1)) }))
    .filter((it) => Number.isInteger(it.id));
}

// Keeps the browser tab's title in sync with the active search or the
// current folder — instead of a static "PinBook — Toàn màn hình" no matter
// what's showing. Deliberately does NOT reflect the selected item(s)
// anymore (that changed too often/abruptly to be useful — just noisy).
function updateDocumentTitle() {
  if (!URL_SYNC_ENABLED) return;
  let label = null;
  const q = els.searchInput.value.trim();
  if (q) label = `Tìm kiếm: ${q}`;
  else if (activeFilter === "none") label = "Chưa phân loại";
  else if (typeof activeFilter === "number") label = folders.find((f) => f.id === activeFilter)?.name || null;
  document.title = label ? `${label} — PinBook` : "PinBook — Toàn màn hình";
}

// The tab title only updates 2.5s after the state driving it (current
// folder, or search box) stops changing — quickly clicking through several
// folders, or typing a search, no longer flickers the title on every step;
// it settles once you've actually stayed somewhere for a beat. Two
// exceptions pass opts.immediateTitle to update it right away instead: the
// initial page load, and Back/Forward — both are a "you have arrived"
// moment, not a chain of intermediate steps, so the title shouldn't lag.
let titleDebounceTimer = null;
function scheduleTitleUpdate() {
  clearTimeout(titleDebounceTimer);
  titleDebounceTimer = setTimeout(updateDocumentTitle, 2500);
}

function currentUrlParams() {
  const params = new URLSearchParams();
  if (activeFilter !== "all") params.set("folder", String(activeFilter));
  const q = els.searchInput.value.trim();
  if (q) params.set("q", q);
  if (searchMode !== "normal") params.set("mode", searchMode);
  if (filterHasImage) params.set("img", "has");
  else if (filterNoImage) params.set("img", "none");
  const sel = selectionToUrlParam(selectedItems);
  if (sel) params.set("sel", sel);
  return params;
}

// push=true starts a new Back/Forward step (folder navigation — each folder
// is its own "place"); push=false updates the current entry in place
// (typing a search, flipping a filter/mode, changing the selection —
// refinements of where you already are, not a new place to navigate back to).
// opts.immediateTitle: true updates the tab title right away instead of
// after the usual 2.5s settle — see the comment on scheduleTitleUpdate.
// The URL itself always updates immediately either way.
function writeStateToUrl(push, opts = {}) {
  if (!URL_SYNC_ENABLED) return;
  if (opts.immediateTitle) {
    clearTimeout(titleDebounceTimer); // supersede any pending debounced update from a moment ago
    updateDocumentTitle();
  } else {
    scheduleTitleUpdate();
  }
  const qs = currentUrlParams().toString();
  const newUrl = window.location.pathname + (qs ? `?${qs}` : "");
  if (newUrl === window.location.pathname + window.location.search) return;
  if (push) {
    history.pushState({ pinbook: true }, "", newUrl);
  } else {
    history.replaceState({ pinbook: true }, "", newUrl);
  }
}

// Used once at startup: only OVERRIDES state for params actually present in
// the URL, leaving anything absent to whatever was just restored from
// chrome.storage.local — so a plain tab reopen (no query string at all)
// behaves exactly as it always did, while a shared/bookmarked URL with
// specific params wins over the stored preferences for just those fields.
function applyUrlOverridesAtInit() {
  if (!URL_SYNC_ENABLED) return;
  const params = new URLSearchParams(window.location.search);
  if (params.has("folder")) {
    const folderParam = params.get("folder");
    if (folderParam === "none") activeFilter = "none";
    else {
      const n = Number(folderParam);
      activeFilter = Number.isInteger(n) ? n : "all";
    }
  }
  if (params.has("q")) els.searchInput.value = params.get("q") || "";
  if (params.has("mode")) {
    const modeParam = params.get("mode");
    if (SEARCH_MODES.some((m) => m.id === modeParam)) searchMode = modeParam;
  }
  if (params.has("img")) {
    const imgParam = params.get("img");
    filterHasImage = imgParam === "has";
    filterNoImage = imgParam === "none";
  }
  if (params.has("sel")) initialSelectionParam = params.get("sel");
}

// Used on Back/Forward: the URL is always one we wrote ourselves (via
// writeStateToUrl), so an absent param really does mean "default" here —
// unlike at init, there's no stored-preference fallback to preserve.
function applyUrlStateOnPopstate(event) {
  if (!URL_SYNC_ENABLED) return;
  const params = new URLSearchParams(window.location.search);
  const folderParam = params.get("folder");
  if (folderParam === "none") activeFilter = "none";
  else if (folderParam) {
    const n = Number(folderParam);
    activeFilter = Number.isInteger(n) && folders.some((f) => f.id === n) ? n : "all";
  } else {
    activeFilter = "all";
  }

  els.searchInput.value = params.get("q") || "";

  const modeParam = params.get("mode");
  searchMode = SEARCH_MODES.some((m) => m.id === modeParam) ? modeParam : "normal";
  renderSearchModePills();

  const imgParam = params.get("img");
  filterHasImage = imgParam === "has";
  filterNoImage = imgParam === "none";
  els.filterHasImage.checked = filterHasImage;
  els.filterNoImage.checked = filterNoImage;

  renderFolderTree();
  renderMainList();

  // Returning (Back/Forward) to a search-results view we'd previously used
  // "Hiển thị trong thư mục" from — re-highlight and re-center that same
  // item here too, instead of leaving the view unmarked. Otherwise, restore
  // whatever selection this URL step itself carries (its "sel" param).
  const revealedItem = event && event.state && event.state.revealedItem;
  if (revealedItem) {
    selectSingle(revealedItem.type, revealedItem.id);
    scrollItemToCenter(revealedItem.type, revealedItem.id);
  } else {
    const items = parseSelectionUrlParam(params.get("sel")).filter((it) =>
      it.type === "folder" ? folders.some((f) => f.id === it.id) : bookmarks.some((b) => b.id === it.id)
    );
    if (items.length > 0) {
      selectedItems = items;
      selectionAnchorKey = keyOf(items[0].type, items[0].id);
      applySelectionClasses();
      scrollSelectionToCenter();
    } else {
      clearSelection();
    }
  }

  // Back/Forward is a "you have arrived" moment, not a chain of intermediate
  // steps — update the tab title right away instead of waiting the usual
  // 2.5s (which was scheduled a moment ago by the selectSingle/
  // applySelectionClasses/clearSelection call just above).
  clearTimeout(titleDebounceTimer);
  updateDocumentTitle();
}

if (URL_SYNC_ENABLED) {
  window.addEventListener("popstate", applyUrlStateOnPopstate);
}

async function initApp() {
  try {
    const stored = await chrome.storage.local.get([
      "pinbookViewMode",
      "pinbookFilterHasImage",
      "pinbookFilterNoImage",
      "pinbookSearchMode",
      "pinbookCollapsedFolders",
    ]);
    if (stored.pinbookViewMode === "grid" || stored.pinbookViewMode === "list") {
      viewMode = stored.pinbookViewMode;
    }
    if (typeof stored.pinbookFilterHasImage === "boolean") {
      filterHasImage = stored.pinbookFilterHasImage;
    }
    if (typeof stored.pinbookFilterNoImage === "boolean") {
      filterNoImage = stored.pinbookFilterNoImage;
    }
    if (SEARCH_MODES.some((m) => m.id === stored.pinbookSearchMode)) {
      searchMode = stored.pinbookSearchMode;
    }
    if (Array.isArray(stored.pinbookCollapsedFolders)) {
      for (const id of stored.pinbookCollapsedFolders) collapsedFolders.add(id);
    }
  } catch {
    /* default to "list" / unfiltered / "normal" search if storage isn't available for some reason */
  }
  els.viewListBtn.classList.toggle("active", viewMode === "list");
  els.viewGridBtn.classList.toggle("active", viewMode === "grid");
  els.filterHasImage.checked = filterHasImage;
  els.filterNoImage.checked = filterNoImage;
  applyUrlOverridesAtInit(); // may override activeFilter/search box/searchMode/image filter above
  els.filterHasImage.checked = filterHasImage;
  els.filterNoImage.checked = filterNoImage;
  renderSearchModePills();
  await loadAll();
  if (typeof activeFilter === "number" && !folders.some((f) => f.id === activeFilter)) {
    activeFilter = "all"; // URL pointed at a folder that no longer exists
  }
  renderFolderTree();
  renderMainList();
  // Restore the selection carried by the URL's "sel" param, now that
  // bookmarks/folders are actually loaded — dropping any id that no longer
  // exists.
  const restoredSelection = parseSelectionUrlParam(initialSelectionParam).filter((it) =>
    it.type === "folder" ? folders.some((f) => f.id === it.id) : bookmarks.some((b) => b.id === it.id)
  );
  if (restoredSelection.length > 0) {
    selectedItems = restoredSelection;
    selectionAnchorKey = keyOf(restoredSelection[0].type, restoredSelection[0].id);
    applySelectionClasses();
    scrollSelectionToCenter();
  }
  writeStateToUrl(false, { immediateTitle: true }); // normalize the URL to exactly reflect the state actually applied; title updates now, not after a 2.5s wait, since arriving via load/reload is a "you're here" moment
}
initApp();
