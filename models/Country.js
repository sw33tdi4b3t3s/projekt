const mongoose = require('mongoose');
const {escapeRegex} = require('../utils/helpers');

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
});

countrySchema.statics.findByCodeOrName = async function(param){
    if(!param) return null;

    const trimmed = param.trim();
    const safeCountry = escapeRegex(trimmed);


    return await this.findOne({
        $or:[
            {code: trimmed.toUpperCase()},
            {name: {$regex: `^${safeCountry}$`, $options: 'i'}}

        ]

    })
}

const Country = mongoose.model("Country",countrySchema);

module.exports = Country;
