# Colecciones SVG

Esta carpeta contiene colecciones de SVG pre-diseñadas para usar en SVG ASCII Generator.

## 📦 Colecciones disponibles

### 1. Geometría Básica (`Geometria_Basica/`)
**5 caracteres** - Formas geométricas simples
- Ideal para: Imágenes generales, retratos, fotos
- Rango de luminancia: 0.10 a 1.00
- Contenido: Puntos, círculos de varios tamaños, cuadrados, relleno completo

### 2. Líneas y Trazos (`Lineas_y_Trazos/`)
**6 caracteres** - Formas lineales con stroke
- Ideal para: Efectos sketch, dibujos, arte conceptual
- Rango de luminancia: 0.15 a 0.80
- Contenido: Círculos vacíos, líneas, diagonales, cruces

## 🎯 Cómo usar estas colecciones

### Método 1: Importar directamente
1. Abre la aplicación
2. Click en **"📥 Importar"**
3. Navega a una carpeta (ej: `Geometria_Basica/`)
4. Selecciona **todos los archivos .svg** (Cmd+A en Mac / Ctrl+A en Windows)
5. Dale un nombre a la colección

### Método 2: Crear tu propia colección basada en estas
1. Copia los SVGs que quieras
2. Edítalos con un editor como Inkscape o VS Code
3. Sube los modificados como nueva colección

## 📝 Crear tu propia colección

### Estructura recomendada
```
Mi_Coleccion/
├── 001_simbolo_oscuro_0.10.svg
├── 002_simbolo_medio_0.50.svg
├── 003_simbolo_claro_0.90.svg
├── collection.json (opcional)
└── README.txt (opcional)
```

### Formato de nombres
```
[número]_[nombre]_[luminancia].svg

001_punto_0.10.svg
│││ │     │││
│││ │     └─ Luminancia: 0.00 (negro) a 1.00 (blanco)
│││ └─────── Nombre descriptivo (sin espacios, usa _)
││└─────────── Orden en la colección (001, 002, 003...)
```

### Reglas para SVG

✅ **SÍ hacer:**
- Usar `currentColor` en fill y stroke
- ViewBox de `0 0 12 12` (recomendado)
- Formas simples (mejor rendimiento)
- Probar diferentes luminancias (distribuir entre 0 y 1)

❌ **NO hacer:**
- Colores hardcodeados (#FF0000, rgb(), etc)
- Tamaños enormes o muy complejos
- Texto (se pierde la escalabilidad)
- Gradientes complejos

### Ejemplo de SVG válido
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12">
  <circle cx="6" cy="6" r="5" fill="currentColor"/>
</svg>
```

### Ejemplo con stroke
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12">
  <rect x="1" y="1" width="10" height="10" 
        fill="none" 
        stroke="currentColor" 
        stroke-width="2"/>
</svg>
```

## 💡 Tips de diseño

### Distribución de luminancia
- **0.00 - 0.20**: Formas muy pequeñas o finas (puntos, líneas)
- **0.20 - 0.40**: Formas pequeñas (círculos pequeños)
- **0.40 - 0.60**: Formas medianas
- **0.60 - 0.80**: Formas grandes
- **0.80 - 1.00**: Formas muy densas o rellenas

### Cantidad recomendada
- **Mínimo**: 3-5 caracteres (básico)
- **Óptimo**: 8-12 caracteres (buen rango)
- **Avanzado**: 15-20+ caracteres (máximo detalle)

### Temas sugeridos
- 🔘 Geometría (círculos, cuadrados, triángulos)
- ✏️ Caligrafía (letras, símbolos)
- 🌿 Naturaleza (hojas, flores, ramas)
- 🎮 Pixel art (formas pixeladas)
- 🔣 ASCII tradicional (. : ; + # @ etc)
- 🎨 Arte abstracto (formas orgánicas)

## 🔄 Exportar tus colecciones

Desde la app puedes exportar cualquier colección:
1. Click en **📤** junto a la colección
2. Se descargarán múltiples archivos
3. Organízalos en una carpeta
4. Comparte con otros usuarios

## 🤝 Contribuir

Si creas colecciones interesantes:
1. Organízalas en una carpeta con README
2. Súbelas a GitHub o compártelas
3. Mantén los SVGs optimizados y simples

## ⚡ Performance

**Colecciones grandes = más lento**
- Menos de 10 chars: Muy rápido ⚡
- 10-20 chars: Rápido 🚀
- 20-30 chars: Moderado 🏃
- 30+ chars: Puede ser lento 🐌

Ajusta según tu hardware y necesidades.
