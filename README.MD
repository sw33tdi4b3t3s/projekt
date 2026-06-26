curl -X POST http://localhost:3000/addCountry -H "Content-Type: application/json" -d "{\"name\":\"Polska\",\"code\":\"PL\"}"

curl -X POST http://localhost:3000/addBreeder -H "Content-Type: application/json" -d "{\"name\":\"Zbigniew DomskI\",\"breederCode\":\"WB\"}"

curl -X POST http://localhost:3000/addHorse -H "Content-Type: application/json" -d "{\"name\": \"Aron\",\"birthYear\": 2020, \"gender\": \"ogier\", \"color\": \"gniada\", \"countryCode\": \"PL\", \"breeder\": \"6a3e9365824dad9244efe092\", \"notes\": \"pierwszy koń\" }"

zastanowic sie czy te kody iso na innych modelach nie ujednolicic