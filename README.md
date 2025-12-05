# inline.px

A modern, browser-based pixel art editor built with SvelteKit 2 and Svelte 5.

![inline.px](https://img.shields.io/badge/SvelteKit-2.0-FF3E00?logo=svelte)
![Svelte](https://img.shields.io/badge/Svelte-5.0-FF3E00?logo=svelte)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)

## ✨ Features

### 🎨 Core Features
- **Multi-Layer System** - Create, manage, and organize multiple layers
- **64-Color Indexed Palette** - Fixed color palette with Base64 encoding
- **Real-Time Layer Previews** - See thumbnails of each layer
- **Professional Tools** - Pencil, eraser, bucket fill, eyedropper, and more
- **Zoom & Pan** - Navigate large canvases with ease
- **Undo/Redo** - Full history system (coming soon)

### 🖱️ Layer Management
- **Drag & Drop Reordering** - Intuitive layer organization
- **Layer Visibility Toggle** - Show/hide layers with eye icon
- **Layer Lock** - Protect layers from editing
- **Layer Duplication** - Quick copy with deep pixel cloning
- **Layer Renaming** - Double-click to rename layers
- **Move Up/Down** - Keyboard shortcuts and buttons

### 🎨 Color System
- **Primary/Secondary Colors** - Photoshop-style color selection
- **X Key to Swap** - Quick color swapping like professional tools
- **Active Color Mode** - Click to toggle between primary/secondary
- **Visual Indicators** - Clear accent colors show active selections
- **64 Colors** - Curated palette from transparent to special colors

### 💾 Export & Import
- **Base64 Export** - Compact text-based format (`WIDTHxHEIGHT:DATA`)
- **PNG Export** - Multiple presets (original, 2x, 4x, 8x upscale)
- **Layer Export** - Export individual layers or composited image
- **Copy to Clipboard** - Easy sharing

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/inline.px.git
cd inline.px

# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:5173
```

### Development

```bash
# Run type checking
npm run check

# Run type checking in watch mode
npm run check:watch

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📖 Usage

### Creating a New Project
1. Click "New Project" from the welcome screen
2. Choose canvas dimensions (8x8 to 128x128)
3. Name your project
4. Start drawing!

### Layer Management
- **Add Layer**: Click `+` button in Layers panel
- **Reorder Layers**: Drag layers with the grip icon (⋮⋮)
- **Rename Layer**: Double-click layer name
- **Toggle Visibility**: Click eye icon
- **Lock Layer**: Click lock icon
- **Duplicate Layer**: Click copy icon

### Color Selection
- **Primary Color**: Left-click on palette
- **Secondary Color**: Right-click on palette or toggle mode
- **Swap Colors**: Press `X` key or click swap button
- **Active Mode**: Click primary/secondary display to toggle

### Keyboard Shortcuts
- `X` - Swap primary/secondary colors
- `Z` - Undo (coming soon)
- `Y` - Redo (coming soon)

## 🏗️ Architecture

### Technology Stack
- **SvelteKit 2** - Full-stack framework with file-based routing
- **Svelte 5** - Using new Runes API ($state, $derived, $effect)
- **TypeScript** - Strict type checking
- **Vite** - Lightning-fast build tool
- **Lucide Svelte** - Beautiful icon library

### Project Structure

```
src/
├── lib/
│   ├── components/
│   │   ├── atoms/          # Smallest UI elements
│   │   ├── molecules/      # Combinations of atoms
│   │   ├── organisms/      # Complex UI sections
│   │   └── templates/      # Page layouts
│   ├── stores/             # Svelte 5 state management
│   │   ├── canvasStore.svelte.ts
│   │   ├── colorStore.svelte.ts
│   │   └── projectStore.svelte.ts
│   ├── utils/              # Helper functions
│   │   ├── base64ToPng.ts      # PNG export system
│   │   ├── pngExport.ts        # High-level export API
│   │   ├── renderPipeline.ts   # Canvas rendering
│   │   └── layerThumbnail.ts   # Thumbnail generation
│   ├── types/              # TypeScript definitions
│   └── constants/          # Color palette, etc.
└── routes/                 # SvelteKit routes
```

### Component Architecture
Follows **Atomic Design** principles:
- **Atoms**: IconButton, ColorSwatch, Panel
- **Molecules**: LayerItem, PixelGrid, ColorPalette
- **Organisms**: Canvas, Toolbar, LayersPanel, ColorPanel
- **Templates**: EditorLayout

### State Management
Uses Svelte 5 Runes for reactive state:

```typescript
// Reactive state
let layers = $state<Layer[]>([]);

// Derived values
let activeLayer = $derived(layers.find(l => l.id === activeLayerId));

// Side effects
$effect(() => {
  renderer.render(width, height, layers);
});
```

## 🎨 Color System

### Base64 Encoding Format
`WIDTHxHEIGHT:BASE64DATA`

Example: `8x8:AAABBBCCCDDDEEE...`

- Each pixel is encoded as a Base64 character (A-Z, a-z, 0-9, +, /)
- Index 0 = Transparent
- Index 1-63 = Color palette

### 64-Color Palette
- 0: Transparent
- 1-2: Black & White
- 3-8: Grayscale (6 shades)
- 9-56: Color spectrum (reds, oranges, yellows, greens, cyans, blues, purples, magentas)
- 57-63: Special colors

## 📦 PNG Export System

### Export Presets
```typescript
import { ExportPresets } from '$lib/utils/pngExport';

// Original size (1:1)
ExportPresets.ORIGINAL

// 2x upscale
ExportPresets.UPSCALE_2X

// 4x upscale (social media)
ExportPresets.UPSCALE_4X

// 8x with pixel borders
ExportPresets.UPSCALE_8X_BORDERED

// White background (printing)
ExportPresets.WHITE_BACKGROUND
```

### Export Single Layer
```typescript
import { exportLayerToPng } from '$lib/utils/pngExport';

await exportLayerToPng(layer, width, height, 'layer.png', {
  scale: 4,
  showCheckerboard: false
});
```

### Export Composited Layers
```typescript
import { exportCompositeLayersToPng } from '$lib/utils/pngExport';

await exportCompositeLayersToPng(layers, width, height, 'final.png', {
  scale: 8,
  pixelBorders: true
});
```

## 🎯 Roadmap

- [x] Multi-layer system
- [x] Layer previews
- [x] Drag & drop reordering
- [x] PNG export system
- [x] Base64 import/export
- [x] Color swap with X key
- [ ] Undo/Redo system
- [ ] Selection tools (rectangle, lasso)
- [ ] Transform tools (move, rotate, scale)
- [ ] Keyboard shortcuts
- [ ] Grid/ruler options
- [ ] Onion skinning for animation
- [ ] Frame-by-frame animation support
- [ ] GIF export

## 📝 Documentation

Comprehensive documentation available in the repo:
- `CANVAS-SYSTEM.md` - Canvas architecture and rendering
- `COLOR-SYSTEM.md` - Color palette and Base64 encoding
- `COMPONENT-STRUCTURE.md` - Atomic Design structure
- `PNG-EXPORT-SYSTEM.md` - Export system usage guide
- `CLAUDE.md` - AI assistant context for development

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Built with [SvelteKit](https://kit.svelte.dev/)
- Icons by [Lucide](https://lucide.dev/)
- Inspired by Aseprite, Piskel, and Photoshop

---

**inline.px** - Pixel perfect, always. 🎨
