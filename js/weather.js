function fetchWeather() {
    const url =
      "https://api.openweathermap.org/data/2.5/weather?q=Dublin,IE&APPID=e27ae2a7d7babf283e771962901cd48f&units=metric";
  
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        console.log(data); // Add this line to log the response data
        displayWeather(data);
      })
      .catch((error) => {
        console.error("Error fetching weather data:", error);
      });
  }
  
  function displayWeather(data) {
    const weatherDescription = data.weather[0].description;
    const temperature = data.main.temp;
    const humidity = data.main.humidity;
    const windSpeed = data.wind.speed;
    const windDirection = data.wind.deg;
    const iconCode = data.weather[0].icon;
    const iconUrl = `http://openweathermap.org/img/wn/${iconCode}@2x.png`;
  
    document.getElementById("weather-description").innerText =
      "Description: " + toTitleCase(weatherDescription);
    document.getElementById("temperature").innerText = "Temperature: " + temperature + "°C";
    document.getElementById("humidity").innerText = "Humidity: " + humidity + "%";
    document.getElementById("wind-speed").innerText = "Wind speed: " + windSpeed + " m/s";
    document.getElementById("wind-direction").innerText = windDirection + "°";
    document.getElementById("weather-icon").src = iconUrl;
    document.getElementById("wind-arrow").style.transform = `rotate(${windDirection}deg)`;
  }
  
  document.addEventListener("DOMContentLoaded", fetchWeather);

  function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  }