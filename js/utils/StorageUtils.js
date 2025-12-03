/**
 * StorageUtils - Safe localStorage wrapper
 *
 * Provides safe access to localStorage with:
 * - Availability checks (Private browsing)
 * - Quota exceeded handling
 * - Error recovery
 * - Fallback mechanisms
 *
 * @module StorageUtils
 */

import logger from '../core/Logger.js';

let isAvailable = null;
let quotaExceeded = false;

/**
 * Check if localStorage is available
 * @returns {boolean} True if localStorage is available
 */
function isStorageAvailable() {
    if (isAvailable !== null) {
        return isAvailable;
    }

    try {
        const test = '__storage_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        isAvailable = true;
        return true;
    } catch (e) {
        isAvailable = false;
        logger.warn?.('localStorage is not available', e);
        return false;
    }
}

/**
 * Safely get item from localStorage
 * @param {string} key - Storage key
 * @returns {string|null} Value or null
 */
function getItem(key) {
    if (!isStorageAvailable()) {
        return null;
    }

    try {
        return localStorage.getItem(key);
    } catch (e) {
        logger.error?.('localStorage.getItem failed', e);
        return null;
    }
}

/**
 * Safely set item in localStorage
 * @param {string} key - Storage key
 * @param {string} value - Value to store
 * @returns {boolean} True if successful
 */
function setItem(key, value) {
    if (!isStorageAvailable()) {
        return false;
    }

    try {
        localStorage.setItem(key, value);
        quotaExceeded = false;
        return true;
    } catch (e) {
        if (e.name === 'QuotaExceededError' || e.code === 22) {
            quotaExceeded = true;
            logger.error?.('localStorage quota exceeded', e);
        } else {
            logger.error?.('localStorage.setItem failed', e);
        }
        return false;
    }
}

/**
 * Safely remove item from localStorage
 * @param {string} key - Storage key
 * @returns {boolean} True if successful
 */
function removeItem(key) {
    if (!isStorageAvailable()) {
        return false;
    }

    try {
        localStorage.removeItem(key);
        return true;
    } catch (e) {
        logger.error?.('localStorage.removeItem failed', e);
        return false;
    }
}

/**
 * Safely clear all localStorage
 * @returns {boolean} True if successful
 */
function clear() {
    if (!isStorageAvailable()) {
        return false;
    }

    try {
        localStorage.clear();
        return true;
    } catch (e) {
        logger.error?.('localStorage.clear failed', e);
        return false;
    }
}

/**
 * Get all keys in localStorage
 * @returns {Array<string>} Array of keys
 */
function keys() {
    if (!isStorageAvailable()) {
        return [];
    }

    try {
        const allKeys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key) {
                allKeys.push(key);
            }
        }
        return allKeys;
    } catch (e) {
        logger.error?.('localStorage.keys failed', e);
        return [];
    }
}

/**
 * Check if quota is exceeded
 * @returns {boolean} True if quota exceeded
 */
function isQuotaExceeded() {
    return quotaExceeded;
}

/**
 * Get storage usage statistics
 * @returns {Object|null} Storage stats {used, total, percentage, usedKB, totalMB}
 */
function getStorageStats() {
    if (!isStorageAvailable()) {
        return null;
    }

    try {
        let totalSize = 0;

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key) {
                const value = localStorage.getItem(key);
                if (value) {
                    totalSize += key.length + value.length;
                }
            }
        }

        const total = 5 * 1024 * 1024; // Approximate 5MB limit

        return {
            used: totalSize,
            total: total,
            percentage: (totalSize / total * 100).toFixed(2),
            usedKB: (totalSize / 1024).toFixed(2),
            totalMB: (total / 1024 / 1024).toFixed(2),
            available: total - totalSize
        };
    } catch (e) {
        logger.error?.('getStorageStats failed', e);
        return null;
    }
}

/**
 * Get item with JSON parsing
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if parse fails
 * @returns {*} Parsed value or default
 */
function getJSON(key, defaultValue = null) {
    const value = getItem(key);
    if (!value) {
        return defaultValue;
    }

    try {
        return JSON.parse(value);
    } catch (e) {
        logger.error?.('JSON parse failed', e);
        return defaultValue;
    }
}

/**
 * Set item with JSON stringification
 * @param {string} key - Storage key
 * @param {*} value - Value to store
 * @returns {boolean} True if successful
 */
function setJSON(key, value) {
    try {
        const json = JSON.stringify(value);
        return setItem(key, json);
    } catch (e) {
        logger.error?.('JSON stringify failed', e);
        return false;
    }
}

/**
 * Check if key exists
 * @param {string} key - Storage key
 * @returns {boolean} True if key exists
 */
function hasKey(key) {
    return getItem(key) !== null;
}

const StorageUtils = {
    isStorageAvailable,
    getItem,
    setItem,
    removeItem,
    clear,
    keys,
    isQuotaExceeded,
    getStorageStats,
    getJSON,
    setJSON,
    hasKey
};

export default StorageUtils;
