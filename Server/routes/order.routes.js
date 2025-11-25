const express = require('express');
const router = express.Router();


const orderController = require('../controllers/order.controller');
const authMiddleware = require('../middleware/authentication.middleware');
const authorizationMiddleware = require('../middleware/authorization.middleware');

router.post('/', authMiddleware,authorizationMiddleware(['Customer']), orderController.createOrder);
router.get('/', authMiddleware, authorizationMiddleware(['Admin', 'Manager']), orderController.getAllOrders);
router.get('/customer/:customerId', authMiddleware, orderController.getOrdersByCustomerId);
router.get('/:id', authMiddleware, orderController.getOrderById);
router.put('/:id/status', authMiddleware, authorizationMiddleware(['Admin', 'Manager']), orderController.updateOrderStatus);

module.exports = router;
