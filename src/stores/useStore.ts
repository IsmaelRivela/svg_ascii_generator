import { create } from 'zustand';
import { SVGCollection, RenderConfig, Preset, ProcessedCell } from '../types';

interface AppState {
  // Image
  sourceImage: HTMLImageElement | null;
  setSourceImage: (img: HTMLImageElement | null) => void;

  // Collections
  collections: SVGCollection[];
  activeCollectionId: string | null;
  enabledCharIds: Set<string>;
  setCollections: (collections: SVGCollection[]) => void;
  setActiveCollection: (id: string) => void;
  addCollection: (collection: SVGCollection) => void;
  removeCollection: (id: string) => void;
  toggleCharEnabled: (charId: string) => void;
  setEnabledChars: (charIds: string[]) => void;
  reorderChars: (collectionId: string, fromIndex: number, toIndex: number) => void;
  sortCharsByLuminance: (collectionId: string) => void;

  // Render config
  config: RenderConfig;
  updateConfig: (config: Partial<RenderConfig>) => void;

  // Presets
  presets: Preset[];
  setPresets: (presets: Preset[]) => void;
  addPreset: (preset: Preset) => void;
  removePreset: (id: string) => void;
  applyPreset: (id: string) => void;

  // Processed data
  processedCells: ProcessedCell[];
  setProcessedCells: (cells: ProcessedCell[]) => void;

  // UI state
  isProcessing: boolean;
  setIsProcessing: (value: boolean) => void;
}

const defaultConfig: RenderConfig = {
  brightness: 0,
  contrast: 0,
  exposure: 0,
  gamma: 1,
  saturation: 1,
  threshold: 0.5,
  cellSize: 12,
  spacing: 0,
  mode: 'bw',
};

const defaultPresets: Preset[] = [
  {
    id: 'high-contrast-bw',
    name: 'High Contrast B&W',
    config: { ...defaultConfig, contrast: 50, threshold: 0.6 },
  },
  {
    id: 'color-dense',
    name: 'Color Dense',
    config: { ...defaultConfig, mode: 'color', cellSize: 8, saturation: 1.5 },
  },
  {
    id: 'low-res-pixel',
    name: 'Low Res Pixel',
    config: { ...defaultConfig, cellSize: 24, spacing: 2 },
  },
];

export const useStore = create<AppState>((set, get) => ({
  sourceImage: null,
  setSourceImage: (img) => set({ sourceImage: img }),

  collections: [],
  activeCollectionId: null,
  enabledCharIds: new Set<string>(),
  setCollections: (collections) => {
    const enabledIds = new Set<string>();
    collections.forEach(c => c.chars.forEach(ch => enabledIds.add(ch.id)));
    set({ collections, enabledCharIds: enabledIds });
  },
  setActiveCollection: (id) => set({ activeCollectionId: id }),
  addCollection: (collection) => {
    const enabledIds = new Set(get().enabledCharIds);
    collection.chars.forEach(ch => enabledIds.add(ch.id));
    set((state) => ({ 
      collections: [...state.collections, collection],
      enabledCharIds: enabledIds,
    }));
  },
  removeCollection: (id) => {
    const state = get();
    const collectionToRemove = state.collections.find(c => c.id === id);
    
    // Remove char IDs from this collection
    const enabledIds = new Set(state.enabledCharIds);
    if (collectionToRemove) {
      collectionToRemove.chars.forEach(ch => enabledIds.delete(ch.id));
    }
    
    set({
      collections: state.collections.filter((c) => c.id !== id),
      activeCollectionId: state.activeCollectionId === id ? null : state.activeCollectionId,
      enabledCharIds: enabledIds,
    });
  },
  toggleCharEnabled: (charId) => {
    const enabled = new Set(get().enabledCharIds);
    if (enabled.has(charId)) {
      enabled.delete(charId);
    } else {
      enabled.add(charId);
    }
    set({ enabledCharIds: enabled });
  },
  setEnabledChars: (charIds) => {
    set({ enabledCharIds: new Set(charIds) });
  },
  reorderChars: (collectionId, fromIndex, toIndex) => {
    set((state) => {
      const collections = state.collections.map((collection) => {
        if (collection.id !== collectionId) return collection;
        
        const chars = [...collection.chars];
        const [movedChar] = chars.splice(fromIndex, 1);
        chars.splice(toIndex, 0, movedChar);
        
        return { ...collection, chars };
      });
      
      return { collections };
    });
  },
  sortCharsByLuminance: (collectionId) => {
    set((state) => {
      const collections = state.collections.map((collection) => {
        if (collection.id !== collectionId) return collection;
        
        const chars = [...collection.chars].sort((a, b) => b.luminance - a.luminance);
        
        return { ...collection, chars };
      });
      
      return { collections };
    });
  },

  config: defaultConfig,
  updateConfig: (newConfig) =>
    set((state) => ({ config: { ...state.config, ...newConfig } })),

  presets: defaultPresets,
  setPresets: (presets) => set({ presets }),
  addPreset: (preset) =>
    set((state) => ({ presets: [...state.presets, preset] })),
  removePreset: (id) =>
    set((state) => ({ presets: state.presets.filter((p) => p.id !== id) })),
  applyPreset: (id) => {
    const preset = get().presets.find((p) => p.id === id);
    if (preset) set({ config: preset.config });
  },

  processedCells: [],
  setProcessedCells: (cells) => set({ processedCells: cells }),

  isProcessing: false,
  setIsProcessing: (value) => set({ isProcessing: value }),
}));
