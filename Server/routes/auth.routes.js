const { Router } = require("express");
const router = Router();

const authController = require("../controllers/auth.controller.js");

//auth routes
router.post("/login",authController.login );
router.post("/register", authController.register );
router.post("/logout", authController.logout );

module.exports = router;
