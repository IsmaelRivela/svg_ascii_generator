import { SVGCollection, Preset, RenderConfig } from '../types';

const KEYS = {
  collections: 'svg-ascii-collections',
  presets: 'svg-ascii-presets',
  config: 'svg-ascii-config',
  enabledChars: 'svg-ascii-enabledChars',
};

function save(key: string, data: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn('localStorage save failed:', e);
  }
}

function load<T>(key: string): T | null {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export async function saveCollections(collections: SVGCollection[]) {
  save(KEYS.collections, collections);
}

export async function loadCollections(): Promise<SVGCollection[]> {
  return load<SVGCollection[]>(KEYS.collections) || [];
}

export async function savePresets(presets: Preset[]) {
  save(KEYS.presets, presets);
}

export async function loadPresets(): Promise<Preset[]> {
  return load<Preset[]>(KEYS.presets) || [];
}

export async function saveConfig(config: RenderConfig) {
  save(KEYS.config, config);
}

export async function loadConfig(): Promise<RenderConfig | undefined> {
  return load<RenderConfig>(KEYS.config) || undefined;
}

export async function saveEnabledChars(charIds: string[]) {
  save(KEYS.enabledChars, charIds);
}

export async function loadEnabledChars(): Promise<string[]> {
  return load<string[]>(KEYS.enabledChars) || [];
}
