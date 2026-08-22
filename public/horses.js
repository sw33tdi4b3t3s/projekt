export function initHorses(){

    //HORSE SHOW ALL

    const horseListButton = document.getElementById('horseListButton');
    const horsesList = document.getElementById('horsesList');

    horseListButton.addEventListener('click', async (e) => {
        e.preventDefault();

        if (horsesList.innerHTML.trim() !== '') {
            horsesList.innerHTML = '';
            return;
        }


        try {
            const response = await fetch('/api/horses/all');
            if (!response.ok) throw new Error('Nie udało się pobrać danych koni');

            const horses = await response.json();

            // Funkcja pomocnicza do bezpiecznego wyciągania danych kraju (nazwa + kod ISO)
            const formatCountry = (countryObj, defaultText = "brak kraju") => {
                if (!countryObj) return defaultText;
                const name = countryObj.name || "brak nazwy";
                const code = countryObj.code || "brak ISO";
                return `${name} (${code})`;
            };

            horsesList.innerHTML = horses.map(horse => {
                // Ojciec
                const fatherName = horse.father?.name || 'brak imienia ojca';
                const fatherYear = horse.father?.birthYear || 'brak roku';
                const fatherCountry = formatCountry(horse.father?.country, 'brak kraju ojca');

                // Matka
                const motherName = horse.mother?.name || 'brak imienia matki';
                const motherYear = horse.mother?.birthYear || 'brak roku';
                const motherCountry = formatCountry(horse.mother?.country, 'brak kraju matki');

                // Hodowca
                const breederName = horse.breeder?.name || 'brak hodowcy';
                const breederCountry = formatCountry(horse.breeder?.country, 'brak kraju hodowcy');
                const breederNotes = horse.breeder?.notes ? `[Notatki: ${horse.breeder.notes}]` : '';

                // Konie
                const horseCountry = formatCountry(horse.country);
                const birthYear = horse.birthYear || 'brak roku';
                const gender = horse.gender || 'brak płci';
                const color = horse.color || 'brak maści';
                const notes = horse.notes ? `<em>// ${horse.notes}</em>` : '';

                return `
                    <li>
                        <strong>${horse.name}</strong> 
                        [Kraj: ${horseCountry}] 
                        Rok: ${birthYear}, 
                        Płeć: ${gender}, 
                        Maść: ${color} 
                        <br>
                        &nbsp;&nbsp;└─ Ojciec: ${fatherName} (${fatherYear}, ${fatherCountry})
                        <br>
                        &nbsp;&nbsp;└─ Matka: ${motherName} (${motherYear}, ${motherCountry})
                        <br>
                        &nbsp;&nbsp;└─ Hodowca: ${breederName} (${breederCountry}) ${breederNotes}
                        ${notes ? `<br>&nbsp;&nbsp;└─ ${notes}` : ''}
                    </li>
                    <hr>
                `;
            }).join('');

        }catch(error){
            alert(error.message);
        }
    });

    //HORSE ADD

    const horseAddButton = document.getElementById('horseAddButton');

    // Podstawowe
    const hName = document.getElementById('hName');
    const hBirthYear = document.getElementById('hBirthYear');
    const hGender = document.getElementById('hGender');
    const hColor = document.getElementById('hColor');
    const hCountry = document.getElementById('hCountry');
    const hNotes = document.getElementById('hNotes');
    
    // Hodowca
    const hBreederName = document.getElementById('hBreederName');
    const hBreederCountry = document.getElementById('hBreederCountry');
    
    // Rodzice
    const hFatherName = document.getElementById('hFatherName');
    const hFatherYear = document.getElementById('hFatherYear');
    const hFatherCountry = document.getElementById('hFatherCountry');
    
    const hMotherName = document.getElementById('hMotherName');
    const hMotherYear = document.getElementById('hMotherYear');
    const hMotherCountry = document.getElementById('hMotherCountry');

    horseAddButton.addEventListener('click', async () => {
        try {
            // Pobieranie obowiązkowych
            const nameVal = hName.value.trim();
            const yearVal = hBirthYear.value.trim();
            const genderVal = hGender.value.trim();
            const colorVal = hColor.value.trim();
            const countryVal = hCountry.value.trim().toUpperCase();
            
            const breederNameVal = hBreederName.value.trim();
            const breederCountryVal = hBreederCountry.value.trim().toUpperCase();
            const notesVal = hNotes ? hNotes.value.trim() : '';

            if (!nameVal || !yearVal || !genderVal || !colorVal || !countryVal || !breederNameVal || !breederCountryVal) {
                alert("Wypełnij wszystkie wymagane pola dla konia oraz hodowcy!");
                return;
            }

            const newHorse = {
                name: nameVal,
                birthYear: yearVal,
                gender: genderVal,
                color: colorVal,
                countryCode: countryVal,
                breederName: breederNameVal,
                breederCountryCode: breederCountryVal,
                notes: notesVal
            };

            // Obsługa opcjonalnego ojca
            const fNameVal = hFatherName ? hFatherName.value.trim() : '';
            const fYearVal = hFatherYear ? hFatherYear.value.trim() : '';

            const fCountryVal = hFatherCountry ? hFatherCountry.value.trim().toUpperCase() : '';
            
            if (fNameVal && fYearVal && fCountryVal) {
                newHorse.father = {
                    name: fNameVal,
                    birthYear: fYearVal,
                    countryCode: fCountryVal
                };
            }

            // Obsługa opcjonalnej matki
            const mNameVal = hMotherName ? hMotherName.value.trim() : '';
            const mYearVal = hMotherYear ? hMotherYear.value.trim() : '';
            const mCountryVal = hMotherCountry ? hMotherCountry.value.trim().toUpperCase() : '';
            
            if (mNameVal && mYearVal && mCountryVal) {
                newHorse.mother = {
                    name: mNameVal,
                    birthYear: mYearVal,
                    countryCode: mCountryVal
                };
            }

            const response = await fetch('/api/horses/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newHorse)
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Nie udało się dodać konia');
            
            console.log("Sukces:", result);
            alert("Dodano konia pomyślnie!");
            
            
            hName.value = '';
            hBirthYear.value = '';
            hGender.value = '';
            hColor.value = '';
            hCountry.value = '';
            hNotes.value = '';

            hBreederName.value = '';
            hBreederCountry.value = '';

            hFatherName.value = '';
            hFatherYear.value = '';
            hFatherCountry.value = '';

            hMotherName.value = '';
            hMotherYear.value = '';
            hMotherCountry.value = '';

        } catch (error) {
            alert(error.message);
        }
    });

    //HORSE FIND
    const horseFindButton = document.getElementById('horseFindButton');

    horseFindButton.addEventListener('click', async () => {
            try {
                const nameVal = hName.value.trim();
                const countryVal = hCountry.value.trim(); 
                const yearVal = hBirthYear.value.trim();

                if (!nameVal || !countryVal || !yearVal) {
                    alert("Wypełnij imię, kod kraju i rok urodzenia, aby wyszukać konia!");
                    return;
                }

                const response = await fetch(`/api/horses/${encodeURIComponent(nameVal)}/${encodeURIComponent(countryVal)}/${encodeURIComponent(yearVal)}`);
                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.error || "Coś poszło nie tak podczas wyszukiwania!");
                }
                
                alert(`Znaleziono konia: ${result.name} (${result.color} ${result.gender}), Rok: ${result.birthYear}`);

            } catch (error) {
                alert(error.message);
            }
        });
    
    //HORSE DELETE

    const horseDeleteButton = document.getElementById('horseDeleteButton');

    horseDeleteButton.addEventListener('click', async () => {
            try {
                const nameVal = hName.value.trim();
                const countryVal = hCountry.value.trim();
                const yearVal = hBirthYear.value.trim();

                if (!nameVal || !countryVal || !yearVal) {
                    alert("Wypełnij imię, kod kraju i rok urodzenia, aby usunąć konia!");
                    return;
                }

                const response = await fetch(`/api/horses/${encodeURIComponent(nameVal)}/${encodeURIComponent(countryVal)}/${encodeURIComponent(yearVal)}`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' }
                });

                const result = await response.json();
                if (!response.ok) throw new Error(result.error || "Nie udało się usunąć konia!");

                alert(`Usunięto konia: ${nameVal} (${yearVal}) z kraju ${countryVal}`);
                hName.value = '';
                hCountry.value = '';
                hBirthYear.value = '';

            } catch (error) {
                alert(error.message);
            }
        });
    
    //HORSE EDIT

    const horseEditButton = document.getElementById('horseEditButton');

    const hNewName = document.getElementById('hNewName');
    const hNewBirthYear = document.getElementById('hNewBirthYear');
    const hNewCountry = document.getElementById('hNewCountry');
    const hNewGender = document.getElementById('hNewGender');
    const hNewColor = document.getElementById('hNewColor');
    const hNewNotes = document.getElementById('hNewNotes');
    
    // Pola edycji - Hodowca
    const hNewBreederName = document.getElementById('hNewBreederName');
    const hNewBreederCountry = document.getElementById('hNewBreederCountry');
    
    // Pola edycji - Rodzice
    const hNewFatherName = document.getElementById('hNewFatherName');
    const hNewFatherYear = document.getElementById('hNewFatherYear');
    const hNewFatherCountry = document.getElementById('hNewFatherCountry');
    
    const hNewMotherName = document.getElementById('hNewMotherName');
    const hNewMotherYear = document.getElementById('hNewMotherYear');
    const hNewMotherCountry = document.getElementById('hNewMotherCountry');

    horseEditButton.addEventListener('click', async () => {
        try {
            const currentName = hName.value.trim();
            const currentCountry = hCountry.value.trim();
            const currentYear = hBirthYear.value.trim();

            if (!currentName || !currentCountry || !currentYear) {
                alert("Wypełnij imię, kraj i rok urodzenia w głównych polach, aby wskazać, którego konia edytujesz!");
                return;
            }

            const updatedData = {};

            if (hNewName && hNewName.value.trim()) updatedData.name = hNewName.value.trim();
            if (hNewBirthYear && hNewBirthYear.value.trim()) updatedData.birthYear = hNewBirthYear.value.trim();
            if (hNewCountry && hNewCountry.value.trim()) updatedData.countryCode = hNewCountry.value.trim().toUpperCase();
            if (hNewGender && hNewGender.value.trim()) updatedData.gender = hNewGender.value.trim();
            if (hNewColor && hNewColor.value.trim()) updatedData.color = hNewColor.value.trim();
            if (hNewNotes && hNewNotes.value.trim()) updatedData.notes = hNewNotes.value.trim();

            // Hodowca
            const nBreederName = hNewBreederName ? hNewBreederName.value.trim() : '';
            const nBreederCountry = hNewBreederCountry ? hNewBreederCountry.value.trim().toUpperCase() : '';
            if (nBreederName || nBreederCountry) {
                updatedData.breederName = nBreederName;
                updatedData.breederCountryCode = nBreederCountry;
            }

            // Ojciec
            const nFatherName = hNewFatherName ? hNewFatherName.value.trim() : '';
            const nFatherYear = hNewFatherYear ? hNewFatherYear.value.trim() : '';
            const nFatherCountry = hNewFatherCountry ? hNewFatherCountry.value.trim().toUpperCase() : '';
            if (nFatherName || nFatherYear || nFatherCountry) {
                updatedData.father = {};
                if (nFatherName) updatedData.father.name = nFatherName;
                if (nFatherYear) updatedData.father.birthYear = nFatherYear;
                if (nFatherCountry) updatedData.father.countryCode = nFatherCountry;
            }

            // Matka
            const nMotherName = hNewMotherName ? hNewMotherName.value.trim() : '';
            const nMotherYear = hNewMotherYear ? hNewMotherYear.value.trim() : '';
            const nMotherCountry = hNewMotherCountry ? hNewMotherCountry.value.trim().toUpperCase() : '';
            if (nMotherName || nMotherYear || nMotherCountry) {
                updatedData.mother = {};
                if (nMotherName) updatedData.mother.name = nMotherName;
                if (nMotherYear) updatedData.mother.birthYear = nMotherYear;
                if (nMotherCountry) updatedData.mother.countryCode = nMotherCountry;
            }

            //czy użytkownik wpisał jakiekolwiek nowe dane
            if (Object.keys(updatedData).length === 0) {
                alert("Wypełnij przynajmniej jedno nowe pole edycji, aby dokonać zmian!");
                return;
            }

            const response = await fetch(`/api/horses/${encodeURIComponent(currentName)}/${encodeURIComponent(currentCountry)}/${encodeURIComponent(currentYear)}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error || "Nie udało się zaktualizować konia!");

            alert("Zaktualizowano dane konia pomyślnie!");
            
            hName.value = '';
            hCountry.value = '';
            hBirthYear.value = '';

            if(hNewName) hNewName.value = '';
            if(hNewBirthYear) hNewBirthYear.value = '';
            if(hNewCountry) hNewCountry.value = '';
            if(hNewGender) hNewGender.value = '';
            if(hNewColor) hNewColor.value = '';
            if(hNewNotes) hNewNotes.value = '';
            if(hNewBreederName) hNewBreederName.value = '';
            if(hNewBreederCountry) hNewBreederCountry.value = '';
            if(hNewFatherName) hNewFatherName.value = '';
            if(hNewFatherYear) hNewFatherYear.value = '';
            if(hNewFatherCountry) hNewFatherCountry.value = '';
            if(hNewMotherName) hNewMotherName.value = '';
            if(hNewMotherYear) hNewMotherYear.value = '';
            if(hNewMotherCountry) hNewMotherCountry.value = '';

        } catch (error) {
            alert(error.message);
        }
    });

    const horseLineageButton = document.getElementById('horseLineageButton');
    const horseLineageResult = document.getElementById('horseLineageResult');
    const lDepth = document.getElementById('lDepth');

    // Funkcja generująca graficzne drzewo z obiektu (zamienia JSON na tekstowy wykres)
    function renderTree(horse, prefix = "", isLast = true, isRoot = true) {
        if (!horse) return "";

        // Próba odczytania kraju (może być stringiem lub obiektem w zależności od API)
        const countryCode = horse.countryCode || (horse.country && horse.country.code) || '?';
        const horseInfo = `${horse.name} (${horse.birthYear || '?'}, ${countryCode})`;
        let result = "";

        if (isRoot) {
            result += `🐴 ${horseInfo}\n`;
        } else {
            result += `${prefix}${isLast ? "└── " : "├── "}🐴 ${horseInfo}\n`;
        }

        // Kalkulacja wcięcia dla kolejnego pokolenia
        const newPrefix = isRoot ? "" : prefix + (isLast ? "    " : "│   ");
        
        // Zbieranie rodziców do tablicy, żeby ustalić, który element jest ostatnim węzłem
        const parents = [];
        if (horse.father) parents.push(horse.father);
        if (horse.mother) parents.push(horse.mother);

        parents.forEach((parent, index) => {
            const isParentLast = index === parents.length - 1;
            result += renderTree(parent, newPrefix, isParentLast, false);
        });

        return result;
    }

    horseLineageButton.addEventListener('click', async () => {
        try {
            const nameVal = hName.value.trim();
            const countryVal = hCountry.value.trim();
            const yearVal = hBirthYear.value.trim();
            const depthVal = lDepth.value.trim() || 3;
            if (!nameVal || !countryVal || !yearVal) {
                alert("Wypełnij imię, kod kraju i rok urodzenia w głównych polach, aby wygenerować drzewo!");
                return;
            }

            const response = await fetch(`/api/horses/lineAge/${encodeURIComponent(nameVal)}/${encodeURIComponent(countryVal)}/${encodeURIComponent(yearVal)}?depth=${depthVal}`);
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Coś poszło nie tak podczas pobierania rodowodu!");
            }

            // CZY TO ZMIENIAC?
            horseLineageResult.style.display = 'block';
            horseLineageResult.innerHTML = renderTree(result);

        } catch (error) {
            alert(error.message);
            horseLineageResult.style.display = 'none';
        }
    });

}