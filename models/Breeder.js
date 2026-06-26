const mongoose = require('mongoose');

const breederSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true,
        unique: true
    },

    countryCode:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Country",
        required: true
    },

    notes:{
        type: String
    }

})

const Breeder = mongoose.model("Breeder",breederSchema);

module.exports = Breeder;
