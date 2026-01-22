export interface SVGChar {
  id: string;
  name: string;
  svg: string;
  luminance: number;
  viewBox?: string;
}

export interface SVGCollection {
  id: string;
  name: string;
  chars: SVGChar[];
  createdAt: number;
}

export interface RenderConfig {
  brightness: number;
  contrast: number;
  exposure: number;
  gamma: number;
  saturation: number;
  threshold: number;
  cellSize: number;
  spacing: number;
  mode: 'bw' | 'color' | 'duotone';
  duotoneColor1?: string;
  duotoneColor2?: string;
  transparentBackground?: boolean;
  skipWhiteAreas?: boolean;
  whiteThreshold?: number;
  previewBackground?: 'black' | 'white';
  invertColors?: boolean;
  canvasWidth?: number;
  canvasHeight?: number;
}

export interface Preset {
  id: string;
  name: string;
  config: RenderConfig;
}

export interface ProcessedCell {
  x: number;
  y: number;
  luminance: number;
  r: number;
  g: number;
  b: number;
  char: SVGChar;
}

export interface ImageData {
  width: number;
  height: number;
  data: Uint8ClampedArray;
}
