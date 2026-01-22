import { useStore } from '../stores/useStore';
import { PresetManager } from './PresetManager';

export function ControlPanel() {
  const { config, updateConfig } = useStore();

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
      <h3 style={{ marginBottom: '16px', fontSize: '16px' }}>Control Panel</h3>

      <PresetManager />

      <div style={{ marginBottom: '24px' }}>
        <label style={{ fontSize: '13px', marginBottom: '8px', display: 'block' }}>
          Mode
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
