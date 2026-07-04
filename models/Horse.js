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

horseSchema.pre("save",async function(next){
    const currentYear = new Date().getFullYear();
    const horseAge = currentYear - this.birthYear;

    if(horseAge > 35 || horseAge < 0){
        return next(new Error(`Podany wiek konia musi być w przedziale [0,35], podano: ${horseAge}`));
    }

    if(this.father){
        const horseFather = await mongoose.model("Horse").findById(this.father);


        if(!horseFather){
            return next(new Error(`Podany ojciec nie istnieje w bazie!`));
        }

        if(horseFather.gender !== "ogier"){
            return next(new Error(`Podany ojciec musi być ogierem!`));
        }

        const fatherAge = currentYear - horseFather.birthYear();

        if(fatherAge < 3 || fatherAge > 21){
            return next(new Error(`Wiek ojca musi być z przedziału [3,21], podano: ${fatherAge}`));
        }
    }

    if(this.mother){
        const horseMother = await mongoose.model("Horse").findById(this.mother);


        if(!horseMother){
            return next(new Error(`Podana matka nie istnieje w bazie!`));
        }

        if(horseMother.gender !== "klacz"){
            return next(new Error(`Podana matka musi być klaczą!`));
        }

        const motherAge = currentYear - horseMother.birthYear();

        if(motherAge < 3 || motherAge > 21){
            return next(new Error(`Wiek matki musi być z przedziału [3,21], podano: ${motherAge}`));
        }
    }


    next();
});

const Horse = mongoose.model("Horse",horseSchema);

module.exports = Horse;
