import { useStore } from '../stores/useStore';

export function ExportPanel() {
  const { processedCells, config } = useStore();

  const exportJPEG = () => {
    if (processedCells.length === 0) return;

    const { cellSize, spacing } = config;
    const actualCellSize = cellSize + spacing;

    const maxX = Math.max(...processedCells.map((c) => c.x));
    const maxY = Math.max(...processedCells.map((c) => c.y));

    const width = (maxX + 1) * actualCellSize;
    const height = (maxY + 1) * actualCellSize;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);

    const renderQueue: Promise<void>[] = [];

    processedCells.forEach((cell) => {
      const x = cell.x * actualCellSize;
      const y = cell.y * actualCellSize;

      let color: string;
      if (config.mode === 'bw') {
        const gray = Math.floor(cell.luminance * 255);
        color = `rgb(${gray}, ${gray}, ${gray})`;
      } else {
        color = `rgb(${cell.r}, ${cell.g}, ${cell.b})`;
      }

      const promise = new Promise<void>((resolve) => {
        const img = new Image();
        const svg = cell.char.svg.replace(/currentColor/g, color);
        const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12">${svg}</svg>`;
        img.onload = () => {
          ctx.drawImage(img, x, y, cellSize, cellSize);
          resolve();
        };
        img.onerror = () => resolve();
        img.src = 'data:image/svg+xml;base64,' + btoa(svgContent);
      });

      renderQueue.push(promise);
    });

    Promise.all(renderQueue).then(() => {
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ascii-art.jpg';
        a.click();
        URL.revokeObjectURL(url);
      }, 'image/jpeg', 0.95);
    });
  };

  const exportSVG = () => {
    if (processedCells.length === 0) return;

    const { cellSize, spacing } = config;
    const actualCellSize = cellSize + spacing;

    const maxX = Math.max(...processedCells.map((c) => c.x));
    const maxY = Math.max(...processedCells.map((c) => c.y));

    const width = (maxX + 1) * actualCellSize;
    const height = (maxY + 1) * actualCellSize;

    let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;
    svgContent += `<rect width="${width}" height="${height}" fill="#000"/>`;

    processedCells.forEach((cell) => {
      const x = cell.x * actualCellSize;
      const y = cell.y * actualCellSize;

      let color: string;
      if (config.mode === 'bw') {
        const gray = Math.floor(cell.luminance * 255);
        color = `rgb(${gray}, ${gray}, ${gray})`;
      } else {
        color = `rgb(${cell.r}, ${cell.g}, ${cell.b})`;
      }

      const charSvg = cell.char.svg.replace(/currentColor/g, color);
      svgContent += `<g transform="translate(${x}, ${y}) scale(${cellSize / 12})">`;
      svgContent += charSvg;
      svgContent += `</g>`;
    });

    svgContent += `</svg>`;

    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ascii-art.svg';
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPNG = () => {
    if (processedCells.length === 0) return;

    const { cellSize, spacing } = config;
    const actualCellSize = cellSize + spacing;

    const maxX = Math.max(...processedCells.map((c) => c.x));
    const maxY = Math.max(...processedCells.map((c) => c.y));

    const width = (maxX + 1) * actualCellSize;
    const height = (maxY + 1) * actualCellSize;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);

    const renderQueue: Promise<void>[] = [];

    processedCells.forEach((cell) => {
      const x = cell.x * actualCellSize;
      const y = cell.y * actualCellSize;

      let color: string;
      if (config.mode === 'bw') {
        const gray = Math.floor(cell.luminance * 255);
        color = `rgb(${gray}, ${gray}, ${gray})`;
      } else {
        color = `rgb(${cell.r}, ${cell.g}, ${cell.b})`;
      }

      const promise = new Promise<void>((resolve) => {
        const img = new Image();
        const svg = cell.char.svg.replace(/currentColor/g, color);
        const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12">${svg}</svg>`;
        img.onload = () => {
          ctx.drawImage(img, x, y, cellSize, cellSize);
          resolve();
        };
        img.onerror = () => resolve();
        img.src = 'data:image/svg+xml;base64,' + btoa(svgContent);
      });

      renderQueue.push(promise);
    });

    Promise.all(renderQueue).then(() => {
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ascii-art.png';
        a.click();
        URL.revokeObjectURL(url);
      }, 'image/png');
    });
  };

  return (
    <div
      style={{
        background: 'var(--bg-panel)',
        padding: '16px',
        borderRadius: '8px',
      }}
    >
      <h4 style={{ fontSize: '14px', marginBottom: '12px' }}>Export</h4>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button
          onClick={exportSVG}
          disabled={processedCells.length === 0}
          style={{ flex: 1, fontSize: '12px', minWidth: '60px' }}
        >
          SVG
        </button>
        <button
          onClick={exportPNG}
          disabled={processedCells.length === 0}
          style={{ flex: 1, fontSize: '12px', minWidth: '60px' }}
        >
          PNG
        </button>
        <button
          onClick={exportJPEG}
          disabled={processedCells.length === 0}
          style={{ flex: 1, fontSize: '12px', minWidth: '60px' }}
        >
          JPEG
        </button>
      </div>
    </div>
  );
}
