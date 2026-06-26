const mongoose = require('mongoose');

const horseSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true,
    },

    birthYear:{
        type: Number,
        required: true,
        min: new Date().getFullYear() - 35,
        max: new Date().getFullYear()

    },

    gender:{
        type: String,
        required: true,
        enum: ["ogier", "klacz", "wałach"]

    },

    color:{
        type: String,
        required: true,
        enum: ["siwa", "gniada", "kasztanowata", "kara"]
    },

    countryCode:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Country",
        required: true
    },

    father:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Horse",
    },
    
    mother:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Horse",
    },

    breeder:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Breeder",
        required: true
    },

    notes:{
        type: String
    }

})

const Horse = mongoose.model("Horse",horseSchema);

module.exports = Horse;
