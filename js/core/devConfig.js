/**
 * Developer Configuration Module
 * 
 * DEVELOPMENT ONLY — DIRECT LEVEL ACCESS & TESTING TOOLS
 * 
 * IMPORTANT:
 * This is a DEVELOPMENT-ONLY configuration.
 * Toggle DEV_MODE to false to completely remove and disable all developer tools.
 */

export const DEV_CONFIG = {
  // Master toggle: true for development/QA, false for final production release
  DEV_MODE: true,

  // Default player identity used for direct level launches
  DEFAULT_TEST_PLAYER: 'TEST_OPERATOR'
};

/**
 * Programmatically enable or disable developer mode (used in tests)
 * @param {boolean} enabled
 */
export function setDevMode(enabled) {
  DEV_CONFIG.DEV_MODE = Boolean(enabled);
}
