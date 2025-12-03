/**
 * ToolHelpers - Shared helper functions for drawing tools
 *
 * Provides common utility functions for:
 * - Coordinate validation
 * - Pixel manipulation
 * - Data cloning and restoration
 * - Performance throttling
 *
 * @module ToolHelpers
 */

/**
 * Validate coordinates are within bounds
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {Array<Array<number>>} pixelData - Pixel data
 * @returns {boolean}
 */
export function validateCoordinates(x, y, pixelData) {
    if (!pixelData || pixelData.length === 0) {
        return false;
    }
    const height = pixelData.length;
    const width = pixelData[0].length;
    return x >= 0 && x < width && y >= 0 && y < height;
}

/**
 * Set pixel at coordinates
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {Array<Array<number>>} pixelData - Pixel data
 * @param {number} colorCode - Color code
 * @returns {boolean} True if pixel was changed
 */
export function setPixel(x, y, pixelData, colorCode) {
    const height = pixelData.length;
    const width = pixelData[0].length;

    if (x >= 0 && x < width && y >= 0 && y < height) {
        if (pixelData[y][x] !== colorCode) {
            pixelData[y][x] = colorCode;
            return true;
        }
    }
    return false;
}

/**
 * Get pixel at coordinates
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {Array<Array<number>>} pixelData - Pixel data
 * @returns {number|null} Color code or null
 */
export function getPixel(x, y, pixelData) {
    const height = pixelData.length;
    const width = pixelData[0].length;

    if (x >= 0 && x < width && y >= 0 && y < height) {
        return pixelData[y][x];
    }
    return null;
}

/**
 * Clone pixel data for preview
 * @param {Array<Array<number>>} pixelData - Original data
 * @returns {Array<Array<number>>} Cloned data
 */
export function clonePixelData(pixelData) {
    return pixelData.map(row => [...row]);
}

/**
 * Restore preview data
 * @param {Array<Array<number>>} pixelData - Target data
 * @param {Array<Array<number>>} previewData - Preview data to restore
 */
export function restorePreviewData(pixelData, previewData) {
    if (!previewData) {
        return;
    }
    for (let y = 0; y < pixelData.length; y++) {
        for (let x = 0; x < pixelData[y].length; x++) {
            pixelData[y][x] = previewData[y][x];
        }
    }
}

/**
 * Create throttle checker
 * @param {number} delay - Throttle delay in ms
 * @returns {Object} Throttle state and checker function
 */
export function createThrottle(delay = 16) {
    const state = {
        lastTime: 0,
        delay: delay
    };

    return {
        shouldThrottle() {
            const now = Date.now();
            if (now - state.lastTime < state.delay) {
                return true;
            }
            state.lastTime = now;
            return false;
        },
        reset() {
            state.lastTime = 0;
        }
    };
}
