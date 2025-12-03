/**
 * ToolSelectionMixin - Selection support for tools
 *
 * Provides selection-related functionality:
 * - Selection bounds management
 * - Coordinate checking within selection
 * - Selection state tracking
 *
 * @module ToolSelectionMixin
 */

/**
 * Mixin for selection support
 * @param {class} BaseClass - Base class to extend
 * @returns {class} Extended class with selection support
 */
export function withSelection(BaseClass) {
    return class extends BaseClass {
        constructor(...args) {
            super(...args);

            // Selection state
            this.selectionActive = false;
            this.selectionBounds = null;
        }

        /**
         * Check if tool respects selection bounds
         * @returns {boolean}
         */
        respectsSelection() {
            return true; // Override to return false for tools that ignore selection
        }

        /**
         * Check if coordinates are within selection
         * @param {number} x - X coordinate
         * @param {number} y - Y coordinate
         * @returns {boolean}
         */
        isInSelection(x, y) {
            if (!this.selectionActive || !this.selectionBounds) {
                return true; // No selection = everything is valid
            }

            const { x1, y1, x2, y2 } = this.selectionBounds;
            return x >= x1 && x <= x2 && y >= y1 && y <= y2;
        }

        /**
         * Set selection bounds
         * @param {Object} bounds - Selection bounds {x1, y1, x2, y2}
         */
        setSelection(bounds) {
            this.selectionActive = true;
            this.selectionBounds = bounds;
        }

        /**
         * Clear selection
         */
        clearSelection() {
            this.selectionActive = false;
            this.selectionBounds = null;
        }
    };
}
