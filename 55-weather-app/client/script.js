import axios from 'axios';
import { format } from 'date-fns';

navigator.geolocation.getCurrentPosition(
  onPositionReceived,
  onPositionError
)

function onPositionReceived({ coords }) {
  const lat = coords.latitude;
  const lon = coords.longitude;
  const weatherAPI = 'http://localhost:3000/weather';
  axios.get(weatherAPI, {
    params: { lat, lon, units: 'imperial' }
  })
    .then(renderWeather)
    .catch(onWeatherDataError)
}

function onPositionError() {
  alert('Error getting your location. Please allow us to use your location and refresh the page.')
}

function onWeatherDataError(err) {
  console.error(err);
  alert('Error getting weather data. Please refresh the page.')
}

function renderWeather({data: { city, current, daily, forecast }}) {
  document.body.classList.remove('blurred');

  renderCurrentWeather(city, current);
  renderDailyWeather(daily)
  renderForecast(forecast.slice(0, 12));
}

function renderCurrentWeather(city, current) {
  document.querySelector('[data-current-icon]').src = getIconUrl(current.icon, true);
  setValue('[data-current-temp]', current.temp);
  setValue('[data-current-description]', current.description);

  setValue('[data-current-high]', current.tempMax);
  setValue('[data-current-fl-high]', current.feelsLike);
  setValue('[data-current-wind]', current.windSpeed);
  setValue('[data-current-low]', current.tempMin);
  setValue('[data-current-fl-low]', current.feelsLike);
  setValue('[data-current-precipitation]', current.precipitation);
}

function renderDailyWeather(daily = []) {
  const daySection = document.querySelector('[data-day-section]');
  const dayCardTemplate = document.getElementById('day-card-template');

  daySection.innerHTML = '';
  daily.forEach(day => {
    const dayCard = dayCardTemplate.content.cloneNode(true);
    dayCard.querySelector('[data-day-icon]').src = getIconUrl(day.icon);
    setValue('[data-day-name]', formatDay(day.time), dayCard);
    setValue('[data-day-temp]', day.temp, dayCard);
    daySection.appendChild(dayCard);
  });
}

function renderForecast(forecast = []) {
  const hourlySection = document.querySelector('[data-hour-section]');
  const hourlyCardTemplate = document.getElementById('hour-row-template');

  hourlySection.innerHTML = '';
  forecast.forEach(hour => {
    const hourCard = hourlyCardTemplate.content.cloneNode(true);
    hourCard.querySelector('[data-hour-icon]').src = getIconUrl(hour.icon);
    setValue('[data-hour-name]', formatDay(hour.time), hourCard);
    setValue('[data-hour-time]', formatTime(hour.time), hourCard);
    setValue('[data-hour-temp]', hour.temp, hourCard);
    setValue('[data-hour-fl-temp]', hour.feelsLike, hourCard);
    setValue('[data-hour-wind]', hour.windSpeed, hourCard);
    setValue('[data-hour-precipitation]', hour.precipitation, hourCard);
    hourlySection.appendChild(hourCard);
  });
}

function setValue(selector, value, parent = document) {
  parent.querySelector(selector).textContent = value;
}

function getIconUrl(icon, large = false) {
  const size = large ? '@2x' : '';
  return `http://openweathermap.org/img/wn/${icon}${size}.png`;
}

function formatDay(timestamp) {
  return format(new Date(timestamp), 'eeee');
}

function formatTime(timestamp) {
  return format(new Date(timestamp), 'ha');
}
