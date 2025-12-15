const { Router } = require("express");
const router = Router();

const authenticationMiddleware = require('../middleware/authentication.middleware.js');
const authorizationMiddleware = require('../middleware/authorization.middleware.js');
const tableController = require("../controllers/table.controller.js");
const ROLES = require('../config/roles.js');

// Public route - anyone authenticated can view all tables
router.get("/",
    authenticationMiddleware,
    tableController.getAllTables
);

// Get tables created by the authenticated user
router.get("/my-tables",
    authenticationMiddleware,
    tableController.getMyTables
);

router.get("/:id",
    authenticationMiddleware,
    tableController.getTableById
);

// Admin/Manager routes - manage tables
router.post("/",
    authenticationMiddleware,
    authorizationMiddleware([ROLES.ADMIN, ROLES.MANAGER]),
    tableController.createTable
);

router.put("/:id",
    authenticationMiddleware,
    authorizationMiddleware([ROLES.ADMIN, ROLES.MANAGER]),
    tableController.updateTable
);

// Admin/Manager - delete tables
router.delete("/:id",
    authenticationMiddleware,
    authorizationMiddleware([ROLES.ADMIN, ROLES.MANAGER]),
    tableController.deleteTable
);

module.exports = router;
