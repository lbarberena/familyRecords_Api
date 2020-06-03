const mongoose = require('mongoose');

const FamilySchema = new mongoose.Schema({
    familyName: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    }
});

module.exports = mongoose.model('Families', FamilySchema);
