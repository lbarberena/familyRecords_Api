const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        min: 5
    },
    password: {
        type: String,
        required: true,
        min: 8
    },
    email: {
        type: String,
        required: true,
        max: 255,
        min: 6
    },
    date: {
        type: Date,
        default: Date.now
    },
    family: {
        type: String,
        required: true
    },
    active: {
        type: Boolean,
        required: true
    },
    loggedin: {
        type: Boolean,
        required: false
    },
    role: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('User', userSchema);
