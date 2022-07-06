//  This is where all global variable should be declared.
var citySearchEl = $("#weather-form");
var cityNameEl = $("#city-name");
var formalCityName;

// Variable(s)) used to get playlist
var weatherMain;
var weatherDescription;
var currentTemp;

// Get the city info from local storage to display
var cityObjArray = JSON.parse(localStorage.getItem("cityInfo")) || [];
console.log(cityObjArray);

var cityButtonEl = document.querySelector("#city-buttons");

//*******************************************************/
//             Meme/Inspiration code goes here                */
var memeFunction = function () {
  console.log("Meme Function call works");
};

//*******************************************************/
//             Weather section code goes here                */
var renderCitySelectors = function () {
  cityObjArray.forEach(function (placeHolder, arrayIndex) {
    // Create button for city choices
    appendCity(cityObjArray[arrayIndex].cityName);
  });
};

var appendCity = function (cityName) {
  // Problem here - only the first class is kept, the rest are ignored
  // May need to append classes
  var cityButton = $(
    "<button class=button is-success has-background-success-dark></button>"
  ).text(cityName);
  $("#city-buttons").append(cityButton); // Append new city button element
};

var citySearchHandler = function (event) {
  event.preventDefault();
  console.log("incitySearchHandler");

  // get cityName from input element
  var cityName = $("input:text").val();

  // if we have a city name, get lat/long, else error
  if (cityName) {
    getCityLatLong(cityName);
    // clear input field content
    cityNameEl.val("");
  } else {
    alert("Please enter a city name");
    return;
  }
};

var getCityLatLong = function (cityName) {
  // format the openwathermap api url
  var apiUrl =
    "https://api.openweathermap.org/geo/1.0/direct?q=" +
    cityName +
    "&appid=d89a7998c295640400d389063c3b71e9";

  // make a get request to url
  fetch(apiUrl)
    .then(function (response) {
      // request was successful
      if (response.ok) {
        response.json().then(function (cityData) {
          console.log("*******************************  data= ", cityData);
          if (!cityData[0]) {
            // no data returned for cityName
            console.log("no data returned - invalid city????");
          } else {
            // Prepare object to push into array and make new selector button
            formalCityName = cityData[0].name;
            const cityObj = {
              cityName: formalCityName,
              stateName: cityData[0].state,
              latitude: cityData[0].lat,
              longitude: cityData[0].lon,
            };
            cityObjArray.push(cityObj);
            localStorage.setItem("cityInfo", JSON.stringify(cityObjArray));

            // Add city button to search button list and get the weather
            appendCity(cityObj.cityName);
            console.log("time to getWeather");
            getWeather(cityObj.latitude, cityObj.longitude);
          }
        });
      } else {
        alert("Error: Total Bummer");
      }
    })
    .catch(function (error) {
      alert("Unable to connect to OpenWeatherAPI");
    });
};

var getWeather = function (latitude, longitude) {
  // format the openwathermap api url
  //var apiUrl = 'https://api.openweathermap.org/data/2.5/forecast?lat=' + latitude + '&lon=' + longitude + '&units=imperial&appid=d89a7998c295640400d389063c3b71e9';

  var apiUrl =
    "https://api.openweathermap.org/data/2.5/onecall?lat=" +
    latitude +
    "&lon=" +
    longitude +
    "&exclude=minutely,hourly&units=imperial&appid=d89a7998c295640400d389063c3b71e9";

  // make a get request to url
  fetch(apiUrl)
    .then(function (response) {
      // request was successful
      if (response.ok) {
        response.json().then(function (data) {
          console.log("*******************************  data= ", data);
          if (!data.daily[0]) {
            // no data returned
            console.log("no data returned - invalid lat/lon????");
          } else {
            console.log("Loading weather data");

            // Load window for today's data
            const initialDate = new Date();

            $("#city-date").html(
              formalCityName + " (" + initialDate.toDateString() + ")"
            );

            // Get the icon and weather description
            var iconCode = data.current.weather[0].icon + "@2x";
            weatherMain = data.current.weather[0].main;
            weatherDescription = data.current.weather[0].description;
            var iconUrl =
              "https://openweathermap.org/img/wn/" + iconCode + ".png";
              $("#today-icon").html(
                "<img class=icon-size src='" + iconUrl + "'>"
                );
            
                // Display the temp/wind/humidity
                $("#today-temperature").text("Temp: " + data.current.temp + "F");
            $("#today-winds").text(
              "Winds: " + data.current.wind_speed + " MPH"
              );
            $("#today-humidity").text(
              "Humidity: " + data.current.humidity + " %"
            );
            
            //Set global variable for  playlist
            currentTemp = data.current.temp;
            console.log("currentTempo=", currentTemp);
            
            // Display the UV index number
            $("#today-uv-index").text("" + data.current.uvi);
            
            // clear any old color class
            $("#today-uv-index").removeClass();
            
            // get the correct background color
            if (data.current.uvi <= 2) {
              $("#today-uv-index").addClass("has-background-success");
            } else if (data.current.uvi <= 5) {
              $("#today-uv-index").addClass("has-background-warning");
            } else if (data.current.uvi <= 7) {
              $("#today-uv-index").addClass("has-background-warning-dark");
            } else {
              $("#today-uv-index").addClass("has-background-danger-dark");
            }
            //****************************************************************************** */
            // Get weather description for playlist (for development only - remove!!!!!!!!!!!!)
            $("#weather-main").empty(weatherMainButton);
            $("#weather-description").empty(weatherDescriptionButton);
            var weatherMainButton = $("<button class=button></button>").text(
              weatherMain
              );
              $("#weather-main").append(weatherMainButton); // Append new city button element
              var weatherDescriptionButton = $(
                "<button class=button></button>"
                ).text(weatherDescription);
                $("#weather-description").append(weatherDescriptionButton); // Append new city button element
                //****************************************************************************** */
                getPlaylist();
              }
            });
          } else {
            alert("Error: Total Bummer");
          }
        })
        .catch(function (error) {
          alert("Unable to connect to OpenWeatherAPI");
    });
};

var buttonClickHandler = function (event) {
  event.preventDefault();
  formalCityName = event.target.innerHTML;

  cityObjArray.forEach(function (placeHolder, arrayIndex) {
    // find the city to get the lat/long
    if (cityObjArray[arrayIndex].cityName === formalCityName) {
      getWeather(
        cityObjArray[arrayIndex].latitude,
        cityObjArray[arrayIndex].longitude
      );
    }
  });
};

//*******************************************************/
//             Spotify's code goes here                */
var playlistOption;
var globalTemp = currentTemp;
console.log("currentTemp", currentTemp);

getPlaylist = function () {
  fetch(
    "https://v1.nocodeapi.com/babaphillips/spotify/FirIUjwQAgxPjCJN/search?q=" +
      playlistOption +
      "&type=playlist&perPage=3"
  )
    .then((response) => response.json())
    .then((result) => console.log(result))
    .catch((error) => console.log("error", error));
  if (globalTemp > 80) {
    playlistOption = "sunny";
  } else if (globalTemp < 80 && globalTemp > 40) {
    playlistOption = "Rainy";
  } else {
    playlistOption = "cold";
  }
};

memeFunction();
renderCitySelectors();
citySearchEl.on("submit", citySearchHandler);
cityButtonEl.addEventListener("click", buttonClickHandler);
