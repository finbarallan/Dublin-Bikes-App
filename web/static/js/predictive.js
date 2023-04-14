document.getElementById('prediction-form').addEventListener('submit', function (event) {
  event.preventDefault();

  // Get user input values
  const stationNumber = document.getElementById('station-number').value;
  const day = document.getElementById('day').value;
  const hour = document.getElementById('hour').value;

  const weather = document.getElementById('weather').value; // from API call
  const description = document.getElementById('description').value; // from API call
  const temp = document.getElementById('temp').value; // from API call
  const feelsLike = document.getElementById('feels-like').value; // from API call
  const humidity = document.getElementById('humidity').value; // from API call
  const windSpeed = document.getElementById('wind-speed').value; // from API call

  // Send POST request to Flask route
  fetch('/predict', {
    method: 'POST',
    body: new FormData(document.getElementById('prediction-form'))
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