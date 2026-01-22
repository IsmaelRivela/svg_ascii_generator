export function processSVGContent(svgContent: string): string {
  // Parse SVG
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgContent, 'image/svg+xml');
  const svgElement = doc.querySelector('svg');
  
  if (!svgElement) {
    throw new Error('No se encontró elemento <svg>');
  }

  // Get innerHTML
  let innerHTML = svgElement.innerHTML;

  // Remove all <style> blocks completely
  innerHTML = innerHTML.replace(/<style[\s\S]*?<\/style>/g, '');
  
  // Remove all <defs> blocks completely
  innerHTML = innerHTML.replace(/<defs[\s\S]*?<\/defs>/g, '');

  // Force all elements to use currentColor for fill
  // This works by removing ALL fill attributes and adding fill="currentColor" to all shape elements
  
  // Remove existing fill and stroke attributes
  innerHTML = innerHTML.replace(/fill\s*=\s*["'][^"']*["']/g, '');
  innerHTML = innerHTML.replace(/stroke\s*=\s*["'][^"']*["']/g, '');
  
  // Remove class and style attributes
  innerHTML = innerHTML.replace(/class\s*=\s*["'][^"']*["']/g, '');
  innerHTML = innerHTML.replace(/style\s*=\s*["'][^"']*["']/g, '');
  
  // Add fill="currentColor" to all shape elements
  innerHTML = innerHTML.replace(/<(path|circle|rect|ellipse|polygon|polyline|line)(\s)/g, '<$1 fill="currentColor"$2');
  
  // Handle self-closing tags
  innerHTML = innerHTML.replace(/<(path|circle|rect|ellipse|polygon|polyline|line)(\/?>)/g, '<$1 fill="currentColor"$2');

  return innerHTML.trim();
}

export function calculateSVGLuminance(svgContent: string): number {
  // Try to estimate luminance based on the SVG content
  // This is a heuristic - filled shapes are denser than strokes
  
  const hasFill = /fill\s*[:=]/.test(svgContent);
  const hasStroke = /stroke\s*[:=]/.test(svgContent);
  const pathCount = (svgContent.match(/<path/g) || []).length;
  const circleCount = (svgContent.match(/<circle/g) || []).length;
  const rectCount = (svgContent.match(/<rect/g) || []).length;
  const polygonCount = (svgContent.match(/<polygon/g) || []).length;
  
  let density = 0;
  
  if (hasFill) {
    density += 0.5;
  }
  if (hasStroke) {
    density += 0.2;
  }
  
  // More shapes = more density
  const shapeCount = pathCount + circleCount + rectCount + polygonCount;
  density += Math.min(shapeCount * 0.1, 0.5);
  
  return Math.min(density, 1);
}
