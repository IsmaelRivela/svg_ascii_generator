import { useState, useEffect } from 'react';
import { useStore } from '../stores/useStore';
import { PresetManager } from './PresetManager';

export function ControlPanel() {
  const { config, updateConfig, sourceImage, setEnabledChars, resetConfig } = useStore();
  const [canvasWidth, setCanvasWidth] = useState(800);
  const [canvasHeight, setCanvasHeight] = useState(600);
  const [aspectRatio, setAspectRatio] = useState(4/3);
  const [lockAspectRatio, setLockAspectRatio] = useState(true);

  const handleResetAll = () => {
    if (confirm('¿Resetear todos los ajustes y caracteres seleccionados?')) {
      resetConfig();
      setEnabledChars([]);
      if (sourceImage) {
        const ratio = sourceImage.width / sourceImage.height;
        setAspectRatio(ratio);
        setCanvasWidth(800);
        setCanvasHeight(Math.round(800 / ratio));
      }
    }
  };

  // Update aspect ratio when source image changes
  useEffect(() => {
    if (sourceImage) {
      const ratio = sourceImage.width / sourceImage.height;
      setAspectRatio(ratio);
      setCanvasWidth(800);
      setCanvasHeight(Math.round(800 / ratio));
    }
  }, [sourceImage]);

  const sliders = [
    { key: 'brightness', label: 'Brightness', min: -100, max: 100, step: 1 },
    { key: 'contrast', label: 'Contrast', min: -100, max: 100, step: 1 },
    { key: 'exposure', label: 'Exposure', min: -100, max: 100, step: 1 },
    { key: 'gamma', label: 'Gamma', min: 0.1, max: 3, step: 0.1 },
    { key: 'saturation', label: 'Saturation', min: 0, max: 2, step: 0.1 },
    { key: 'threshold', label: 'Threshold', min: 0, max: 1, step: 0.01 },
    { key: 'cellSize', label: 'Cell Size', min: 4, max: 48, step: 1 },
    { key: 'spacing', label: 'Spacing / Overlap', min: -24, max: 10, step: 1 },
  ];

  return (
    <div
      style={{
        background: 'var(--bg-panel)',
        padding: '20px',
        borderRadius: '8px',
        width: '100%',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '16px' }}>Control Panel</h3>
        <button
          onClick={handleResetAll}
          style={{
            fontSize: '11px',
            padding: '6px 10px',
            background: '#a44',
          }}
          title="Resetear todos los ajustes y caracteres"
        >
          🔄 Reset All
        </button>
      </div>

      <PresetManager />

      <div style={{ marginBottom: '24px' }}>
        <label style={{ fontSize: '13px', marginBottom: '8px', display: 'block' }}>
          Color Mode
        </label>
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['bw', 'color', 'duotone'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => updateConfig({ mode })}
              style={{
                fontSize: '11px',
                padding: '6px 12px',
                background: config.mode === mode ? 'var(--accent)' : 'var(--border)',
              }}
            >
              {mode.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={{ fontSize: '13px', marginBottom: '8px', display: 'block' }}>
          Glyph Selection
        </label>
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['brightness', 'random'] as const).map((cm) => (
            <button
              key={cm}
              onClick={() => updateConfig({ charMode: cm })}
              style={{
                fontSize: '11px',
                padding: '6px 12px',
                background: config.charMode === cm ? 'var(--accent)' : 'var(--border)',
              }}
            >
              {cm === 'brightness' ? 'BY BRIGHTNESS' : 'RANDOM'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={{ fontSize: '13px', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={config.transparentBackground || false}
            onChange={(e) => updateConfig({ transparentBackground: e.target.checked })}
            style={{ marginRight: '8px' }}
          />
          Transparent Background
        </label>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={{ fontSize: '13px', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={config.skipWhiteAreas || false}
            onChange={(e) => updateConfig({ skipWhiteAreas: e.target.checked })}
            style={{ marginRight: '8px' }}
          />
          Skip White Areas
        </label>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={{ fontSize: '13px', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={config.invertColors || false}
            onChange={(e) => updateConfig({ invertColors: e.target.checked })}
            style={{ marginRight: '8px' }}
          />
          Invert Colors
        </label>
      </div>

      {config.skipWhiteAreas && (
        <div style={{ marginBottom: '16px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '4px',
              fontSize: '12px',
            }}
          >
            <label>White Threshold</label>
            <span style={{ color: 'var(--text-dim)' }}>
              {config.whiteThreshold || 0.85}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={config.whiteThreshold || 0.85}
            onChange={(e) =>
              updateConfig({ whiteThreshold: parseFloat(e.target.value) })
            }
          />
        </div>
      )}

      <div style={{ marginBottom: '24px' }}>
        <label style={{ fontSize: '13px', marginBottom: '8px', display: 'block' }}>
          Preview Background
        </label>
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['black', 'white'] as const).map((bg) => (
            <button
              key={bg}
              onClick={() => updateConfig({ previewBackground: bg })}
              style={{
                fontSize: '11px',
                padding: '6px 12px',
                background: (config.previewBackground || 'black') === bg ? 'var(--accent)' : 'var(--border)',
              }}
            >
              {bg.charAt(0).toUpperCase() + bg.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '24px', padding: '12px', background: 'var(--border)', borderRadius: '4px' }}>
        <h4 style={{ fontSize: '13px', marginBottom: '8px' }}>Canvas Size</h4>
        
        {sourceImage && (
          <div style={{ 
            fontSize: '10px', 
            color: 'var(--text-dim)', 
            marginBottom: '12px',
            padding: '6px 8px',
            background: 'var(--bg-panel)',
            borderRadius: '4px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>Original: {sourceImage.width} × {sourceImage.height}px</span>
            {(canvasWidth !== sourceImage.width || canvasHeight !== sourceImage.height) && (
              <span style={{ color: 'var(--accent)' }}>
                → {canvasWidth} × {canvasHeight}px ({((canvasWidth / sourceImage.width) * 100).toFixed(0)}%)
              </span>
            )}
          </div>
        )}
        
        <label style={{ fontSize: '12px', display: 'flex', alignItems: 'center', cursor: 'pointer', marginBottom: '12px' }}>
          <input
            type="checkbox"
            checked={lockAspectRatio}
            onChange={(e) => setLockAspectRatio(e.target.checked)}
            style={{ marginRight: '8px' }}
          />
          Lock Aspect Ratio {aspectRatio && `(${aspectRatio.toFixed(2)})`}
        </label>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '11px', marginBottom: '4px', display: 'block' }}>
              Width: {canvasWidth}px
            </label>
            <input
              type="range"
              min={200}
              max={3840}
              step={10}
              value={canvasWidth}
              onChange={(e) => {
                const newWidth = parseInt(e.target.value);
                setCanvasWidth(newWidth);
                if (lockAspectRatio) {
                  setCanvasHeight(Math.round(newWidth / aspectRatio));
                }
                updateConfig({ canvasWidth: newWidth, canvasHeight: lockAspectRatio ? Math.round(newWidth / aspectRatio) : canvasHeight });
              }}
            />
          </div>
          
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '11px', marginBottom: '4px', display: 'block' }}>
              Height: {canvasHeight}px
            </label>
            <input
              type="range"
              min={200}
              max={3840}
              step={10}
              value={canvasHeight}
              onChange={(e) => {
                const newHeight = parseInt(e.target.value);
                setCanvasHeight(newHeight);
                if (lockAspectRatio) {
                  setCanvasWidth(Math.round(newHeight * aspectRatio));
                }
                updateConfig({ canvasHeight: newHeight, canvasWidth: lockAspectRatio ? Math.round(newHeight * aspectRatio) : canvasWidth });
              }}
            />
          </div>
        </div>
      </div>

      {sliders.map(({ key, label, min, max, step }) => (
        <div key={key} style={{ marginBottom: '16px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '4px',
              fontSize: '12px',
            }}
          >
            <label>{label}</label>
            <span style={{ color: 'var(--text-dim)' }}>
              {config[key as keyof typeof config]}
            </span>
          </div>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={config[key as keyof typeof config] as number}
            onChange={(e) =>
              updateConfig({ [key]: parseFloat(e.target.value) })
            }
          />
        </div>
      ))}
    </div>
  );
}
