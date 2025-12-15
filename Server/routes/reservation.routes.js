const { Router } = require("express");
const router = Router();

const authenticationMiddleware = require('../middleware/authentication.middleware.js');
const authorizationMiddleware = require('../middleware/authorization.middleware.js');
const reservationController = require("../controllers/reservation.controller.js");
const ROLES = require('../config/roles.js');

// Public route - anyone authenticated can check availability
router.get("/available-tables",
    authenticationMiddleware,
    reservationController.getAvailableTables
);

// Customer routes - authenticated users can create and view their reservations
router.post("/",
    authenticationMiddleware,
    reservationController.createReservation
);

router.get("/my-reservations",
    authenticationMiddleware,
    reservationController.getUserReservations
);

// Admin/Manager routes - manage all reservations
router.get("/all",
    authenticationMiddleware,
    authorizationMiddleware([ROLES.ADMIN, ROLES.MANAGER]),
    reservationController.getAllReservations
);

router.put("/status/:id",
    authenticationMiddleware,
    authorizationMiddleware([ROLES.ADMIN, ROLES.MANAGER]),
    reservationController.updateReservationStatus
);

router.put("/cancel/:id",
    authenticationMiddleware,
    reservationController.cancelReservation
);

router.put("/:id",
    authenticationMiddleware,
    reservationController.updateReservation
);

router.get("/:id",
    authenticationMiddleware,
    reservationController.getReservationById
);

module.exports = router;
