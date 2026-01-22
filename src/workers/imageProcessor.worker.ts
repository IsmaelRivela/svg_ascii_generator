import { RenderConfig, SVGChar, ProcessedCell } from '../types';

interface WorkerMessage {
  type: 'process';
  imageData: ImageData;
  config: RenderConfig;
  chars: SVGChar[];
}

self.onmessage = (e: MessageEvent<WorkerMessage>) => {
  const { type, imageData, config, chars } = e.data;

  if (type === 'process') {
    const cells = processImage(imageData, config, chars);
    self.postMessage({ type: 'result', cells });
  }
};

function processImage(
  imageData: ImageData,
  config: RenderConfig,
  chars: SVGChar[]
): ProcessedCell[] {
  const { width, height, data } = imageData;
  const { cellSize, brightness, contrast, exposure, gamma, saturation, threshold } = config;

  const cols = Math.ceil(width / cellSize);
  const rows = Math.ceil(height / cellSize);
  const cells: ProcessedCell[] = [];

  const sortedChars = [...chars].sort((a, b) => a.luminance - b.luminance);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * cellSize;
      const y = row * cellSize;
      
      const { r, g, b, luminance } = calculateCellAverage(
        data,
        width,
        height,
        x,
        y,
        cellSize
      );

      const adjusted = adjustValues(
        { r, g, b, luminance },
        brightness,
        contrast,
        exposure,
        gamma,
        saturation,
        threshold
      );

      const char = selectChar(adjusted.luminance, sortedChars);

      cells.push({
        x: col,
        y: row,
        luminance: adjusted.luminance,
        r: adjusted.r,
        g: adjusted.g,
        b: adjusted.b,
        char,
      });
    }
  }

  return cells;
}

function calculateCellAverage(
  data: Uint8ClampedArray,
  imgWidth: number,
  imgHeight: number,
  startX: number,
  startY: number,
  cellSize: number
) {
  let r = 0, g = 0, b = 0, count = 0;

  for (let dy = 0; dy < cellSize; dy++) {
    for (let dx = 0; dx < cellSize; dx++) {
      const x = startX + dx;
      const y = startY + dy;

      if (x >= imgWidth || y >= imgHeight) continue;

      const i = (y * imgWidth + x) * 4;
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
      count++;
    }
  }

  r = r / count;
  g = g / count;
  b = b / count;

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return { r, g, b, luminance };
}

function adjustValues(
  values: { r: number; g: number; b: number; luminance: number },
  brightness: number,
  contrast: number,
  exposure: number,
  gamma: number,
  saturation: number,
  threshold: number
) {
  let { r, g, b, luminance } = values;

  // Exposure
  const expFactor = Math.pow(2, exposure / 100);
  r *= expFactor;
  g *= expFactor;
  b *= expFactor;

  // Brightness
  const brightFactor = brightness / 100;
  r += brightFactor * 255;
  g += brightFactor * 255;
  b += brightFactor * 255;

  // Contrast
  const contrastFactor = (contrast + 100) / 100;
  r = ((r / 255 - 0.5) * contrastFactor + 0.5) * 255;
  g = ((g / 255 - 0.5) * contrastFactor + 0.5) * 255;
  b = ((b / 255 - 0.5) * contrastFactor + 0.5) * 255;

  // Saturation
  const gray = 0.299 * r + 0.587 * g + 0.114 * b;
  r = gray + (r - gray) * saturation;
  g = gray + (g - gray) * saturation;
  b = gray + (b - gray) * saturation;

  // Clamp
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));

  // Recalculate luminance
  luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Gamma
  luminance = Math.pow(luminance, 1 / gamma);

  // Threshold
  luminance = luminance < threshold ? 0 : luminance;

  return { r, g, b, luminance };
}

function selectChar(luminance: number, sortedChars: SVGChar[]): SVGChar {
  if (sortedChars.length === 0) {
    return {
      id: 'default',
      name: 'Default',
      svg: '<rect width="12" height="12" fill="currentColor"/>',
      luminance: 0.5,
    };
  }

  let closest = sortedChars[0];
  let minDiff = Math.abs(luminance - closest.luminance);

  for (const char of sortedChars) {
    const diff = Math.abs(luminance - char.luminance);
    if (diff < minDiff) {
      minDiff = diff;
      closest = char;
    }
  }

  return closest;
}

export {};
