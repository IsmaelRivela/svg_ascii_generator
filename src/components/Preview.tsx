import { useEffect, useRef, useMemo } from 'react';
import { useStore } from '../stores/useStore';

const svgCache = new Map<string, HTMLImageElement>();
const BATCH_SIZE = 500; // Render in batches to avoid blocking UI

export function Preview() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { processedCells, config, isProcessing } = useStore();
  const renderingRef = useRef(false);
  const animationFrameRef = useRef<number>();

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
    const ctx = canvas.getContext('2d', { alpha: config.transparentBackground || false, willReadFrequently: false });
    if (!ctx) return;

    renderingRef.current = true;
    const { cellSize, spacing } = config;
    const actualCellSize = cellSize + spacing;

    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    // Only fill background if not transparent
    if (!config.transparentBackground) {
      ctx.fillStyle = config.previewBackground === 'white' ? '#fff' : '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    // Pre-process all cells and group by cache key
    const cellsByKey = new Map<string, Array<{ x: number; y: number }>>();
    const imagesToLoad = new Map<string, HTMLImageElement>();

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
      
      if (!cellsByKey.has(cacheKey)) {
        cellsByKey.set(cacheKey, []);
      }
      cellsByKey.get(cacheKey)!.push({ x, y });

      // Create image only once per unique key
      if (!svgCache.has(cacheKey) && !imagesToLoad.has(cacheKey)) {
        const svg = cell.char.svg.replace(/currentColor/g, color);
        const viewBox = cell.char.viewBox || '0 0 12 12';
        const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="${viewBox}">${svg}</svg>`;
        const img = new Image();
        img.src = 'data:image/svg+xml;base64,' + btoa(svgContent);
        imagesToLoad.set(cacheKey, img);
      }
    });

    // Render function that works in batches
    const renderBatch = (startIdx: number, keys: string[]) => {
      const endIdx = Math.min(startIdx + BATCH_SIZE, processedCells.length);
      let rendered = 0;

      for (const [cacheKey, positions] of cellsByKey.entries()) {
        const img = svgCache.get(cacheKey) || imagesToLoad.get(cacheKey);
        if (!img || !img.complete) continue;

        for (const { x, y } of positions) {
          if (rendered >= startIdx && rendered < endIdx) {
            ctx.drawImage(img, x, y, cellSize, cellSize);
          }
          rendered++;
        }
      }

      if (endIdx < processedCells.length) {
        animationFrameRef.current = requestAnimationFrame(() => renderBatch(endIdx, keys));
      } else {
        renderingRef.current = false;
      }
    };

    // Wait for all images to load, then render
    const loadPromises = Array.from(imagesToLoad.entries()).map(([key, img]) => 
      new Promise<void>((resolve) => {
        if (img.complete) {
          svgCache.set(key, img);
          resolve();
        } else {
          img.onload = () => {
            svgCache.set(key, img);
            resolve();
          };
          img.onerror = () => resolve();
        }
      })
    );

    // Render already cached images immediately
    const cachedRender = () => {
      for (const [cacheKey, positions] of cellsByKey.entries()) {
        const img = svgCache.get(cacheKey);
        if (img) {
          for (const { x, y } of positions) {
            ctx.drawImage(img, x, y, cellSize, cellSize);
          }
        }
      }
    };

    if (imagesToLoad.size === 0) {
      // All images are cached
      cachedRender();
      renderingRef.current = false;
    } else {
      // Load new images and render
      Promise.all(loadPromises).then(() => {
        const keys = Array.from(cellsByKey.keys());
        renderBatch(0, keys);
      }).catch((error) => {
        console.error('Error rendering preview:', error);
        renderingRef.current = false;
      });
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [processedCells, config, dimensions]);

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'auto',
        background: config.previewBackground === 'white' ? '#fff' : '#000',
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
