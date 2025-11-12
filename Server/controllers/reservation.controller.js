require("dotenv").config();
const reservationService = require("../services/reservation.service");

const reservationController = {

    /**
     * Get available tables based on party size, date, and time
     */
    getAvailableTables: async (req, res) => {
        try {
            const { partySize, reservationDate, startTime, endTime } = req.query;

            // Validate required parameters
            if (!partySize || !reservationDate || !startTime || !endTime) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Missing required parameters: partySize, reservationDate, startTime, endTime'
                });
            }

            // Validate party size
            if (partySize < 1) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Party size must be at least 1'
                });
            }

            const availableTables = await reservationService.getAvailableTables(
                parseInt(partySize),
                reservationDate,
                startTime,
                endTime
            );

            res.status(200).json({
                status: 'success',
                count: availableTables.length,
                tables: availableTables
            });

        } catch (error) {
            const statusCode = error.code || 500;
            res.status(statusCode).json({
                status: 'error',
                message: error.message
            });
        }
    },

    /**
     * Create a new reservation
     */
    createReservation: async (req, res) => {
        try {
            const reservationData = req.body;
            const user = req.user;

            // Validate required fields
            const requiredFields = ['tableId', 'partySize', 'reservationDate', 'startTime', 'endTime', 'customerName', 'customerEmail'];
            const missingFields = requiredFields.filter(field => !reservationData[field]);

            if (missingFields.length > 0) {
                return res.status(400).json({
                    status: 'error',
                    message: `Missing required fields: ${missingFields.join(', ')}`
                });
            }

            const newReservation = await reservationService.createReservation(reservationData, user);

            res.status(201).json({
                status: 'success',
                message: 'Reservation created successfully',
                reservation: newReservation
            });

        } catch (error) {
            const statusCode = error.code || 500;
            res.status(statusCode).json({
                status: 'error',
                message: error.message
            });
        }
    },

    /**
     * Get user's own reservations
     */
    getUserReservations: async (req, res) => {
        try {
            const userId = req.user.id;

            const reservations = await reservationService.getUserReservations(userId);

            res.status(200).json({
                status: 'success',
                count: reservations.length,
                reservations
            });

        } catch (error) {
            const statusCode = error.code || 500;
            res.status(statusCode).json({
                status: 'error',
                message: error.message
            });
        }
    },

    /**
     * Get all reservations (Admin/Manager only)
     */
    getAllReservations: async (req, res) => {
        try {
            const filters = {
                status: req.query.status,
                date: req.query.date
            };

            const reservations = await reservationService.getAllReservations(filters);

            res.status(200).json({
                status: 'success',
                count: reservations.length,
                reservations
            });

        } catch (error) {
            const statusCode = error.code || 500;
            res.status(statusCode).json({
                status: 'error',
                message: error.message
            });
        }
    },

    /**
     * Update reservation status (Admin/Manager only)
     */
    updateReservationStatus: async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body;

            if (!status) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Status is required'
                });
            }

            const validStatuses = ['Pending', 'Confirmed', 'Cancelled', 'Completed', 'No-Show'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    status: 'error',
                    message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
                });
            }

            const updatedReservation = await reservationService.updateReservationStatus(id, status, req.user);

            res.status(200).json({
                status: 'success',
                message: 'Reservation status updated successfully',
                reservation: updatedReservation
            });

        } catch (error) {
            const statusCode = error.code || 500;
            res.status(statusCode).json({
                status: 'error',
                message: error.message
            });
        }
    },

    /**
     * Cancel reservation (Customer can cancel their own, Admin/Manager can cancel any)
     */
    cancelReservation: async (req, res) => {
        try {
            const { id } = req.params;

            const cancelledReservation = await reservationService.cancelReservation(id, req.user);

            res.status(200).json({
                status: 'success',
                message: 'Reservation cancelled successfully',
                reservation: cancelledReservation
            });

        } catch (error) {
            const statusCode = error.code || 500;
            res.status(statusCode).json({
                status: 'error',
                message: error.message
            });
        }
    }
};

module.exports = reservationController;
