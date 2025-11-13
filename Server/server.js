require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const cookieParser=require('cookie-parser')

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
const menuRouter = require("./routes/menu.routes.js")

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser())

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
}));


//use routes
app.use("/api/v1/user", userRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/menu", menuRouter);

// Primary Test Route "http://localhost:PORT/"
app.get('/', (req, res) => {
  res.send('Welcome! Backend started successfully.')
})

//Default Error
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke! \n You probably had an invalid input not handled by the controller. \n Check the terminal for the error code\n' + 'Error: ' + err.message);
});

// Start the server
const startServer = async () => {
  await connectDB();
  app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
  });
};

startServer();