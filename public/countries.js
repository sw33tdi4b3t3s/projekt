export function initCountries(){
    //COUNTRY SHOW ALL
    const countryListButton = document.getElementById('countryListButton');
    const countriesList = document.getElementById('countriesList');
    
    countryListButton.addEventListener('click', async(e)=>{
        e.preventDefault();

        if (countriesList.innerHTML.trim() !== '') { // zamykanie i otwieranie listy
            countriesList.innerHTML = '';
            return;
        }

        try{
            const response = await fetch('/api/countries/all');

            if(!response.ok) throw new Error('nie udalo sie pobrac danych');

            const countries = await response.json();

            countriesList.innerHTML = countries.map(country=>`
                <li>${country.name} ${country.code}</li>
                `).join('');

        }catch(error){
            alert(error.message);
        }

    });

    //COUNTRY ADD
    const countryAddButton = document.getElementById('countryAddButton');
    const countryName = document.getElementById('countryName');
    const countryCode = document.getElementById('countryCode');
    
    countryAddButton.addEventListener('click', async ()=>{
        try{
            const nameValue = countryName.value.trim();
            const codeValue = countryCode.value.trim().toUpperCase();

            if(!nameValue || !codeValue){
                alert("wypelnij oba pola!")
                return;
            }

            const newCountry={
                name: nameValue,
                code: codeValue
            };

            const response = await fetch('api/countries/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify(newCountry)
            });
            const result = await response.json();

            if(!response.ok) throw new Error( result.error ||'nie udalo sie dodac kraju');
            
            console.log("sukces:",result);
            countryName.value = '';
            countryCode.value = '';

        }catch(error){
            alert(error.message);
        }
    });

    //COUNTRY FIND
    const countryFindButton = document.getElementById('countryFindButton');

    countryFindButton.addEventListener('click', async ()=>{
        try{
            const nameValue = countryName.value.trim();
            const codeValue = countryCode.value.trim(); 

            const searchValue = nameValue || codeValue;

            if(!searchValue){
                alert("wypelnij ktores z pol!")
                return;
            }

            const response = await fetch(`/api/countries/${encodeURIComponent(searchValue)}`);

            const result = await response.json();

            if(!response.ok){
                throw new Error(result.error || "cos poszlo nie tak!");
            }
            
            alert("znaleziono kraj: "+ result.name + " " +result.code);

        }catch(error){
            alert(error.message);
        }

    });

    //COUNTRY DELETE
    const countryDeleteButton = document.getElementById('countryDeleteButton');

    countryDeleteButton.addEventListener('click', async ()=>{
        try{
            const nameValue = countryName.value.trim();
            const codeValue = countryCode.value.trim(); 

            const deleteValue = nameValue || codeValue;

            if(!deleteValue){
                alert("wypelnij ktores z pol!")
                return;
            }

            const response = await fetch(`/api/countries/${encodeURIComponent(deleteValue)}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json'}
            });

            const result = await response.json();

            if(!response.ok){
                throw new Error(result.error || "cos poszlo nie tak!");
            }
            
            alert("usunieto kraj: "+ deleteValue);

        }catch(error){
            alert(error.message);
        }

    });

    //COUNTRY EDIT
    const countryNewName = document.getElementById('countryNewName');
    const countryNewCode = document.getElementById('countryNewCode');
    const countryEditButton = document.getElementById('countryEditButton');

    countryEditButton.addEventListener('click', async ()=>{
        try{
            const nameValue = countryName.value.trim();
            const codeValue = countryCode.value.trim(); 
            const editValue = nameValue || codeValue;

            const newNameValue = countryNewName.value.trim();
            const newCodeValue = countryNewCode.value.trim().toUpperCase(); 

            if(!editValue){
                alert("wypelnij ktores z pol do wyszukania edytowanego kraju! ")
                return;
            }

            if(!newNameValue && !newCodeValue){
                alert("oba pola nie zostaly wypelnione, nie dokonano zmian");
                return;
            }

            const editedCountry = {};
            if (newNameValue) editedCountry.name = newNameValue;
            if (newCodeValue) editedCountry.code = newCodeValue;

            const response = await fetch(`/api/countries/${encodeURIComponent(editValue)}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify(editedCountry)
            });

            const result = await response.json();

            if(!response.ok){
                throw new Error(result.error || "cos poszlo nie tak!");
            }
            
            alert("dokonano zmian!");

            countryNewCode.value = "";
            countryNewName.value = "";

        }catch(error){
            alert(error.message);
        }

    });
}