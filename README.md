# SVG ASCII Generator

Conversor de imagen a ASCII usando SVG personalizados como caracteres.

## ✨ Características

- 🖼️ **Drag & drop** de imágenes (JPG, PNG, WEBP)
- 🎨 **Colecciones SVG personalizadas** - Crea tus propios sets de caracteres
- 👁️ **Visor de caracteres** - Activa/desactiva caracteres individualmente con toggle
- ⚡ **Preview en vivo** - Renderizado reactivo en tiempo real
- 🎛️ **Controles tipo Photoshop** - Brightness, Contrast, Exposure, Gamma, Saturation, Threshold
- 🎯 **3 modos de renderizado** - Blanco y Negro, Color, Duotono
- 💾 **Presets personalizables** - Guarda y carga configuraciones
- 📤 **Export múltiple** - SVG, PNG, JPEG
- 📥 **Importar/Exportar** - Comparte colecciones con archivos SVG
- 💽 **Persistencia local** - IndexedDB (local-first)
- 📱 **Responsive** - Desktop y mobile
- 🔧 **Web Workers** - Procesamiento sin bloquear UI

## 🚀 Inicio rápido

```bash
npm install
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173)

## � Colecciones incluidas

En la carpeta `/collections/` encontrarás colecciones de ejemplo:

- **Geometria_Basica/** - 5 formas básicas (puntos, círculos, cuadrados)
- **Lineas_y_Trazos/** - 6 formas lineales para efectos sketch

Cada carpeta incluye:
- SVGs numerados con formato `001_nombre_0.50.svg`
- `README.txt` con instrucciones
- `collection.json` con metadata

### Formato de nombres de archivo

```
001_nombre_descriptivo_0.50.svg
│││ │                   │
│││ │                   └─ Luminancia (0.00 a 1.00)
│││ └───────────────────── Nombre descriptivo
││└────────────────────────── Orden de la colección
```

## �📖 Uso

### 1. Subir imagen
- Arrastra una imagen o haz clic en el área de carga
- Formatos soportados: JPG, PNG, WEBP

### 2. Seleccionar colección
- Usa la colección por defecto "Default Shapes"
- O crea tu propia colección personalizada
- **Nuevo**: Visualiza y activa/desactiva caracteres individualmente

### 2.1 Visor de caracteres
- Aparece cuando tienes una colección activa
- **Click en un carácter** para activarlo/desactivarlo
- **Activar/Desactivar todos** con el botón superior
- Los caracteres desactivados aparecen grisáceos con una X
- El contador muestra cuántos están activos (ej: 5/10)
- **Importante**: Debes tener al menos 1 carácter activo

### 3. Crear colección personalizada
- Click en **"+ Nueva"**
- Dale un nombre a tu colección
- Sube múltiples archivos SVG o usa "🧪 Agregar SVGs de prueba"
- Ajusta la luminancia de cada SVG (0 = oscuro, 1 = claro)
- Click en **"Crear"**
- ⚠️ **Importante**: Debes tener un nombre Y al menos 1 SVG para activar el botón

### 3.1 Importar colección desde carpeta
- Click en **"📥 Importar"**
- Selecciona todos los SVGs de una carpeta (Ej: `/collections/Geometria_Basica/`)
- Los nombres con formato `001_nombre_0.50.svg` se importan con luminancia automática
- Dale un nombre cuando te lo pida

### 3.2 Exportar colección
- Click en el botón **📤** junto a la colección
- Se descargarán todos los SVGs con nombres descriptivos
- Usa estos archivos para compartir o hacer backup

### 4. Ajustar parámetros
- **Brightness**: -100 a 100
- **Contrast**: -100 a 100
- **Exposure**: -100 a 100
- **Gamma**: 0.1 a 3
- **Saturation**: 0 a 2
- **Threshold**: 0 a 1
- **Cell Size**: 4 a 48px
- **Spacing**: 0 a 10px

### 5. Cambiar modo
- **B&W**: Blanco y negro
- **COLOR**: Mantiene colores originales
- **DUOTONE**: Dos tonos (próximamente)

### 6. Usar presets
- Selecciona un preset predefinido
- O guarda tu configuración actual como nuevo preset

### 7. Exportar
- **SVG**: Vectorial escalable
- **PNG**: Imagen rasterizada sin pérdida
- **JPEG**: Imagen comprimida (95% calidad)

## 🏗️ Arquitectura

```
src/
├── components/          # Componentes React
│   ├── ImageUpload.tsx
│   ├── Preview.tsx      # Canvas con caché de SVG
│   ├── ControlPanel.tsx
│   ├── SVGCollectionEditor.tsx
│   ├── PresetManager.tsx
│   └── ExportPanel.tsx
├── engine/
│   └── useImageProcessor.ts  # Hook de procesamiento
├── workers/
│   └── imageProcessor.worker.ts  # Web Worker
├── stores/
│   └── useStore.ts      # Zustand store
├── utils/
│   ├── db.ts           # IndexedDB
│   └── defaultSVGs.ts  # Colección por defecto
└── types.ts

```

## 🔧 Stack técnico

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Zustand** - State management
- **IndexedDB** (idb) - Persistencia local
- **Web Workers** - Procesamiento paralelo
- **Canvas API** - Renderizado rápido
- **SVG** - Export vectorial

## 🎯 Roadmap

### ✅ MVP (Completado)
- [x] Subida de imagen
- [x] Motor de conversión
- [x] Preview en vivo
- [x] Controles en tiempo real
- [x] Sistema de colecciones
- [x] Sistema de presets
- [x] Export SVG/PNG/JPEG
- [x] Persistencia local
- [x] Importar/Exportar colecciones
- [x] Visor de caracteres con toggle

### 🚧 v1.1
- [ ] Modo duotono funcional
- [ ] Zoom/Pan en preview
- [ ] Histograma de luminancia
- [ ] Atajos de teclado
- [ ] Editor de luminancia por lotes
- [ ] Previsualización de colección antes de importar

### 🔮 v2.0
- [ ] Iframe embed
- [ ] Share URL con config
- [ ] Templates predefinidos
- [ ] Batch processing
- [ ] Video to ASCII (frames)

## 📝 Formato SVG

Los SVG deben:
- Usar `currentColor` para que se coloreen dinámicamente
- Tener viewBox `0 0 12 12` (recomendado)
- Ser formas simples para mejor rendimiento

Ejemplo:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12">
  <circle cx="6" cy="6" r="5" fill="currentColor"/>
</svg>
```

## 🎨 Personalización

### Temas
Edita variables CSS en `src/index.css`:
```css
:root {
  --bg: #0a0a0a;
  --bg-panel: #151515;
  --border: #2a2a2a;
  --text: #e0e0e0;
  --accent: #4a9eff;
}
```

## 🐛 Troubleshooting

**El botón "Crear" está deshabilitado:**
- ⚠️ Verifica que hayas ingresado un nombre para la colección
- ⚠️ Verifica que hayas subido al menos 1 SVG (o usado "🧪 SVGs de prueba")
- El botón muestra un mensaje de ayuda al hacer hover

**Los SVGs no se suben:**
- Abre DevTools (F12) y mira la consola para ver errores
- Verifica que los archivos sean `.svg` válidos
- Prueba con los SVGs de ejemplo en `/collections/`
- Usa el botón "🧪 Agregar SVGs de prueba" para verificar que funcione

**El preview no aparece:**
- Verifica que hayas seleccionado una colección activa
- Asegúrate de que la colección tenga al menos 1 carácter **activo** (no solo creado)
- En el visor de caracteres, verifica que haya caracteres con fondo azul
- Si todos están grisáceos, activa algunos con click

**No se ve ningún cambio al ajustar los sliders:**
- Puede que todos los caracteres estén desactivados
- Intenta con diferentes colecciones
- Ajusta el Cell Size para ver cambios más evidentes

**Rendimiento lento:**
- Reduce el Cell Size (menos celdas = más rápido)
- Usa colecciones con menos caracteres
- Cierra otras pestañas del navegador

**Los SVGs no se colorean:**
- Asegúrate de usar `currentColor` en el SVG
- Verifica que el SVG esté bien formado

## 📄 Licencia

MIT
