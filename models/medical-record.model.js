const mongoose = require('mongoose');

const MedicalRecordSchema = new mongoose.Schema({
    recordName: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    quantity: {
        type: Number,
        required: false
    },
    userId: {
        type: String,
        required: false
    },
    family: {
        type: String,
        required: false
    },
    date: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    imageURI: {
        type: String,
        required: false
    }
});

module.exports = mongoose.model('MedicalRecords', MedicalRecordSchema);
