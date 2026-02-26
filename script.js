/* ═══════════════════════════════════════════════
   script.js — Nimbus Weather App
   All logic: state, API, render, theme, favs, bg
═══════════════════════════════════════════════ */

const API_KEY = "d1845658f92b31c64bd94f06f7188c9c";
const BASE_URL = "https://api.openweathermap.org/data/2.5";
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const AQI_LEVELS = [
  null,
  { label:"Good",      color:"#22c55e", bg:"rgba(34,197,94,0.15)",   pct:15 },
  { label:"Fair",      color:"#84cc16", bg:"rgba(132,204,22,0.15)",  pct:30 },
  { label:"Moderate",  color:"#eab308", bg:"rgba(234,179,8,0.15)",   pct:55 },
  { label:"Poor",      color:"#f97316", bg:"rgba(249,115,22,0.15)",  pct:75 },
  { label:"Very Poor", color:"#ef4444", bg:"rgba(239,68,68,0.15)",   pct:95 },
];
const ALERTS = {
  thunderstorm: { range:[200,300], title:"Thunderstorm Warning",  desc: c=>`Thunderstorm activity near ${c}. Stay indoors.` },
  tornado:      { ids:[781],       title:"Tornado Warning",       desc: c=>`Tornado conditions possible near ${c}. Seek shelter!` },
  heavySnow:    { range:[602,620], title:"Heavy Snow Advisory",   desc: c=>`Heavy snowfall expected near ${c}. Travel with caution.` },
};

// ── State ──────────────────────────────────────
const State = { unit: "metric", currentCity: null };

// ── DOM helpers ────────────────────────────────
const $ = id => document.getElementById(id);

// ── Utility Functions ──────────────────────────
function condToEmoji(id, icon = "") {
  const day = icon.endsWith("d");
  if (id >= 200 && id < 300) return "⛈";
  if (id >= 300 && id < 400) return "🌦";
  if (id >= 500 && id < 600) return id === 511 ? "🌨" : "🌧";
  if (id >= 600 && id < 700) return "❄️";
  if (id >= 700 && id < 800) return ({701:"🌫",711:"🌫",721:"🌫",731:"🌪",741:"🌫",751:"🌫",761:"🌫",762:"🌋",771:"💨",781:"🌪"})[id] || "🌫";
  if (id === 800) return day ? "☀️" : "🌙";
  if (id === 801) return "🌤";
  if (id === 802) return "⛅";
  if (id >= 803) return "☁️";
  return "🌡";
}

function degToDir(d) {
  return ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"][Math.round(d/22.5)%16];
}

function fmtTime(unix, tz = 0) {
  const d = new Date((unix + tz) * 1000);
  const h = d.getUTCHours(), m = String(d.getUTCMinutes()).padStart(2,"0");
  return `${h%12||12}:${m} ${h>=12?"PM":"AM"}`;
}

function fmtHour(unix, tz = 0) {
  const d = new Date((unix + tz) * 1000), h = d.getUTCHours();
  return `${h%12||12}${h>=12?"pm":"am"}`;
}

function fmtDay(unix, tz = 0) {
  return DAYS[new Date((unix + tz) * 1000).getUTCDay()];
}

function isSameDay(u1, u2, tz = 0) {
  const a = new Date((u1+tz)*1000), b = new Date((u2+tz)*1000);
  return a.getUTCFullYear()===b.getUTCFullYear() && a.getUTCMonth()===b.getUTCMonth() && a.getUTCDate()===b.getUTCDate();
}

function uvAdvice(uv) {
  if (uv <= 2) return "No protection needed";
  if (uv <= 5) return "Wear sunscreen SPF 30+";
  if (uv <= 7) return "Sunscreen + hat advised";
  if (uv <= 10) return "Avoid midday sun";
  return "Stay indoors if possible";
}

// ── UI State ───────────────────────────────────
function showLoader() {
  $("grantPanel").classList.remove("visible");
  $("loaderPanel").classList.add("visible");
  $("weatherMain").classList.remove("visible");
}
function showGrant() {
  $("grantPanel").classList.add("visible");
  $("loaderPanel").classList.remove("visible");
  $("weatherMain").classList.remove("visible");
}
function showWeather() {
  $("grantPanel").classList.remove("visible");
  $("loaderPanel").classList.remove("visible");
  $("weatherMain").classList.add("visible");
}
function showError(msg) {
  $("errorText").textContent = msg;
  $("errorToast").classList.add("visible");
  setTimeout(() => $("errorToast").classList.remove("visible"), 5000);
}

// ── Theme ──────────────────────────────────────
let isDark = localStorage.getItem("nimbus-theme") !== "light";

function applyTheme() {
  document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
  $("themeBtn").textContent = isDark ? "☀️" : "🌙";
  localStorage.setItem("nimbus-theme", isDark ? "dark" : "light");
}

$("themeBtn").addEventListener("click", () => { isDark = !isDark; applyTheme(); });

// ── Unit Toggle ────────────────────────────────
$("celsiusBtn").addEventListener("click", () => {
  if (State.unit === "metric") return;
  State.unit = "metric";
  $("celsiusBtn").classList.add("active");
  $("fahrenheitBtn").classList.remove("active");
  if (State.currentCity) fetchWeather(State.currentCity);
});
$("fahrenheitBtn").addEventListener("click", () => {
  if (State.unit === "imperial") return;
  State.unit = "imperial";
  $("fahrenheitBtn").classList.add("active");
  $("celsiusBtn").classList.remove("active");
  if (State.currentCity) fetchWeather(State.currentCity);
});

// ── Favourites ─────────────────────────────────
function getFavs() { return JSON.parse(localStorage.getItem("nimbus-favs") || "[]"); }
function saveFavs(f) { localStorage.setItem("nimbus-favs", JSON.stringify(f)); }

function addFav(city) {
  const favs = getFavs();
  if (!favs.includes(city) && favs.length < 8) { favs.unshift(city); saveFavs(favs); renderFavs(); }
}
function removeFav(city) { saveFavs(getFavs().filter(c => c !== city)); renderFavs(); updateFavBtn(); }

function updateFavBtn() {
  $("favBtn").textContent = (State.currentCity && getFavs().includes(State.currentCity)) ? "❤️" : "🤍";
}

function renderFavs() {
  const strip = $("favsStrip");
  strip.innerHTML = "";
  getFavs().forEach(city => {
    const chip = document.createElement("div");
    chip.className = "fav-chip";
    chip.innerHTML = `<span>⭐</span><span>${city}</span><span class="fav-remove" data-city="${city}">✕</span>`;
    chip.addEventListener("click", e => {
      e.target.classList.contains("fav-remove") ? removeFav(e.target.dataset.city) : fetchWeather(city);
    });
    strip.appendChild(chip);
  });
}

$("favBtn").addEventListener("click", () => {
  if (!State.currentCity) return;
  getFavs().includes(State.currentCity) ? removeFav(State.currentCity) : addFav(State.currentCity);
  updateFavBtn();
});

// ── Animated Background ────────────────────────
function setBackground(condition, isDay) {
  const bg = $("bgScene");
  const c = condition.toLowerCase();
  let gradient = "", particles = [];

  if (c.includes("thunder")) {
    gradient = isDay ? "linear-gradient(160deg,#1a1a2e,#2d1b3d,#16213e)" : "linear-gradient(160deg,#0d0d1a,#1a0d26,#0a0d16)";
    particles = mkParticles("💧", 15, 12, 0.3, [1.0, 1.8]);
  } else if (c.includes("snow")) {
    gradient = "linear-gradient(160deg,#1a2a3a,#2a3a50,#1a2030)";
    particles = mkParticles("❄️", 20, 14, 0.4, [2.5, 4.5], true);
  } else if (c.includes("rain") || c.includes("drizzle")) {
    gradient = isDay ? "linear-gradient(160deg,#2a3a4a,#3a4a5a,#1a2a3a)" : "linear-gradient(160deg,#0a1020,#151e2d,#0a0f18)";
    particles = mkParticles("│", 28, 10, 0.12, [0.7, 1.1]);
  } else if (c.includes("cloud") || c.includes("mist") || c.includes("fog")) {
    gradient = isDay ? "linear-gradient(160deg,#4a5a6a,#5a6a7a,#3a4a5a)" : "linear-gradient(160deg,#151e2a,#1e2a38,#0f1620)";
  } else if (c.includes("clear")) {
    if (isDay) {
      gradient = "linear-gradient(160deg,#0a2a5a,#1a4a8a,#0a1a3a)";
      particles = mkParticles("☁️", 5, 30, 2.5, [10, 15]);
    } else {
      gradient = "linear-gradient(160deg,#050a18,#0a1228,#030710)";
      particles = mkParticles("✦", 12, 12, 0.9, [5, 9]);
    }
  } else {
    gradient = isDay ? "linear-gradient(160deg,#0a2040,#1a3a6a,#0a1a30)" : "linear-gradient(160deg,#050a18,#0a1228,#030710)";
  }

  bg.style.background = gradient;
  bg.innerHTML = "";
  particles.forEach(p => {
    const el = document.createElement("div");
    el.className = "weather-particle";
    el.textContent = p.char;
    el.style.cssText = `left:${Math.random()*100}%;font-size:${p.size}px;animation-name:${p.snow?"snowfall":"fall"};animation-duration:${p.dur}s;animation-delay:${p.delay}s;animation-iteration-count:infinite;opacity:0;`;
    bg.appendChild(el);
  });
}

function mkParticles(char, count, size, delayStep, durRange, snow = false) {
  return Array.from({length: count}, (_, i) => ({
    char, size, snow,
    delay: i * delayStep,
    dur: durRange[0] + Math.random() * (durRange[1] - durRange[0]),
  }));
}

// ── API ────────────────────────────────────────
async function fetchWeather(query) {
  showLoader();
  $("errorToast").classList.remove("visible");

  const isCoords = typeof query === "object";
  const urlParam = isCoords ? `lat=${query.lat}&lon=${query.lon}` : `q=${encodeURIComponent(query)}`;

  try {
    const [curRes, fcastRes] = await Promise.all([
      fetch(`${BASE_URL}/weather?${urlParam}&appid=${API_KEY}&units=${State.unit}`),
      fetch(`${BASE_URL}/forecast?${urlParam}&appid=${API_KEY}&units=${State.unit}`),
    ]);

    if (!curRes.ok) { const e = await curRes.json(); throw new Error(e.message || "City not found."); }

    const [cur, fcast] = await Promise.all([curRes.json(), fcastRes.json()]);

    let aqiData = null;
    try {
      const aqiRes = await fetch(`${BASE_URL}/air_pollution?lat=${cur.coord.lat}&lon=${cur.coord.lon}&appid=${API_KEY}`);
      if (aqiRes.ok) aqiData = await aqiRes.json();
    } catch (_) {}

    State.currentCity = cur.name;
    renderWeather(cur, fcast, aqiData);
    setBackground(cur.weather[0].description, cur.weather[0].icon.endsWith("d"));
    updateFavBtn();
    showWeather();

  } catch (err) {
    showError(err.message);
    showGrant();
  }
}

// ── Render ─────────────────────────────────────
function renderWeather(cur, fcast, aqiData) {
  const tz  = cur.timezone;
  const sym = State.unit === "metric" ? "°C" : "°F";
  const spd = State.unit === "metric" ? "m/s" : "mph";

  // Hero
  $("cityName").textContent   = cur.name;
  $("flagImg").src            = `https://flagcdn.com/48x36/${cur.sys.country.toLowerCase()}.png`;
  $("flagImg").alt            = cur.sys.country;
  $("cityCoords").textContent = `${cur.coord.lat.toFixed(2)}°N  ${cur.coord.lon.toFixed(2)}°E`;
  $("mainTemp").textContent   = `${Math.round(cur.main.temp)}${sym}`;
  $("feelsLike").textContent  = `${Math.round(cur.main.feels_like)}${sym}`;
  $("tempMax").textContent    = `${Math.round(cur.main.temp_max)}${sym}`;
  $("tempMin").textContent    = `${Math.round(cur.main.temp_min)}${sym}`;
  $("condIcon").textContent   = condToEmoji(cur.weather[0].id, cur.weather[0].icon);
  $("condLabel").textContent  = cur.weather[0].description;

  // Rain bar
  const nowUnix   = Math.floor(Date.now() / 1000);
  const todayItems = fcast.list.filter(i => isSameDay(i.dt, nowUnix, tz));
  const maxPop    = todayItems.length ? Math.max(...todayItems.map(i => i.pop || 0)) : 0;
  const rainPct   = Math.round(maxPop * 100);
  $("rainPct").textContent = `${rainPct}%`;
  setTimeout(() => { $("rainFill").style.width = `${rainPct}%`; }, 100);

  // Stats
  $("sWind").textContent      = `${cur.wind.speed} ${spd}`;
  $("sHumidity").textContent  = `${cur.main.humidity}%`;
  $("sClouds").textContent    = `${cur.clouds.all}%`;
  $("sVisibility").textContent = cur.visibility ? `${(cur.visibility/1000).toFixed(1)} km` : "N/A";

  // AQI
  const aqiCard = $("aqiCard");
  if (aqiData && aqiData.list && aqiData.list[0]) {
    aqiCard.classList.add("visible");
    const aqi   = aqiData.list[0].main.aqi;
    const level = AQI_LEVELS[aqi];
    const comp  = aqiData.list[0].components;
    $("aqiBadge").textContent           = level.label;
    $("aqiBadge").style.cssText         = `background:${level.bg};color:${level.color}`;
    $("aqiNum").textContent             = `AQI ${aqi}`;
    $("aqiBarFill").style.cssText       = `width:${level.pct}%;background:${level.color}`;
    $("aqiInfo").innerHTML = [
      ["PM2.5", comp.pm2_5?.toFixed(1)],
      ["PM10",  comp.pm10?.toFixed(1)],
      ["NO₂",   comp.no2?.toFixed(1)],
      ["O₃",    comp.o3?.toFixed(1)],
    ].map(([n,v]) => `<div class="aqi-pollutant"><div class="poll-name">${n}</div><div class="poll-val">${v||"—"}</div></div>`).join("");
  } else {
    aqiCard.classList.remove("visible");
  }

  // Hourly
  const hourlyRow = $("hourlyRow");
  hourlyRow.innerHTML = "";
  fcast.list.slice(0, 8).forEach((item, i) => {
    const card = document.createElement("div");
    card.className = `hour-card${i === 0 ? " now" : ""}`;
    card.innerHTML = `
      <div class="hour-time">${i === 0 ? "Now" : fmtHour(item.dt, tz)}</div>
      <span class="hour-icon">${condToEmoji(item.weather[0].id, item.weather[0].icon)}</span>
      <div class="hour-temp">${Math.round(item.main.temp)}${sym}</div>
      <div class="hour-rain">💧${Math.round((item.pop || 0) * 100)}%</div>
    `;
    hourlyRow.appendChild(card);
  });

  // 5-Day Forecast
  const forecastList = $("forecastList");
  forecastList.innerHTML = "";
  const dayMap = {};
  fcast.list.forEach(item => {
    const d   = new Date((item.dt + tz) * 1000);
    const key = `${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}`;
    if (!dayMap[key]) dayMap[key] = [];
    dayMap[key].push(item);
  });
  const allTemps  = fcast.list.map(i => i.main.temp);
  const globalMin = Math.min(...allTemps);
  const globalMax = Math.max(...allTemps);
  Object.entries(dayMap).slice(0, 5).forEach(([, items], idx) => {
    const hi   = Math.round(Math.max(...items.map(i => i.main.temp_max || i.main.temp)));
    const lo   = Math.round(Math.min(...items.map(i => i.main.temp_min || i.main.temp)));
    const pop  = Math.round(Math.max(...items.map(i => i.pop || 0)) * 100);
    const noon = items.find(i => { const h = new Date((i.dt + tz)*1000).getUTCHours(); return h >= 11 && h <= 13; }) || items[Math.floor(items.length / 2)];
    const pct  = globalMax > globalMin ? ((hi - globalMin) / (globalMax - globalMin)) * 100 : 50;
    const label = idx === 0 ? "Today" : fmtDay(items[0].dt, tz);
    const row  = document.createElement("div");
    row.className = "fc-row";
    row.innerHTML = `
      <div class="fc-day">${label}</div>
      <div class="fc-icon-desc">
        <span class="fc-emoji">${condToEmoji(noon.weather[0].id, noon.weather[0].icon)}</span>
        <span class="fc-desc">${noon.weather[0].description}</span>
      </div>
      ${pop > 0 ? `<span class="fc-rain-pill">💧${pop}%</span>` : ""}
      <div class="fc-temps">
        <span class="fc-hi">${hi}°</span>
        <span class="fc-lo">${lo}°</span>
      </div>
      <div class="fc-bar-wrap">
        <div class="fc-temp-bar"><div class="fc-temp-fill" style="width:${pct}%"></div></div>
      </div>
    `;
    forecastList.appendChild(row);
  });

  // Detailed Conditions
  $("dPressure").textContent  = `${cur.main.pressure} hPa`;
  $("dSeaLevel").textContent  = cur.main.sea_level ? `${cur.main.sea_level} hPa` : `${cur.main.pressure} hPa`;
  $("dSunrise").textContent   = `🌅 ${fmtTime(cur.sys.sunrise, tz)}`;
  $("dSunset").textContent    = `🌇 ${fmtTime(cur.sys.sunset, tz)}`;

  const dewC = cur.main.temp - ((100 - cur.main.humidity) / 5);
  $("dDew").textContent = State.unit === "metric" ? `${dewC.toFixed(1)}°C` : `${(dewC * 9/5 + 32).toFixed(1)}°F`;

  const uvApprox = Math.round((1 - cur.clouds.all / 100) * 8 * (cur.weather[0].icon.endsWith("d") ? 1 : 0));
  $("dUV").textContent      = uvApprox;
  $("dUVAdvice").textContent = uvAdvice(uvApprox);
  setTimeout(() => { $("uvDot").style.left = `${Math.min(uvApprox / 11 * 100, 100)}%`; }, 300);

  const windDeg = cur.wind.deg || 0;
  $("dWindDir").textContent   = degToDir(windDeg);
  $("dWindSpeed").textContent = `${cur.wind.speed} ${spd}`;
  setTimeout(() => { $("compassNeedle").style.transform = `rotate(${windDeg}deg)`; }, 300);

  // Weather Alert
  let alerted = false;
  for (const cfg of Object.values(ALERTS)) {
    const inRange = cfg.range && cur.weather[0].id >= cfg.range[0] && cur.weather[0].id < cfg.range[1];
    const inIds   = cfg.ids   && cfg.ids.includes(cur.weather[0].id);
    if (inRange || inIds) {
      $("alertTitle").textContent = cfg.title;
      $("alertDesc").textContent  = cfg.desc(cur.name);
      $("alertBanner").classList.add("visible");
      alerted = true; break;
    }
  }
  if (!alerted) $("alertBanner").classList.remove("visible");
}

// ── Geolocation ────────────────────────────────
function fetchByLocation() {
  if (!navigator.geolocation) { showError("Geolocation not supported by your browser."); return; }
  navigator.geolocation.getCurrentPosition(
    pos => {
      const coords = { lat: pos.coords.latitude, lon: pos.coords.longitude };
      sessionStorage.setItem("nimbus-coords", JSON.stringify(coords));
      fetchWeather(coords);
    },
    () => showError("Location denied. Try searching a city instead.")
  );
}

// ── Search ─────────────────────────────────────
function doSearch() {
  const val = $("searchInput").value.trim();
  if (val) { fetchWeather(val); $("searchInput").blur(); }
}
$("searchBtn").addEventListener("click", doSearch);
$("searchInput").addEventListener("keydown", e => { if (e.key === "Enter") doSearch(); });
$("grantBtn").addEventListener("click", fetchByLocation);
$("locationBtn").addEventListener("click", fetchByLocation);

//  Init
applyTheme();
renderFavs();

const saved = sessionStorage.getItem("nimbus-coords");
if (saved) { fetchWeather(JSON.parse(saved)); }
else { showGrant(); }