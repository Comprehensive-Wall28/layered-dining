require("dotenv").config();
const reservationService = require("../services/reservation.service");
const nodemailer = require('nodemailer');
const User = require('../models/user');

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
        

        // Send confirmation email and notify managers in background (non-blocking)
        (async () => {
            try {
                const transporter = nodemailer.createTransport({
                    service: "Gmail",
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASS,
                    },
                });

                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: recipientEmail,
                    subject: "Reservation Confirmation",
                    html: `
            <html>
            <body style="font-family: Arial, sans-serif; background-color: #f6f6f6; margin: 0; padding: 0;">
              <table align="center" width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; margin-top: 20px;">
                <tr>
                  <td style="background-color: #111827; color: #ffffff; padding: 20px;">
                    <h2>Reservation Confirmed</h2>
                    <p>Thank you for booking with us!</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 20px;">
                    <p>Hello <strong>${reservationData.customerName}</strong>,</p>
                    <p>Your reservation details are as follows:</p>
                    <table cellpadding="8" cellspacing="0" width="100%" style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px;">
                      <tr>
                        <td><strong>Table ID</strong></td>
                        <td>${reservationData.tableId}</td>
                      </tr>
                      <tr>
                        <td><strong>Party Size</strong></td>
                        <td>${reservationData.partySize}</td>
                      </tr>
                      <tr>
                        <td><strong>Date</strong></td>
                        <td>${reservationData.reservationDate}</td>
                      </tr>
                      <tr>
                        <td><strong>Start Time</strong></td>
                        <td>${reservationData.startTime}</td>
                      </tr>
                      <tr>
                        <td><strong>End Time</strong></td>
                        <td>${reservationData.endTime}</td>
                      </tr>
                      <tr>
                        <td><strong>Customer Name</strong></td>
                        <td>${reservationData.customerName}</td>
                      </tr>
                      <tr>
                        <td><strong>Customer Email</strong></td>
                        <td>${reservationData.customerEmail}</td>
                      </tr>
                    </table>
                    <p style="margin-top: 20px;">If you need to change or cancel your reservation, please contact us by replying to this email.</p>
                    <p>We look forward to serving you!</p>
                    <p><strong>The Restaurant Team</strong></p>
                  </td>
                </tr>
                <tr>
                  <td style="background-color: #f3f4f6; color: #6b7280; text-align: center; font-size: 12px; padding: 10px;">
                    © ${new Date().getFullYear()} Restaurant Name
                  </td>
                </tr>
              </table>
            </body>
            </html>
            `
                };

                await transporter.sendMail(mailOptions);

                const managers = await User.find({ type: 'manager' });

                for (let manager of managers) {
                    const alreadyNotified = manager.notifications.some(
                        n => n.title === `New Reservation: ${newReservation._id}` && !n.read
                    );

                    if (!alreadyNotified) {
                        manager.notifications.push({
                            title: `New Reservation: ${newReservation._id}`,
            message: `
                Reservation Details:
                - Customer: ${newReservation.customerName}
                - Email: ${newReservation.customerEmail}
                - Table: ${newReservation.tableId}
                - Party Size: ${newReservation.partySize}
                - Date: ${newReservation.reservationDate.toDateString()}
                - Time: ${newReservation.startTime} - ${newReservation.endTime}
            `
                        });
                        await manager.save();
                    }
                }
            } catch (bgError) {
                console.error('Error sending reservation email/notifications:', bgError);
            }
        })();
    } catch (error) {
        const statusCode = error.code || 500;
        if (!res.headersSent) {
            res.status(statusCode).json({
                status: 'error',
                message: error.message
            });
        } else {
            console.error('Error occurred after response was sent:', error);
        }
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
