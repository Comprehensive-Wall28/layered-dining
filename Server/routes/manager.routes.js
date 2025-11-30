const { Router } = require("express");
const router = Router();

const authenticationMiddleware = require('../middleware/authentication.middleware.js');
const authorizationMiddleware = require('../middleware/authorization.middleware.js');
const managerController = require("../controllers/manager.controller.js");

router.get("/",authenticationMiddleware,userController.getCurrentUser);
//router.get("/cart", authenticationMiddleware, userController.getCartId);
router.put("/profile", authenticationMiddleware, userController.updateUserProfile)
router.get("/log/:id", authenticationMiddleware, authorizationMiddleware([ROLES.ADMIN]), userController.getLogs)


router.put("/order/:id", authenticationMiddleware, authorizationMiddleware([ROLES.MANAGER]),managerController.updateOrderStatus)
router.put("/order/:id", authenticationMiddleware, authorizationMiddleware([ROLES.MANAGER]), managerController.acceptOrder)

//router.delete("/delete/:id",authenticationMiddleware,authorizationMiddleware([ROLES.CUSTOMER]),userController.deleteAccount);
