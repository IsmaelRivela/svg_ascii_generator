import { useEffect } from 'react';
import { useStore } from './stores/useStore';
import { ImageUpload } from './components/ImageUpload';
import { ControlPanel } from './components/ControlPanel';
import { Preview } from './components/Preview';
import { SVGCollectionEditor } from './components/SVGCollectionEditor';
import { CharacterViewer } from './components/CharacterViewer';
import { ExportPanel } from './components/ExportPanel';
import { useImageProcessor } from './engine/useImageProcessor';
import { loadCollections, loadPresets, loadConfig, saveCollections, savePresets, saveConfig, loadEnabledChars, saveEnabledChars } from './utils/db';
import { defaultCollection, glifosCollection } from './utils/defaultSVGs';

function App() {
  useImageProcessor();

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

  useEffect(() => {
    async function init() {
      const [savedCollections, savedPresets, savedConfig, savedEnabledChars] = await Promise.all([
        loadCollections(),
        loadPresets(),
        loadConfig(),
        loadEnabledChars(),
      ]);

      if (savedCollections.length === 0) {
        setCollections([defaultCollection, glifosCollection]);
        setActiveCollection(glifosCollection.id);
        saveCollections([defaultCollection, glifosCollection]);
      } else {
        setCollections(savedCollections);
        if (savedCollections.length > 0) {
          setActiveCollection(savedCollections[0].id);
        }
        
        // Load enabled chars if saved
        if (savedEnabledChars.length > 0) {
          setEnabledChars(savedEnabledChars);
        }
      }

      if (savedPresets.length > 0) {
        setPresets(savedPresets);
      }

      if (savedConfig) {
        updateConfig(savedConfig);
      }
    }

    init();
  }, [setCollections, setActiveCollection, setEnabledChars, setPresets, updateConfig]);

  useEffect(() => {
    if (collections.length > 0) {
      saveCollections(collections);
    }
  }, [collections]);

  useEffect(() => {
    saveEnabledChars(Array.from(enabledCharIds));
  }, [enabledCharIds]);

  useEffect(() => {
    if (presets.length > 0) {
      savePresets(presets);
    }
  }, [presets]);

  useEffect(() => {
    saveConfig(config);
  }, [config]);

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

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        {!sourceImage && <ImageUpload />}
        {sourceImage && <Preview />}
      </div>
    </div>
  );
}

export default App;
