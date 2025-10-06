require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const connectDB = require('./config/database');

if (!process.env.MONGODB_URI) {
  console.error("FATAL ERROR: DATABASE_URI environment variable is not set.");
  process.exit(1);
}

//env variables
const port = process.env.PORT ||  3000
const app = express();

//routes
const userRouter = require("./routes/userRoutes.js")