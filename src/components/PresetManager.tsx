import { useState } from 'react';
import { useStore } from '../stores/useStore';
import { Preset } from '../types';

export function PresetManager() {
  const { presets, config, addPreset, removePreset, applyPreset } = useStore();
  const [isSaving, setIsSaving] = useState(false);
  const [presetName, setPresetName] = useState('');

  const handleSavePreset = () => {
    if (!presetName.trim()) return;

    const newPreset: Preset = {
      id: `preset-${Date.now()}`,
      name: presetName,
      config: { ...config },
    };

    addPreset(newPreset);
    setIsSaving(false);
    setPresetName('');
  };

  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <label style={{ fontSize: '13px' }}>Presets</label>
        <button
          onClick={() => setIsSaving(!isSaving)}
          style={{
            fontSize: '11px',
            padding: '4px 8px',
            background: isSaving ? 'var(--border)' : 'var(--accent)',
          }}
        >
          {isSaving ? '✕' : '+ Guardar'}
        </button>
      </div>

      {isSaving && (
        <div style={{ marginBottom: '8px' }}>
          <input
            type="text"
            placeholder="Nombre del preset"
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSavePreset()}
            autoFocus
            style={{
              width: '100%',
              padding: '6px 8px',
              marginBottom: '6px',
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              color: 'var(--text)',
              fontSize: '12px',
            }}
          />
          <button
            onClick={handleSavePreset}
            disabled={!presetName.trim()}
            style={{ width: '100%', fontSize: '11px', padding: '6px' }}
          >
            Guardar configuración actual
          </button>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {presets.map((preset) => (
          <div key={preset.id} style={{ display: 'flex', gap: '4px' }}>
            <button
              onClick={() => applyPreset(preset.id)}
              style={{
                flex: 1,
                fontSize: '11px',
                padding: '6px 12px',
                textAlign: 'left',
              }}
            >
              {preset.name}
            </button>
            {!preset.id.startsWith('high-contrast') &&
              !preset.id.startsWith('color-dense') &&
              !preset.id.startsWith('low-res') && (
                <button
                  onClick={() => removePreset(preset.id)}
                  style={{
                    fontSize: '11px',
                    padding: '6px 8px',
                    background: '#a44',
                  }}
                >
                  ✕
                </button>
              )}
          </div>
        ))}
      </div>
    </div>
  );
}
