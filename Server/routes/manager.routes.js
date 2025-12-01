const { Router } = require("express");
const router = Router();

const authenticationMiddleware = require('../middleware/authentication.middleware.js');
const authorizationMiddleware = require('../middleware/authorization.middleware.js');
const managerController = require("../controllers/manager.controller.js");

const ROLES = {
    ADMIN: 'Admin',
    MANAGER: 'Manager',
    CUSTOMER: 'Customer'
};

router.put("/:id/status", authenticationMiddleware, authorizationMiddleware([ROLES.MANAGER]),managerController.updateOrderStatus);
router.put("/:id/status", authenticationMiddleware, authorizationMiddleware([ROLES.MANAGER]), managerController.acceptOrder);

module.exports = router;