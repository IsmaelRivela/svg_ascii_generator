import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { SVGCollection, Preset, RenderConfig } from '../types';

interface AppDB extends DBSchema {
  collections: {
    key: string;
    value: SVGCollection;
  };
  presets: {
    key: string;
    value: Preset;
  };
  config: {
    key: 'current';
    value: RenderConfig;
  };
  enabledChars: {
    key: 'enabled';
    value: string[];
  };
}

let db: IDBPDatabase<AppDB> | null = null;

export async function initDB() {
  db = await openDB<AppDB>('svg-ascii-generator', 2, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) {
        db.createObjectStore('collections', { keyPath: 'id' });
        db.createObjectStore('presets', { keyPath: 'id' });
        db.createObjectStore('config');
      }
      if (oldVersion < 2) {
        db.createObjectStore('enabledChars');
      }
    },
  });
  return db;
}

export async function saveCollections(collections: SVGCollection[]) {
  if (!db) await initDB();
  const tx = db!.transaction('collections', 'readwrite');
  await Promise.all([
    ...collections.map((c) => tx.store.put(c)),
    tx.done,
  ]);
}

export async function loadCollections(): Promise<SVGCollection[]> {
  if (!db) await initDB();
  return db!.getAll('collections');
}

export async function savePresets(presets: Preset[]) {
  if (!db) await initDB();
  const tx = db!.transaction('presets', 'readwrite');
  await Promise.all([
    ...presets.map((p) => tx.store.put(p)),
    tx.done,
  ]);
}

export async function loadPresets(): Promise<Preset[]> {
  if (!db) await initDB();
  return db!.getAll('presets');
}

export async function saveConfig(config: RenderConfig) {
  if (!db) await initDB();
  await db!.put('config', config, 'current');
}

export async function loadConfig(): Promise<RenderConfig | undefined> {
  if (!db) await initDB();
  return db!.get('config', 'current');
}

export async function saveEnabledChars(charIds: string[]) {
  if (!db) await initDB();
  await db!.put('enabledChars', charIds, 'enabled');
}

export async function loadEnabledChars(): Promise<string[]> {
  if (!db) await initDB();
  const result = await db!.get('enabledChars', 'enabled');
  return result || [];
}
