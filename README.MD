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


seedowanie/mongoCompass######
{ "birthYear": { "$gte": 2000 } }
############################

zastanowic sie co ograniczyc uzytkownikowi?

RODOWOD DO ZROBIENIA | ZROBIONE?

Pobieranie informacji o potomstwie danego konia (z opcjonalnym „filtrem” dotyczącym płci i/lub hodowcy).

frontend wedlug rol
