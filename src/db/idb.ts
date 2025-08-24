import { openDB, type IDBPDatabase } from "idb";

export type CommentRow = {
  id: string;
  content: string;
  createdAt: string;
  parentId: string | null;
};

type DBSchema = {
  comments: {
    key: string;
    value: CommentRow;
    indexes: {
      by_parentId: string | null;
      by_createdAt: string;
    };
  };
};

let dbPromise: Promise<IDBPDatabase<DBSchema>> | null = null;

export function getDb() {
  if (!dbPromise) {
    dbPromise = openDB<DBSchema>("comments-db", 1, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          const store = db.createObjectStore("comments", { keyPath: "id" });
          store.createIndex("by_parentId", "parentId");
          store.createIndex("by_createdAt", "createdAt");
        }
      },
    });
  }
  return dbPromise;
}

export async function ensurePersistence(): Promise<boolean> {
  // detect storage (devtools)
  if (!("storage" in navigator) || !navigator.storage?.persist) return false;

  try {
    // already persisted?
    if (await navigator.storage.persisted()) return true;
    // ask for persistence
    return await navigator.storage.persist();
  } catch {
    return false;
  }
}
