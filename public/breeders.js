export function initBreeders(){
    //BREEDER SHOW ALL
    const breederListButton = document.getElementById('breederListButton');
    const breedersList = document.getElementById('breedersList');
    
    breederListButton.addEventListener('click', async(e)=>{
        e.preventDefault();

        if (breedersList.innerHTML.trim() !== '') {
            breedersList.innerHTML = '';
            return;
        }

        try{
            const response = await fetch('/api/breeders/all');

            if(!response.ok) throw new Error('nie udalo sie pobrac danych');

            const breeders = await response.json();

            breedersList.innerHTML = breeders.map(breeder=>`
                <li>
                ${breeder.name} ${breeder.country ? breeder.country.name : "brak kraju"} ${breeder.country ? breeder.country.code : "brak ISO"}  //<em>${breeder.notes}<em>
                </li>
                `).join('');

        }catch(error){
            alert(error.message);
        }

    });


    //BREEDER ADD
    const breederAddButton = document.getElementById('breederAddButton');
    const breederName = document.getElementById('breederName');
    const breederCountry = document.getElementById('breederCountry');
    const breederNotes = document.getElementById('breederNotes');
    
    breederAddButton.addEventListener('click', async ()=>{
        try{
            const nameValue = breederName.value.trim();
            const countryValue = breederCountry.value.trim(); 
            const notesValue = breederNotes ? breederNotes.value.trim() : '';

            if(!nameValue || !countryValue){
                alert("wypelnij oba pola!")
                return;
            }

            const newBreeder ={
                name: nameValue,
                countryCode: countryValue, 
                notes: notesValue
            }

            const response = await fetch('/api/breeders/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify(newBreeder)
            });

            const result = await response.json();

            if(!response.ok) throw new Error( result.error ||'nie udalo sie dodac hodowcy');
            
            console.log("sukces:",result);
            breederName.value = '';
            breederCountry.value = '';
            if (breederNotes) breederNotes.value = '';

        }catch(error){
            alert(error.message);
        }
    });

    //COUNTRY FIND (wyszukiwanie hodowcy)
    const breederFindButton = document.getElementById('breederFindButton');

    breederFindButton.addEventListener('click', async ()=>{
        try{
            const nameValue = breederName.value.trim();
            const countryValue = breederCountry.value.trim();

            if(!nameValue || !countryValue){
                alert("wypelnij oba pola!")
                return;
            }

            const response = await fetch(`/api/breeders/${encodeURIComponent(nameValue)}/${encodeURIComponent(countryValue)}`);

            const result = await response.json();

            if(!response.ok){
                throw new Error(result.error || "cos poszlo nie tak!");
            }
            
            alert("znaleziono hodowce: "+ result.name + " " +result.country.code );

        }catch(error){
            alert(error.message);
        }

    });

    //BREEDER DELETE
    const breederDeleteButton = document.getElementById('breederDeleteButton');

    breederDeleteButton.addEventListener('click', async () => {
        try {
            const nameValue = breederName.value.trim();
            const countryValue = breederCountry.value.trim(); 

            if (!nameValue || !countryValue) {
                alert("Podaj nazwę hodowcy i kod kraju lub nazwę kraju, aby go usunąć!");
                return;
            }

            const response = await fetch(`/api/breeders/${encodeURIComponent(nameValue)}/${encodeURIComponent(countryValue)}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error || "Nie udało się usunąć hodowcy!");

            alert(`Usunięto hodowcę: ${nameValue} (${countryValue})`);
            breederName.value = '';
            breederCountry.value = '';
            if (breederNotes) breederNotes.value = '';

        } catch (error) {
            alert(error.message);
        }
    });

    //BREEDER EDIT
    const breederNewName = document.getElementById('breederNewName');
    const breederNewCountry = document.getElementById('breederNewCountry');
    const breederNewNotes = document.getElementById('breederNewNotes');
    const breederEditButton = document.getElementById('breederEditButton');

    breederEditButton.addEventListener('click', async () => {
        try {
            const currentName = breederName.value.trim();
            const currentCountry = breederCountry.value.trim(); 

            const newNameValue = breederNewName.value.trim();
            const newCountryValue = breederNewCountry.value.trim(); 
            const newNotesValue = breederNewNotes.value.trim();

            if (!currentName || !currentCountry) {
                alert("Wypełnij obecną nazwę i obecny kraj, aby wskazać kogo edytujesz!");
                return;
            }

            if (!newNameValue && !newCountryValue && !newNotesValue) {
                alert("Wypełnij przynajmniej jedno nowe pole, aby dokonać zmian!");
                return;
            }

            const updatedData = {};
            if (newNameValue) updatedData.name = newNameValue;
            if (newCountryValue) updatedData.country = newCountryValue;
            if (newNotesValue) updatedData.notes = newNotesValue;

            const response = await fetch(`/api/breeders/${encodeURIComponent(currentName)}/${encodeURIComponent(currentCountry)}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error || "Nie udało się zaktualizować hodowcy!");

            alert("Zaktualizowano dane hodowcy!");
            breederNewName.value = '';
            breederNewCountry.value = '';
            breederNewNotes.value = '';
        } catch (error) {
            alert(error.message);
        }
    });
}