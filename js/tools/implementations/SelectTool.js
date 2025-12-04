/**
 * SelectTool - Rectangular Selection
 *
 * Professional selection tool:
 * - Rectangular selection area
 * - Persistent selection across tool switches
 * - Live preview during dragging
 * - Selection data export
 *
 * @extends BaseTool
 *
 * @typedef {import('../../types.js').DrawingContext} DrawingContext
 */

import BaseTool from '../BaseTool.js';

class SelectTool extends BaseTool {
    static CONFIG = {
        id: 'select',
        name: 'Select',
        icon: 'select_all',
        shortcut: 'M',
        cursor: 'crosshair',
        hasSizeOption: false,
        hasShapeOption: false,
        description: 'Rectangular selection',
        category: 'selection'
    };

    respectsSelection() {
        return false; // Selection tool doesn't respect its own selection
    }

    onDrawStart(x, y, pixelData, context) {
        const width = pixelData[0].length;
        const height = pixelData.length;

        // Clamp to grid bounds
        const clampedX = Math.max(0, Math.min(x, width - 1));
        const clampedY = Math.max(0, Math.min(y, height - 1));

        // Store start and last positions (used by PixelCanvas render loop)
        this.startX = clampedX;
        this.startY = clampedY;
        this.lastX = clampedX;
        this.lastY = clampedY;

        return false; // No canvas modification
    }

    onDrawContinue(x, y, pixelData, context) {
        const width = pixelData[0].length;
        const height = pixelData.length;

        // Clamp to grid bounds
        const clampedX = Math.max(0, Math.min(x, width - 1));
        const clampedY = Math.max(0, Math.min(y, height - 1));

        // Update last position (used by PixelCanvas render loop)
        this.lastX = clampedX;
        this.lastY = clampedY;

        return false; // No canvas modification
    }

    onDrawEnd(x, y, pixelData, context) {
        const width = pixelData[0].length;
        const height = pixelData.length;

        // Clamp to grid bounds
        const clampedX = Math.max(0, Math.min(x, width - 1));
        const clampedY = Math.max(0, Math.min(y, height - 1));

        // Finalize selection - normalize bounds
        const bounds = {
            x1: Math.min(this.startX, clampedX),
            y1: Math.min(this.startY, clampedY),
            x2: Math.max(this.startX, clampedX),
            y2: Math.max(this.startY, clampedY)
        };

        // Set selection bounds (from BaseTool)
        this.setSelection(bounds);

        // Notify for overlay update
        if (context.onSelectionChange) {
            context.onSelectionChange(bounds);
        }

        return false; // No canvas modification
    }

    /**
     * Get current selection data for rendering
     * @returns {Object|null} Selection data
     */
    getSelectionData() {
        if (this.isDrawing) {
            // During drawing - normalize for rendering
            return {
                active: true,
                isDrawing: true,
                x1: Math.min(this.startX, this.lastX),
                y1: Math.min(this.startY, this.lastY),
                x2: Math.max(this.startX, this.lastX),
                y2: Math.max(this.startY, this.lastY)
            };
        } else if (this.selectionActive && this.selectionBounds) {
            // Finalized selection
            return {
                active: true,
                isDrawing: false,
                ...this.selectionBounds
            };
        }
        return null;
    }

    /**
     * Get selected pixels
     * @param {Array<Array<number>>} pixelData - Pixel data
     * @returns {Array<Array<number>>|null} Selected pixel data
     */
    getSelectedPixels(pixelData) {
        if (!this.selectionActive || !this.selectionBounds) {
            return null;
        }

        const { x1, y1, x2, y2 } = this.selectionBounds;
        const selected = [];

        for (let y = y1; y <= y2; y++) {
            const row = [];
            for (let x = x1; x <= x2; x++) {
                if (y >= 0 && y < pixelData.length && x >= 0 && x < pixelData[0].length) {
                    row.push(pixelData[y][x]);
                } else {
                    row.push(0); // Transparent for out-of-bounds
                }
            }
            selected.push(row);
        }

        return selected;
    }
}

export default SelectTool;
