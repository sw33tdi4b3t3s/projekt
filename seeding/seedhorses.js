const mongoose = require("mongoose");
const {fakerPL} = require('@faker-js/faker');
const Country = require("../models/Country");
const Breeder = require("../models/Breeder");
const Horse = require("../models/Horse");
const connectDB = require("../db.js");

const faker = fakerPL;

const currentYear = new Date().getFullYear();
let qtyGen = 6; 
let qtyHorsesPerGen = 20;
let qtyBreeders = 10;
let baseCountries = [];
let baseBreeders = [];

function generateHorseName(gender){
    if(gender === "ogier" || gender === "wałach"){
        return faker.person.firstName("male");
    }

    if(gender === "klacz"){
        return faker.person.firstName("female");
    }

    return faker.person.firstName();
}


function randomFromArray(array){
    return array[Math.floor(Math.random() * array.length)];
}



async function seedCountries(){
    await Country.deleteMany({});

    const countries = [
        {name: "Polska" , code: "PL"},
        {name: "Francja" , code: "FR"},
        {name: "Hiszpania" , code: "ES"},
        {name: "Włochy" , code: "IT"},
        {name: "Niemcy" , code: "DE"},
        {name: "Arabia Saudyjska" , code: "AS"}
];

    baseCountries = await Country.insertMany(countries);

}


async function seedBreeders(){
    await Breeder.deleteMany({});

    const breeders = [];

    for(let i =0; i<qtyBreeders; i++){
        const breederName = faker.person.firstName() +" "+ faker.person.lastName();
        const breederCountry = randomFromArray(baseCountries);
        const breederNotes = faker.lorem.sentences(3);
        breeders.push({name: breederName, country: breederCountry._id, notes: breederNotes});
    }

    baseBreeders = await Breeder.insertMany(breeders);
}

async function seedHorses(){
    await Horse.deleteMany({});
    
    const genders = ["ogier", "klacz", "wałach"];
    const colors = ["siwa", "gniada", "kasztanowata", "kara"];

    const horsesgen0 = [];
    const horsesNextGens = [];

    //gen 0(bez ojca i matki)
    for(let j =0; j<qtyHorsesPerGen; j++){

        
        const horseBirthYear = faker.number.int({min: currentYear - 100, max: currentYear});
        const horseGender = randomFromArray(genders);
        const horseName = generateHorseName(horseGender);
        

        const horseColor = randomFromArray(colors);
        const horseCountry = randomFromArray(baseCountries);
        const horseBreeder = randomFromArray(baseBreeders);
        const horseNotes = faker.lorem.sentences(3);

        horsesgen0.push({
            name: horseName, 
            birthYear: horseBirthYear,
            gender: horseGender,
            color: horseColor,
            country: horseCountry._id,
            breeder: horseBreeder._id,
            notes: horseNotes
        });
    }
    let gen0 = await Horse.insertMany(horsesgen0); //wykorzystanie do kolejnych generacji


    let fatherCandidate = [];
    let motherCandidate = [];

    function candidatesFatherMother(currentList){
        for(let i =0; i<currentList.length; i++){

           const candidate = currentList[i];

            if(candidate.gender === "ogier"){
                    fatherCandidate.push(candidate);
                }else if(candidate.gender === "klacz"){
                    motherCandidate.push(candidate);
                }
        }
    }

    candidatesFatherMother(gen0);


    //next gens
    for(let i=0; i<qtyGen; i++){
        const horsesNextGens =[];

        for(let i=0; i<qtyHorsesPerGen; i++){

            const horseFather = randomFromArray(fatherCandidate);
            const horseMother = randomFromArray(motherCandidate);

            if(!horseFather || !horseMother){
                continue;
            }

            const minYear = Math.max(horseFather.birthYear+3, horseMother.birthYear+3);
            const maxYear = Math.min(horseFather.birthYear+21,horseMother.birthYear+21,currentYear)
            if(minYear > maxYear){
                continue;
            }
            const horseBirthYear = faker.number.int({min: minYear, max: maxYear}); //zalezne od wieku rodzicow
            
            const horseGender = randomFromArray(genders);
            const horseName = generateHorseName(horseGender);

            const horseColor = randomFromArray(colors);
            const horseCountry = randomFromArray(baseCountries);
            const horseBreeder = randomFromArray(baseBreeders);
            const horseNotes = faker.lorem.sentences(3);

            horsesNextGens.push({
                name: horseName, 
                birthYear: horseBirthYear,
                gender: horseGender,
                color: horseColor,
                country: horseCountry._id,
                father: horseFather._id,
                mother: horseMother._id,
                breeder: horseBreeder._id,
                notes: horseNotes
            });
            
        }
        const currentGen = await Horse.insertMany(horsesNextGens);
        fatherCandidate =[];
        motherCandidate =[];
        candidatesFatherMother(currentGen);
    }


    
}


async function seedDataBase(){

    try{
        await connectDB();
        
        await seedCountries();
        await seedBreeders();
        await seedHorses();

        console.log("Pomyślny seed");

        await mongoose.disconnect();

    }catch(err){
        console.log("blad przy seedowaniu: "+err.message);
    }
    

}

seedDataBase();