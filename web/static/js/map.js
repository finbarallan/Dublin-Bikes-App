let startMarker;
let endMarker;
let inputClicked = false;
let startBikeStation = null;
let endBikeStation = null;
let selectedInput = null;
let startJourneyDirectionsRenderer;
let endJourneyDirectionsRenderer;
let directionsService;
let distanceMatrixService;

var snazzyMapStyle = [
    {
        "featureType": "administrative",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#000000"
            }
        ]
    },
    {
        "featureType": "landscape",
        "elementType": "all",
        "stylers": [
            {
                "color": "#7993c9"
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "all",
        "stylers": [
            {
                "saturation": -100
            },
            {
                "lightness": "57"
            },
            {
                "color": "#cedaff"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "visibility": "on"
            },
            {
                "color": "#3c3c3c"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "simplified"
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "elementType": "labels.icon",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "transit",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "all",
        "stylers": [
            {
                "color": "#004fb6"
            },
            {
                "visibility": "on"
            }
        ]
    }
]

// Declare the map variable globally
var map;


function initMap() {
    // Set the map options
    var mapOptions = {
        zoom: 13.5, // Set the zoom level
        center: {
            lat: 53.346396,
            lng: -6.263156
        }, // Set the center point of the map
        styles: snazzyMapStyle // Remove this line if you don't have a style
    };

    // Create the map object
    map = new google.maps.Map(document.getElementById('map'), mapOptions);

    // Initialize the directions renderer
    startJourneyDirectionsRenderer = new google.maps.DirectionsRenderer({
        map: map,
        suppressMarkers: true,
        polylineOptions: {
            strokeColor: '#a6eca8'
        },
        preserveViewport: true,
    });
    startJourneyDirectionsRenderer.setMap(map);

    endJourneyDirectionsRenderer = new google.maps.DirectionsRenderer({
        map: map,
        suppressMarkers: true,
        polylineOptions: {
            strokeColor: '#ff6961'
        },
        preserveViewport: true,
    });
    endJourneyDirectionsRenderer.setMap(map);

    // Initialize the directions service
    directionsService = new google.maps.DirectionsService();

    // Initialize the distance matrix service
    distanceMatrixService = new google.maps.DistanceMatrixService();

    fetch('https://api.jcdecaux.com/vls/v1/stations?contract=Dublin&apiKey=a572dc37b128fb280c9e1621093640367863e160')
        .then(response => response.json())
        .then(data => {
            // Create an info window to display station information
            var infoWindow = new google.maps.InfoWindow();

            // Creates a variable with my custom marker image
            var customMarkerIcon = {
                url: 'img/marker.png',
                scaledSize: new google.maps.Size(60, 60) // Width and height in pixels
            };

            // Loop through each station and add a marker to the map
            data.forEach(station => {
                var marker = new google.maps.Marker({
                    position: {
                        lat: station.position.lat,
                        lng: station.position.lng
                    },
                    map: map,
                    icon: customMarkerIcon,
                    title: station.name
                });
                // Add a click event listener to the marker
                marker.addListener('click', function () {
                    // Set the content of the info window
                    infoWindow.setContent(
                        '<div class="info-card">' +
    '<h3>' + station.name + '</h3>' +
    '<p>Available bikes: ' + station.available_bikes + '</p>' +
    '<p>Available parking spaces: ' + station.available_bike_stands + '</p>' +
    '<p><a href="/station/' + station.number + '">View Station Details</a></p>' +
    '</div>'
                    );

                    // Open the info window on the clicked marker
                    infoWindow.open(map, marker);

                    // Call the onMarkerClick function with the station number
                    onMarkerClick(station.number);
                });
            });

            // Add a click event listener to the map
            map.addListener('click', function (event) {
                handleMapClick(event, data);
            });

            // Attach event listeners to the input boxes and clear buttons
            document.getElementById('start_location').addEventListener('click', selectStartLocation);
            document.getElementById('end_location').addEventListener('click', selectEndLocation);

            map.addListener('click', function (event) {
                handleMapClick(event, data);
            });
        });
}

function handleMapClick(event, data) {
    if (inputClicked) {
        findNearestBikeStationAndDisplayRoute(event.latLng, data);
        inputClicked = false;
        resetCursor();
    }
}

function selectStartLocation() {
    selectedInput = 'start';
    inputClicked = true;
    map.setOptions({
        draggableCursor: 'pointer'
    });
}

function selectEndLocation() {
    selectedInput = 'end';
    inputClicked = true;
    map.setOptions({
        draggableCursor: 'pointer'
    });
}

function clearStartLocation() {
    document.getElementById('start_location').value = '';
}

function clearEndLocation() {
    document.getElementById('end_location').value = '';
}

async function findNearestBikeStationAndDisplayRoute(clickedLocation, stations) {
    const clickedLatLng = new google.maps.LatLng(clickedLocation.lat(), clickedLocation.lng());

    // Find the 5 nearest stations using the geometry spherical distance
    const nearestStations = stations
        .map(station => ({
            station,
            distance: google.maps.geometry.spherical.computeDistanceBetween(clickedLatLng, new google.maps.LatLng(station.position.lat, station.position.lng))
        }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 5)
        .map(({
            station
        }) => station);

    // Use the distance matrix service to calculate the walking distance between the clicked location and the 5 nearest stations
    const destinations = nearestStations.map(station => new google.maps.LatLng(station.position.lat, station.position.lng));
    distanceMatrixService.getDistanceMatrix({
        origins: [clickedLatLng],
        destinations: destinations,
        travelMode: google.maps.TravelMode.WALKING,
    }, function (response, status) {
        if (status === google.maps.DistanceMatrixStatus.OK) {
            const distances = response.rows[0].elements.map(element => element.distance.value);
            const minDistance = Math.min(...distances);
            const nearestStation = nearestStations[distances.indexOf(minDistance)];

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
                        const newMarker = new google.maps.Marker({
                            position: leg.start_location,
                            map: map,
                            icon: selectedInput === 'start' ? startIcon : endIcon,
                        });

                        // Remove the previous marker if it exists
                        if (selectedInput === 'start' && startMarker) {
                            startMarker.setMap(null);
                        } else if (selectedInput === 'end' && endMarker) {
                            endMarker.setMap(null);
                        }

                        // Update the current marker
                        if (selectedInput === 'start') {
                            startMarker = newMarker;
                        } else if (selectedInput === 'end') {
                            endMarker = newMarker;
                        }

                        // Update directions renderer
                        currentDirectionsRenderer.setDirections(response);
                        zoomToFitRoute(startJourneyDirectionsRenderer, endJourneyDirectionsRenderer);
                    } else {
                        alert('Directions request failed due to ' + status);
                    }
                });
            }
        }
    });
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
    return str.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

function resetCursor() {
    map.setOptions({
        draggableCursor: null
    });
}

function clearJourney() {
    // Clear input boxes
    document.getElementById("start_location").value = "";
    document.getElementById("end_location").value = "";

    // Clear markers
    if (startMarker) {
        startMarker.setMap(null);
        startMarker = null;
    }
    if (endMarker) {
        endMarker.setMap(null);
        endMarker = null;
    }

    // Clear directions
    if (directionsRenderer) {
        directionsRenderer.setDirections({
            routes: []
        });
    }
}

// Attach an event listener to the document to listen for the Escape key
document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
        selectedInput = null;
    }
});

// Remove the lines that temporarily hide the end journey directions when selecting the begin journey input and vice versa
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('start_location').addEventListener('click', function () {
        selectStartLocation();
        clearStartLocation();
    });
    document.getElementById('end_location').addEventListener('click', function () {
        selectEndLocation();
        clearEndLocation();
    });
});
