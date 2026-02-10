import { useEffect, useRef } from 'react';
import { useStore } from '../stores/useStore';

// Pre-render each unique glyph ONCE as a bitmap at the current cellSize.
// Then stamp them onto the main canvas with color tinting.
// This avoids creating thousands of Image objects per frame.

const glyphCache = new Map<string, CanvasRenderingContext2D>();
let cachedCellSize = 0;

function getGlyphBitmap(char: { id: string; svg: string; viewBox?: string }, cellSize: number): CanvasRenderingContext2D | null {
  // Invalidate cache if cellSize changed
  if (cellSize !== cachedCellSize) {
    glyphCache.clear();
    cachedCellSize = cellSize;
  }

  const cached = glyphCache.get(char.id);
  if (cached) return cached;

  // Render glyph to an offscreen canvas (white on transparent)
  const canvas = document.createElement('canvas');
  canvas.width = cellSize;
  canvas.height = cellSize;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Use SVG with white fill so we can tint it later
  const svg = char.svg.replace(/currentColor/g, '#fff');
  const viewBox = char.viewBox || '0 0 12 12';
  const svgStr = `<svg xmlns="http://www.w3.org/2000/svg" width="${cellSize}" height="${cellSize}" viewBox="${viewBox}">${svg}</svg>`;

  const img = new Image();
  img.src = 'data:image/svg+xml;base64,' + btoa(svgStr);

  // Synchronous if already cached by browser, otherwise we queue
  if (img.complete && img.naturalWidth > 0) {
    ctx.drawImage(img, 0, 0, cellSize, cellSize);
    glyphCache.set(char.id, ctx);
    return ctx;
  }

  // Async path: load and cache
  img.onload = () => {
    ctx.drawImage(img, 0, 0, cellSize, cellSize);
    glyphCache.set(char.id, ctx);
  };

  return null; // Will be available next render
}

export function Preview() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { processedCells, config, isProcessing } = useStore();
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!canvasRef.current || processedCells.length === 0) return;

    // Cancel previous render
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const { cellSize, spacing } = config;
    const step = cellSize + spacing;

    // Compute canvas size
    let maxX = 0, maxY = 0;
    for (let i = 0; i < processedCells.length; i++) {
      if (processedCells[i].x > maxX) maxX = processedCells[i].x;
      if (processedCells[i].y > maxY) maxY = processedCells[i].y;
    }
    const w = (maxX + 1) * step;
    const h = (maxY + 1) * step;

    canvas.width = w;
    canvas.height = h;

    // Background
    ctx.clearRect(0, 0, w, h);
    if (!config.transparentBackground) {
      ctx.fillStyle = config.previewBackground === 'white' ? '#fff' : '#000';
      ctx.fillRect(0, 0, w, h);
    }

    // Pre-warm glyph cache
    const uniqueChars = new Map<string, typeof processedCells[0]['char']>();
    for (const cell of processedCells) {
      if (!uniqueChars.has(cell.char.id)) {
        uniqueChars.set(cell.char.id, cell.char);
      }
    }
    let allCached = true;
    for (const char of uniqueChars.values()) {
      if (!getGlyphBitmap(char, cellSize)) allCached = false;
    }

    // If not all glyphs are cached yet, retry after a short delay
    if (!allCached) {
      rafRef.current = requestAnimationFrame(() => {
        // Trigger re-render by dispatching a minimal state change
        // Actually we just re-run this effect by using a timeout
      });
      const timer = setTimeout(() => {
        // Force re-render by re-setting cells (zustand will notify)
        canvasRef.current?.dispatchEvent(new Event('render'));
      }, 50);
      return () => clearTimeout(timer);
    }

    // Stamp cell by cell using a temporary single-cell canvas for tinting
    const stampCanvas = document.createElement('canvas');
    stampCanvas.width = cellSize;
    stampCanvas.height = cellSize;
    const stampCtx = stampCanvas.getContext('2d')!;

    // Render in batches via rAF to avoid blocking
    const BATCH = 2000;
    let idx = 0;

    const renderBatch = () => {
      const end = Math.min(idx + BATCH, processedCells.length);

      for (; idx < end; idx++) {
        const cell = processedCells[idx];
        const glyph = glyphCache.get(cell.char.id);
        if (!glyph) continue;

        const px = cell.x * step;
        const py = cell.y * step;

        // Determine color
        let r: number, g: number, b: number;
        if (config.mode === 'bw') {
          const gray = Math.floor(cell.luminance * 255);
          r = g = b = gray;
        } else {
          r = cell.r;
          g = cell.g;
          b = cell.b;
        }

        // Tint: draw glyph mask, then multiply with color
        stampCtx.clearRect(0, 0, cellSize, cellSize);
        stampCtx.globalCompositeOperation = 'source-over';
        stampCtx.drawImage(glyph.canvas, 0, 0);
        stampCtx.globalCompositeOperation = 'source-in';
        stampCtx.fillStyle = `rgb(${r},${g},${b})`;
        stampCtx.fillRect(0, 0, cellSize, cellSize);

        ctx.drawImage(stampCanvas, px, py);
      }

      if (idx < processedCells.length) {
        rafRef.current = requestAnimationFrame(renderBatch);
      }
    };

    rafRef.current = requestAnimationFrame(renderBatch);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [processedCells, config]);

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
          Procesando...
        </div>
      )}
      <canvas
        ref={canvasRef}
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
        }}
      />
    </div>
  );
}
