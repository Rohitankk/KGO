// Access token
mapboxgl.accessToken = "pk.eyJ1Ijoicm9oaXRhbmsiLCJhIjoiY2xvMHNvZzltMDFvcDJqb2wxcXkyYWN6dSJ9.nGSabdY3AUZ_w0DRJ2CYJQ";

// Variable declaration
var map;
var pinnedLoc;
var cityName;
var currLong;
var currLat;
var isAddressMethod;
var toIATA;
var fromIATA;
var currAP;
var destiantionAP;
var XRapidApiKeyValue = "";
const RapidAPIKeys = {
  button1: 'c2aa56a109mshaa89d930bb8b607p1d6c93jsn8252337bffbc',
  button2: '65956749bcmsh0d6863260fb644cp116d0ajsnfa997923c043',
  button3: '7eba7fe0eemsh5a89b97de6f9b7dp1f40fejsnf26b94a1dc9c',
  button4: '0e697281d8msh0dbbb558c8a8243p1ce2d3jsn90a59d856275',
  button5: '2fa997f2bfmsh87e774a3bcff19ap118fa6jsndfdad8cc417c',
  button6: 'c2aa56a109mshaa89d930bb8b607p1d6c93jsn8252337bffbc',
};

selectAPIKey();
//===========================================================================================

//Sets the current location
navigator.geolocation.getCurrentPosition(successLocation, errorLocation, {
  enableHighAccuracy: true
});

//Gets the users current location
function successLocation(position) {
  currLong = position.coords.longitude;
  currLat = position.coords.latitude;
  setupMap([currLong, currLat]);
}

//Sets default starting location
function errorLocation() {
}

//===========================================================================================

//Sets up map given a set of coordinates (lat and long)
function setupMap(center) {

  // Create a map
  map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v12",
    center: center,
    zoom: 15
  });

  // Zoom in and out + change map view
  const nav = new mapboxgl.NavigationControl();
  map.addControl(nav);

  // Create a draggable marker
  const marker = new mapboxgl.Marker({
    draggable: true
  })
    .setLngLat(center)
    .addTo(map);

  // Get location when marker is dragged  
  function onDragEnd() {
    pinnedLoc = marker.getLngLat();
    cityName = document.getElementById("cityName");

    // Perform reverse geocoding to get the location details
    reverseGeocode(pinnedLoc, function(locationName) {
      cityName.value = locationName;
    });
  }

  marker.on('dragend', onDragEnd);
}

//===========================================================================================

//Checks whether the input method used in inputting a destination was through
//manual input or pinpoint
async function getInputMethod() {
  const addressMethod = document.getElementById("addressMethod");

  if (addressMethod.checked) {
    // Use the input address method
    const addressInput = document.getElementById("cityName");
    const address = addressInput.value;
    isAddressMethod = true;

    // Geocode the address and set pinnedLoc
    await geocodeAddress(address);
  } else {
    isAddressMethod = false;
  }
}

//===========================================================================================

//Converts coordinates into its corresponding string address
function reverseGeocode(coordinates, callback) {

  const response = fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${coordinates.lng},${coordinates.lat}.json?access_token=pk.eyJ1Ijoicm9oaXRhbmsiLCJhIjoiY2xvMHhqaGloMWg1ZTJqbWNsZnBvdXczbSJ9.Tnq7BQWm3vdTcu8TtmYszA`
  );

  //Extract data from response json file
  response
    .then(response => response.json())
    .then(data => {

      var firstFeature = data.features[0];
      var fullAddress = firstFeature.place_name;

      callback(fullAddress);

    })
    .catch(error => {
      console.error('Reverse geocoding error:', error);
    });
}

//===========================================================================================

//Converts a string address into its corresponding coordinates
function geocodeAddress(address) {
  return new Promise((resolve, reject) => {

  if (!address.trim()) {
    pinnedLoc = null;
    return;
  }

  const response = fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${address}.json?access_token=pk.eyJ1Ijoicm9oaXRhbmsiLCJhIjoiY2xvMHhqaGloMWg1ZTJqbWNsZnBvdXczbSJ9.Tnq7BQWm3vdTcu8TtmYszA`
  );

  // Extract data from response json file
  response
    .then(response => response.json())
    .then(data => {
      if (data.features && data.features.length > 0) {
        var firstFeature = data.features[0];
        const coordinates = firstFeature.center;

        pinnedLoc = {
          lng: coordinates[0],
          lat: coordinates[1]
        };

      } else {
        displayError('Address not found! Please enter a valid address.');
        pinnedLoc = null; // Set pinnedLoc to null when address is not found
      }
      resolve(pinnedLoc);
    })
    .catch(error => {
      reject(error);
    });
  });
}

//===========================================================================================

//Function to clear existing flight data in flights available container
function clearFlightData() {
  const flightDataContainer = document.getElementById("fa-flights-list");

  // Remove all child elements within the container to clear existing data
  while (flightDataContainer.firstChild) {
    flightDataContainer.removeChild(flightDataContainer.firstChild);
  }
}

//===========================================================================================

//Adds an action listener tot he check flight button
document.addEventListener("DOMContentLoaded", function () {
  // Gets a reference to the "Check Flight" button
  const checkFlightButton = document.getElementById("checkFlight");

  //Generates the list of flights available using the user provided information
  checkFlightButton.addEventListener("click", async function () {
    // clearError();
    await getInputMethod();

    if (pinnedLoc == null) {
      displayError("A destination must be set before flights can be checked!");
      return;
    }

    //Clear the existing flight data in the container if there is a recent search
    clearFlightData();


    if(isAddressMethod == false){
    //Initialize variables for IATA codes
      fromIATA = null;
      toIATA = null;
    }

    //Get IATA code for the pinned location or the chosen destination and error handling
    getIATACode(pinnedLoc.lat, pinnedLoc.lng, function (result) {
      if (!result) {
        displayError("No airline is available within the chosen destination!");
        return;
      }

      toIATA = result.iata_code;
      destiantionAP = result.name;

      //Check if both IATA codes are available
      if (fromIATA !== null && toIATA !== null) {
        //Both IATA codes are available, proceed to get the flight estimate
        getFlightEstimate(fromIATA, toIATA);
      }
    });

    //Get IATA code for the current location and error handling
    getIATACode(currLat, currLong, function (result) {
      if (!result) {
        displayError("No airline is available within your current location!");
        return;
      }

      fromIATA = result.iata_code;
      currAP = result.name;

      //Check if both IATA codes are available
      if (fromIATA !== null && toIATA !== null) {
        //Both IATA codes are available, proceed to get the flight estimate
        getFlightEstimate(fromIATA, toIATA);
      }
    });
  });
});

//===========================================================================================

//Display an error message
function displayError(errorMessage) {
  const errorElement = document.getElementById("error");

  if (errorElement) {
    // Update the error message text
    errorElement.textContent = errorMessage;
    // Display the error element
    errorElement.style.display = "block";
  }
}

//Hide the web page's error message
function clearError() {
  const errorElement = document.getElementById("error");
  errorElement.style.display = "none";
}

//===========================================================================================

//Retreive IATA Code of nearest airline based on a specified location (lat and long))
function getIATACode(inputLat, inputLong, callback){
  const apiKey = '708893f5-ed35-4c22-81f3-0e9eae85d80e';
  const distance = 800; // KM Radius

  //Retreieve data from API based on inputted latitude and longitude, distance radius (100), and API key
  fetch(`https://airlabs.co/api/v9/nearby?lat=${inputLat}&lng=${inputLong}&distance=${distance}&api_key=${apiKey}`)
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }
    })
    .then(data => {
      //Check if array is empty or not
      if (Array.isArray(data.response.airports) && data.response.airports.length > 0) {
        //Get the first (nearest) airport in the list for the specified location
        const firstAirport = data.response.airports[0];
        //Get the iata code of the nearest airport

        callback(firstAirport);

      } else {
        console.log('No airports found in the response.');
      }
    })
    .catch(error => {
      console.error(error);
    });
}

//===========================================================================================

//Retreive the flight details using the IATA codes generated from the getIATA function
function getFlightEstimate(fromIATF, toIATF) {
  //Retrieve data from API based on inputted IATF code for "from" airline and for "to" airline
  const url = `https://flight-time-estimation1.p.rapidapi.com/getAllJetInfo/${fromIATF}/${toIATF}/oneWay/`;
  const options = {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': XRapidApiKeyValue,
      'X-RapidAPI-Host': 'flight-time-estimation1.p.rapidapi.com'
    }
  };

  //Fetch data based on url
  fetch(url, options)
    .then(response => {
      if (response.ok) {
        return response.json(); 
      } else if (response.status === 429) {
        displayError('Sorry, your API key has been maxed out! Use another key and try again.');
        return;
      } else {
        displayError('An error has occurred processing your request. Please try again later.')
        return;
      }
    })
    .then(data => {
      //Retrieve and store data from json
      const flightData = data.data.map(jet => {
        return {
          type: jet.type,
          rate: jet.rate,
          capacity: jet.capacity,
          speed: jet.speed,
          time: jet.time,
          cost: jet.cost,
          image: jet.img1
        };
      });


      displayFlightData(flightData);
    })
    .catch(error => {
      console.error(error);
    });
}

//===========================================================================================

//Display the retrieved data from the getFlightEstimates function in the
//flights available section
function displayFlightData(flightData) {
  const flightDataContainer = document.getElementById("fa-flights-list");

  const toAndFrom = document.getElementById("fa-to-and-from");
  
  const existingH2 = toAndFrom.querySelectorAll("h2");
  existingH2.forEach((h2) => {
    toAndFrom.removeChild(h2);
  });

  const lineBreak = toAndFrom.querySelector(".line-break");
  if (lineBreak) {
    toAndFrom.removeChild(lineBreak);
  }
  
  const h2CurrAP = document.createElement("h2");
  h2CurrAP.textContent = `Flight from: ${currAP}`;
  toAndFrom.appendChild(h2CurrAP);

  const br = document.createElement("br");
  br.classList.add("line-break");
  toAndFrom.appendChild(br);

  const h2DestiantionAP = document.createElement("h2");
  h2DestiantionAP.textContent = `Flight to: ${destiantionAP}`;
  toAndFrom.appendChild(h2DestiantionAP);

  toAndFrom.style.display = "block";

   // Clears the existing flight data by removing all child elements within the container
   while (flightDataContainer.firstChild) {
    flightDataContainer.removeChild(flightDataContainer.firstChild);
  }

  flightData.forEach((entry) => { 
    const flightDataEntry = document.createElement("div");
    flightDataEntry.classList.add("flight-data-entry"); 

    const image = document.createElement("img");
    image.src = entry.image;
    image.alt = entry.type;
    flightDataEntry.appendChild(image);

    const type = document.createElement("h2");
    type.textContent = `Type: ${entry.type}`;
    flightDataEntry.appendChild(type);

    const rates = document.createElement("p");
    rates.textContent = `Rate/s: $${entry.rate.join(" - ")}`;
    flightDataEntry.appendChild(rates);

    const capacity = document.createElement("p");
    capacity.textContent = `Capacity: ${entry.capacity}`;
    flightDataEntry.appendChild(capacity);

    const speed = document.createElement("p");
    speed.textContent = `Speed: ${entry.speed} km/h`;
    flightDataEntry.appendChild(speed);

    const time = document.createElement("p");
    time.textContent = `Time: ${entry.time} hours`;
    flightDataEntry.appendChild(time);

    const costs = document.createElement("p");
    costs.textContent = `Cost/s: $${entry.cost.join(" - ")}`;
    flightDataEntry.appendChild(costs);

    flightDataContainer.appendChild(flightDataEntry);

  });
}

//===========================================================================================

//Allow users to search for a jet by type
document.getElementById("jetTypeSearch").addEventListener("input", function () {
    const searchInput = this.value.toLowerCase(); 

    const flightDataEntries = document.querySelectorAll(".flight-data-entry");

    flightDataEntries.forEach(entry => {
        const jetType = entry.querySelector("h2").textContent.toLowerCase();
        if (jetType.includes(searchInput)) {
            entry.style.display = "block";
        } else {
            entry.style.display = "none"; 
        }
    });
});

//===========================================================================================

// Get the button's ID and use it to fetch the corresponding API key
function selectAPIKey() {
  for (let i = 1; i <= 6; i++) {
    const button = document.getElementById(`button${i}`);
    button.addEventListener('click', (event) => {
      const buttonId = event.target.id; // Use event.target to get the clicked button
      XRapidApiKeyValue = RapidAPIKeys[buttonId];
      selectedButtonId = buttonId; // Store the selected button ID
      displaySelectedAPIKey(buttonId);
    });
  }
}

// displays what button was selected by the user
function displaySelectedAPIKey(apiKey) {
  const apiKeyMessage = document.getElementById("selectedAPIKeyResult");
  
  // Extract the button number from the button's ID
  const buttonNumber = apiKey.replace("button", "");
  
  apiKeyMessage.textContent = `Selected API Key: ${buttonNumber}`;
}

//===========================================================================================
// FOR SORTING 
// Add an event listener to the dropdown
document.getElementById("fa-sort-drop-down").addEventListener("change", function () {
  // Get the selected pricing option
  const selectedOption = this.value;

  // Sort the flight data based on the selected option
  const sortedFlightData = sortFlightData(selectedOption);

  // Display the sorted flight data
  console.log(displayFlightDataSort(sortedFlightData));
  
});

// Function to sort the flight data based on the selected option
function sortFlightData(selectedOption) {
  const flightDataContainer = document.getElementById("fa-flights-list");

  // Get the current flight data
  const flightDataEntries = Array.from(flightDataContainer.querySelectorAll(".flight-data-entry"));

  // Sort the flight data based on the selected option
  if (selectedOption === "l-h") {
      flightDataEntries.sort((a, b) => {
          const priceA = parseFloat(a.querySelector(".cost").textContent.split("$")[1]);
          const priceB = parseFloat(b.querySelector(".cost").textContent.split("$")[1]);
          return priceA - priceB;
      });
  } else if (selectedOption === "h-l") {
      flightDataEntries.sort((a, b) => {
          const priceA = parseFloat(a.querySelector(".cost").textContent.split("$")[1]);
          const priceB = parseFloat(b.querySelector(".cost").textContent.split("$")[1]);
          return priceB - priceA;
      });
  }

  // Clear the existing flight data
  while (flightDataContainer.firstChild) {
      flightDataContainer.removeChild(flightDataContainer.firstChild);
  }

  // Append the sorted flight data back to the container
  flightDataEntries.forEach(entry => {
      flightDataContainer.appendChild(entry);
  });
}

// Add an event listener to the dropdown
document.getElementById("fa-sort-drop-down").addEventListener("change", function () {
  // Get the selected pricing option
  const selectedOption = this.value;

  // Sort the flight data based on the selected option
  sortFlightData(selectedOption);
});

