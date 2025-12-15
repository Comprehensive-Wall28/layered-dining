const express = require('express');
const router = express.Router();


const orderController = require('../controllers/order.controller');
const authMiddleware = require('../middleware/authentication.middleware');
const authorizationMiddleware = require('../middleware/authorization.middleware');

const ROLES = require('../config/roles.js');

router.post('/', authMiddleware, authorizationMiddleware([ROLES.CUSTOMER]), orderController.createOrder);
router.get('/', authMiddleware, authorizationMiddleware([ROLES.ADMIN, ROLES.MANAGER]), orderController.getAllOrders);
router.get('/customer/:customerId', authMiddleware, orderController.getOrdersByCustomerId);
router.get('/:id', authMiddleware, orderController.getOrderById);
router.get('/:id/status', authMiddleware, orderController.getOrderStatus);
router.put('/:id/status', authMiddleware, authorizationMiddleware([ROLES.ADMIN, ROLES.MANAGER]), orderController.updateOrderStatus);
router.post('/:id/pay', authMiddleware, orderController.payOrder);
router.post('/:id/refund', authMiddleware, authorizationMiddleware([ROLES.ADMIN, ROLES.MANAGER]), orderController.refundOrder);
module.exports = router;
