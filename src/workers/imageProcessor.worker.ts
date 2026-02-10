import { RenderConfig, SVGChar, ProcessedCell } from '../types';

interface WorkerMessage {
  type: 'process';
  imageData: ImageData;
  config: RenderConfig;
  chars: SVGChar[];
}

self.onmessage = (e: MessageEvent<WorkerMessage>) => {
  try {
    const { type, imageData, config, chars } = e.data;
    if (type === 'process') {
      if (!chars || chars.length === 0) {
        self.postMessage({ type: 'result', cells: [] });
        return;
      }
      const cells = processImage(imageData, config, chars);
      self.postMessage({ type: 'result', cells });
    }
  } catch (error) {
    console.error('Worker error:', error);
    self.postMessage({ type: 'result', cells: [] });
  }
};

function processImage(
  imageData: ImageData,
  config: RenderConfig,
  chars: SVGChar[]
): ProcessedCell[] {
  const { width, height, data } = imageData;
  const { cellSize, brightness, contrast, exposure, gamma, saturation, threshold, skipWhiteAreas, whiteThreshold, invertColors, charMode } = config;

  const cols = Math.ceil(width / cellSize);
  const rows = Math.ceil(height / cellSize);

  // Pre-sort chars for brightness mode (only sort once)
  const sortedChars = charMode === 'brightness'
    ? [...chars].sort((a, b) => a.luminance - b.luminance)
    : chars;

  // Pre-allocate array for performance
  const cells: ProcessedCell[] = [];
  cells.length = 0; // hint to engine

  // Seeded PRNG for consistent random results per position (avoids flicker)
  // Simple mulberry32
  let seed = 1337;
  const random = () => {
    seed |= 0;
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * cellSize;
      const y = row * cellSize;

      let { r, g, b, luminance } = sampleCell(data, width, height, x, y, cellSize);

      if (invertColors) {
        r = 255 - r;
        g = 255 - g;
        b = 255 - b;
        luminance = 1 - luminance;
      }

      if (skipWhiteAreas && luminance >= (whiteThreshold || 0.85)) {
        continue;
      }

      const adj = adjust(r, g, b, luminance, brightness, contrast, exposure, gamma, saturation, threshold);

      // Select char based on mode
      let char: SVGChar;
      if (charMode === 'random') {
        // Random selection - seed ensures same position gets same char per render
        const idx = Math.floor(random() * sortedChars.length);
        char = sortedChars[idx];
      } else {
        // Brightness-based selection (binary search)
        char = selectByBrightness(adj.luminance, sortedChars);
      }

      cells.push({
        x: col,
        y: row,
        luminance: adj.luminance,
        r: adj.r,
        g: adj.g,
        b: adj.b,
        char,
      });
    }
  }

  return cells;
}

// Sample average color of a cell region
function sampleCell(
  data: Uint8ClampedArray,
  imgW: number,
  imgH: number,
  sx: number,
  sy: number,
  size: number
) {
  let r = 0, g = 0, b = 0, count = 0;
  const endX = Math.min(sx + size, imgW);
  const endY = Math.min(sy + size, imgH);

  for (let y = sy; y < endY; y++) {
    const rowOffset = y * imgW;
    for (let x = sx; x < endX; x++) {
      const i = (rowOffset + x) * 4;
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
      count++;
    }
  }

  if (count === 0) return { r: 0, g: 0, b: 0, luminance: 0 };

  r = r / count;
  g = g / count;
  b = b / count;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return { r, g, b, luminance };
}

// Apply all adjustments in one pass (inlined for speed)
function adjust(
  r: number, g: number, b: number, luminance: number,
  brightness: number, contrast: number, exposure: number,
  gamma: number, saturation: number, threshold: number
) {
  // Exposure
  const exp = Math.pow(2, exposure / 100);
  r *= exp; g *= exp; b *= exp;

  // Brightness
  const br = brightness * 2.55;
  r += br; g += br; b += br;

  // Contrast
  const cf = (contrast + 100) / 100;
  r = ((r / 255 - 0.5) * cf + 0.5) * 255;
  g = ((g / 255 - 0.5) * cf + 0.5) * 255;
  b = ((b / 255 - 0.5) * cf + 0.5) * 255;

  // Saturation
  const gray = 0.299 * r + 0.587 * g + 0.114 * b;
  r = gray + (r - gray) * saturation;
  g = gray + (g - gray) * saturation;
  b = gray + (b - gray) * saturation;

  // Clamp
  r = r < 0 ? 0 : r > 255 ? 255 : r;
  g = g < 0 ? 0 : g > 255 ? 255 : g;
  b = b < 0 ? 0 : b > 255 ? 255 : b;

  // Luminance + gamma + threshold
  luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  luminance = Math.pow(luminance, 1 / gamma);
  if (luminance < threshold) luminance = 0;

  return { r, g, b, luminance };
}

// Binary search for closest luminance match
function selectByBrightness(luminance: number, sorted: SVGChar[]): SVGChar {
  if (sorted.length === 1) return sorted[0];

  let lo = 0, hi = sorted.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (sorted[mid].luminance < luminance) {
      lo = mid + 1;
    } else {
      hi = mid;
    }
  }

  // Check neighbor for closest
  if (lo > 0 && Math.abs(sorted[lo - 1].luminance - luminance) < Math.abs(sorted[lo].luminance - luminance)) {
    return sorted[lo - 1];
  }
  return sorted[lo];
}

export {};
