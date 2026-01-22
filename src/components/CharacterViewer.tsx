import { useState } from 'react';
import { useStore } from '../stores/useStore';

export function CharacterViewer() {
  const { collections, activeCollectionId, enabledCharIds, toggleCharEnabled, setEnabledChars, reorderChars, sortCharsByLuminance } = useStore();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const activeCollection = collections.find(c => c.id === activeCollectionId);

  if (!activeCollection) {
    return null;
  }

  const allEnabled = activeCollection.chars.every(ch => enabledCharIds.has(ch.id));
  const noneEnabled = activeCollection.chars.every(ch => !enabledCharIds.has(ch.id));

  const toggleAll = () => {
    if (allEnabled) {
      // Disable all
      setEnabledChars([]);
    } else {
      // Enable all
      setEnabledChars(activeCollection.chars.map(ch => ch.id));
    }
  };

  const enabledCount = activeCollection.chars.filter(ch => enabledCharIds.has(ch.id)).length;

  return (
    <div
      style={{
        background: 'var(--bg-panel)',
        padding: '16px',
        borderRadius: '8px',
        marginBottom: '16px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', gap: '8px' }}>
        <h4 style={{ fontSize: '14px' }}>
          Caracteres ({enabledCount}/{activeCollection.chars.length})
        </h4>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            onClick={() => sortCharsByLuminance(activeCollection.id)}
            style={{
              fontSize: '11px',
              padding: '4px 8px',
              background: 'var(--accent)',
            }}
            title="Ordenar de más oscuro a más claro"
          >
            ⬇ Ordenar
          </button>
          <button
            onClick={toggleAll}
            style={{
              fontSize: '11px',
              padding: '4px 8px',
              background: allEnabled ? '#a44' : 'var(--accent)',
            }}
          >
            {allEnabled ? 'Desactivar todos' : 'Activar todos'}
          </button>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(48px, 1fr))',
          gap: '6px',
          maxHeight: '300px',
          overflowY: 'auto',
        }}
        className="scroll-panel"
      >
        {activeCollection.chars.map((char, index) => {
          const isEnabled = enabledCharIds.has(char.id);
          const isDragging = draggedIndex === index;
          
          return (
            <button
              key={char.id}
              draggable
              onDragStart={(e) => {
                setDraggedIndex(index);
                e.dataTransfer.effectAllowed = 'move';
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
              }}
              onDrop={(e) => {
                e.preventDefault();
                if (draggedIndex !== null && draggedIndex !== index) {
                  reorderChars(activeCollection.id, draggedIndex, index);
                }
                setDraggedIndex(null);
              }}
              onDragEnd={() => setDraggedIndex(null)}
              onClick={() => toggleCharEnabled(char.id)}
              style={{
                padding: '8px',
                background: isEnabled ? 'var(--accent)' : 'var(--border)',
                border: isEnabled ? '2px solid var(--accent-hover)' : '2px solid transparent',
                borderRadius: '4px',
                cursor: isDragging ? 'grabbing' : 'grab',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                opacity: isDragging ? 0.5 : (isEnabled ? 1 : 0.4),
                transition: 'all 0.2s',
                position: 'relative',
                transform: isDragging ? 'scale(1.05)' : 'scale(1)',
              }}
              title={`${char.name} - Luminancia: ${char.luminance.toFixed(2)}\n${isEnabled ? 'Click para desactivar' : 'Click para activar'}\nArrastrar para reordenar`}
            >
              <div
                dangerouslySetInnerHTML={{
                  __html: `<svg width="32" height="32" viewBox="${char.viewBox || '0 0 12 12'}" preserveAspectRatio="xMidYMid meet">${char.svg}</svg>`,
                }}
                style={{ 
                  width: '32px', 
                  height: '32px',
                  filter: isEnabled ? 'none' : 'grayscale(100%)',
                }}
              />
              <div style={{ fontSize: '8px', color: 'var(--text-dim)', textAlign: 'center', lineHeight: 1 }}>
                {char.luminance.toFixed(2)}
              </div>
              {!isEnabled && (
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    fontSize: '24px',
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

      {noneEnabled && (
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
