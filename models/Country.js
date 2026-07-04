const mongoose = require('mongoose');

const countrySchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true,
        unique: true
    },

    code:{
        type: String,
        required: true,
        minlength: 2,
        maxlength: 2,
        uppercase: true,
        trim: true,
        unique: true
    },
})

countrySchema.index({code:1},{unique: true});//rosnaco (buduje unikalny index)

const Country = mongoose.model("Country",countrySchema);

module.exports = Country;
