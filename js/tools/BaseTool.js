/**
 * BaseTool - Abstract Base Class for All Drawing Tools (Refactored)
 *
 * Provides a comprehensive framework for implementing drawing tools with:
 * - Lifecycle hooks (init, activate, deactivate, destroy)
 * - Drawing phases (start, continue, end, cancel)
 * - State management (tool options)
 * - Preview system for shape tools
 * - Mixins for selection and event handling
 *
 * @abstract
 * @class BaseTool
 */

import logger from '../core/Logger.js';
import * as ToolHelpers from './mixins/ToolHelpers.js';
import { withSelection } from './mixins/ToolSelectionMixin.js';
import { withEvents } from './mixins/ToolEventMixin.js';

// Base class without mixins
class BaseToolCore {
    /**
     * Tool configuration - MUST be overridden by subclasses
     * @static
     */
    static CONFIG = {
        id: 'base-tool',
        name: 'Base Tool',
        icon: 'tool',
        shortcut: '',
        cursor: 'default',
        hasSizeOption: false,
        hasShapeOption: false,
        description: 'Base tool class',
        category: 'other'
    };

    /**
     * Default tool options - can be overridden
     * @static
     */
    static DEFAULT_OPTIONS = {
        brushSize: 1,
        shapeMode: 'fill',
        opacity: 1.0,
        antiAlias: false,
        snapToGrid: false,
        constrainProportions: false
    };

    constructor() {
        // Prevent direct instantiation of base class
        if (new.target === BaseToolCore) {
            throw new Error('BaseTool is abstract and cannot be instantiated directly');
        }

        // Validate CONFIG override
        const config = this.constructor.CONFIG;
        if (!config || config.id === 'base-tool') {
            throw new Error(`${this.constructor.name} must override static CONFIG property`);
        }

        // Initialize state
        this.isActive = false;
        this.isDrawing = false;
        this.options = { ...this.constructor.DEFAULT_OPTIONS };

        // Drawing state
        this.startX = 0;
        this.startY = 0;
        this.lastX = 0;
        this.lastY = 0;
        this.previewData = null;

        // Performance optimization
        this.throttle = ToolHelpers.createThrottle(16);

        // Callbacks
        this.onChangeCallback = null;
        this.onOptionChangeCallback = null;

        // History/undo integration
        this.actionHistory = [];

        // Logger reference
        this.logger = logger;

        this.logger.debug?.(`${this.constructor.CONFIG.name} tool created`);
    }

    // ==================== LIFECYCLE HOOKS ====================

    /**
     * Initialize tool - called once when tool is registered
     */
    init() {
        this.logger.debug?.(`${this.getName()} tool initialized`);
    }

    /**
     * Activate tool - called when tool is selected
     */
    activate() {
        this.isActive = true;
        this.logger.info?.(`${this.getName()} tool activated`);
    }

    /**
     * Deactivate tool - called when switching to another tool
     */
    deactivate() {
        this.isActive = false;
        this.cancelDrawing();
        this.logger.info?.(`${this.getName()} tool deactivated`);
    }

    /**
     * Destroy tool - called when tool is unregistered
     */
    destroy() {
        this.removeAllEventListeners();
        this.previewData = null;
        this.logger.debug?.(`${this.getName()} tool destroyed`);
    }

    // ==================== DRAWING LIFECYCLE ====================

    /**
     * Start drawing operation
     */
    startDrawing(x, y, pixelData, context = {}) {
        if (!this.isActive) {
            this.logger.warn?.(`Cannot start drawing: ${this.getName()} is not active`);
            return false;
        }

        if (!ToolHelpers.validateCoordinates(x, y, pixelData)) {
            this.logger.warn?.(`Invalid coordinates: (${x}, ${y})`);
            return false;
        }

        this.isDrawing = true;
        this.startX = x;
        this.startY = y;
        this.lastX = x;
        this.lastY = y;

        // Save preview data for tools that need it
        if (this.needsPreview()) {
            this.previewData = ToolHelpers.clonePixelData(pixelData);
        }

        return this.onDrawStart(x, y, pixelData, context);
    }

    /**
     * Continue drawing operation
     */
    continueDrawing(x, y, pixelData, context = {}) {
        if (!this.isDrawing) {
            return false;
        }

        if (!ToolHelpers.validateCoordinates(x, y, pixelData)) {
            return false;
        }

        // Throttle for performance
        if (this.throttle.shouldThrottle()) {
            return false;
        }

        this.lastX = x;
        this.lastY = y;

        return this.onDrawContinue(x, y, pixelData, context);
    }

    /**
     * End drawing operation
     */
    endDrawing(x, y, pixelData, context = {}) {
        if (!this.isDrawing) {
            return false;
        }

        this.isDrawing = false;

        if (!ToolHelpers.validateCoordinates(x, y, pixelData)) {
            x = this.lastX;
            y = this.lastY;
        }

        const modified = this.onDrawEnd(x, y, pixelData, context);

        // Cleanup
        this.previewData = null;
        this.throttle.reset();

        return modified;
    }

    /**
     * Cancel drawing operation
     */
    cancelDrawing() {
        if (this.isDrawing) {
            this.isDrawing = false;
            this.previewData = null;
            this.onDrawCancel();
            this.logger.debug?.(`${this.getName()} drawing cancelled`);
        }
    }

    // ==================== TOOL-SPECIFIC IMPLEMENTATIONS ====================
    // Subclasses MUST override these methods

    onDrawStart(x, y, pixelData, context) {
        throw new Error(`${this.constructor.name} must implement onDrawStart()`);
    }

    onDrawContinue(x, y, pixelData, context) {
        throw new Error(`${this.constructor.name} must implement onDrawContinue()`);
    }

    onDrawEnd(x, y, pixelData, context) {
        throw new Error(`${this.constructor.name} must implement onDrawEnd()`);
    }

    onDrawCancel() {
        // Optional override
    }

    // ==================== TOOL OPTIONS ====================

    /**
     * Set tool option
     */
    setOption(key, value) {
        if (this.options.hasOwnProperty(key)) {
            const oldValue = this.options[key];
            this.options[key] = value;
            this.onOptionChanged(key, value, oldValue);

            if (this.onOptionChangeCallback) {
                this.onOptionChangeCallback(key, value, oldValue);
            }
        } else {
            this.logger.warn?.(`Unknown option: ${key}`);
        }
    }

    /**
     * Get tool option
     */
    getOption(key) {
        return this.options[key];
    }

    /**
     * Get all options
     */
    getAllOptions() {
        return { ...this.options };
    }

    /**
     * Reset options to defaults
     */
    resetOptions() {
        this.options = { ...this.constructor.DEFAULT_OPTIONS };
        this.onOptionsReset();
    }

    /**
     * Handle option change - override for custom behavior
     */
    onOptionChanged(key, newValue, oldValue) {
        this.logger.debug?.(`${this.getName()} option changed: ${key} = ${newValue}`);
    }

    /**
     * Handle options reset - override for custom behavior
     */
    onOptionsReset() {
        // Optional override
    }

    // ==================== HELPER METHODS ====================

    /**
     * Check if tool needs preview mode
     */
    needsPreview() {
        return false; // Override in subclasses
    }

    /**
     * Validate coordinates
     */
    validateCoordinates(x, y, pixelData) {
        return ToolHelpers.validateCoordinates(x, y, pixelData);
    }

    /**
     * Clone pixel data
     */
    clonePixelData(pixelData) {
        return ToolHelpers.clonePixelData(pixelData);
    }

    /**
     * Restore preview data
     */
    restorePreviewData(pixelData) {
        ToolHelpers.restorePreviewData(pixelData, this.previewData);
    }

    /**
     * Set pixel
     */
    setPixel(x, y, pixelData, colorCode) {
        return ToolHelpers.setPixel(x, y, pixelData, colorCode);
    }

    /**
     * Get pixel
     */
    getPixel(x, y, pixelData) {
        return ToolHelpers.getPixel(x, y, pixelData);
    }

    // ==================== GETTERS ====================

    getId() {
        return this.constructor.CONFIG.id;
    }

    getName() {
        return this.constructor.CONFIG.name;
    }

    getConfig() {
        return { ...this.constructor.CONFIG };
    }

    getCursor() {
        return this.constructor.CONFIG.cursor;
    }

    hasSizeOption() {
        return this.constructor.CONFIG.hasSizeOption;
    }

    hasShapeOption() {
        return this.constructor.CONFIG.hasShapeOption;
    }

    // ==================== CALLBACKS ====================

    setChangeCallback(callback) {
        this.onChangeCallback = callback;
    }

    setOptionChangeCallback(callback) {
        this.onOptionChangeCallback = callback;
    }

    triggerChange() {
        if (this.onChangeCallback) {
            this.onChangeCallback();
        }
    }
}

// Apply mixins to create final BaseTool class
const BaseTool = withEvents(withSelection(BaseToolCore));

export default BaseTool;
