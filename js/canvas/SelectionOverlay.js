/**
 * SelectionOverlay - Stateless Selection Visualizer
 *
 * This module is responsible for drawing selection-related visuals onto a dedicated
 * overlay canvas. It is designed to be stateless, meaning it relies on external
 * components to pass it the necessary information on every frame.
 *
 * It can render:
 * - A "marching ants" border for a finalized selection.
 * - A live preview of a new selection being drawn.
 * - The pixel content of a selection being moved.
 *
 * @module SelectionOverlay
 *
 * @typedef {import('../types.js').SelectionBounds} SelectionBounds
 * @typedef {import('../types.js').PixelData} PixelData
 */

import logger from '../core/Logger.js';
import CanvasRenderer from './CanvasRenderer.js';

let overlayCanvas = null;
let overlayCtx = null;
let mainCanvas = null;
let renderer = null; // Reference to CanvasRenderer for pixel size etc.

/**
 * Initialize the selection overlay.
 * @param {HTMLCanvasElement} mainCanvasElement - The main canvas element.
 * @param {Object} dependencies - Module dependencies like the renderer.
 */
function init(mainCanvasElement, dependencies = {}) {
    mainCanvas = mainCanvasElement;
    renderer = dependencies.renderer || CanvasRenderer;

    createOverlay();
    logger.debug?.('SelectionOverlay initialized (stateless)');
}

/**
 * Create and configure the overlay canvas element.
 * @private
 */
function createOverlay() {
    if (overlayCanvas) overlayCanvas.remove();

    overlayCanvas = document.createElement('canvas');
    overlayCanvas.className = 'selection-overlay';

    // Get the main canvas position
    const mainRect = mainCanvas.getBoundingClientRect();

    Object.assign(overlayCanvas.style, {
        position: 'fixed', // Use fixed positioning to match getBoundingClientRect coordinates
        top: mainRect.top + 'px',
        left: mainRect.left + 'px',
        pointerEvents: 'none',
        zIndex: '10'
    });

    overlayCtx = overlayCanvas.getContext('2d');

    // Append to body so it's not affected by parent transforms
    document.body.appendChild(overlayCanvas);
    updateSize();
}

/**
 * Resize the overlay to match the main canvas dimensions.
 */
function updateSize() {
    if (!overlayCanvas || !mainCanvas) return;

    // Get the ACTUAL displayed size and position of the main canvas
    const mainRect = mainCanvas.getBoundingClientRect();

    // Set overlay canvas internal resolution to match displayed size
    overlayCanvas.width = mainRect.width;
    overlayCanvas.height = mainRect.height;

    // Set overlay CSS size and position to match main canvas exactly
    overlayCanvas.style.width = mainRect.width + 'px';
    overlayCanvas.style.height = mainRect.height + 'px';
    overlayCanvas.style.top = mainRect.top + 'px';
    overlayCanvas.style.left = mainRect.left + 'px';
}

/**
 * The main rendering function, called from an external render loop.
 * @param {Object} selectionState - The current state of the selection.
 * @param {Object} selectionState.bounds - The bounds of a finalized selection.
 * @param {Object} selectionState.previewBounds - The bounds of a selection being drawn.
 * @param {Object} selectionState.movePreview - Data for rendering a move preview.
 * @param {number} dashOffset - The offset for the "marching ants" animation.
 */
function render(selectionState, dashOffset = 0) {
    if (!overlayCanvas || !overlayCtx || !renderer) return;

    // Update overlay size every frame to match current display size
    updateSize();

    clear();

    const { bounds, previewBounds, movePreview } = selectionState;

    // 1. Render content being moved (highest priority)
    if (movePreview && movePreview.pixelData) {
        renderMovePreview(movePreview);
        // Also draw a border around the moving content
        const moveBounds = {
            x1: movePreview.x,
            y1: movePreview.y,
            x2: movePreview.x + movePreview.pixelData[0].length - 1,
            y2: movePreview.y + movePreview.pixelData.length - 1,
        };
        drawMarchingAnts(moveBounds, dashOffset);
    }
    // 2. Render a finalized selection border
    else if (bounds) {
        drawMarchingAnts(bounds, dashOffset);
    }
    // 3. Render a live selection drawing preview
    else if (previewBounds) {
        drawSelectionPreview(previewBounds);
    }
}

/**
 * Renders the pixel data for a MoveTool preview.
 * @param {Object} movePreview - The data from MoveTool.getPreviewData().
 */
function renderMovePreview(movePreview) {
    const { pixelData, x, y } = movePreview;
    const mainRect = mainCanvas.getBoundingClientRect();
    const overlayRect = overlayCanvas.getBoundingClientRect();
    const colors = renderer.getColors();

    const gridWidth = mainCanvas.width / renderer.getPixelSize();
    const displayedPixelSize = mainRect.width / gridWidth;

    overlayCtx.save();

    for (let j = 0; j < pixelData.length; j++) {
        for (let i = 0; i < pixelData[j].length; i++) {
            const colorIndex = pixelData[j][i];
            if (colorIndex !== 0) {
                overlayCtx.fillStyle = colors[colorIndex];
                overlayCtx.fillRect(
                    (x + i) * displayedPixelSize,
                    (y + j) * displayedPixelSize,
                    displayedPixelSize,
                    displayedPixelSize
                );
            }
        }
    }
    overlayCtx.restore();
}

/**
 * Draws the "marching ants" animated border for a finalized selection.
 * @param {Object} bounds - The selection bounds {x1, y1, x2, y2}.
 * @param {number} dashOffset - The animation offset.
 */
function drawMarchingAnts(bounds, dashOffset) {
    // Use the ACTUAL displayed canvas size, not the internal pixelSize!
    // The canvas element's width/height are the internal resolution,
    // but getBoundingClientRect gives us the displayed size after CSS transforms
    const mainRect = mainCanvas.getBoundingClientRect();
    const overlayRect = overlayCanvas.getBoundingClientRect();

    // Get the grid dimensions
    const gridWidth = mainCanvas.width / renderer.getPixelSize();
    const gridHeight = mainCanvas.height / renderer.getPixelSize();

    // Calculate the ACTUAL displayed pixel size
    const displayedPixelSize = mainRect.width / gridWidth;

    // Calculate bounds using displayed size
    const x = bounds.x1 * displayedPixelSize;
    const y = bounds.y1 * displayedPixelSize;
    const w = (bounds.x2 - bounds.x1 + 1) * displayedPixelSize;
    const h = (bounds.y2 - bounds.y1 + 1) * displayedPixelSize;

    // Save context state
    overlayCtx.save();
    overlayCtx.imageSmoothingEnabled = false;

    // Draw white dashes
    overlayCtx.strokeStyle = '#FFFFFF';
    overlayCtx.lineWidth = 1;
    overlayCtx.setLineDash([4, 4]);
    overlayCtx.lineDashOffset = dashOffset;
    overlayCtx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);

    // Draw black dashes (offset by 4 for marching effect)
    overlayCtx.strokeStyle = '#000000';
    overlayCtx.lineDashOffset = dashOffset + 4;
    overlayCtx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);

    // Restore context state
    overlayCtx.restore();
}

/**
 * Draws a simple dashed-line preview for a selection in progress.
 * @param {Object} bounds - The preview bounds {x1, y1, x2, y2}.
 */
function drawSelectionPreview(bounds) {
    const mainRect = mainCanvas.getBoundingClientRect();
    const overlayRect = overlayCanvas.getBoundingClientRect();

    const gridWidth = mainCanvas.width / renderer.getPixelSize();
    const gridHeight = mainCanvas.height / renderer.getPixelSize();
    const displayedPixelSize = mainRect.width / gridWidth;

    const x = bounds.x1 * displayedPixelSize;
    const y = bounds.y1 * displayedPixelSize;
    const w = (bounds.x2 - bounds.x1 + 1) * displayedPixelSize;
    const h = (bounds.y2 - bounds.y1 + 1) * displayedPixelSize;

    overlayCtx.save();
    overlayCtx.imageSmoothingEnabled = false;

    overlayCtx.strokeStyle = 'rgba(0, 191, 255, 0.8)';
    overlayCtx.lineWidth = 1;
    overlayCtx.setLineDash([3, 3]);
    overlayCtx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
    overlayCtx.restore();
}

/**
 * Clear the entire overlay canvas.
 */
function clear() {
    if (overlayCanvas && overlayCtx) {
        overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    }
}

/**
 * Clean up and remove the overlay.
 */
function destroy() {
    if (overlayCanvas) {
        overlayCanvas.remove();
        overlayCanvas = null;
        overlayCtx = null;
    }
    logger.debug?.('SelectionOverlay destroyed');
}

const SelectionOverlay = {
    init,
    updateSize,
    render,
    clear,
    destroy
};

export default SelectionOverlay;
