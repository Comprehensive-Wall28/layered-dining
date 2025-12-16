

const ROLES = {
    ADMIN: 'Admin',
    MANAGER: 'Manager',
    CUSTOMER: 'Customer'
};

// Freeze the object to prevent modifications
Object.freeze(ROLES);

module.exports = ROLES;
