// REFERENCE - Refactoring required
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
function populateCurrentAvailability(header, key, availability, stationInfoList) {
    // creates container for availability data
    var availabilityContainer = document.createElement("div");
    availabilityContainer.className = "col-sm-6 availability_data";

    //creates header for availability data 
    var availabilityHeader = document.createElement("p");
    availabilityHeader.innerHTML = header;

    //inserts quantity into availability data
    var availabilityCount = document.createElement("p");
    availabilityCount.innerHTML = availability[availability.length - 1][key];

    // displays elements on the page
    availabilityContainer.appendChild(availabilityHeader);
    availabilityContainer.appendChild(availabilityCount);
    stationInfoList.appendChild(availabilityContainer);

}

// Load the Visualization API and the corechart package.
google.charts.load('current', { 'packages': ['corechart'] });

// Set a callback to run when the Google Visualization API is loaded.
google.charts.setOnLoadCallback(function () {
    drawBikeChart();
    drawStandChart();
    loadOnCallback();
});


function drawBikeChart() {
    // Fetch bike availability data from server
    $.getJSON('/bike-info/' + station_id, function (response) {
        var bikeData = response;

        // Create a DataTable object
        var data = new google.visualization.DataTable();
        data.addColumn('string', 'Day of Week');
        data.addColumn('number', 'Average Bikes');

        // Calculate average number of bikes available for each day of the week
        var dayOfWeekData = Array(7).fill(0);
        var dayOfWeekCount = Array(7).fill(0); // New array to keep track of count for each day
        for (var i = 0; i < bikeData.length; i++) {
            var timestamp = new Date(bikeData[i].last_update * 1000); // Convert seconds to milliseconds
            var dayOfWeek = timestamp.getDay();
            dayOfWeekData[dayOfWeek] += bikeData[i].available_bikes;
            dayOfWeekCount[dayOfWeek]++; // Increment count for each day
        }
        dayOfWeekData.push(dayOfWeekData.shift());
        dayOfWeekCount.push(dayOfWeekCount.shift());
        var weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        for (var j = 0; j < dayOfWeekData.length; j++) {
            data.addRow([weekdays[j], dayOfWeekData[j] / dayOfWeekCount[j]]); // Divide by count for each day
        }
        // Create and draw the chart
        var options = {
            title: 'Average Bikes Available by Day of Week for Station ' + station_id,
            hAxis: { title: 'Day of Week' },
            vAxis: { title: 'Average Bikes' },
            legend: { position: 'none' },
            bar: { groupWidth: '80%' }
        };

        var chartDiv = document.getElementById('bike_chart_div');
        //chartDiv.style.width = '60%';
        var chart = new google.visualization.ColumnChart(document.getElementById('bike_chart_div'));
        chart.draw(data, options);
    });
}

function drawStandChart() {
    // Fetch bike availability data from server
    $.getJSON('/bike-info/' + station_id, function (response) {
        var standData = response;

        // Create a DataTable object
        var data = new google.visualization.DataTable();
        data.addColumn('string', 'Day of Week');
        data.addColumn('number', 'Average Stands');

        // Calculate average number of bikes available for each day of the week
        var dayOfWeekData = Array(7).fill(0);
        var dayOfWeekCount = Array(7).fill(0); // New array to keep track of count for each day
        for (var i = 0; i < standData.length; i++) {
            var timestamp = new Date(standData[i].last_update * 1000); // Convert seconds to milliseconds
            var dayOfWeek = timestamp.getDay();
            dayOfWeekData[dayOfWeek] += standData[i].available_bike_stands;
            dayOfWeekCount[dayOfWeek]++; // Increment count for each day
        }
        dayOfWeekData.push(dayOfWeekData.shift());
        dayOfWeekCount.push(dayOfWeekCount.shift());
        var weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        for (var j = 0; j < dayOfWeekData.length; j++) {
            data.addRow([weekdays[j], dayOfWeekData[j] / dayOfWeekCount[j]]); // Divide by count for each day
        }
        // Create and draw the chart
        var options = {
            title: 'Average Stands Available by Day of Week for Station ' + station_id,
            hAxis: { title: 'Day of Week' },
            vAxis: { title: 'Average Stands' },
            legend: { position: 'none' },
            bar: { groupWidth: '80%' }
        };

        var chartDiv = document.getElementById('stand_chart_div');
        //chartDiv.style.width = '60%';
        var chart = new google.visualization.ColumnChart(document.getElementById('stand_chart_div'));
        chart.draw(data, options);
    });
}




var bikeData;

function loadData() {
  // Load bike data here and store it in bikeData variable
  // For example, you can use jQuery to load data from a JSON file
  $.getJSON('/bike-info/' + station_id, function (response) {
        bikeData = response;
  });
}

function drawBikeHourChart(dayOfWeek, divId) {
  // Use the bikeData variable to draw the chart
  // For example, you can use the Google Charts API to draw a line chart
  var data = new google.visualization.DataTable();
  data.addColumn('number', 'Hour');
  data.addColumn('number', 'Bike Count');
  for (var i = 0; i < bikeData.length; i++) {
    if (bikeData[i].dayOfWeek === dayOfWeek) {
      data.addRow([bikeData[i].hour, bikeData[i].count]);
    }
  }
  var options = {
    title: 'Bike Count by Hour on Day ' + dayOfWeek,
    curveType: 'function',
    legend: { position: 'bottom' }
  };
  var chart = new google.visualization.LineChart(document.getElementById(divId));
  chart.draw(data, options);
}

function loadOnCallback() {
    loadData();
drawBikeHourChart(1, 'bike_hour_chart_div_mon');
drawBikeHourChart(2, 'bike_hour_chart_div_tues');
drawBikeHourChart(3, 'bike_hour_chart_div_wed');
drawBikeHourChart(4, 'bike_hour_chart_div_thur');
drawBikeHourChart(5, 'bike_hour_chart_div_fri');
drawBikeHourChart(6, 'bike_hour_chart_div_sat');
drawBikeHourChart(0, 'bike_hour_chart_div_sun');
}

