const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connection = mongoose.connect(
    process.env.DB_CONNECT, {
        useUnifiedTopology: true,
        useNewUrlParser: true
    },
    () => console.log('Connected to DB')).catch(err => {
    console.log(err);
});

module.exports = connection.db;


