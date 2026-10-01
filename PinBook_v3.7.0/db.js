/* Promise-based IndexedDB wrapper for PinBook.
   Two stores: "bookmarks" and "folders" (v2 adds folders; existing users
   upgrade in place, old bookmarks are kept as-is). */

const PinDB = (() => {
  const DB_NAME = "pinbook-db";
  const DB_VERSION = 2;
  const S_BOOKMARKS = "bookmarks";
  const S_FOLDERS = "folders";
  let dbPromise = null;

  function open() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(S_BOOKMARKS)) {
          const s = db.createObjectStore(S_BOOKMARKS, { keyPath: "id", autoIncrement: true });
          s.createIndex("createdAt", "createdAt");
        }
        if (!db.objectStoreNames.contains(S_FOLDERS)) {
          const s = db.createObjectStore(S_FOLDERS, { keyPath: "id", autoIncrement: true });
          s.createIndex("order", "order");
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    return dbPromise;
  }

  async function tx(storeName, mode) {
    const db = await open();
    const transaction = db.transaction(storeName, mode);
    return { transaction, store: transaction.objectStore(storeName) };
  }

  async function add(storeName, item) {
    const { transaction, store } = await tx(storeName, "readwrite");
    return new Promise((resolve, reject) => {
      const req = store.add(item);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async function update(storeName, item) {
    const { transaction, store } = await tx(storeName, "readwrite");
    return new Promise((resolve, reject) => {
      const req = store.put(item);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async function remove(storeName, id) {
    const { transaction, store } = await tx(storeName, "readwrite");
    return new Promise((resolve, reject) => {
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async function getAll(storeName) {
    const { store } = await tx(storeName, "readonly");
    return new Promise((resolve, reject) => {
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  return {
    addBookmark: (b) => add(S_BOOKMARKS, b),
    updateBookmark: (b) => update(S_BOOKMARKS, b),
    removeBookmark: (id) => remove(S_BOOKMARKS, id),
    getAllBookmarks: () => getAll(S_BOOKMARKS),

    addFolder: (f) => add(S_FOLDERS, f),
    updateFolder: (f) => update(S_FOLDERS, f),
    removeFolder: (id) => remove(S_FOLDERS, id),
    getAllFolders: () => getAll(S_FOLDERS),
  };
})();
