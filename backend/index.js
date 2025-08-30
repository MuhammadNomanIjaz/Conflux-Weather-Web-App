import axios from "axios";

// Function to fetch coordinates from city name
async function getCoordinates(city) {
  try {
    const geoRes = await axios.get(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        city
      )}&count=1`
    );
    if (!geoRes.data.results || geoRes.data.results.length === 0) return null;

    const { latitude, longitude, name } = geoRes.data.results[0];
    return { latitude, longitude, name };
  } catch (err) {
    console.error("❌ Geocoding error:", err.message);
    return null;
  }
}

// Vercel API handler
export default async function handler(req, res) {
  // ✅ Use req.query safely (works in Vercel)
  const { city, lat, lon } = req.query || {};

  let latitude, longitude, name;

  if (lat && lon) {
    // If geolocation is provided
    latitude = parseFloat(lat);
    longitude = parseFloat(lon);
    name = "Your Location";
  } else if (city) {
    // If city is provided
    const location = await getCoordinates(city);
    if (!location) return res.status(404).json({ error: "City not found" });
    ({ latitude, longitude, name } = location);
  } else {
    return res
      .status(400)
      .json({ error: "City name or coordinates are required" });
  }

  try {
    // ✅ Weather API request
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=temperature_2m,precipitation,weathercode,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`;

    const weatherRes = await axios.get(url);
    const data = weatherRes.data;

    // ✅ Format API response
    const weatherData = {
      city: name,
      current: {
        temperature: data.current_weather.temperature,
        wind_speed: data.current_weather.windspeed,
        weather_code: data.current_weather.weathercode,
        time: data.current_weather.time,
      },
      hourly: data.hourly.time.map((t, i) => ({
        time: t,
        temperature: data.hourly.temperature_2m[i],
        precipitation: data.hourly.precipitation[i],
        weather_code: data.hourly.weathercode[i],
        wind_speed: data.hourly.wind_speed_10m[i],
      })),
      daily: data.daily.time.map((t, i) => ({
        date: t,
        temp_max: data.daily.temperature_2m_max[i],
        temp_min: data.daily.temperature_2m_min[i],
        weather_code: data.daily.weathercode[i],
      })),
    };

    return res.status(200).json(weatherData);
  } catch (err) {
    console.error("❌ Weather API error:", err.message);
    return res
      .status(500)
      .json({ error: "Failed to fetch weather data from API" });
  }
}
