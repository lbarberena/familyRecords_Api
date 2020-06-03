const express = require('express');
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
let cors = require('cors');

//Import Routes
const authRoute = require('./routes/auth.route');
const MedicalRecord = require('./routes/medical-records.route');
const family = require('./routes/family.route');

dotenv.config();

//Connect to db
mongoose.connect(
    process.env.DB_CONNECT, {
        useUnifiedTopology: true,
        useNewUrlParser: true
    },
    () => console.log('Connected to DB')).catch(err => {
    console.log(err);
});

//Middlewares
app.use(express.json());
app.use(cors({ origin: true }));

//Route Middlewares
app.use('/api/user', authRoute);
app.use('/api/',
    MedicalRecord,
    family
);

app.listen(
    process.env.PORT || 8080,
    () => console.log('Server Up and Running'));
