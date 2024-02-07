const { from } = require('rxjs');
const { catchError, map } = require('rxjs/operators');
const axios = require('axios');
require('dotenv').config();

function fetchCurrentWeather(lat, lon, units) {
  return from(axios.get(
    'https://api.openweathermap.org/data/2.5/weather',
    {
      params: {
        lat,
        lon,
        appid: process.env.API_KEY,
        units: units
      }
    } 
  )).pipe(
    map(response => parseWeatherAndCityData(response.data)),
    catchError(error => {
      console.log(error);
      throw error;
    })
  );
}

function fetchForecast(lat, lon, units) {
  return from(axios.get(
    'https://api.openweathermap.org/data/2.5/forecast',
    {
      params: {
        lat,
        lon,
        appid: process.env.API_KEY,
        units: units
      }
    } 
  )).pipe(
    map(response => parseForecastData(response.data)),
    catchError(error => {
      console.log(error);
      throw error;
    })
  );
}

function getDailyForecast(forecast, time) {
  let currentDay = new Date(time);
  currentDay.setHours(0, 0, 0, 0);
  currentDay = currentDay.getTime();
  const currentHour = new Date(time).getHours();
  const selectedForecasts = {};

  forecast.forEach((f) => {
    let forecastDay = new Date(f.time);
    forecastDay.setHours(0, 0, 0, 0);
    forecastDay = forecastDay.getTime();
    const forecastHours = new Date(f.time).getHours();
    
    if (forecastDay > currentDay) {
      if (!selectedForecasts[forecastDay]) {
        selectedForecasts[forecastDay] = f;
      } else {
        const existingForecastHour = new Date(selectedForecasts[forecastDay].time).getHours();
        if (Math.abs(currentHour - forecastHours) < Math.abs(currentHour - existingForecastHour)) {
            selectedForecasts[forecastDay] = f;
        }
      }
    }
  });

  return Object.values(selectedForecasts);
};

parseWeatherData = (data) => {
  const { main, weather, wind, clouds, rain, snow, dt:time, dt_txt: timeText, pop: precipitation } = data;
  const { temp, feels_like: feelsLike, temp_min: tempMin, temp_max: tempMax, humidity } = main;
  const { description, main:status, icon } = weather[0];
  return {
    status,
    icon,
    description,
    temp,
    feelsLike,
    tempMin,
    tempMax,
    humidity,
    windSpeed: wind.speed,
    clouds: clouds.all,
    rain: rain,
    snow: snow,
    precipitation,
    time: time * 1000,
    timeText
  }
}

parseCityData = (data) => {
  const { name, coord: coords, sys: { country, sunrise, sunset } } = data;
  return {
    name,
    coords,
    country,
    sunrise,
    sunset
  }
}

parseWeatherAndCityData = (data) => {
  const weather = parseWeatherData(data);
  const city = parseCityData(data);
  return { ...weather, city };
}

parseForecastData = (data) => {
  const { list } = data;
  return (list || []).map(parseWeatherData);
}


module.exports = {
  fetchCurrentWeather,
  fetchForecast,
  getDailyForecast
};