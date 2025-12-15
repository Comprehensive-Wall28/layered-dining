const { Router } = require("express");
const router = Router();

const authController = require("../controllers/auth.controller.js");

const authenticationMiddleware = require('../middleware/authentication.middleware.js');

//auth routes
router.post("/login", authController.login);
router.post("/register", authController.register);
router.post("/logout", authController.logout);
router.delete("/delete-account", authenticationMiddleware, authController.deleteAccount);

module.exports = router;
