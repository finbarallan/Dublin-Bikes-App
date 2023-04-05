// Defining function to add list of stations
function addStations() {
    // Request the JSON data from "/bike-info" using jQuery's $.getJSON() method
    let addStations = $.getJSON("/bike-info", function (data) {
        // Log the fetched data to the console as a success message
        console.log("success", data);

        // Iterate through the data
        for (nums in data) {
            // Create a new <li> element for the station list item
            let accessLists = document.createElement("li");
            // Create a new <a> element for the station link
            let accessLinks = document.createElement("a");
            // Create a text node containing the station's address
            let accessAddresses = document.createTextNode(data[nums].address);

            // Set the href attribute of the anchor to the station's detail page URL
            accessLinks.href = "station/" + data[nums].number;
            // Append the station address text to the anchor element
            accessLinks.appendChild(accessAddresses);
            // Append the anchor element to the list item
            accessLists.appendChild(accessLinks);
            // Append the list item to an existing list element (presumably with the id "list")
            list.appendChild(accessLists);
        }
    })
    // If the data fetch fails, log an error message in the console
    .fail(function () {
        console.error("failed");
    });
}

// Defining function to filter list of stations
function filterStations() {
    // Get the input element and its value in uppercase
    let input = document.getElementById('input');
    let filter = input.value.toUpperCase();

    // Get the list and link element
    let ul = document.getElementById("list");
    let link = ul.querySelectorAll('a');

    // Iterate through all the 'a' elements using forEach
    link.forEach(function(aElement) {
        // Get the parent 'list' element of the current 'a' element
        let list = aElement.parentNode;
        // Get the text content of the 'list' element
        let txtValue = list.textContent || list.innerText;

        // Check if the text content matches the search query
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
            // If it matches, set the display style of the 'list' element to an empty string (default)
            list.style.display = "";
        } else {
            // If it doesn't match, set the display style of the 'list' element to "none" (hidden)
            list.style.display = "none";
        }
    });
}
