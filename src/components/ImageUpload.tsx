import { useRef } from 'react';
import { useStore } from '../stores/useStore';

export function ImageUpload() {
  const inputRef = useRef<HTMLInputElement>(null);
  const { setSourceImage } = useStore();

  const handleFile = (file: File) => {
    if (!file.type.match(/^image\/(jpeg|png|webp)$/)) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setSourceImage(img);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div
      style={{
        border: '2px dashed var(--border)',
        borderRadius: '8px',
        padding: '32px',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'border-color 0.2s',
      }}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleChange}
      />
      <div style={{ fontSize: '14px', color: 'var(--text-dim)' }}>
        Arrastra una imagen o haz clic para seleccionar
        <br />
        <span style={{ fontSize: '12px' }}>JPG, PNG, WEBP</span>
      </div>
    </div>
  );
}
