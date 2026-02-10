import { useEffect, useRef } from 'react';
import { useStore } from './stores/useStore';
import { ImageUpload } from './components/ImageUpload';
import { ControlPanel } from './components/ControlPanel';
import { Preview } from './components/Preview';
import { SVGCollectionEditor } from './components/SVGCollectionEditor';
import { CharacterViewer } from './components/CharacterViewer';
import { ExportPanel } from './components/ExportPanel';
import { useImageProcessor } from './engine/useImageProcessor';
import { loadCollections, loadPresets, loadConfig, saveCollections, savePresets, saveConfig, loadEnabledChars, saveEnabledChars } from './utils/db';
import { defaultCollection, glifosCollection, tulipanaCollectionData } from './utils/defaultSVGs';

const DEFAULT_COLLECTIONS = [defaultCollection, glifosCollection, tulipanaCollectionData];

function App() {
  useImageProcessor();
  const initDone = useRef(false);

  const {
    sourceImage,
    collections,
    enabledCharIds,
    setCollections,
    setActiveCollection,
    setEnabledChars,
    setPresets,
    updateConfig,
    config,
    presets,
  } = useStore();

  // --- Init: load persisted state once ---
  useEffect(() => {
    async function init() {
      const [saved, savedPresets, savedConfig, savedEnabled] = await Promise.all([
        loadCollections(), loadPresets(), loadConfig(), loadEnabledChars(),
      ]);

      // Merge default collections with saved ones (adds missing defaults)
      const savedIds = new Set(saved.map((c: { id: string }) => c.id));
      const missing = DEFAULT_COLLECTIONS.filter(c => !savedIds.has(c.id));
      const all = [...saved, ...missing];

      setCollections(all.length > 0 ? all : DEFAULT_COLLECTIONS);
      setActiveCollection(all.length > 0 ? all[0].id : tulipanaCollectionData.id);

      if (missing.length > 0 || saved.length === 0) saveCollections(all.length > 0 ? all : DEFAULT_COLLECTIONS);
      if (savedEnabled.length > 0) setEnabledChars(savedEnabled);
      if (savedPresets.length > 0) setPresets(savedPresets);
      if (savedConfig) updateConfig(savedConfig);

      initDone.current = true;
    }
    init();
  }, [setCollections, setActiveCollection, setEnabledChars, setPresets, updateConfig]);

  // --- Single debounced auto-save for all state ---
  useEffect(() => {
    if (!initDone.current) return;
    const id = setTimeout(() => {
      saveCollections(collections);
      saveEnabledChars(Array.from(enabledCharIds));
      savePresets(presets);
      saveConfig(config);
    }, 500);
    return () => clearTimeout(id);
  }, [collections, enabledCharIds, presets, config]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: window.innerWidth < 768 ? 'column' : 'row',
        height: '100vh',
        gap: '16px',
        padding: '16px',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          width: window.innerWidth < 768 ? '100%' : '320px',
          maxHeight: window.innerWidth < 768 ? '400px' : '100%',
        }}
        className="scroll-panel"
      >
        <ControlPanel />
        <SVGCollectionEditor />
        <CharacterViewer />
        <ExportPanel />
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {!sourceImage && <ImageUpload />}
        {sourceImage && <Preview />}
      </div>
    </div>
  );
}

export default App;
