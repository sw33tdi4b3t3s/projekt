require('dotenv').config();
const mongoose = require('mongoose');


const connectDB = async () =>{
    try{
        const dbPort = process.env.DB_PORT;
        await mongoose.connect(`mongodb://localhost:${dbPort}/KONIOWELOVEDB`);
        console.log('Połączono z MongoDB...');

    }catch(err){
        console.log('Nie udało sie połączyć z MongoDB...',err);
    }
};

module.exports = connectDB;