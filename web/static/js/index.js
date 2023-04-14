let startBikeStation = null;
let endBikeStation = null;
let selectedInput = null;
let startJourneyDirectionsRenderer;
let endJourneyDirectionsRenderer;
let directionsService;

function initMap() {
  // Set the map options
  var mapOptions = {
    zoom: 13.5, // Set the zoom level
    center: {
      lat: 53.346396,
      lng: -6.263156
    } // Set the center point of the map
  };
  // Create the map object
  map = new google.maps.Map(document.getElementById('map'), mapOptions);

  // Initialize the directions renderer
  startJourneyDirectionsRenderer = new google.maps.DirectionsRenderer({
    map: map,
    suppressMarkers: true,
    polylineOptions: { strokeColor: 'blue' },
    preserveViewport: true,
  });
  startJourneyDirectionsRenderer.setMap(map);

  endJourneyDirectionsRenderer = new google.maps.DirectionsRenderer({
    map: map,
    suppressMarkers: true,
    polylineOptions: { strokeColor: 'red' },
    preserveViewport: true,
  });
  endJourneyDirectionsRenderer.setMap(map);

  // Initialize the directions service
  directionsService = new google.maps.DirectionsService();

  fetch('https://api.jcdecaux.com/vls/v1/stations?contract=Dublin&apiKey=a572dc37b128fb280c9e1621093640367863e160')
    .then(response => response.json())
    .then(data => {
      // Create an info window to display station information
      var infoWindow = new google.maps.InfoWindow();

      // Loop through each station and add a marker to the map
      data.forEach(station => {
        var marker = new google.maps.Marker({
          position: {
            lat: station.position.lat,
            lng: station.position.lng
          },
          map: map,
          title: station.name
        });

        // Add a click event listener to the marker
        marker.addListener('click', function () {
          // Set the content of the info window
          infoWindow.setContent(
            '<h3>' + station.name + '</h3>' +
            '<p>Available bikes: ' + station.available_bikes + '</p>' +
            '<p>Available parking spaces: ' + station.available_bike_stands + '</p>'
          );

          // Open the info window on the clicked marker
          infoWindow.open(map, marker);
        });
      });

      // Add a click event listener to the map
      map.addListener('click', function (event) {
        handleMapClick(event, data);
      });

      // Attach event listeners to the input boxes and clear buttons
      document.getElementById('start_location').addEventListener('click', selectStartLocation);
      document.getElementById('end_location').addEventListener('click', selectEndLocation);
    });
}

function handleMapClick(event, data) {
  findNearestBikeStationAndDisplayRoute(event.latLng, data);
}

function selectStartLocation() {
  selectedInput = 'start';
}

function selectEndLocation() {
  selectedInput = 'end';
}

function clearStartLocation() {
  document.getElementById('start_location').value = '';
}

function clearEndLocation() {
  document.getElementById('end_location').value = '';
}

function findNearestBikeStationAndDisplayRoute(clickedLocation, stations) {
  let minDistance = Infinity;
  let nearestStation = null;
  let clickedLat = clickedLocation.lat()
  let clickedLng = clickedLocation.lng()
  const clickedLatLng = new google.maps.LatLng(clickedLat, clickedLng);

  stations.forEach(station => {
    const stationLatLng = new google.maps.LatLng(station.position.lat, station.position.lng);
    const distance = google.maps.geometry.spherical.computeDistanceBetween(clickedLatLng, stationLatLng);

    if (distance < minDistance) {
      minDistance = distance;
      nearestStation = station;
    }
  });

  if (nearestStation) {
    let currentDirectionsRenderer;
    if (selectedInput === 'start') {
      startBikeStation = nearestStation;
      currentDirectionsRenderer = startJourneyDirectionsRenderer;
    } else if (selectedInput === 'end') {
      endBikeStation = nearestStation;
      currentDirectionsRenderer = endJourneyDirectionsRenderer;
    }

    document.getElementById(selectedInput + '_location').value = " " + toTitleCase(nearestStation.name);

    if (startJourneyDirectionsRenderer) {
      startJourneyDirectionsRenderer.setMap(map);
    }
    if (endJourneyDirectionsRenderer) {
      endJourneyDirectionsRenderer.setMap(map);
    }

    const request = {
      origin: clickedLocation,
      destination: new google.maps.LatLng(nearestStation.position.lat, nearestStation.position.lng),
      travelMode: google.maps.TravelMode.WALKING,
    };

    if (directionsService && currentDirectionsRenderer) {
      directionsService.route(request, function (response, status) {
        if (status === google.maps.DirectionsStatus.OK) {
          currentDirectionsRenderer.setDirections(response);

          const markerIconsDiv = document.getElementById('marker-icons');
          const startIcon = {
            url: markerIconsDiv.getAttribute('data-start-icon'),
            scaledSize: new google.maps.Size(32, 32),
          };
        
          const endIcon = {
            url: markerIconsDiv.getAttribute('data-end-icon'),
            scaledSize: new google.maps.Size(32, 32),
          };

          // Create a custom start marker
          const leg = response.routes[0].legs[0];
          const startMarker = new google.maps.Marker({
            position: leg.start_location,
            map: map,
            icon: startIcon,
          });

          // Update directions renderer
          currentDirectionsRenderer.setDirections(response);
          zoomToFitRoute(startJourneyDirectionsRenderer, endJourneyDirectionsRenderer);
        } else {
          alert('Directions request failed due to ' + status);
        }
      });
    }
  }
}

function zoomToFitRoute(startJourneyDirectionsRenderer, endJourneyDirectionsRenderer) {
  const bounds = new google.maps.LatLngBounds();

  [startJourneyDirectionsRenderer, endJourneyDirectionsRenderer].forEach(directionsRenderer => {
    if (directionsRenderer && directionsRenderer.getDirections()) {
      const route = directionsRenderer.getDirections().routes[0];

      for (let i = 0; i < route.legs.length; i++) {
        const leg = route.legs[i];

        bounds.extend(leg.start_location);
        bounds.extend(leg.end_location);

        for (let j = 0; j < leg.steps.length; j++) {
          const step = leg.steps[j];

          for (let k = 0; k < step.path.length; k++) {
            bounds.extend(step.path[k]);
          }
        }
      }
    }
  });
  // Check if the bounds are not empty before calling map.fitBounds()
  if (!bounds.isEmpty()) {
    map.fitBounds(bounds);
  }
}

function toTitleCase(str) {
  return str.replace(/\w\S*/g, function(txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}


// Attach an event listener to the document to listen for the Escape key
document.addEventListener('keydown', function (event) {
  if (event.key === 'Escape') {
    selectedInput = null;
  }
});

// Attach event listeners to the input boxes and clear buttons
document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('start_location').addEventListener('click', function () {
    selectStartLocation();
    clearStartLocation();
    // Remove the following lines:
    if (endJourneyDirectionsRenderer) {
      endJourneyDirectionsRenderer.setMap(null);
    }
  });
  document.getElementById('end_location').addEventListener('click', function () {
    selectEndLocation();
    clearEndLocation();
    // Remove the following lines:
    if (startJourneyDirectionsRenderer) {
      startJourneyDirectionsRenderer.setMap(null);
    }
  });
});

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