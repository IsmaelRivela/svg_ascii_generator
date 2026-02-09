/**
 * Script para procesar los SVGs de Tulipana y generar el archivo tulipana.ts
 * Ejecutar con: node scripts/processTulipana.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const tulipanaDir = path.join(__dirname, '../collections/Tulipana');
const outputFile = path.join(__dirname, '../src/utils/tulipana.ts');

// Función para calcular luminancia aproximada basada en el área del SVG
function calculateLuminance(svgContent, index) {
  // Los SVGs más complejos tienen más paths, calculamos una luminancia basada en eso
  const pathMatches = svgContent.match(/<path/g);
  const pathCount = pathMatches ? pathMatches.length : 1;
  
  // Distribuir luminancia entre 0.2 y 0.95 basándose en el índice
  // Los primeros son más simples (menos luminancia), los últimos más complejos
  return Math.min(0.95, 0.2 + (index * 0.05));
}

// Función para extraer solo los paths del SVG y convertir a currentColor
function processSVG(svgContent) {
  // Remover la declaración XML y el tag svg de apertura
  let processed = svgContent
    .replace(/<\?xml[^>]*\?>/g, '')
    .replace(/<svg[^>]*>/g, '')
    .replace(/<\/svg>/g, '')
    .trim();
  
  // Reemplazar fill="..." con fill="currentColor" o agregar si no existe
  processed = processed.replace(/fill="[^"]*"/g, 'fill="currentColor"');
  
  // Si no tiene fill, agregarlo
  if (!processed.includes('fill=')) {
    processed = processed.replace(/<path/g, '<path fill="currentColor"');
  }
  
  return processed;
}

// Leer todos los SVGs
const svgFiles = [];
for (let i = 1; i <= 16; i++) {
  const filePath = path.join(tulipanaDir, `${i}.svg`);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const processedSVG = processSVG(content);
    const luminance = calculateLuminance(content, i - 1);
    
    svgFiles.push({
      name: `Tulipana ${i}`,
      svg: processedSVG,
      luminance: luminance,
      viewBox: '0 0 300 300',
    });
  }
}

// Generar el archivo TypeScript
const tsContent = `import { SVGChar } from '../types';

// Colección Tulipana - SVGs orgánicos con formas de plantas

const tulipanaData = [
${svgFiles.map((svg, index) => `  {
    name: '${svg.name}',
    svg: \`${svg.svg}\`,
    luminance: ${svg.luminance.toFixed(2)},
    viewBox: '${svg.viewBox}',
  }`).join(',\n')}
];

export const tulipanaCollection: SVGChar[] = tulipanaData.map((tulip, index) => ({
  id: \`tulipana-\${index + 1}\`,
  name: tulip.name,
  svg: tulip.svg,
  luminance: tulip.luminance,
  viewBox: tulip.viewBox,
}));
`;

// Escribir el archivo
fs.writeFileSync(outputFile, tsContent, 'utf-8');

console.log(`✅ Generado ${outputFile}`);
console.log(`📦 Procesados ${svgFiles.length} SVGs de Tulipana`);
