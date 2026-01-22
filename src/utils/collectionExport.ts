import { SVGCollection } from '../types';

export async function exportCollectionToFiles(collection: SVGCollection) {
  // Create a zip-like structure with all SVGs
  const files: { name: string; content: string }[] = [];

  // Create metadata file
  const metadata = {
    name: collection.name,
    id: collection.id,
    createdAt: collection.createdAt,
    charCount: collection.chars.length,
  };

  files.push({
    name: 'collection.json',
    content: JSON.stringify(metadata, null, 2),
  });

  // Create individual SVG files
  collection.chars.forEach((char, index) => {
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12">\n  ${char.svg}\n</svg>`;
    
    const filename = `${String(index + 1).padStart(3, '0')}_${char.name.replace(/[^a-z0-9]/gi, '_')}_${char.luminance.toFixed(2)}.svg`;
    
    files.push({
      name: filename,
      content: svgContent,
    });
  });

  // Download as individual files or create a way to download all
  // For now, we'll create a combined download
  downloadCollectionFiles(collection.name, files);
}

function downloadCollectionFiles(collectionName: string, files: { name: string; content: string }[]) {
  // Create a text file with instructions
  let readmeContent = `# ${collectionName}\n\n`;
  readmeContent += `Esta carpeta contiene ${files.length - 1} archivos SVG.\n\n`;
  readmeContent += `## Archivos:\n\n`;
  
  files.forEach(file => {
    if (file.name.endsWith('.svg')) {
      readmeContent += `- ${file.name}\n`;
    }
  });

  readmeContent += `\n## Cómo usar:\n\n`;
  readmeContent += `1. Extrae todos los archivos SVG en una carpeta\n`;
  readmeContent += `2. En la aplicación, crea una nueva colección\n`;
  readmeContent += `3. Sube todos los SVGs de esta carpeta\n`;
  readmeContent += `4. Los nombres de archivo incluyen la luminancia sugerida (0.00 a 1.00)\n`;

  files.push({
    name: 'README.txt',
    content: readmeContent,
  });

  // Download all files as a zip (using JSZip would be ideal, but for now we'll download them one by one)
  // For simplicity, we'll create a single file with all content
  let combinedContent = '';
  
  files.forEach(file => {
    combinedContent += `\n\n========== ${file.name} ==========\n\n`;
    combinedContent += file.content;
  });

  const blob = new Blob([combinedContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${collectionName.replace(/[^a-z0-9]/gi, '_')}_collection.txt`;
  a.click();
  URL.revokeObjectURL(url);
  
  // Better approach: download each SVG individually
  files.forEach((file, index) => {
    setTimeout(() => {
      const blob = new Blob([file.content], { 
        type: file.name.endsWith('.svg') ? 'image/svg+xml' : 'text/plain' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${collectionName.replace(/[^a-z0-9]/gi, '_')}/${file.name}`;
      a.click();
      URL.revokeObjectURL(url);
    }, index * 100);
  });
}

export function importCollectionFromFiles(files: FileList): Promise<SVGCollection> {
  return new Promise((resolve, reject) => {
    const svgFiles = Array.from(files).filter(f => f.name.endsWith('.svg'));
    
    if (svgFiles.length === 0) {
      reject(new Error('No se encontraron archivos SVG'));
      return;
    }

    const chars: any[] = [];
    let processed = 0;

    svgFiles.forEach(file => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, 'image/svg+xml');
        const svg = doc.querySelector('svg');
        
        if (svg) {
          // Extract luminance from filename if present
          const match = file.name.match(/_(\d+\.\d+)\.svg$/);
          const luminance = match ? parseFloat(match[1]) : Math.random();
          
          chars.push({
            id: `imported-${Date.now()}-${Math.random()}`,
            name: file.name.replace(/^\d+_/, '').replace(/_\d+\.\d+\.svg$/, '').replace(/_/g, ' '),
            svg: svg.innerHTML,
            luminance,
          });
        }
        
        processed++;
        
        if (processed === svgFiles.length) {
          // Sort by luminance
          chars.sort((a, b) => a.luminance - b.luminance);
          
          resolve({
            id: `collection-${Date.now()}`,
            name: 'Colección Importada',
            chars,
            createdAt: Date.now(),
          });
        }
      };
      
      reader.onerror = () => {
        reject(new Error(`Error leyendo ${file.name}`));
      };
      
      reader.readAsText(file);
    });
  });
}
