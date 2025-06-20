const express = require('express');
const cors = require('cors'); 
require('dotenv').config();
//const AppRoutes = require('../routes/App.routes');
const path = require('path');
const FileRoutes = require('../routes/File.routes');
const AuthRoutes = require('../routes/Auth.routes');
const verifyJWT = require('../middleware/verifyJWT.middleware');
const cookieParser = require('cookie-parser');
const corsOptions = require('./cors.config');
const credentials = require('../middleware/credentials.middleware');
const mongoose = require('mongoose');
const connectDB = require('./dbConn.config');

connectDB();
const app = express();

app.use(credentials);
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// app.use('/api',AppRoutes);
app.use('/auth',AuthRoutes)
app.use(verifyJWT);
app.use('/api',FileRoutes);

mongoose.connection.once('open', ()=>{
    console.log('Connected to MongoDB');
})

module.exports = app;