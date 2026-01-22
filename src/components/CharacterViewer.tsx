import { useState } from 'react';
import { useStore } from '../stores/useStore';

export function CharacterViewer() {
  const { collections, enabledCharIds, toggleCharEnabled, setEnabledChars, reorderChars, sortCharsByLuminance } = useStore();
  const [expandedCollections, setExpandedCollections] = useState<Set<string>>(new Set(collections.map(c => c.id)));
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [draggedCollectionId, setDraggedCollectionId] = useState<string | null>(null);

  if (collections.length === 0) {
    return null;
  }

  const totalEnabledCount = Array.from(enabledCharIds).length;

  const toggleCollection = (collectionId: string) => {
    const newExpanded = new Set(expandedCollections);
    if (newExpanded.has(collectionId)) {
      newExpanded.delete(collectionId);
    } else {
      newExpanded.add(collectionId);
    }
    setExpandedCollections(newExpanded);
  };

  const toggleAllInCollection = (collectionId: string) => {
    const collection = collections.find(c => c.id === collectionId);
    if (!collection) return;

    const allEnabled = collection.chars.every(ch => enabledCharIds.has(ch.id));
    
    if (allEnabled) {
      // Disable all from this collection
      const newEnabled = Array.from(enabledCharIds).filter(id => 
        !collection.chars.some(ch => ch.id === id)
      );
      setEnabledChars(newEnabled);
    } else {
      // Enable all from this collection
      const newEnabled = new Set(enabledCharIds);
      collection.chars.forEach(ch => newEnabled.add(ch.id));
      setEnabledChars(Array.from(newEnabled));
    }
  };

  const selectByLuminanceRange = (min: number, max: number) => {
    const newEnabled = new Set<string>();
    collections.forEach(collection => {
      collection.chars.forEach(char => {
        if (char.luminance >= min && char.luminance <= max) {
          newEnabled.add(char.id);
        }
      });
    });
    setEnabledChars(Array.from(newEnabled));
  };

  return (
    <div
      style={{
        background: 'var(--bg-panel)',
        padding: '16px',
        borderRadius: '8px',
        marginBottom: '16px',
      }}
    >
      <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ fontSize: '14px' }}>
          Caracteres Activos: <span style={{ color: 'var(--accent)' }}>{totalEnabledCount}</span>
        </h4>
        <button
          onClick={() => setEnabledChars([])}
          style={{
            fontSize: '11px',
            padding: '4px 8px',
            background: '#a44',
          }}
        >
          Limpiar todo
        </button>
      </div>

      <div style={{ marginBottom: '12px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
        <button
          onClick={() => selectByLuminanceRange(0, 0.3)}
          style={{ fontSize: '10px', padding: '4px 8px', background: 'var(--border)' }}
          title="Solo oscuros"
        >
          🌑 Oscuros
        </button>
        <button
          onClick={() => selectByLuminanceRange(0.3, 0.7)}
          style={{ fontSize: '10px', padding: '4px 8px', background: 'var(--border)' }}
          title="Solo medios"
        >
          ◐ Medios
        </button>
        <button
          onClick={() => selectByLuminanceRange(0.7, 1)}
          style={{ fontSize: '10px', padding: '4px 8px', background: 'var(--border)' }}
          title="Solo claros"
        >
          ☀️ Claros
        </button>
      </div>

      {collections.map((collection) => {
        const isExpanded = expandedCollections.has(collection.id);
        const enabledInCollection = collection.chars.filter(ch => enabledCharIds.has(ch.id)).length;
        const allEnabledInCollection = collection.chars.every(ch => enabledCharIds.has(ch.id));

        return (
          <div key={collection.id} style={{ marginBottom: '8px', border: '1px solid var(--border)', borderRadius: '4px' }}>
            <div
              style={{
                padding: '8px 12px',
                background: 'var(--border)',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                userSelect: 'none',
              }}
              onClick={() => toggleCollection(collection.id)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px' }}>{isExpanded ? '▼' : '▶'}</span>
                <span style={{ fontSize: '13px', fontWeight: 500 }}>
                  {collection.name}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                  ({enabledInCollection}/{collection.chars.length})
                </span>
              </div>
              <div style={{ display: 'flex', gap: '4px' }} onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => sortCharsByLuminance(collection.id)}
                  style={{
                    fontSize: '10px',
                    padding: '3px 6px',
                    background: 'var(--accent)',
                  }}
                  title="Ordenar por luminancia"
                >
                  ⬇
                </button>
                <button
                  onClick={() => toggleAllInCollection(collection.id)}
                  style={{
                    fontSize: '10px',
                    padding: '3px 6px',
                    background: allEnabledInCollection ? '#a44' : 'var(--accent)',
                  }}
                >
                  {allEnabledInCollection ? '✕' : '✓'}
                </button>
              </div>
            </div>

            {isExpanded && (
              <div
                style={{
                  padding: '8px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(48px, 1fr))',
                  gap: '6px',
                  maxHeight: '200px',
                  overflowY: 'auto',
                }}
                className="scroll-panel"
              >
                {collection.chars.map((char, index) => {
                  const isEnabled = enabledCharIds.has(char.id);
                  const isDragging = draggedIndex === index && draggedCollectionId === collection.id;

                  return (
                    <button
                      key={char.id}
                      draggable
                      onDragStart={(e) => {
                        setDraggedIndex(index);
                        setDraggedCollectionId(collection.id);
                        e.dataTransfer.effectAllowed = 'move';
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'move';
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (draggedIndex !== null && draggedCollectionId === collection.id && draggedIndex !== index) {
                          reorderChars(collection.id, draggedIndex, index);
                        }
                        setDraggedIndex(null);
                        setDraggedCollectionId(null);
                      }}
                      onDragEnd={() => {
                        setDraggedIndex(null);
                        setDraggedCollectionId(null);
                      }}
                      onClick={() => toggleCharEnabled(char.id)}
                      style={{
                        padding: '6px',
                        background: isEnabled ? 'var(--accent)' : 'var(--bg-panel)',
                        border: isEnabled ? '2px solid var(--accent-hover)' : '2px solid transparent',
                        borderRadius: '4px',
                        cursor: isDragging ? 'grabbing' : 'grab',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '2px',
                        opacity: isDragging ? 0.5 : (isEnabled ? 1 : 0.4),
                        transition: 'all 0.15s',
                        position: 'relative',
                        transform: isDragging ? 'scale(1.05)' : 'scale(1)',
                      }}
                      title={`${char.name} - Lum: ${char.luminance.toFixed(2)}\n${isEnabled ? 'Click: desactivar' : 'Click: activar'}\nDrag: reordenar`}
                    >
                      <div
                        dangerouslySetInnerHTML={{
                          __html: `<svg width="28" height="28" viewBox="${char.viewBox || '0 0 12 12'}" preserveAspectRatio="xMidYMid meet">${char.svg}</svg>`,
                        }}
                        style={{
                          width: '28px',
                          height: '28px',
                          filter: isEnabled ? 'none' : 'grayscale(100%)',
                        }}
                      />
                      <div style={{ fontSize: '7px', color: 'var(--text-dim)', textAlign: 'center', lineHeight: 1 }}>
                        {char.luminance.toFixed(2)}
                      </div>
                      {!isEnabled && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            fontSize: '20px',
                            color: '#a44',
                            pointerEvents: 'none',
                          }}
                        >
                          ✕
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {totalEnabledCount === 0 && (
        <div
          style={{
            marginTop: '8px',
            padding: '8px',
            background: '#443300',
            borderRadius: '4px',
            fontSize: '11px',
            color: '#ffcc00',
            border: '1px solid #665500',
            textAlign: 'center',
          }}
        >
          ⚠️ Debes activar al menos 1 carácter
        </div>
      )}
    </div>
  );
}
