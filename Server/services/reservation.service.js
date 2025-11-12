const ReservationModel = require('../models/reservation');
const TableModel = require('../models/table');
const LogModel = require('../models/log');
const mongoose = require('mongoose');

const reservationService = {

    /**
     * Get available tables based on party size, date, and time
     * @param {Number} partySize - Number of people
     * @param {Date} reservationDate - Date of reservation
     * @param {String} startTime - Start time in HH:MM format
     * @param {String} endTime - End time in HH:MM format
     * @returns {Array} Available tables
     */
    async getAvailableTables(partySize, reservationDate, startTime, endTime) {
        try {
            // Find all tables that can accommodate the party size
            const suitableTables = await TableModel.find({
                capacity: { $gte: partySize },
                status: { $in: ['Available', 'Reserved'] } // Not in maintenance or permanently occupied
            });

            if (suitableTables.length === 0) {
                const error = new Error('No tables available for the requested party size');
                error.code = 404;
                throw error;
            }

            // Convert date string to Date object for comparison
            const searchDate = new Date(reservationDate);
            searchDate.setHours(0, 0, 0, 0);

            const nextDay = new Date(searchDate);
            nextDay.setDate(nextDay.getDate() + 1);

            // Find all reservations for that date
            const existingReservations = await ReservationModel.find({
                reservationDate: {
                    $gte: searchDate,
                    $lt: nextDay
                },
                status: { $in: ['Pending', 'Confirmed'] }
            });

            // Filter tables that are available during the requested time slot
            const availableTables = suitableTables.filter(table => {
                // Check if this table has any conflicting reservations
                const hasConflict = existingReservations.some(reservation => {
                    if (reservation.tableId.toString() !== table._id.toString()) {
                        return false;
                    }

                    // Check for time overlap
                    return this.timeOverlap(startTime, endTime, reservation.startTime, reservation.endTime);
                });

                return !hasConflict;
            });

            if (availableTables.length === 0) {
                const error = new Error('No tables available for the requested time slot');
                error.code = 404;
                throw error;
            }

            return availableTables;

        } catch (error) {
            if (error.code) throw error;
            const err = new Error('Error fetching available tables: ' + error.message);
            err.code = 500;
            throw err;
        }
    },

    /**
     * Helper function to check if two time ranges overlap
     */
    timeOverlap(start1, end1, start2, end2) {
        const [s1h, s1m] = start1.split(':').map(Number);
        const [e1h, e1m] = end1.split(':').map(Number);
        const [s2h, s2m] = start2.split(':').map(Number);
        const [e2h, e2m] = end2.split(':').map(Number);

        const start1Minutes = s1h * 60 + s1m;
        const end1Minutes = e1h * 60 + e1m;
        const start2Minutes = s2h * 60 + s2m;
        const end2Minutes = e2h * 60 + e2m;

        return start1Minutes < end2Minutes && end1Minutes > start2Minutes;
    },

    /**
     * Create a new reservation
     * @param {Object} reservationData - Reservation details
     * @param {Object} user - User creating the reservation
     * @returns {Object} Created reservation
     */
    async createReservation(reservationData, user) {
        try {
            const { 
                tableId, 
                partySize, 
                reservationDate, 
                startTime, 
                endTime, 
                customerName, 
                customerEmail, 
                customerPhone,
                specialRequests,
                occasion
            } = reservationData;

            // Validate table exists and has sufficient capacity
            const table = await TableModel.findById(tableId);
            if (!table) {
                const error = new Error('Table not found');
                error.code = 404;
                throw error;
            }

            if (table.capacity < partySize) {
                const error = new Error(`Table capacity (${table.capacity}) is insufficient for party size (${partySize})`);
                error.code = 400;
                throw error;
            }

            // Check if table is available at the requested time
            const availableTables = await this.getAvailableTables(partySize, reservationDate, startTime, endTime);
            const isTableAvailable = availableTables.some(t => t._id.toString() === tableId);

            if (!isTableAvailable) {
                const error = new Error('Table is not available at the requested time');
                error.code = 409;
                throw error;
            }

            // Calculate duration
            const [startHour, startMin] = startTime.split(':').map(Number);
            const [endHour, endMin] = endTime.split(':').map(Number);
            const duration = ((endHour * 60 + endMin) - (startHour * 60 + startMin)) / 60;

            // Create the reservation
            const newReservation = new ReservationModel({
                userId: user.id,
                tableId,
                partySize,
                reservationDate: new Date(reservationDate),
                startTime,
                endTime,
                duration,
                status: 'Pending',
                customerName,
                customerEmail,
                customerPhone,
                specialRequests: specialRequests || '',
                occasion: occasion || 'None',
                createdBy: user.id
            });

            await newReservation.save();

            // Create log entry
            const log = new LogModel({
                action: 'CREATE',
                description: `Reservation created for table ${table.tableNumber} on ${reservationDate}`,
                affectedDocument: newReservation._id,
                affectedModel: 'Reservation',
                severity: 'NOTICE',
                type: 'SUCCESS',
                userId: user.id,
            });
            await log.save();

            // Populate table and user details
            await newReservation.populate('tableId');
            await newReservation.populate('userId', 'name email');

            return newReservation;

        } catch (error) {
            if (error.code) throw error;
            const err = new Error('Error creating reservation: ' + error.message);
            err.code = 500;
            throw err;
        }
    },

    /**
     * Get user's reservations
     * @param {String} userId - User ID
     * @returns {Array} User reservations
     */
    async getUserReservations(userId) {
        try {
            const reservations = await ReservationModel.find({ userId })
                .populate('tableId')
                .sort({ reservationDate: -1 });

            return reservations;

        } catch (error) {
            const err = new Error('Error fetching user reservations: ' + error.message);
            err.code = 500;
            throw err;
        }
    },

    /**
     * Get all reservations (Admin/Manager only)
     * @param {Object} filters - Optional filters
     * @returns {Array} All reservations
     */
    async getAllReservations(filters = {}) {
        try {
            const query = {};
            
            if (filters.status) {
                query.status = filters.status;
            }
            
            if (filters.date) {
                const searchDate = new Date(filters.date);
                searchDate.setHours(0, 0, 0, 0);
                const nextDay = new Date(searchDate);
                nextDay.setDate(nextDay.getDate() + 1);
                
                query.reservationDate = {
                    $gte: searchDate,
                    $lt: nextDay
                };
            }

            const reservations = await ReservationModel.find(query)
                .populate('tableId')
                .populate('userId', 'name email')
                .sort({ reservationDate: -1 });

            return reservations;

        } catch (error) {
            const err = new Error('Error fetching reservations: ' + error.message);
            err.code = 500;
            throw err;
        }
    },

    /**
     * Update reservation status
     * @param {String} reservationId - Reservation ID
     * @param {String} status - New status
     * @param {Object} user - User performing the action
     * @returns {Object} Updated reservation
     */
    async updateReservationStatus(reservationId, status, user) {
        try {
            const reservation = await ReservationModel.findById(reservationId);

            if (!reservation) {
                const error = new Error('Reservation not found');
                error.code = 404;
                throw error;
            }

            reservation.status = status;
            await reservation.save();

            // Create log entry
            const log = new LogModel({
                action: 'UPDATE',
                description: `Reservation status updated to ${status}`,
                affectedDocument: reservation._id,
                affectedModel: 'Reservation',
                severity: 'NOTICE',
                type: 'SUCCESS',
                userId: user.id,
            });
            await log.save();

            await reservation.populate('tableId');
            await reservation.populate('userId', 'name email');

            return reservation;

        } catch (error) {
            if (error.code) throw error;
            const err = new Error('Error updating reservation: ' + error.message);
            err.code = 500;
            throw err;
        }
    },

    /**
     * Cancel reservation
     * @param {String} reservationId - Reservation ID
     * @param {Object} user - User performing the action
     * @returns {Object} Cancelled reservation
     */
    async cancelReservation(reservationId, user) {
        try {
            const reservation = await ReservationModel.findById(reservationId);

            if (!reservation) {
                const error = new Error('Reservation not found');
                error.code = 404;
                throw error;
            }

            // Check if user owns this reservation or is admin/manager
            if (reservation.userId.toString() !== user.id && !['Admin', 'Manager'].includes(user.role)) {
                const error = new Error('Unauthorized to cancel this reservation');
                error.code = 403;
                throw error;
            }

            if (reservation.status === 'Cancelled') {
                const error = new Error('Reservation is already cancelled');
                error.code = 400;
                throw error;
            }

            reservation.status = 'Cancelled';
            await reservation.save();

            // Create log entry
            const log = new LogModel({
                action: 'UPDATE',
                description: `Reservation cancelled`,
                affectedDocument: reservation._id,
                affectedModel: 'Reservation',
                severity: 'IMPORTANT',
                type: 'SUCCESS',
                userId: user.id,
            });
            await log.save();

            await reservation.populate('tableId');
            await reservation.populate('userId', 'name email');

            return reservation;

        } catch (error) {
            if (error.code) throw error;
            const err = new Error('Error cancelling reservation: ' + error.message);
            err.code = 500;
            throw err;
        }
    }
};

module.exports = reservationService;
