// UI Controller
const UICtrl = (function() {
  this.latitude = 0;
  this.longitude = 0;

  const UISelectors = {
    weatherDesc: '#weather-desc',
    cityName: '#city-name',
    weatherDetails: '#weather-details',
    nextDay: '.next-day',
    prevDay: '.prev-day',
    dateDisplay: '.weather-date',
    changeLocationSubmit: '#change-submit',
    longitudeInput: '#longitude-input',
    latitudeInput: '#latitude-input'
  }
  // Used by Date function
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  // Index is days from today (0 being today)
  setWeather = function(data, index) {
    console.log(data,index)
    const weatherDesc = document.querySelector(UISelectors.weatherDesc);
    const cityName = document.querySelector(UISelectors.cityName);
    const weatherDetails = document.querySelector(UISelectors.weatherDetails);
    const dateDisplay = document.querySelector(UISelectors.dateDisplay);
    const date = new Date();
    weatherDesc.innerHTML = `${data.weatherData.daily[index].weather[0].main}, <em>${data.weatherData.daily[index].temp.day}&deg;C</em>`
    cityName.innerHTML = `<b>${getLocationName(data.cityNameData.results[0].components)}</b>`
    weatherDetails.innerHTML = `
    <ul id="weather-details" class="list-group mt-4 mb-3 mx-3">
      <li class="list-group-item"><b>Wind: </b>${data.weatherData.daily[index].wind_speed}km/h, ${getWindDirection(data.weatherData.daily[index].wind_deg)}</li>
      <li class="list-group-item"><b>Air pressure: </b>${data.weatherData.daily[index].pressure}hPa</li>
      <li class="list-group-item"><b>Humidity: </b>${data.weatherData.daily[index].humidity}%</li>
    </ul>`
    dateDisplay.innerHTML = `${date.getDate() + index} ${months[date.getMonth()]} ${date.getFullYear()}`
  }

  // Searching through Open Cage API to find a name of the location
  getLocationName = function(components) {
    if (components.city) {
      return components.city;
    } else if (components.town) {
      return components.town;
    } else if (components.county) {
      return components.county;
    } else {
      return 'Unnamed location'
    }
  }

  // Fetches weather and location data and changes it in the UI
  changeDay = function(currDate, lat, lon) {
      WeatherCtrl.fetchWeatherData(lat, lon)
      .then(data => {
        UICtrl.setWeather(data, currDate);
      })
      .catch(err => console.log(err));}

  changeLocation = function(currDate) {
    const latitudeInput = document.querySelector(UISelectors.latitudeInput);
    const longitudeInput = document.querySelector(UISelectors.longitudeInput);
    latitude = latitudeInput.value;
    longitude = longitudeInput.value;
    this.longitude = longitude;
    this.latitude = latitude;
    console.log(currDate)
    // Check if empty
    if (latitude === '' || longitude === '') 
    {
      alert('Please enter correct data :(')
    } else {
      // Then check if values are correct
      if (latitude > 90 || latitude < -90 || longitude > 180 || longitude < -180 ) {
        latitude = parseFloat(latitude);
        longitude = parseFloat(longitude)
        alert('Please enter correct data :(')
      } else {
        changeDay(currDate, latitude, longitude);
        $('#change-location').modal('hide')
      }
    }
  }

  getWindDirection= function(degrees) {
      if (degrees < 23 || degrees > 337) {
        return 'N';
      } else if (degrees < 68){
        return 'NE';
      } else if (degrees < 113) {
        return 'E';
      } else if (degrees < 158) {
        return 'SE';
      } else if (degrees < 203) {
        return 'S';
      } else if (degrees < 248) {
        return 'SW';
      } else if (degrees < 293) {
        return 'W';
      } else {
        return 'NW';
      }}

  // Hides arrow buttons if not needed
  checkControlsShow = function(currDate) {
    const nextDayBtn = document.querySelector(UISelectors.nextDay);
    const prevDayBtn = document.querySelector(UISelectors.prevDay);
    if (currDate > 0 && currDate < 6) {
      nextDayBtn.style.display = 'block';
      prevDayBtn.style.display = 'block';
    } else if ( currDate == 0) {
      nextDayBtn.style.display = 'block';
      prevDayBtn.style.display = 'none';
    } else {
      nextDayBtn.style.display = 'none';
      prevDayBtn.style.display = 'block';
    }
  }

  // Public methods
  return {
    setWeather,
    UISelectors,
    changeDay,
    checkControlsShow,
    changeLocation
  }
}
)();

// Weather Controller
const WeatherCtrl = (function(){

  // Returns forecast and the city 
  fetchWeatherData = async function(lat = 50.195080, lon = 21.274691) {
      const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=metric&appid=e3c1466bbea248b4ca46251096afd03c`);
      const weatherData = await weatherResponse.json();
      const cityNameResponse = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=6028cfa1e7b84f39bb810f483553271a`);
      const cityNameData = await cityNameResponse.json();
      return {
        weatherData,
        cityNameData};
  }
  // Public methods
  return {
        fetchWeatherData
      }
})();


// App Controller
const App = (function(WeatherCtrl, UICtrl) {

  // currDate means days from today, 0 by default
  var currDate = 0
  loadEventListeners = function() {
    const UISelectors = UICtrl.UISelectors;
    const nextDayBtn = document.querySelector(UISelectors.nextDay);
    const prevDayBtn = document.querySelector(UISelectors.prevDay);
    const changeLocationSubmit = document.querySelector(UISelectors.changeLocationSubmit);
    nextDayBtn.addEventListener('click', (e) => {
      currDate++;
      UICtrl.changeDay(currDate, UICtrl.latitude, UICtrl.longitude);
      UICtrl.checkControlsShow(currDate);
      })

    prevDayBtn.addEventListener('click', (e) => {
      currDate--;
      UICtrl.changeDay(currDate, UICtrl.latitude, UICtrl.longitude);
      UICtrl.checkControlsShow(currDate);
    })

    changeLocationSubmit.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('klik')
      UICtrl.changeLocation(currDate);
    })

  }

  getUsersLocation = function() {
    navigator.geolocation.getCurrentPosition(setLocation)
  }

  setLocation = function(location) {
    UICtrl.changeDay(currDate, location.coords.latitude, location.coords.longitude);
  }
  

  init = function() {
    UICtrl.changeDay(currDate);
    getUsersLocation();
    UICtrl.checkControlsShow(currDate);
    loadEventListeners();
  }

  // Public methods
  return {
    init,
    currDate
  }
})(WeatherCtrl, UICtrl);

App.init();