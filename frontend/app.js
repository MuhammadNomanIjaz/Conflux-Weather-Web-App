// ======= API Base URL (Auto-detect for PC & Mobile) =======
const API_BASE = `http://${window.location.hostname}:5000/api/weather`;

// ======= Weather Fetch Functions =======
function getWeather() {
  const city = document.getElementById('cityInput').value;
  if (!city) return showNotification("Please enter a city");
  fetchWeatherData(`${API_BASE}?city=${encodeURIComponent(city)}`);
}

function getWeatherByLocation(lat, lon) {
  fetchWeatherData(`${API_BASE}?lat=${lat}&lon=${lon}`);
}

function fetchWeatherData(url) {
  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (data.error) return showNotification(data.error);

      document.getElementById("cityName").innerText = data.city;
      document.getElementById("currentTemp").innerText = data.current.temperature + "°";
      document.getElementById("condition").innerText = weatherCodeToText(data.current.weather_code);
      document.getElementById("rain").innerText = "Chance of rain: " + data.hourly[0].precipitation + "%";
      document.getElementById("currentIcon").src = weatherCodeToIcon(data.current.weather_code);

      document.getElementById("feelsLike").innerText = data.current.temperature + "°";
      document.getElementById("humidity").innerText = "--%";
      document.getElementById("wind").innerText = data.current.wind_speed + " km/h";
      document.getElementById("uvi").innerText = "--";

      const hourly = document.getElementById("hourlyForecast");
      hourly.innerHTML = "";
      data.hourly.slice(0, 6).forEach(h => {
        hourly.innerHTML += `
          <div class="hour-card">
            <p>${new Date(h.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            <img src="${weatherCodeToIcon(h.weather_code)}" alt="Weather Icon" />
            <p>${h.temperature}°</p>
          </div>`;
      });

      const daily = document.getElementById("dailyForecast");
      daily.innerHTML = "";
      data.daily.forEach(d => {
        daily.innerHTML += `
          <div class="day-card">
            <p>${new Date(d.date).toLocaleDateString(undefined, { weekday: 'short' })}</p>
            <img src="${weatherCodeToIcon(d.weather_code)}" alt="Weather Icon" />
            <p>${d.temp_max}° / ${d.temp_min}°</p>
          </div>`;
      });
    })
    .catch(() => showNotification("Weather data not found."));
}

// ======= Notification Banner =======
function showNotification(message, duration = 3000) {
  const notification = document.getElementById("notification");
  notification.innerText = message;
  notification.style.display = "block";
  setTimeout(() => { notification.style.display = "none"; }, duration);
}

// ======= Geolocation =======
const locationBtn = document.getElementById("locationBtn");
locationBtn.addEventListener("click", () => {
  if (!navigator.geolocation) return showNotification("Geolocation not supported.");

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      getWeatherByLocation(latitude, longitude);
    },
    (error) => {
      switch(error.code) {
        case error.PERMISSION_DENIED:
          showNotification("Location access denied. Please allow location.");
          break;
        case error.POSITION_UNAVAILABLE:
          showNotification("Location information is unavailable.");
          break;
        case error.TIMEOUT:
          showNotification("Location request timed out.");
          break;
        default:
          showNotification("Unknown error fetching location.");
          break;
      }
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
});

// ======= Sidebar Sections =======
const sections = {
  Weather: document.querySelector('.current-weather'),
  Cities: document.createElement('div'),
  Map: document.createElement('div'),
  Settings: document.createElement('div')
};

sections.Cities.innerHTML = `<h2>Cities</h2><p>Search and manage your favorite cities here.</p>`;
sections.Map.innerHTML = `<h2>Map</h2><p>Interactive map will be displayed here.</p>`;
sections.Settings.innerHTML = `<h2>Settings</h2><p>Adjust your dashboard settings here.</p>`;

sections.Cities.id = "citiesSection";
sections.Map.id = "mapSection";
sections.Settings.id = "settingsSection";

sections.Cities.style.display = 'none';
sections.Map.style.display = 'none';
sections.Settings.style.display = 'none';

const content = document.querySelector('.content');
content.appendChild(sections.Cities);
content.appendChild(sections.Map);
content.appendChild(sections.Settings);

// ======= Section Switching =======
function showSection(name) {
  Object.keys(sections).forEach(key => sections[key].style.display = key === name ? 'block' : 'none');
  document.querySelectorAll('.sidebar nav ul li').forEach(item => {
    item.classList.toggle('active', item.innerText === name);
  });
}

document.querySelectorAll('.sidebar nav ul li').forEach(item => {
  item.addEventListener('click', () => showSection(item.innerText));
});

// Default section
showSection('Weather');

// ======= Weather Icons/Text Mapping =======
function weatherCodeToIcon(code) {
  switch (code) {
    case 0: return "https://cdn-icons-png.flaticon.com/512/869/869869.png";
    case 1: case 2: case 3: return "https://cdn-icons-png.flaticon.com/512/1163/1163624.png";
    case 45: case 48: return "https://cdn-icons-png.flaticon.com/512/4005/4005900.png";
    case 51: case 53: case 55: return "https://cdn-icons-png.flaticon.com/512/414/414974.png";
    case 61: case 63: case 65: return "https://cdn-icons-png.flaticon.com/512/1163/1163620.png";
    case 71: case 73: case 75: return "https://cdn-icons-png.flaticon.com/512/642/642102.png";
    case 80: case 81: case 82: return "https://cdn-icons-png.flaticon.com/512/1163/1163619.png";
    case 95: case 96: case 99: return "https://cdn-icons-png.flaticon.com/512/1146/1146869.png";
    default: return "https://cdn-icons-png.flaticon.com/512/1163/1163621.png";
  }
}

function weatherCodeToText(code) {
  switch (code) {
    case 0: return "Clear sky";
    case 1: return "Mainly clear";
    case 2: return "Partly cloudy";
    case 3: return "Overcast";
    case 45: return "Fog";
    case 48: return "Depositing rime fog";
    case 51: case 53: case 55: return "Drizzle";
    case 61: case 63: case 65: return "Rain";
    case 71: case 73: case 75: return "Snow";
    case 80: case 81: case 82: return "Rain showers";
    case 95: case 96: case 99: return "Thunderstorm";
    default: return "Unknown";
  }
}
