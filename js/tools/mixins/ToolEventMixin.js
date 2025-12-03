/**
 * ToolEventMixin - Event handling for tools
 *
 * Provides event listener management:
 * - Automatic event listener tracking
 * - Cleanup on destroy
 * - Bound handler management
 *
 * @module ToolEventMixin
 */

/**
 * Mixin for event handling
 * @param {class} BaseClass - Base class to extend
 * @returns {class} Extended class with event handling
 */
export function withEvents(BaseClass) {
    return class extends BaseClass {
        constructor(...args) {
            super(...args);

            // Event handlers (bound for proper cleanup)
            this.boundHandlers = {};
        }

        /**
         * Add event listener with automatic cleanup tracking
         * @param {EventTarget} target - Event target
         * @param {string} event - Event name
         * @param {Function} handler - Event handler
         */
        addEventListener(target, event, handler) {
            const boundHandler = handler.bind(this);
            target.addEventListener(event, boundHandler);

            const key = `${event}_${Date.now()}`;
            this.boundHandlers[key] = { target, event, handler: boundHandler };
        }

        /**
         * Remove all event listeners
         */
        removeAllEventListeners() {
            Object.values(this.boundHandlers).forEach(({ target, event, handler }) => {
                target.removeEventListener(event, handler);
            });
            this.boundHandlers = {};
        }
    };
}
