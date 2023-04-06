// displays realtime information for a specific station
function displayStationInfo() {
    // Show the loading indicator
    document.getElementById("loader").style.display = "block";

    // getting the name of the station
    var jqxhr = $.getJSON("/station-info/" + station_id, function (data) {
        console.log("success", data);
        var stationInfo = data;

        // Display header = name of the station
        const stationHeader = document.createTextNode(stationInfo[0]["address"]);
        document.getElementById("station_title").appendChild(stationHeader);

        // extracts container for real time station information
        const stationInfoList = document.getElementById("station_info");

        // Display real time availability information
        var jqxhr = $.getJSON("/bike-info/" + station_id, function (data) {
            console.log("success", data);
            var availability = [];
            availability = data;

            // Display currently available bikes
            populateCurrentAvailability("Currently Available Bikes", "available_bikes", availability, stationInfoList);

            // Display currently available stations
            populateCurrentAvailability("Currently Available Parking Spaces", "available_bike_stands", availability, stationInfoList);

            // Hide the loading indicator and show the information containers
            document.getElementById("loader").style.display = "none";
            document.getElementById("station_title_row").style.display = "block";
            document.getElementById("current_availability_header").style.display = "block";
            document.getElementById("station_info").style.display = "block";
        })
            .fail(function () {
                console.error("inner error");
            });
    })
        .fail(function () {
            console.error("outer error");
        });
}

// inserts availability data onto the page 
function populateCurrentAvailability(header, key, availability, stationInfoList){
    // creates container for availability data
    var availabilityContainer = document.createElement("div");
    availabilityContainer.className = "col-sm-6 availability_data";
    
    //creates header for availability data 
    var availabilityHeader = document.createElement("p");
    availabilityHeader.innerHTML = header;

    //inserts quantity into availability data
    var availabilityCount = document.createElement("p");
    availabilityCount.innerHTML = availability[0][key];

    // displays elements on the page
    availabilityContainer.appendChild(availabilityHeader);
    availabilityContainer.appendChild(availabilityCount);
    stationInfoList.appendChild(availabilityContainer);

}