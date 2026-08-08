COUNTRY###############################
curl -X POST http://localhost:3000/api/countries/add -H "Content-Type: application/json" -d "{\"name\":\"Polska\",\"code\":\"PL\"}"

curl http://localhost:3000/api/countries/PL
######################################

BREEDER###############################
curl -X POST http://localhost:3000/api/breeders/add -H "Content-Type: application/json" -d "{\"name\":\"Zbigniew DomskI\",\"countryCode\":\"FR\"}"
######################################


HORSE#################################
curl -X POST http://localhost:3000/api/horses/add -H "Content-Type: application/json" -d "{\"name\": \"Aron\",\"birthYear\": 2020, \"gender\": \"ogier\", \"color\": \"gniada\", \"countryCode\": \"PL\", \"breeder\": \"6a52661397664a487ba21ead\", \"notes\": \"pierwszy koń\" }" 
######################################


zwalidowac wyszukiwanie or!

sprawdzic dla horses zapytania z krajem konia/hodowcy/rodzicow

wyciagnac do pliku funkcje ze wszystkich plikow ?

szukac po unikalnym indeksie nie kompletnym typu tylko po name dla konia