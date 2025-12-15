const reservationService = require('../services/reservation.service');
const ReservationModel = require('../models/reservation');
const TableModel = require('../models/table');
const LogModel = require('../models/log');
const User = require('../models/user');
const nodemailer = require('nodemailer');

jest.mock('../models/reservation');
jest.mock('../models/table');
jest.mock('../models/log');
jest.mock('../models/user');
jest.mock('nodemailer');

describe('ReservationService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getAvailableTables', () => {
        const partySize = 2;
        const reservationDate = new Date('2023-12-25');
        const startTime = '18:00';
        const endTime = '20:00';
        const mockTables = [
            { _id: 't1', capacity: 2, status: 'Available' },
            { _id: 't2', capacity: 4, status: 'Available' }
        ];

        it('should return available tables when no conflicts exist', async () => {
            TableModel.find.mockResolvedValue(mockTables);
            ReservationModel.find.mockResolvedValue([]);

            const result = await reservationService.getAvailableTables(partySize, reservationDate, startTime, endTime);

            expect(TableModel.find).toHaveBeenCalledWith({
                capacity: { $gte: partySize },
                status: { $in: ['Available'] }
            });
            expect(result).toEqual(mockTables);
        });

        it('should filter out tables with conflicting reservations', async () => {
            const conflictingReservation = {
                tableId: 't1',
                startTime: '18:30',
                endTime: '19:30',
                status: 'Confirmed'
            };
            TableModel.find.mockResolvedValue(mockTables);
            ReservationModel.find.mockResolvedValue([conflictingReservation]);

            const result = await reservationService.getAvailableTables(partySize, reservationDate, startTime, endTime);

            expect(result).toHaveLength(1);
            expect(result[0]._id).toBe('t2');
        });

        it('should throw 404 if no tables match criteria', async () => {
            TableModel.find.mockResolvedValue([]);
            await expect(reservationService.getAvailableTables(partySize, reservationDate, startTime, endTime))
                .rejects.toThrow('No tables available for the requested party size');
        });

        it('should throw 404 if no tables available in time slot', async () => {
            const conflictingReservations = [
                { tableId: 't1', startTime: '18:00', endTime: '20:00' },
                { tableId: 't2', startTime: '18:00', endTime: '20:00' }
            ];
            TableModel.find.mockResolvedValue(mockTables);
            ReservationModel.find.mockResolvedValue(conflictingReservations);

            await expect(reservationService.getAvailableTables(partySize, reservationDate, startTime, endTime))
                .rejects.toThrow('No tables available for the requested time slot');
        });
    });

    describe('createReservation', () => {
        const reservationData = {
            tableId: 't1',
            partySize: 2,
            reservationDate: '2023-12-25',
            startTime: '18:00',
            endTime: '20:00',
            customerName: 'Test',
            customerEmail: 'test@test.com'
        };
        const user = { id: 'user1', role: 'Customer' };
        const mockTable = { _id: 't1', tableNumber: 1, capacity: 4 };

        it('should create reservation successfully', async () => {
            TableModel.findById.mockResolvedValue(mockTable);

            // Mock available tables check inside createReservation
            // We need to mock getAvailableTables logic or the internal calls it makes
            // Since it's a method on the same object, mocking the method directly might need spyOn if structure allowed it,
            // but here we mock the DB calls it makes.
            // Or better, we can mock the internal call if we were using a class instance, but it's an object literal.
            // So we mock TableModel and ReservationModel responses for the check.

            TableModel.find.mockResolvedValue([mockTable]); // For getAvailableTables
            ReservationModel.find.mockResolvedValue([]); // No conflicts

            const mockSavedReservation = {
                _id: 'res1',
                ...reservationData,
                save: jest.fn().mockResolvedValue(true),
                populate: jest.fn().mockResolvedValue(true)
            };
            ReservationModel.mockImplementation(() => mockSavedReservation);
            LogModel.mockImplementation(() => ({ save: jest.fn().mockResolvedValue(true) }));

            // Mock email
            const mockTransporter = { sendMail: jest.fn().mockResolvedValue(true) };
            nodemailer.createTransport.mockReturnValue(mockTransporter);
            User.find.mockResolvedValue([]); // Managers

            const result = await reservationService.createReservation(reservationData, user, 'user1');

            expect(ReservationModel).toHaveBeenCalled();
            expect(mockSavedReservation.save).toHaveBeenCalled();
            expect(mockSavedReservation.populate).toHaveBeenCalled();
            expect(LogModel).toHaveBeenCalled();
            expect(result).toBe(mockSavedReservation);
        });

        it('should throw error if table capacity insufficient', async () => {
            TableModel.findById.mockResolvedValue({ ...mockTable, capacity: 1 });
            await expect(reservationService.createReservation(reservationData, user, 'user1'))
                .rejects.toThrow(/capacity.*is insufficient/);
        });

        it('should throw error if table not available', async () => {
            const mockTable2 = { _id: 't2', tableNumber: 2, capacity: 4 };
            TableModel.findById.mockResolvedValue(mockTable);
            TableModel.find.mockResolvedValue([mockTable, mockTable2]);

            // Simulate conflict
            const conflictingReservation = {
                tableId: 't1',
                startTime: '18:30',
                endTime: '19:30',
                status: 'Confirmed'
            };
            ReservationModel.find.mockResolvedValue([conflictingReservation]);

            await expect(reservationService.createReservation(reservationData, user, 'user1'))
                .rejects.toThrow(/This table is already occupied/);
        });
    });

    describe('getUserReservations', () => {
        it('should return user reservations', async () => {
            const mockReservations = [{ _id: 'r1' }];
            ReservationModel.find.mockReturnValue({
                populate: jest.fn().mockReturnThis(),
                sort: jest.fn().mockResolvedValue(mockReservations)
            });

            const result = await reservationService.getUserReservations('user1');
            expect(result).toEqual(mockReservations);
        });
    });

    describe('getReservationById', () => {
        it('should return reservation', async () => {
            const mockRes = { _id: 'r1' };
            ReservationModel.findById.mockReturnValue({
                populate: jest.fn().mockReturnThis(),
                mockResolvedValue: jest.fn().mockResolvedValue(mockRes) // Simplified chaining mock
            });
            // Re-mocking effectively for the chain
            const populateMock = jest.fn().mockResolvedValue(mockRes); // Last populate returns the result
            ReservationModel.findById.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    populate: populateMock
                })
            });

            const result = await reservationService.getReservationById('r1');
            expect(result).toEqual(mockRes);
        });

        it('should throw if not found', async () => {
            ReservationModel.findById.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    populate: jest.fn().mockResolvedValue(null)
                })
            });
            await expect(reservationService.getReservationById('r1')).rejects.toThrow('Reservation not found');
        });
    });

    describe('getAllReservations', () => {
        it('should return all reservations with filters', async () => {
            const mockReservations = [{ _id: 'r1', status: 'Pending' }];
            const mockFind = {
                populate: jest.fn().mockReturnThis(),
                sort: jest.fn().mockResolvedValue(mockReservations)
            };
            ReservationModel.find.mockReturnValue({
                populate: jest.fn().mockReturnValue(mockFind)
            });

            const result = await reservationService.getAllReservations({ status: 'Pending' });
            expect(ReservationModel.find).toHaveBeenCalledWith(expect.objectContaining({ status: 'Pending' }));
            expect(result).toEqual(mockReservations);
        });
    });

    describe('updateReservationStatus', () => {
        it('should update status', async () => {
            const mockRes = {
                _id: 'r1',
                status: 'Pending',
                save: jest.fn().mockResolvedValue(true),
                populate: jest.fn().mockResolvedValue(true)
            };
            ReservationModel.findById.mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockRes)
            });
            LogModel.mockImplementation(() => ({ save: jest.fn().mockResolvedValue(true) }));

            const result = await reservationService.updateReservationStatus('r1', 'Confirmed', { id: 'admin1' });

            expect(mockRes.status).toBe('Confirmed');
            expect(mockRes.save).toHaveBeenCalled();
            expect(LogModel).toHaveBeenCalled();
        });
    });

    describe('cancelReservation', () => {
        it('should cancel reservation if owner', async () => {
            const mockRes = {
                _id: 'r1',
                userId: 'user1',
                status: 'Pending',
                save: jest.fn().mockResolvedValue(true),
                populate: jest.fn().mockResolvedValue(true)
            };
            ReservationModel.findById.mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockRes)
            });
            LogModel.mockImplementation(() => ({ save: jest.fn().mockResolvedValue(true) }));

            await reservationService.cancelReservation('r1', { id: 'user1', role: 'Customer' });

            expect(mockRes.status).toBe('Cancelled');
            expect(mockRes.save).toHaveBeenCalled();
        });

        it('should throw if not owner and not admin', async () => {
            const mockRes = {
                _id: 'r1',
                userId: 'user1',
                status: 'Pending'
            };
            ReservationModel.findById.mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockRes)
            });

            await expect(reservationService.cancelReservation('r1', { id: 'user2', role: 'Customer' }))
                .rejects.toThrow('Unauthorized to cancel this reservation');
        });
    });
});
