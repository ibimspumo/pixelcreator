/**
 * Auto-generated Tool Documentation Types
 *
 * Generated on 2025-12-05T16:06:07.582Z
 * Do not edit manually - run 'npm run generate:docs' to regenerate
 */

export type ToolId = 'bucket' | 'circle' | 'eraser' | 'eyedropper' | 'hand' | 'line' | 'move' | 'pencil' | 'rectangle';

export interface ToolDocumentation {
	id: ToolId;
	name: string;
	description: string;
	category: string;
	shortcut?: string;
	version?: string;
	author?: string;
	tags?: string[];
	documentation?: {
		description?: string;
		usage?: string;
		tips?: string[];
		relatedTools?: string[];
	};
}

export const toolDocs: Record<ToolId, ToolDocumentation> = {
  "bucket": {
    "id": "bucket",
    "name": "Paint Bucket",
    "description": "Fill contiguous area with color",
    "category": "draw",
    "shortcut": "G",
    "version": "1.2.0",
    "author": "inline.px",
    "tags": [
      "fill",
      "paint",
      "flood-fill",
      "pattern"
    ]
  },
  "circle": {
    "id": "circle",
    "name": "Circle",
    "description": "Draw circles and ellipses with fill or outline mode",
    "category": "draw",
    "shortcut": "C",
    "version": "1.1.0",
    "author": "inline.px",
    "tags": [
      "shape",
      "circle",
      "ellipse",
      "drawing",
      "geometry"
    ],
    "documentation": {
      "description": "Draw circular and elliptical shapes on the canvas with precise control over fill and outline.",
      "usage": "Click and drag to define the circle. Enable ",
      "tips": [
        "Toggle Filled option to switch between solid and outline circles",
        "Adjust line width for thicker outlines",
        "Use Perfect Pixels to constrain to perfect circles",
        "Use left-click for primary color and right-click for secondary color"
      ],
      "relatedTools": [
        "rectangle",
        "line",
        "pencil"
      ]
    }
  },
  "eraser": {
    "id": "eraser",
    "name": "Eraser",
    "description": "Erase pixels to transparent",
    "category": "draw",
    "shortcut": "E",
    "version": "1.2.0",
    "author": "inline.px",
    "tags": [
      "drawing",
      "erase",
      "transparent"
    ]
  },
  "eyedropper": {
    "id": "eyedropper",
    "name": "Eyedropper",
    "description": "Sample color from canvas",
    "category": "draw",
    "shortcut": "I"
  },
  "hand": {
    "id": "hand",
    "name": "Hand",
    "description": "Pan the canvas view",
    "category": "view",
    "shortcut": "H",
    "version": "1.0.0",
    "author": "inline.px",
    "tags": [
      "navigation",
      "pan",
      "view"
    ]
  },
  "line": {
    "id": "line",
    "name": "Line",
    "description": "Draw straight lines with configurable width",
    "category": "draw",
    "shortcut": "L",
    "version": "1.0.0",
    "author": "inline.px",
    "tags": [
      "shape",
      "line",
      "drawing",
      "geometry"
    ],
    "documentation": {
      "description": "Draw perfectly straight lines on the canvas with configurable width.",
      "usage": "Click and drag to define the line. Enable ",
      "tips": [
        "Adjust line width for thicker lines",
        "Use Perfect Angles to draw horizontal",
        "vertical",
        "or diagonal lines",
        "Use left-click for primary color and right-click for secondary color"
      ],
      "relatedTools": [
        "rectangle",
        "circle",
        "pencil"
      ]
    }
  },
  "move": {
    "id": "move",
    "name": "Move",
    "description": "Move selected content or layers",
    "category": "edit",
    "shortcut": "V"
  },
  "pencil": {
    "id": "pencil",
    "name": "Pencil",
    "description": "Draw freehand with primary or secondary color",
    "category": "draw",
    "shortcut": "B",
    "version": "1.2.0",
    "author": "inline.px",
    "tags": [
      "drawing",
      "basic",
      "pixel",
      "freehand"
    ],
    "documentation": {
      "description": "The Pencil tool allows you to draw individual pixels on the canvas with precise control.",
      "usage": "Click to draw a single pixel, or click and drag to draw continuously. Use left-click for primary color and right-click for secondary color.",
      "tips": [
        "Hold Shift while dragging to draw straight lines (coming soon)",
        "Use right-click to draw with secondary color",
        "Adjust brush size in tool options for larger strokes"
      ],
      "relatedTools": [
        "eraser",
        "bucket"
      ]
    }
  },
  "rectangle": {
    "id": "rectangle",
    "name": "Rectangle",
    "description": "Draw rectangles with fill or outline mode",
    "category": "draw",
    "shortcut": "U",
    "version": "1.2.0",
    "author": "inline.px",
    "tags": [
      "shape",
      "rectangle",
      "drawing",
      "geometry"
    ],
    "documentation": {
      "description": "Draw rectangular shapes on the canvas with precise control over fill and outline.",
      "usage": "Click and drag to define the rectangle. Hold Shift to constrain to a perfect square.",
      "tips": [
        "Toggle Filled option to switch between solid and outline rectangles",
        "Adjust line width for thicker outlines",
        "Use Perfect Pixels to constrain to square shapes",
        "Use left-click for primary color and right-click for secondary color"
      ],
      "relatedTools": [
        "circle",
        "line",
        "pencil"
      ]
    }
  }
} as const;
