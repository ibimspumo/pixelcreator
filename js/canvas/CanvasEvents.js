/**
 * CanvasEvents - Canvas Event Handler
 *
 * Manages user interaction with the canvas:
 * - Mouse and touch event handling
 * - Coordinate translation
 * - Tool integration
 * - Drawing state management
 *
 * @module CanvasEvents
 *
 * @typedef {import('../types.js').DrawingContext} DrawingContext
 */

import logger from '../core/Logger.js';
import eventBus from '../core/EventBus.js';
import CanvasRenderer from './CanvasRenderer.js';
import PixelData from './PixelData.js';
import ToolRegistry from '../tools/ToolRegistry.js';
import ColorPalette from '../colorPalette.js';
import Viewport from '../viewport.js';
import SelectionOverlay from './SelectionOverlay.js';

let canvas = null;
let renderer = null;
let pixelData = null;
let toolRegistry = null;
let colorPalette = null;
let viewport = null;

let onChangeCallback = null;
let isDrawing = false;

/**
 * Initialize event handler
 * @param {HTMLCanvasElement} canvasElement - Canvas element
 * @param {Object} dependencies - Module dependencies
 */
function init(canvasElement, dependencies = {}) {
    canvas = canvasElement;
    renderer = dependencies.renderer || CanvasRenderer;
    pixelData = dependencies.pixelData || PixelData;
    toolRegistry = dependencies.toolRegistry || ToolRegistry;
    colorPalette = dependencies.colorPalette || ColorPalette;
    viewport = dependencies.viewport || Viewport;
    onChangeCallback = dependencies.onChange || null;

    setupEventListeners();
    logger.debug?.('CanvasEvents initialized');
}

/**
 * Setup event listeners
 * @private
 */
function setupEventListeners() {
    // Mouse events
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp);

    // Touch events
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd);
    canvas.addEventListener('touchcancel', handleTouchEnd);

    // Prevent context menu
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    logger.debug?.('Canvas event listeners registered');
}

/**
 * Handle mouse down
 * @private
 */
function handleMouseDown(e) {
    if (!toolRegistry || !pixelData) return;

    const coords = getPixelCoordinates(e);
    if (!coords) return;

    // Use active layer data for tools to modify
    const data = pixelData.getActiveLayerData();
    const colorIndex = colorPalette ? colorPalette.getCurrentColorIndex() : 1;

    const context = {
        colorCode: colorIndex,
        event: e
    };

    isDrawing = true;
    toolRegistry.startDrawing(coords.x, coords.y, data, context);

    // Immediate draw for continuous tools
    const toolId = toolRegistry.getCurrentToolId();
    if (['brush', 'pencil', 'eraser'].includes(toolId)) {
        if (toolRegistry.continueDrawing(coords.x, coords.y, data, context)) {
            triggerRender();
            triggerChange();
        }
    }
}

/**
 * Handle mouse move
 * @private
 */
function handleMouseMove(e) {
    if (!toolRegistry || !pixelData) return;

    const coords = getPixelCoordinates(e);
    if (!coords) return;

    // Use active layer data for tools to modify
    const data = pixelData.getActiveLayerData();
    const colorIndex = colorPalette ? colorPalette.getCurrentColorIndex() : 1;

    const context = {
        colorCode: colorIndex,
        event: e,
        onSelectionChange: handleSelectionChange
    };

    if (toolRegistry.continueDrawing(coords.x, coords.y, data, context)) {
        triggerRender();
        triggerChange();
    }
}

/**
 * Handle mouse up
 * @private
 */
function handleMouseUp(e) {
    if (!isDrawing || !toolRegistry || !pixelData) {
        isDrawing = false;
        return;
    }

    isDrawing = false;

    const coords = getPixelCoordinates(e);
    const data = pixelData.getActiveLayerData();
    const colorIndex = colorPalette ? colorPalette.getCurrentColorIndex() : 1;

    const context = {
        colorCode: colorIndex,
        event: e,
        onSelectionChange: handleSelectionChange
    };

    let modified = false;
    if (coords) {
        modified = toolRegistry.endDrawing(coords.x, coords.y, data, context);
    } else {
        // Mouse left canvas - use invalid coords to signal end
        modified = toolRegistry.endDrawing(-1, -1, data, context);
    }

    if (modified) {
        triggerRender();
        triggerChange();
    }
}

/**
 * Handle touch start
 * @private
 */
function handleTouchStart(e) {
    e.preventDefault();

    if (e.touches.length === 0) return;

    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY,
        bubbles: true
    });

    handleMouseDown(mouseEvent);
}

/**
 * Handle touch move
 * @private
 */
function handleTouchMove(e) {
    e.preventDefault();

    if (e.touches.length === 0) return;

    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY,
        bubbles: true
    });

    handleMouseMove(mouseEvent);
}

/**
 * Handle touch end
 * @private
 */
function handleTouchEnd(e) {
    e.preventDefault();

    const mouseEvent = new MouseEvent('mouseup', {
        bubbles: true
    });

    handleMouseUp(mouseEvent);
}

/**
 * Get pixel coordinates from mouse/touch event
 * @private
 * @param {MouseEvent} e - Mouse event
 * @returns {Object|null} {x, y} or null
 */
function getPixelCoordinates(e) {
    if (!renderer || !pixelData) return null;

    const dims = pixelData.getDimensions();
    const zoom = viewport ? viewport.getZoom() : 1.0;

    return renderer.screenToPixelCoords(
        e.clientX,
        e.clientY,
        dims.width,
        dims.height,
        zoom
    );
}

/**
 * Handle selection change callback
 * @private
 */
function handleSelectionChange(bounds) {
    // Selection is now managed by PixelCanvas render loop
    // Just emit event for other components
    if (eventBus) {
        eventBus.emit(eventBus.Events.SELECTION_CHANGED, bounds);
    }
}

/**
 * Trigger canvas render
 * @private
 */
function triggerRender() {
    if (renderer && pixelData) {
        renderer.render(pixelData.getData());
    }
}

/**
 * Trigger change callback
 * @private
 */
function triggerChange() {
    if (onChangeCallback) {
        onChangeCallback();
    }

    // Emit event
    if (eventBus) {
        eventBus.emit(eventBus.Events.CANVAS_CHANGED);
    }
}

/**
 * Set change callback
 * @param {Function} callback - Callback function
 */
function setChangeCallback(callback) {
    onChangeCallback = callback;
}

/**
 * Remove all event listeners
 */
function destroy() {
    if (!canvas) return;

    canvas.removeEventListener('mousedown', handleMouseDown);
    canvas.removeEventListener('mousemove', handleMouseMove);
    canvas.removeEventListener('mouseup', handleMouseUp);
    canvas.removeEventListener('mouseleave', handleMouseUp);
    canvas.removeEventListener('touchstart', handleTouchStart);
    canvas.removeEventListener('touchmove', handleTouchMove);
    canvas.removeEventListener('touchend', handleTouchEnd);
    canvas.removeEventListener('touchcancel', handleTouchEnd);
    canvas.removeEventListener('contextmenu', (e) => e.preventDefault());

    logger.debug?.('CanvasEvents destroyed');
}

const CanvasEvents = {
    init,
    setChangeCallback,
    destroy
};

export default CanvasEvents;
