require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const cookieParser=require('cookie-parser')
const cron = require('node-cron'); 

if (!process.env.MONGODB_URI) {
  console.error("FATAL ERROR: DATABASE_URI environment variable is not set.");
  process.exit(1);
}

if (!process.env.SECRET_KEY) {
  console.error("FATAL ERROR: SECRET_KEY environment variable is not set.");
  process.exit(1);
}

if (!process.env.PORT) {
  console.warn("WARNING: PORT environment variable is not set. Defaulting to 3000.");
}

//env variables
const port = process.env.PORT ||  3000
const app = express();

//routes
const authRouter = require("./routes/auth.routes.js")
const userRouter = require("./routes/user.routes.js")
const reservationRouter = require("./routes/reservation.routes.js")
const tableRouter = require("./routes/table.routes.js")

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser())

app.use(cors({
  origin: true, // Allow all origins in development (or specify your frontend URLs)
  credentials: true,
}));

//use routes
app.use("/api/v1/user", userRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/reservations", reservationRouter);
app.use("/api/v1/tables", tableRouter);

// Start the server
const startServer = async () => {
  await connectDB();
  app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
  });
};

// Primary Test Route "http://localhost:PORT/"
app.get('/', (req, res) => {
  res.send('Welcome! Backend started successfully.')
})

// Debug route to check all registered routes
app.get('/debug/routes', (req, res) => {
  const routes = [];
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods)
      });
    } else if (middleware.name === 'router') {
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          routes.push({
            path: handler.route.path,
            methods: Object.keys(handler.route.methods)
          });
        }
      });
    }
  });
  res.json({ routes });
})

cron.schedule('0 0 * * 0', async () => {
    console.log("Running weekly low-stock check...");
    try {
        const items = await Item.find({});
        const managers = await User.find({ type: 'manager' });

        for (let item of items) {
            if (item.lOWarningThreshold !== undefined && item.quantity <= item.lOWarningThreshold) {
                for (let manager of managers) {
                    // Avoid duplicate notifications
                    const alreadyNotified = manager.notifications.some(
                        n => n.title === `Low Stock Alert: ${item.name}` && !n.read
                    );

                    if (!alreadyNotified) {
                        manager.notifications.push({
                            title: `Low Stock Alert: ${item.name}`,
                            message: `The item "${item.name}" is low. Quantity left: ${item.quantity} ${item.unit || ''}.`
                        });
                        await manager.save();
                    }
                }
            }
        }
    } catch (err) {
        console.error("Error in weekly low-stock check:", err);
    }
});

//Default Error
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke! \n You probably had an invalid input not handled by the controller. \n Check the terminal for the error code\n' + 'Error: ' + err.message);
});

startServer();