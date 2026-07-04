const mongoose = require('mongoose');

const breederSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true,
    },

    country:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Country",
        required: true
    },

    notes:{
        type: String
    }

})

breederSchema.index({name:1, country:1},{unique: true});//rosnaco (buduje unikalny index)

const Breeder = mongoose.model("Breeder",breederSchema);

module.exports = Breeder;

