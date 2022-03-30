var cityInputEl = document.querySelector("#city-input");
var searchBtn = document.querySelector("#search-btn");
var notFoundText = document.querySelector("#not-found-text");
var favoriteBtn = document.querySelector("#fav-btns");

var currentContainer = document.querySelector("#current");
currentContainer.setAttribute("style", "display:none")
var forecastContainer = document.querySelector("#forecast");
forecastContainer.setAttribute("style", "display:none")

const months = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];
const weekdays = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function generateBtn() {
    var existingCities = JSON.parse(localStorage.getItem("cities"));
    if (existingCities == null) {
        existingCities = [];
    }
    var j = 0;
    for (let i = existingCities.length - 1; j < existingCities.length & j < 7; i--) {
        var cityBtn = document.createElement('button');
        cityBtn.textContent = existingCities[i];
        j++;
        favoriteBtn.appendChild(cityBtn);
    }
};

generateBtn();

function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

function handleCitySearch(type, event) {
    if (type == "inpt") { 
        var searchCity = cityInputEl.value;
    } else if (type == "btn") {
        var element = event.target;
        if (element.matches("button") === true) {
            var searchCity = element.textContent;
        }
    };

    var requestGeocodeUrl = 'https://api.openweathermap.org/data/2.5/weather?q=' + searchCity + '&APPID=c84153fa02f99cc73cd6303492bd0b19';

    fetch(requestGeocodeUrl, {method: 'get'})
    .then(function (response) {
        if (response.status === 404) {
            notFoundText.textContent = "Please enter a valid city name.";
        } else {
            notFoundText.textContent = "";
            removeAllChildNodes(favoriteBtn);
            generateBtn()
            
            existingCities = JSON.parse(localStorage.getItem("cities"));
            if (existingCities == null) {
                existingCities = [];
                lastSeven = [];
            } else if (existingCities.length > 7) {
                lastSeven = existingCities.slice(-7);
            } else {
                lastSeven = existingCities;
            }

            const exists = (city) => city === searchCity;

            if (!lastSeven.some(exists)) {
                localStorage.setItem("cityName", JSON.stringify(searchCity));
                existingCities.push(searchCity);
                localStorage.setItem("cities", JSON.stringify(existingCities));}

            return response.json();
        }
    })
    .then(function (data) {
        var cityLat = data.coord.lat;
        var cityLon = data.coord.lon;
        var requestWeatherUrl = 'https://api.openweathermap.org/data/2.5/onecall?lat=' + cityLat + '&lon=' + cityLon + '&exclude=minutely,hourly&units=imperial&appid=c84153fa02f99cc73cd6303492bd0b19'
        return fetch(requestWeatherUrl);
    })
    .then(function (response) {
        return response.json();
    })
    .then(function (data) {
        console.log(data);
        removeAllChildNodes(currentContainer);
        //current
        var cityName = document.createElement("h2");
        cityName.textContent = searchCity; 
        
        var currentDate = document.createElement("h3");
        currentDate.setAttribute("class", "inline-display");
        const currentDt = new Date(data.current.dt*1000);
        currentDate.textContent = weekdays[currentDt.getDay()] + " " + months[currentDt.getMonth()] + " " + currentDt.getDate() + ", " + currentDt.getFullYear();
        
        var currentIcon = document.createElement("img");
        currentIcon.setAttribute("class", "current-icon-style");
        var currentIconCd = data.current.weather[0].icon;
        var currentIconUrl = "http://openweathermap.org/img/wn/" + currentIconCd + "@2x.png";
        currentIcon.src = currentIconUrl;
        
        var currentTemp = document.createElement("p");
        currentTemp.textContent = "Temp: " + data.current.temp + "\u00B0" + "F";
        
        var currentWind = document.createElement("p");
        currentWind.textContent = "Wind: " + data.current.wind_speed + " MPH";
        
        var currentHumidity = document.createElement("p");
        currentHumidity.textContent = "Humidity: " + data.current.humidity + "%";
        
        var currentUviLabel = document.createElement("p");
        currentUviLabel.textContent = "UV Index: ";
        currentUviLabel.setAttribute("class", "inline-display");
        var currentUvi = document.createElement("span");
        var uvi = parseFloat(data.current.uvi);
        currentUvi.textContent = uvi;
        if (uvi < 3.0) {
            // currentUvi.setAttribute("style", "background-color:green;padding:3px 10px 3px 10px;border-radius:25%;")
            currentUvi.setAttribute("class", "uvi-green" );
        } else if (uvi < 6.0) {
            // currentUvi.setAttribute("style", "background-color:gold;padding:3px 10px 3px 10px;border-radius:25%;")
            currentUvi.setAttribute("class", "uvi-gold");
        } else if (uvi < 8.0) {
            // currentUvi.setAttribute("style", "background-color:darkorange;padding:3px 10px 3px 10px;border-radius:25%;")
            currentUvi.setAttribute("class", "uvi-orange");
        } else if (uvi < 11.0) {
            // currentUvi.setAttribute("style", "background-color:red;padding:3px 10px 3px 10px;border-radius:25%;")
            currentUvi.setAttribute("class", "uvi-red");
        } else if (uvi >= 11.0) {
            // currentUvi.setAttribute("style", "background-color:hotpink;padding:3px 10px 3px 10px;border-radius:25%;")
            currentUvi.setAttribute("class", "uvi-pink");
        };

        currentContainer.appendChild(cityName);
        currentContainer.appendChild(currentDate);
        currentContainer.appendChild(currentIcon);
        currentContainer.appendChild(currentTemp);
        currentContainer.appendChild(currentWind);
        currentContainer.appendChild(currentHumidity);
        currentContainer.appendChild(currentUviLabel);
        currentContainer.appendChild(currentUvi);

        currentContainer.setAttribute("style", "display:block");

        removeAllChildNodes(forecastContainer);

        //daily
        for (let i = 1; i < 6; i++) {
            var dailyDt = new Date(data.daily[i].dt*1000);

            var dailyContainer = document.createElement('div');

            var dailyDate = document.createElement('h3');
            dailyDate.setAttribute("class", "inline-display");
            dailyDate.textContent = weekdays[dailyDt.getDay()] + " " + months[dailyDt.getMonth()] + " " + dailyDt.getDate() + ", " + dailyDt.getFullYear();
            
            var dailyIcon = document.createElement('img');
            dailyIcon.setAttribute("class", "daily-icon-style");
            var dailyIconCd = data.daily[i].weather[0].icon;
            var dailyIconUrl = "http://openweathermap.org/img/wn/" + dailyIconCd + "@2x.png";
            dailyIcon.src = dailyIconUrl;

            var dailyTemp = document.createElement('p');
            dailyTemp.textContent =  "Temp: " + data.daily[i].temp.day + "\u00B0" + "F";

            var dailyWind = document.createElement('p');
            dailyWind.textContent = "Wind: " + data.daily[i].wind_speed + " MPH";

            var dailyHumidity = document.createElement('p');
            dailyHumidity.textContent = "Humidity: " + data.daily[i].humidity + "%";

            dailyContainer.appendChild(dailyDate);
            dailyContainer.appendChild(dailyIcon);
            dailyContainer.appendChild(dailyTemp);
            dailyContainer.appendChild(dailyWind);
            dailyContainer.appendChild(dailyHumidity);

            forecastContainer.appendChild(dailyContainer);

            forecastContainer.setAttribute("style", "display:flex");
        }
    });
}

searchBtn.addEventListener("click", function() {
    handleCitySearch("inpt");
})

favoriteBtn.addEventListener("click", function(event) {
    handleCitySearch("btn", event);
})

