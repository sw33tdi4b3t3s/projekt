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

    country:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Country",
        required: true
    },

    father:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Horse",
        default: null
    },
    
    mother:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Horse",
        default: null
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

horseSchema.index({name:1, country:1, birthYear:1},{unique: true});//rosnaco (buduje unikalny index)

horseSchema.pre("save",async function(){
    const currentYear = new Date().getFullYear();

    if(currentYear - this.birthYear < 0 || this.birthYear > currentYear){
        throw new Error(`Podany wiek konia musi być > 0 oraz nie moze byc koniem z przyszlosci, podano: ${this.birthYear}`);
    }

    if(this.father){
        const horseFather = await mongoose.model("Horse").findById(this.father);

        if(!horseFather){
            throw new Error(`Podany ojciec nie istnieje w bazie!`);
        }

        if(horseFather.gender !== "ogier"){
            throw new Error(`Podany ojciec musi być ogierem!`);
        }

        const fatherAge = this.birthYear - horseFather.birthYear;

        if(fatherAge < 3 || fatherAge > 21){
            throw new Error(`Wiek ojca musi być z przedziału [3,21], podano: ${fatherAge}`);
        }

    }

    if(this.mother){
        const horseMother = await mongoose.model("Horse").findById(this.mother);


        if(!horseMother){
            throw new Error(`Podana matka nie istnieje w bazie!`);
        }

        if(horseMother.gender !== "klacz"){
            throw new Error(`Podana matka musi być klaczą!`);
        }

        const motherAge = this.birthYear - horseMother.birthYear;

        if(motherAge < 3 || motherAge > 21){
            throw new Error(`Wiek matki musi być z przedziału [3,21], podano: ${motherAge}`);
        }

    }
});

const Horse = mongoose.model("Horse",horseSchema);

module.exports = Horse;
