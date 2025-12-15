const { Router } = require("express");
const router = Router();

const authenticationMiddleware = require('../middleware/authentication.middleware');
const authorizationMiddleware = require('../middleware/authorization.middleware');
const menuController = require("../controllers/menu.controller");

const ROLES = require('../config/roles.js');

// Public routes - SPECIFIC ROUTES FIRST!
router.get("/category/:category", menuController.getMenuByCategory);
router.get("/", menuController.getAllMenuItems);
// WILDCARD ROUTE LAST!
router.get("/:id", menuController.getMenuItemById);

// Protected routes - ADD MIDDLEWARE BACK!
router.post("/",
    authenticationMiddleware,
    authorizationMiddleware([ROLES.ADMIN, ROLES.MANAGER]),
    menuController.createMenuItem
);

router.put("/:id", authenticationMiddleware, authorizationMiddleware([ROLES.ADMIN, ROLES.MANAGER]), menuController.updateMenuItem);
router.delete("/:id", authenticationMiddleware, authorizationMiddleware([ROLES.ADMIN, ROLES.MANAGER]), menuController.deleteMenuItem);

module.exports = router;