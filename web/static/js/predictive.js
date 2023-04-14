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
        const dateString = `${date} ${hour}:00:00`;
        console.log(dateString);
        const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;
      
        return fetch(apiUrl)
          .then(response => {
            console.log(response);
            return response.json();
          });
      }

      console.log(date)
      console.log(hour)
      
      fetchWeatherData(date, hour)
      .then(weatherData => {
        // Get the weather data for the specified date and hour
        const forecastData = weatherData.list.filter(item => {
          const itemDate = new Date(item.dt_txt);
          return itemDate.getDate() === parseInt(date) && itemDate.getHours() === parseInt(hour);
        })[0];
        
        console.log(forecastData);
    
        const weather = forecastData.weather[0].main;
        const description = forecastData.weather[0].description;
        const temp = forecastData.main.temp;
        const feelsLike = forecastData.main.feels_like;
        const humidity = forecastData.main.humidity;
        const windSpeed = forecastData.wind.speed;
  
        // Create FormData object and append all required data
        const formData = new FormData(document.getElementById('prediction-form'));
        formData.append('weather', weather);
        formData.append('description', description);
        formData.append('temp', temp);
        formData.append('feels_like', feelsLike);
        formData.append('humidity', humidity);
        formData.append('wind_speed', windSpeed);
  
        // Send POST request to Flask route
        return fetch('/predict', {
          method: 'POST',
          body: formData
        });
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
  