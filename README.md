# 🌤 Nimbus — Personal Weather App

> A clean, feature-packed weather app built with pure HTML, CSS, and JavaScript. No frameworks. No bloat. Just weather.

**🔗 Live Demo → [nimbus-personal-weather-app.vercel.app](https://nimbus-personal-weather-app.vercel.app)**

---

## What is this?

Nimbus started as a simple weather app and grew into something I'm actually proud of. You can search any city in the world, save your favourites, toggle between °C and °F, check air quality, see the next 24 hours hour by hour — and the background literally changes based on the weather outside. Rain? You'll see raindrops. Snow? Snowflakes. It just feels alive.

And the best part — no API key setup headaches. Just open it and it works.

---

## Features

**The basics, done really well**
- Current temperature with feels-like, daily high/low
- Weather condition with animated emoji icon
- Country flag next to the city name
- One-click location access (or just search any city)

**Forecasts**
- Hourly forecast for the next 24 hours
- 5-day forecast with temperature range bars and rain probability

**The details that matter**
- Wind speed + animated compass showing actual wind direction
- Humidity, cloud cover, visibility, pressure
- Dew point, sea level pressure
- UV Index with a sliding bar and sun protection advice
- Sunrise & sunset times adjusted to the city's timezone

**Air Quality**
- Real-time AQI with a color-coded level (Good to Very Poor)
- Pollutant breakdown: PM2.5, PM10, NO₂, O₃

**Weather alerts**
- Automatic warning banner for thunderstorms, tornadoes, and heavy snow

**Your cities**
- Save up to 8 favourite cities
- Quick-switch chip strip so you can jump between them instantly
- Everything persists across page refreshes (localStorage)

**Personalisation**
- Dark / Light mode toggle (remembers your preference)
- °C / °F toggle
- Animated background that changes with the weather: rain, snow, stars, storm, and more

---

## Tech Stack

This is a vanilla project — no React, no build tools, no npm install required.

| Thing | What it does |
|---|---|
| HTML5 | Structure |
| CSS3 | Styling, animations, responsive layout, dark/light themes |
| JavaScript (ES6+) | Everything — API calls, rendering, state, events |
| OpenWeatherMap API | Live weather, forecast, and AQI data |
| Google Fonts | Outfit + JetBrains Mono |
| flagcdn.com | Country flags |
| localStorage | Saves favourites and theme preference |
| sessionStorage | Caches last known GPS coordinates |

---

## File Structure

```
nimbus/
├── index.html     ← All the markup
├── styles.css     ← All the styling + animations
└── script.js      ← All the logic
```

---

## Running it locally

### Step 1 — Get an API key

Sign up at [openweathermap.org](https://openweathermap.org/api) (it's free). Copy your key from the dashboard.

### Step 2 — Add it to script.js

Open `script.js` and paste your key at the top:

```js
const API_KEY = "your_api_key_here";
```

### Step 3 — Use a local server

You can't just double-click the HTML file — browsers block loading external CSS and JS that way. Two easy options:

**VS Code Live Server (easiest)**
1. Install the Live Server extension
2. Right-click `index.html` → Open with Live Server
3. Done. It opens at `http://127.0.0.1:5500`

**Python**
```bash
cd your-project-folder
python -m http.server 8000
# then open http://localhost:8000
```

---

## Deploying to Vercel

1. Push your 3 files to a GitHub repo
2. Go to [vercel.com](https://vercel.com) → Add New Project
3. Select your repo
4. Set Framework Preset to **Other**
5. Click Deploy

That's it. Vercel handles the rest and gives you a live URL in about 30 seconds.

---

## API Endpoints Used

All three are on the free OpenWeatherMap tier — no credit card needed.

| Endpoint | Purpose |
|---|---|
| `/data/2.5/weather` | Current conditions |
| `/data/2.5/forecast` | 5-day + hourly forecast |
| `/data/2.5/air_pollution` | AQI and pollutants |

---

## Responsive Design

Works on everything from a large desktop down to a small phone.

| Screen Size | Layout |
|---|---|
| Desktop (760px+) | Full layout, 4-column stats grid |
| Tablet (560–760px) | Adjusted spacing |
| Mobile (< 560px) | Stacked, 2-column stats |

---

## Troubleshooting

**CSS not loading** — Make sure all 3 files are in the same folder and you're opening via a local server, not by double-clicking.

**"City not found"** — Try the English name (e.g. "Mumbai" not "Bombay").

**Location not working** — Allow location permission in your browser settings, or just search manually.

**AQI not showing** — AQI needs valid coordinates. It won't appear if location access is denied.

**Blank page** — Open browser console (F12) and check for errors. Usually means the API key is missing or invalid.

---

## Privacy

Nothing is sent anywhere except OpenWeatherMap for weather data. Your location coordinates only live in `sessionStorage` (gone when you close the tab) and your favourite cities live in `localStorage` (gone when you clear your browser data). No tracking, no analytics, no backend.

---

*Built with vanilla HTML, CSS & JS — because you don't always need a framework.*