/**
 * Centralized role definitions for the application
 * This ensures consistency across all routes and prevents typos
 */

const ROLES = {
    ADMIN: 'Admin',
    MANAGER: 'Manager',
    CUSTOMER: 'Customer'
};

// Freeze the object to prevent modifications
Object.freeze(ROLES);

module.exports = ROLES;
