document.getElementById('prediction-form').addEventListener('submit', function (event) {
    event.preventDefault();

    // Get user input values
    const stationNumber = document.getElementById('station-number').value;
    const date = document.getElementById('date').value;
    const hour = document.getElementById('hour').value;

    // Fetch weather data from OpenWeather API
    function fetchWeatherData(date, hour) {
        const apiKey = "e27ae2a7d7babf283e771962901cd48f";
        const city = "Dublin";
        const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

        return fetch(apiUrl)
            .then(response => {
                console.log(response);
                return response.json();
            });
    }

    fetchWeatherData(date, hour)
        .then(weatherData => {
            // Log the available data points
            console.log(weatherData.list);

            // Get the weather data for the specified date and hour
            const targetDateTime = new Date(date + "T" + hour + ":00");
            const forecastData = weatherData.list.reduce((closest, item) => {
                const itemDate = new Date(item.dt_txt);
                const timeDifference = Math.abs(itemDate.getTime() - targetDateTime.getTime());
                if (closest === null || Math.abs(new Date(closest.dt_txt).getTime() - targetDateTime.getTime()) > timeDifference) {
                    return item;
                }
                return closest;
            }, null);

            // Log filtered forecastData
            console.log('Filtered forecastData:', forecastData);

            if (forecastData) {
                const weather = forecastData.weather[0].main;
                const description = forecastData.weather[0].description;
                const temp = forecastData.main.temp + 273.15;
                const feelsLike = forecastData.main.feels_like + 273.15;
                const humidity = forecastData.main.humidity;
                const windSpeed = forecastData.wind.speed;

                // Create FormData object and append all required data
                let formDay = targetDateTime.getDay()
                console.log(formDay)
                let formHour = targetDateTime.getHours()
                console.log(formHour)
                
                const formData = new FormData(document.getElementById('prediction-form'));
                formData.set('date', formDay);
                formData.set('hour', formHour);
                formData.append('weather', weather);
                formData.append('description', description);
                formData.append('temp', temp);
                formData.append('feels_like', feelsLike);
                formData.append('humidity', humidity);
                formData.append('wind_speed', windSpeed);

                // Log the contents of formData
                const formDataArray = Array.from(formData.entries());
                console.log('FormData contents:', formDataArray);

                // Send POST request to Flask route
                return fetch('/predict', {
                    method: 'POST',
                    body: formData
                });
            } else {
                console.error('No matching weather data found for the specified date and hour.');
            }
        })
        .then(response => response.json())
        .then(data => {
            // Display predicted values in HTML
            document.getElementById('prediction-results').innerHTML = `
                <p>Predicted available bikes: ${data.available_bikes}</p>
                <p>Predicted available stands: ${data.available_stands}</p>
            `;
        })
        .catch(error => {
            console.error('Error:', error);
        });
});

function onMarkerClick(stationNumber) {
    // Set the value of the 'station-number' input box to the stationNumber
    document.getElementById('station-number').value = stationNumber;
}
