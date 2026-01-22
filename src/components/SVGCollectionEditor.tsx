import { useState, useRef } from 'react';
import { useStore } from '../stores/useStore';
import { SVGCollection, SVGChar } from '../types';
import { exportCollectionToFiles, importCollectionFromFiles } from '../utils/collectionExport';
import { processSVGContent, calculateSVGLuminance } from '../utils/svgProcessor';

export function SVGCollectionEditor() {
  const { collections, activeCollectionId, enabledCharIds, addCollection, removeCollection, setActiveCollection } = useStore();
  const [isCreating, setIsCreating] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [uploadedSVGs, setUploadedSVGs] = useState<SVGChar[]>([]);
  const importInputRef = useRef<HTMLInputElement>(null);

  const handleSVGUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    console.log(`Subiendo ${files.length} archivos SVG...`);

    Array.from(files).forEach((file, idx) => {
      console.log(`Procesando archivo ${idx + 1}: ${file.name}`);
      
      const reader = new FileReader();
      
      reader.onerror = () => {
        console.error(`Error leyendo archivo: ${file.name}`);
      };
      
      reader.onload = (event) => {
        try {
          const svgContent = event.target?.result as string;
          
          // Process SVG to replace colors with currentColor
          const processedSVG = processSVGContent(svgContent);
          
          if (!processedSVG) {
            console.warn(`SVG vacío después de procesar: ${file.name}`);
            return;
          }
          
          // Calculate luminance
          const luminance = calculateSVGLuminance(processedSVG);
          
          const newChar: SVGChar = {
            id: `custom-${Date.now()}-${Math.random()}`,
            name: file.name.replace('.svg', ''),
            svg: processedSVG,
            luminance,
          };
          
          console.log(`✅ SVG procesado: ${file.name} (luminancia: ${luminance.toFixed(2)})`);
          setUploadedSVGs((prev) => [...prev, newChar]);
        } catch (error) {
          console.error(`Error procesando ${file.name}:`, error);
          alert(`Error procesando ${file.name}: ${(error as Error).message}`);
        }
      };
      
      reader.readAsText(file);
    });

    // Reset input value to allow re-upload of same files
    e.target.value = '';
  };

  const handleCreateCollection = () => {
    if (!newCollectionName.trim() || uploadedSVGs.length === 0) return;

    const sortedChars = uploadedSVGs.map((char, index) => ({
      ...char,
      luminance: index / (uploadedSVGs.length - 1 || 1),
    }));

    const newCollection: SVGCollection = {
      id: `collection-${Date.now()}`,
      name: newCollectionName,
      chars: sortedChars,
      createdAt: Date.now(),
    };

    addCollection(newCollection);
    setActiveCollection(newCollection.id);
    setIsCreating(false);
    setNewCollectionName('');
    setUploadedSVGs([]);
  };

  const removeSVG = (id: string) => {
    setUploadedSVGs((prev) => prev.filter((s) => s.id !== id));
  };

  const adjustLuminance = (id: string, value: number) => {
    setUploadedSVGs((prev) =>
      prev.map((s) => (s.id === id ? { ...s, luminance: value } : s))
    );
  };

  const addTestSVGs = () => {
    const testSVGs: SVGChar[] = [
      {
        id: `test-${Date.now()}-1`,
        name: 'Círculo pequeño',
        svg: '<circle cx="6" cy="6" r="2" fill="currentColor"/>',
        luminance: 0.2,
      },
      {
        id: `test-${Date.now()}-2`,
        name: 'Círculo medio',
        svg: '<circle cx="6" cy="6" r="4" fill="currentColor"/>',
        luminance: 0.5,
      },
      {
        id: `test-${Date.now()}-3`,
        name: 'Cuadrado',
        svg: '<rect x="2" y="2" width="8" height="8" fill="currentColor"/>',
        luminance: 0.8,
      },
    ];
    setUploadedSVGs((prev) => [...prev, ...testSVGs]);
  };

  const handleExportCollection = (collectionId: string) => {
    const collection = collections.find(c => c.id === collectionId);
    if (collection) {
      exportCollectionToFiles(collection);
    }
  };

  const handleImportCollection = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    try {
      const collection = await importCollectionFromFiles(files);
      // Ask for name
      const name = prompt('Nombre para la colección importada:', collection.name);
      if (name) {
        collection.name = name;
        addCollection(collection);
        setActiveCollection(collection.id);
      }
    } catch (error) {
      alert('Error importando colección: ' + (error as Error).message);
    }

    e.target.value = '';
  };

  if (isCreating) {
    return (
      <div
        style={{
          background: 'var(--bg-panel)',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '16px',
        }}
      >
        <h4 style={{ fontSize: '14px', marginBottom: '12px' }}>Nueva Colección</h4>
        
        <input
          type="text"
          placeholder="Nombre de la colección"
          value={newCollectionName}
          onChange={(e) => setNewCollectionName(e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            marginBottom: '12px',
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: '4px',
            color: 'var(--text)',
            fontSize: '13px',
          }}
        />

        <label
          style={{
            display: 'block',
            padding: '12px',
            background: 'var(--accent)',
            borderRadius: '4px',
            textAlign: 'center',
            cursor: 'pointer',
            fontSize: '12px',
            marginBottom: '12px',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--accent-hover)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--accent)';
          }}
        >
          📤 Subir SVGs (múltiples archivos)
          <input
            type="file"
            accept=".svg,image/svg+xml"
            multiple
            onChange={handleSVGUpload}
            style={{ display: 'none' }}
          />
        </label>

        <button
          onClick={addTestSVGs}
          style={{
            width: '100%',
            fontSize: '11px',
            padding: '8px',
            marginBottom: '12px',
            background: 'var(--border)',
          }}
        >
          🧪 Agregar SVGs de prueba
        </button>

        {uploadedSVGs.length > 0 && (
          <div
            style={{
              padding: '8px',
              background: 'var(--bg)',
              borderRadius: '4px',
              marginBottom: '8px',
              fontSize: '11px',
              color: 'var(--accent)',
            }}
          >
            ✓ {uploadedSVGs.length} SVG{uploadedSVGs.length > 1 ? 's' : ''} cargado{uploadedSVGs.length > 1 ? 's' : ''}
          </div>
        )}

        {uploadedSVGs.length > 0 && (
          <div
            style={{
              maxHeight: '200px',
              overflowY: 'auto',
              marginBottom: '12px',
              background: 'var(--bg)',
              borderRadius: '4px',
              padding: '8px',
            }}
          >
            {uploadedSVGs.map((char) => (
              <div
                key={char.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '8px',
                  padding: '8px',
                  background: 'var(--bg-panel)',
                  borderRadius: '4px',
                }}
              >
                <div
                  dangerouslySetInnerHTML={{
                    __html: `<svg width="20" height="20" viewBox="0 0 12 12">${char.svg}</svg>`,
                  }}
                  style={{ flexShrink: 0 }}
                />
                <div style={{ flex: 1, fontSize: '11px' }}>
                  {char.name}
                  <div style={{ marginTop: '4px' }}>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={char.luminance}
                      onChange={(e) => adjustLuminance(char.id, parseFloat(e.target.value))}
                      style={{ width: '100%', height: '2px' }}
                    />
                    <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>
                      Luminancia: {char.luminance.toFixed(2)}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => removeSVG(char.id)}
                  style={{
                    padding: '4px 8px',
                    fontSize: '11px',
                    background: '#a44',
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {(!newCollectionName.trim() || uploadedSVGs.length === 0) && (
          <div
            style={{
              padding: '8px',
              background: '#443300',
              borderRadius: '4px',
              marginBottom: '8px',
              fontSize: '11px',
              color: '#ffcc00',
              border: '1px solid #665500',
            }}
          >
            {!newCollectionName.trim() && '⚠️ Ingresa un nombre para la colección'}
            {newCollectionName.trim() && uploadedSVGs.length === 0 && '⚠️ Sube al menos 1 SVG o usa SVGs de prueba'}
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleCreateCollection}
            disabled={!newCollectionName.trim() || uploadedSVGs.length === 0}
            style={{ 
              flex: 1, 
              fontSize: '12px',
              opacity: (!newCollectionName.trim() || uploadedSVGs.length === 0) ? 0.5 : 1,
              cursor: (!newCollectionName.trim() || uploadedSVGs.length === 0) ? 'not-allowed' : 'pointer',
            }}
            title={
              !newCollectionName.trim() 
                ? 'Falta el nombre de la colección' 
                : uploadedSVGs.length === 0 
                ? 'Falta subir SVGs' 
                : 'Crear colección'
            }
          >
            Crear ({uploadedSVGs.length})
          </button>
          <button
            onClick={() => {
              setIsCreating(false);
              setNewCollectionName('');
              setUploadedSVGs([]);
            }}
            style={{ flex: 1, fontSize: '12px', background: 'var(--border)' }}
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        background: 'var(--bg-panel)',
        padding: '16px',
        borderRadius: '8px',
        marginBottom: '16px',
      }}
    >
      <h4 style={{ fontSize: '14px', marginBottom: '12px' }}>Colecciones SVG</h4>
      
      <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
        <button
          onClick={() => setIsCreating(true)}
          style={{
            flex: 1,
            fontSize: '12px',
            background: '#4a9eff',
          }}
        >
          + Nueva
        </button>
        <button
          onClick={() => importInputRef.current?.click()}
          style={{
            flex: 1,
            fontSize: '12px',
            background: '#4a9',
          }}
        >
          📥 Importar
        </button>
      </div>

      <input
        ref={importInputRef}
        type="file"
        accept=".svg"
        multiple
        onChange={handleImportCollection}
        style={{ display: 'none' }}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {collections.map((collection) => {
          const enabledCount = collection.chars.filter(ch => enabledCharIds.has(ch.id)).length;
          
          return (
            <div
              key={collection.id}
              style={{
                display: 'flex',
                gap: '8px',
                alignItems: 'center',
              }}
            >
              <button
                onClick={() => setActiveCollection(collection.id)}
                style={{
                  flex: 1,
                  fontSize: '11px',
                  padding: '8px',
                  textAlign: 'left',
                  background: activeCollectionId === collection.id ? 'var(--accent)' : 'var(--border)',
                  fontWeight: activeCollectionId === collection.id ? '600' : 'normal',
                }}
              >
                {collection.name}
                <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '2px' }}>
                  {enabledCount}/{collection.chars.length} activos
                </div>
              </button>
            <button
              onClick={() => handleExportCollection(collection.id)}
              style={{
                padding: '8px',
                fontSize: '11px',
                background: 'var(--accent)',
                minWidth: '32px',
              }}
              title="Exportar colección"
            >
              📤
            </button>
            {collection.id !== 'default' && (
              <button
                onClick={() => removeCollection(collection.id)}
                style={{
                  padding: '8px',
                  fontSize: '11px',
                  background: '#a44',
                  minWidth: '32px',
                }}
                title="Eliminar colección"
              >
                ✕
              </button>
            )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
