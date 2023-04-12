let startBikeStation = null;
let endBikeStation = null;
let selectedInput = null;
let directionsRenderer;
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
  directionsRenderer = new google.maps.DirectionsRenderer();
  directionsRenderer.setMap(map);

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
        handleMapClick(event.latLng, data);
      });


      // Attach event listeners to the input boxes and clear buttons
      document.getElementById('start_location').addEventListener('click', selectStartLocation);
      document.getElementById('end_location').addEventListener('click', selectEndLocation);
      document.getElementById('clear_start_location').addEventListener('click', clearStartLocation);
      document.getElementById('clear_end_location').addEventListener('click', clearEndLocation);
    });
}

function handleMapClick(event, data) {
  if (selectedInput) {
    findNearestBikeStationAndDisplayRoute(event.latLng, data, (bikeStation) => {
      if (selectedInput === 'start') {
        startBikeStation = bikeStation;
      } else if (selectedInput === 'end') {
        endBikeStation = bikeStation;
      }

      document.getElementById(selectedInput + '_location').value = bikeStation.name;

      if (startBikeStation && endBikeStation) {
        calculateAndDisplayRoute(directionsService, directionsRenderer, startBikeStation, endBikeStation);
      } else {
        // If either the start or end bike station is not selected, clear the previous route (if any).
        if (directionsRenderer) {
          directionsRenderer.setDirections({ routes: [] });
        }
      }
    });
  }
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

function calculateAndDisplayRoute(origin, destination) {
  const directionsService = new google.maps.DirectionsService();

  const request = {
    origin: origin,
    destination: new google.maps.LatLng(destination.lat, destination.lng),
    travelMode: google.maps.TravelMode.WALKING,
  };

  directionsService.route(request, function (response, status) {
    if (status === google.maps.DirectionsStatus.OK) {
      directionsRenderer.setDirections(response);
    } else {
      alert('Directions request failed due to ' + status);
    }
  });
}

function findNearestBikeStationAndDisplayRoute(event, stations, callback) {
  let minDistance = Infinity;
  let nearestStation = null;

  stations.forEach(station => {
    const stationLatLng = new google.maps.LatLng(station.position.lat, station.position.lng);
    const distance = google.maps.geometry.spherical.computeDistanceBetween(event, stationLatLng);

    if (distance < minDistance) {
      minDistance = distance;
      nearestStation = station;
    }
  });

  if (nearestStation) {
    callback(nearestStation);
  }
}

// Attach an event listener to the document to listen for the Escape key
document.addEventListener('keydown', function (event) {
  if (event.key === 'Escape') {
    selectedInput = null;
  }
});

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
    });
}

// Attach event listeners to the input boxes and clear buttons
document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('start_location').addEventListener('click', function () {
    selectStartLocation();
    clearStartLocation();
    if (directionsRenderer) {
      directionsRenderer.setMap(null);
    }
  });
  document.getElementById('end_location').addEventListener('click', function () {
    selectEndLocation();
    clearEndLocation();
    if (directionsRenderer) {
      directionsRenderer.setMap(null);
    }
  });
});