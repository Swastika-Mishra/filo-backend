const express = require('express');
const app = require('./config/app.config');
require('dotenv').config();
const path = require('path');

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(3001,()=>{
    console.log("listening on port 3001");
})