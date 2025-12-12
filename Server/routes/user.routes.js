const { Router } = require("express");
const router = Router();

const authenticationMiddleware = require('../middleware/authentication.middleware.js');
const authorizationMiddleware = require('../middleware/authorization.middleware.js');
const userController = require("../controllers/user.controller.js");

const ROLES = require('../config/roles.js');

//user routes
router.get("/", authenticationMiddleware, userController.getCurrentUser);
router.get("/cart", authenticationMiddleware, userController.getCartId);
router.put("/profile", authenticationMiddleware, userController.updateUserProfile)
router.get("/log/:id", authenticationMiddleware, authorizationMiddleware([ROLES.ADMIN]), userController.getLogs)
router.get("/all", authenticationMiddleware, authorizationMiddleware([ROLES.ADMIN]), userController.getAllUsers);
router.delete("/:id", authenticationMiddleware, authorizationMiddleware([ROLES.ADMIN]), userController.deleteAccount);
router.put("/:id", authenticationMiddleware, authorizationMiddleware([ROLES.ADMIN]), userController.adminUpdateUser);
router.get("/stats", authenticationMiddleware, authorizationMiddleware([ROLES.ADMIN]), userController.getDashboardStats);

router.post("/feedback", authenticationMiddleware, authorizationMiddleware([ROLES.CUSTOMER]), userController.createFeedback);
router.get("/feedback", authenticationMiddleware, authorizationMiddleware([ROLES.ADMIN, ROLES.MANAGER]), userController.getAllFeedback);
router.get("/feedback/:id", authenticationMiddleware, authorizationMiddleware([ROLES.ADMIN, ROLES.MANAGER]), userController.getFeedback);
router.delete("/feedback/:id", authenticationMiddleware, authorizationMiddleware([ROLES.ADMIN, ROLES.MANAGER]), userController.deleteFeedback);

router.delete("/delete/:id", authenticationMiddleware, authorizationMiddleware([ROLES.CUSTOMER]), userController.deleteAccount);

module.exports = router;
