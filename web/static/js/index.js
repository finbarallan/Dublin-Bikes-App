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
          marker.addListener('click', function() {
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
        map.addListener('click', function(event) {
          handleMapClick(event.latLng, data);
        });
  
        // Attach event listeners to the input boxes and clear buttons
        document.getElementById('start_location').addEventListener('click', selectStartLocation);
        document.getElementById('end_location').addEventListener('click', selectEndLocation);
        document.getElementById('clear_start_location').addEventListener('click', clearStartLocation);
        document.getElementById('clear_end_location').addEventListener('click', clearEndLocation);
      });
  }

  function handleMapClick(latLng, stations) {
    if (selectedInput) {
      selectedInput.value = `${latLng.lat().toFixed(6)}, ${latLng.lng().toFixed(6)}`;
      findNearestBikeStation(latLng, stations);
      selectedInput = null;
    }
  }
  function selectStartLocation() {
    selectedInput = document.getElementById('start_location');
  }

  function selectEndLocation() {
    selectedInput = document.getElementById('end_location');
  }

  function clearStartLocation() {
    document.getElementById('start_location').value = '';
  }

  function clearEndLocation() {
    document.getElementById('end_location').value = '';
  }

  function calculateAndDisplayRoute(origin, destination) {
    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer();
  
    directionsRenderer.setMap(map);
  
    const request = {
      origin: origin,
      destination: new google.maps.LatLng(destination.lat, destination.lng),
      travelMode: google.maps.TravelMode.WALKING,
    };
  
    directionsService.route(request, function(response, status) {
      if (status === google.maps.DirectionsStatus.OK) {
        directionsRenderer.setDirections(response);
      } else {
        alert('Directions request failed due to ' + status);
      }
    });
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
          marker.addListener('click', function() {
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
        map.addListener('click', function(event) {
          handleMapClick(event.latLng, data);
        });
      });
  }

// Attach event listeners to the input boxes and clear buttons
document.getElementById('start_location').addEventListener('click', selectStartLocation);
document.getElementById('end_location').addEventListener('click', selectEndLocation);
document.getElementById('clear_start_location').addEventListener('click', clearStartLocation);
document.getElementById('clear_end_location').addEventListener('click', clearEndLocation);