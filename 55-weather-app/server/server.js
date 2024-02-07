const express = require('express');
const cors = require('cors');
const { forkJoin } = require('rxjs');
const { fetchCurrentWeather, fetchForecast, getDailyForecast } = require('./weatherService');

const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.get('/weather', (req, res) => {
  const { lat, lon, units } = req.query

  const currentWeather$ = fetchCurrentWeather(lat, lon, units);
  const forecast$ = fetchForecast(lat, lon, units);
  forkJoin([
    currentWeather$,
    forecast$
  ]).subscribe(
    ([current, forecast]) => {
      res.json({
        city: current.city,
        current: {
          ...current,
          precipitation: forecast[0].precipitation,
          city: undefined
        },
        daily: getDailyForecast(forecast, current.time),
        forecast,
      });
    },
    () => {
      res.sendStatus(500);
    }
  );
});

app.listen(3000, () => console.log('Server running on port 3000'));