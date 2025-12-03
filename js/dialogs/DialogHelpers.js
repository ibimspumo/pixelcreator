/**
 * DialogHelpers - Utility functions for dialogs
 *
 * @module DialogHelpers
 */

/**
 * Escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
export function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Get icon name for dialog type
 * @param {string} type - Dialog type
 * @returns {string} Icon name
 */
export function getIconForType(type) {
    const iconMap = {
        info: 'info',
        success: 'check_circle',
        warning: 'warning',
        error: 'error'
    };
    return iconMap[type] || iconMap.info;
}
