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
    { key: 'spacing', label: 'Spacing', min: 0, max: 10, step: 1 },
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
