import { useEffect, useRef, useMemo } from 'react';
import { useStore } from '../stores/useStore';

const svgCache = new Map<string, HTMLImageElement>();

export function Preview() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { processedCells, config, isProcessing } = useStore();
  const renderingRef = useRef(false);

  const dimensions = useMemo(() => {
    if (processedCells.length === 0) return { width: 0, height: 0 };
    const { cellSize, spacing } = config;
    const actualCellSize = cellSize + spacing;
    const maxX = Math.max(...processedCells.map((c) => c.x));
    const maxY = Math.max(...processedCells.map((c) => c.y));
    return {
      width: (maxX + 1) * actualCellSize,
      height: (maxY + 1) * actualCellSize,
    };
  }, [processedCells, config]);

  useEffect(() => {
    if (!canvasRef.current || processedCells.length === 0 || renderingRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    renderingRef.current = true;
    const { cellSize, spacing } = config;
    const actualCellSize = cellSize + spacing;

    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const loadQueue: Promise<void>[] = [];
    const imagesToLoad = new Map<string, { img: HTMLImageElement; cells: typeof processedCells }>();

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

      const cacheKey = `${cell.char.id}-${color}`;
      
      if (svgCache.has(cacheKey)) {
        const img = svgCache.get(cacheKey)!;
        ctx.drawImage(img, x, y, cellSize, cellSize);
      } else {
        if (!imagesToLoad.has(cacheKey)) {
          const svg = cell.char.svg.replace(/currentColor/g, color);
          const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12">${svg}</svg>`;
          const img = new Image();
          
          const promise = new Promise<void>((resolve) => {
            img.onload = () => {
              svgCache.set(cacheKey, img);
              resolve();
            };
            img.onerror = () => resolve();
            img.src = 'data:image/svg+xml;base64,' + btoa(svgContent);
          });
          
          loadQueue.push(promise);
          imagesToLoad.set(cacheKey, { img, cells: [] });
        }
        imagesToLoad.get(cacheKey)!.cells.push({ ...cell, x, y });
      }
    });

    Promise.all(loadQueue)
      .then(() => {
        imagesToLoad.forEach(({ img, cells }) => {
          cells.forEach((cell) => {
            ctx.drawImage(img, cell.x, cell.y, cellSize, cellSize);
          });
        });
        renderingRef.current = false;
      })
      .catch((error) => {
        console.error('Error rendering preview:', error);
        renderingRef.current = false;
      });

  }, [processedCells, config, dimensions]);

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'auto',
        background: '#000',
        position: 'relative',
      }}
    >
      {isProcessing && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'var(--text-dim)',
            fontSize: '14px',
          }}
        >
          Processing...
        </div>
      )}
      <canvas
        ref={canvasRef}
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          imageRendering: 'pixelated',
        }}
      />
    </div>
  );
}
