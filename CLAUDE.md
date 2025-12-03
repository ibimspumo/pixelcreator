# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Inline.px** is a browser-based pixel art editor built with Vite and modern ES modules. The application exports to a single, self-contained HTML file that runs entirely client-side without dependencies. It uses a custom ultra-compact Base64-based format for pixel art storage with optional RLE compression.

## Common Commands

### Development
```bash
npm install           # Install dependencies
npm run dev          # Start Vite dev server with hot-reload
```

### Production Build
```bash
npm run build        # Bundle to single HTML file in docs/
```

The production build outputs to `docs/index.html` as a single, self-contained file using `vite-plugin-singlefile`.

## Architecture

### Core Design Patterns

1. **Event-Driven Architecture**: Central `EventBus` (`js/core/EventBus.js`) manages all inter-module communication. Modules emit and subscribe to events rather than direct coupling.

2. **Tool Registry Pattern**: All drawing tools extend `BaseTool` (`js/tools/BaseTool.js`) and register with `ToolRegistry` (`js/tools/ToolRegistry.js`). The registry handles tool lifecycle (init, activate, deactivate, destroy) and shared state management.

3. **Module Separation**: Canvas functionality is split into specialized modules:
   - `PixelData.js`: Raw pixel data management (2D array of color indices)
   - `CanvasRenderer.js`: Rendering logic
   - `CanvasEvents.js`: User input handling
   - `SelectionOverlay.js`: Selection visualization
   - `PixelCanvas.js`: Orchestrates all canvas modules

4. **Render Loop**: Main render loop in `PixelCanvas.js` runs via `requestAnimationFrame`, continuously rendering both the canvas and selection overlay with animated marching ants.

### Data Format

The pixel art format is `WxH:DATA` where:
- `W` = width, `H` = height
- `DATA` = Base64-encoded string (using custom 64-char alphabet from `config/colors.json`)
- Each character represents a color index (0-63)
- Color 0 is always transparent

Optional RLE compression format: `WxH:RLE:COUNTCHAR` (e.g., "16x16:RLE:01a05b..." means 1×'a', 5×'b')

### Module Organization

```
js/
├── core/              # Core infrastructure
│   ├── EventBus.js    # Pub/sub event system
│   ├── Logger.js      # Logging utilities
│   └── ConfigLoader.js # Loads JSON configs
├── canvas/            # Canvas subsystem
│   ├── PixelCanvas.js # Main orchestrator + render loop
│   ├── PixelData.js   # Data management
│   ├── CanvasRenderer.js # Rendering
│   ├── CanvasEvents.js   # Input handling
│   └── SelectionOverlay.js # Selection visuals
├── tools/             # Tool system
│   ├── BaseTool.js    # Abstract base class (refactored, 379 lines)
│   ├── mixins/        # Tool mixins for composition
│   │   ├── ToolHelpers.js      # Shared helper functions
│   │   ├── ToolSelectionMixin.js # Selection support
│   │   └── ToolEventMixin.js    # Event handling
│   ├── ToolRegistry.js # Tool registration & lifecycle
│   └── implementations/ # Concrete tools (BrushTool, etc.)
├── dialogs/           # Dialog system (refactored, modular)
│   ├── DialogCore.js       # Core dialog functionality
│   ├── DialogHelpers.js    # Utility functions
│   └── ExportDialog.js     # Specialized export dialog
├── utils/             # Utilities
│   ├── ValidationUtils.js
│   ├── FormatUtils.js
│   ├── ClipboardUtils.js
│   └── StorageUtils.js     # Safe localStorage wrapper (NEW)
├── main.js            # Application entry point
├── dialogs.js         # Dialog system facade (refactored, 180 lines)
├── compression.js     # RLE compression
├── colorPalette.js    # 64-color palette management
├── fileManager.js     # File save/load (uses StorageUtils)
├── tabManager.js      # Multi-tab workspace (improved error handling)
├── autosave.js        # Auto-save (uses StorageUtils)
├── viewport.js        # Zoom/pan (with blur handler fix)
├── history.js         # Undo/redo system
└── pngExport.js       # PNG export functionality
```

### Configuration

- `config/constants.json`: App constants (canvas limits, history size, etc.)
- `config/colors.json`: 64-color palette with hex values and Base64 alphabet
- Both configs loaded at runtime via `ConfigLoader.js`

## Critical Implementation Details

### Tool Development

All tools must extend `BaseTool` and implement three methods:
- `onDrawStart(x, y, pixelData, context)` - Mouse down
- `onDrawContinue(x, y, pixelData, context)` - Mouse move while drawing
- `onDrawEnd(x, y, pixelData, context)` - Mouse up

Tools must define a static `CONFIG` object with `id`, `name`, `icon`, `shortcut`, `cursor`, etc.

Shape tools (Rectangle, Ellipse, Line) use the preview system: set `needsPreview()` to return `true`, and `BaseTool` will automatically save/restore pixel data for live preview.

### Shared Tool Options

Options like `brushSize`, `shapeMode`, and `colorCode` are managed centrally in `ToolRegistry` and synced to tools when activated. Changes propagate to all tools via callbacks.

### Selection System

- `SelectTool` creates rectangular selections (stored in tool state as `selectionBounds`)
- `MagicWandTool` creates selections via flood-fill algorithm
- `MoveTool` moves selected content (uses temporary `movePreview` data structure)
- Most tools respect selection bounds (check `isInSelection()` from `BaseTool`)
- Selection overlay renders with animated dashed border (dashOffset increments each frame)

### Canvas Coordinate System

- Canvas uses pixel grid coordinates (integers)
- `CanvasEvents.js` converts mouse screen coordinates to grid coordinates
- All tools work with grid coordinates, not screen pixels
- Viewport zoom/pan handled separately by `Viewport.js`

### Undo/Redo System

Implemented in `history.js` with debounced state capture:
- Canvas changes trigger `onCanvasChange()` in main.js
- After 300ms debounce, full canvas state is saved to history
- History is a stack of compressed data strings
- Undo/redo restores entire canvas state via `importFromString()`

### File Management

`FileManager` handles:
- Save/load to browser localStorage (key: "pixelArt_saved_{name}")
- Export to .txt file (contains data string)
- List saved files for loading dialog
- Current filename tracking for save operations

### Tab System

`TabManager` provides multi-tab workspace:
- Each tab has: `id`, `name`, `data` (pixel art string), `isDirty` flag
- Active tab state loaded into main canvas
- Switching tabs saves current canvas state to tab
- Dirty flag indicates unsaved changes

### Autosave

`Autosave` module runs every 30 seconds:
- Saves current canvas state to localStorage
- Shows visual indicator when saving
- Recovers state on page reload if available

## Important Notes

### Module Loading

All modules are ES6 modules loaded via Vite. In development, imports work natively. In production, Vite bundles everything into inline scripts in a single HTML file.

### Vite Configuration

`vite.config.js` uses `vite-plugin-singlefile` to inline all JS/CSS into `docs/index.html`. The result is a standalone file with zero external dependencies.

### Browser APIs Used

- Canvas 2D API for rendering
- localStorage for persistence
- Clipboard API for copy/paste
- requestAnimationFrame for render loop
- No external libraries or frameworks

### Color Palette

Fixed 64-color palette defined in `config/colors.json`. Colors map to Base64 characters (0-9, A-Z, a-z, +, /). Index 0 is always transparent (#00000000).

`ColorPalette.js` provides:
- `getBase64Char(index)` - Convert color index to character
- `getIndexFromChar(char)` - Convert character to color index
- `getHexColor(index)` - Get hex color for rendering

### Validation

`ValidationUtils` validates:
- Canvas dimensions (4-512 pixels, must be integers)
- Data string format (matches WxH:DATA or WxH:RLE:DATA)
- Color indices (0-63 range)

Initialize with constants before use: `ValidationUtils.init(constants)`
