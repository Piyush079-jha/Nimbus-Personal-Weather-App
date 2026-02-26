<<<<<<< HEAD
# 🌤 Nimbus — Personal Weather App

A beautiful, feature-rich personal weather app built with vanilla HTML, CSS, and JavaScript. Powered by the OpenWeatherMap API with no frameworks or build tools required.

---

## 📸 Preview

> Search any city worldwide and get instant weather data with animated backgrounds that change based on real conditions.

---

## 🚀 Features

### 🌡 Current Weather
- Live temperature with **°C / °F toggle**
- Feels like temperature, daily High / Low
- Weather condition with animated emoji icon
- Country flag display

### 📅 Forecasts
- **Hourly forecast** — next 24 hours (3-hour intervals)
- **5-day forecast** — with temperature range bar, rain probability, and condition description

### 🌬 Detailed Conditions
- Wind speed & animated compass direction
- Humidity, cloud cover, visibility
- Atmospheric pressure & sea level pressure
- Dew point (calculated via Magnus formula)
- UV Index with sliding indicator and sun protection advice
- Sunrise & Sunset times (localised to city timezone)

### 💧 Rain Chance Bar
- Animated bar showing today's maximum precipitation probability

### 🌫 Air Quality Index (AQI)
- Real-time AQI with color-coded level (Good → Very Poor)
- Pollutant breakdown: PM2.5, PM10, NO₂, O₃

### 🚨 Weather Alerts
- Automatic alert banner for severe conditions:
  - ⛈ Thunderstorms
  - 🌪 Tornadoes
  - ❄️ Heavy Snow

### ⭐ Favourite Cities
- Save up to 8 favourite cities
- Quick-switch chip strip for instant access
- Persisted in `localStorage` — survives page refresh

### 🎨 Animated Backgrounds
- Dynamic background changes based on weather condition:
  - ☀️ Clear day → Deep blue sky with drifting clouds
  - 🌙 Clear night → Dark starfield with twinkling stars
  - 🌧 Rain → Animated falling raindrops
  - ❄️ Snow → Floating snowflakes
  - ⛈ Thunder → Dark storm with lightning flashes
  - ☁️ Cloudy / Fog → Muted grey tones

### 🌙 Dark / Light Mode
- Toggle between dark and light themes
- Preference saved in `localStorage`

### 📍 Geolocation
- One-click "Allow Location" for instant local weather
- Last known coordinates cached in `sessionStorage`

---

## 📁 File Structure

```
weather-app/
├── index.html      # App structure & layout
├── styles.css      # All styles, themes, animations
└── script.js       # All logic — API, render, state, events
```

---

## ⚙️ Setup & Usage

### 1. Get a Free API Key
1. Go to [openweathermap.org](https://openweathermap.org/api)
2. Sign up for a free account
3. Copy your API key from the dashboard

### 2. Add Your API Key
Open `script.js` and replace the key on line 1:
```js
const API_KEY = "your_api_key_here";
```

### 3. Run the App
You **must** use a local server (browsers block external files when opening HTML directly). Two easy options:

**Option A — VS Code Live Server (recommended)**
1. Install the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension
2. Right-click `index.html` → **Open with Live Server**
3. Opens at `http://127.0.0.1:5500`

**Option B — Python**
```bash
cd your-project-folder
python -m http.server 8000
# Open http://localhost:8000
```

---

## 🔑 API Reference

This app uses three **OpenWeatherMap** endpoints:

| Endpoint | Used For |
|---|---|
| `/data/2.5/weather` | Current weather (temp, wind, humidity…) |
| `/data/2.5/forecast` | 5-day / hourly forecast (3-hour intervals) |
| `/data/2.5/air_pollution` | Air Quality Index + pollutants |

All endpoints are on the **free tier** — no credit card needed.

---

## 🛠 Tech Stack

| Technology | Purpose |
|---|---|
| HTML5 | App structure & semantic markup |
| CSS3 | Styling, animations, dark/light themes, responsive layout |
| Vanilla JavaScript (ES6+) | All app logic, API calls, DOM rendering |
| OpenWeatherMap API | Live weather data |
| Google Fonts | Outfit + JetBrains Mono typefaces |
| flagcdn.com | Country flag images |
| localStorage | Favourites & theme preference |
| sessionStorage | Last known location coordinates |

---

## 📱 Responsive Design

The app is fully responsive across all screen sizes:

| Screen | Layout |
|---|---|
| Desktop (760px+) | Full layout, 4-column stats grid, 2-column details |
| Tablet (560–760px) | Adjusted spacing and font sizes |
| Mobile (< 560px) | Stacked layout, 2-column stats, single-column details |

---

## 🔒 Privacy

- No user data is sent to any server other than OpenWeatherMap
- Location coordinates are stored **only in your browser** (`sessionStorage`) and cleared when the tab is closed
- Favourite cities are stored **only in your browser** (`localStorage`)

---

## 🐛 Common Issues

| Problem | Fix |
|---|---|
| CSS not loading | Make sure all 3 files are in the **same folder** and you're using a local server, not opening the file directly |
| "City not found" error | Check spelling — try the English city name (e.g. "Mumbai" not "Bombay") |
| Location not working | Allow location permission in your browser, or use the search instead |
| AQI not showing | AQI requires a valid location — it won't appear if coordinates are unavailable |
| Blank page | Check browser console (F12) for errors — likely an invalid API key |

---

## 📄 License

This project is open source and free to use for personal and educational purposes.

---

*Built with ❤️ using vanilla web technologies — no frameworks, no build tools, just HTML, CSS & JS.*
=======
# Nimbus-Personal-Weather-App
>>>>>>> 48787405d64d5c1a373aef053411041bc4fff9e5
