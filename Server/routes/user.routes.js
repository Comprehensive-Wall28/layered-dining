const { Router } = require("express");
const router = Router();

const authenticationMiddleware = require('../middleware/authentication.middleware.js');
const authorizationMiddleware = require('../middleware/authorization.middleware.js');
const userController = require("../controllers/user.controller.js");
const ROLES = require('../config/roles.js');

//user routes
router.get("/",authenticationMiddleware,userController.getCurrentUser);
router.put("/profile", authenticationMiddleware, userController.updateUserProfile)
router.get("/log/:id", authenticationMiddleware, authorizationMiddleware([ROLES.ADMIN]), userController.getLogs)

router.delete("/delete/:id",authenticationMiddleware,authorizationMiddleware([ROLES.CUSTOMER]),userController.deleteAccount);

module.exports = router;
