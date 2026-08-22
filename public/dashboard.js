import {initCountries} from './countries.js';
import {initBreeders} from './breeders.js';
import {initHorses} from './horses.js';


//ten plik ma dzialac jak zwrotnica. DOMContendLoaded odpowiada za bezpiecznik ktory najpierw oczekuje powstania przyciskow
//by moc potem do nich podpiac listenery, co zapobiega bledom.


document.addEventListener('DOMContentLoaded', ()=>{
    initCountries();
    initBreeders();
    initHorses();
});