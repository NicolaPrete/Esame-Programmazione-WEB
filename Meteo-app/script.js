// script.js

// Definizione dei codici meteo WMO e descrizioni in italiano
const weatherCodes = {
    0: { description: "Cielo sereno", icon: "☀️" },
    1: { description: "Prevalentemente sereno", icon: "🌤️" },
    2: { description: "Parzialmente nuvoloso", icon: "⛅" },
    3: { description: "Nuvoloso", icon: "☁️" },
    45: { description: "Nebbia", icon: "🌫️" },
    48: { description: "Nebbia con brina", icon: "🌫️" },
    51: { description: "Pioviggine leggera", icon: "🌦️" },
    53: { description: "Pioviggine moderata", icon: "🌦️" },
    55: { description: "Pioviggine intensa", icon: "🌧️" },
    56: { description: "Pioviggine congelantesi leggera", icon: "🌧️" },
    57: { description: "Pioviggine congelantesi densa", icon: "🌧️" },
    61: { description: "Pioggia leggera", icon: "🌦️" },
    63: { description: "Pioggia moderata", icon: "🌧️" },
    65: { description: "Pioggia intensa", icon: "🌧️" },
    66: { description: "Pioggia congelantesi leggera", icon: "🌧️❄️" },
    67: { description: "Pioggia congelantesi intensa", icon: "🌧️❄️" },
    71: { description: "Nevicata leggera", icon: "🌨️" },
    73: { description: "Nevicata moderata", icon: "❄️" },
    75: { description: "Nevicata intensa", icon: "❄️" },
    77: { description: "Granelli di neve", icon: "❄️" },
    80: { description: "Rovesci di pioggia leggeri", icon: "🌦️" },
    81: { description: "Rovesci di pioggia moderati", icon: "🌧️" },
    82: { description: "Rovesci di pioggia violenti", icon: "⛈️" },
    85: { description: "Rovesci di neve leggeri", icon: "🌨️" },
    86: { description: "Rovesci di neve intensi", icon: "❄️" },
    95: { description: "Temporale", icon: "⛈️" },
    96: { description: "Temporale con grandine leggera", icon: "⛈️" },
    99: { description: "Temporale con grandine intensa", icon: "⛈️" }
};

// Elementi DOM
const latitudeInput = document.getElementById('latitude');
const longitudeInput = document.getElementById('longitude');
const searchBtn = document.getElementById('searchBtn');
const locateBtn = document.getElementById('locateBtn');
const weatherData = document.getElementById('weatherData');
const loading = document.getElementById('loading');
const errorMessage = document.getElementById('errorMessage');

// Elementi per visualizzare i dati meteo
const locationName = document.getElementById('locationName');
const coordinatesDisplay = document.getElementById('coordinatesDisplay');
const weatherIcon = document.getElementById('weatherIcon');
const temperature = document.getElementById('temperature');
const weatherDescription = document.getElementById('weatherDescription');
const humidity = document.getElementById('humidity');
const precipitation = document.getElementById('precipitation');
const rain = document.getElementById('rain');
const cloudCover = document.getElementById('cloudCover');
const windSpeed = document.getElementById('windSpeed');

// Funzione per ottenere i dati meteo
async function getWeatherData(lat, lon) {
    showLoading();
    hideError();
    
    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,rain,cloud_cover,wind_speed_10m,weather_code`;
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Errore nel recupero dei dati meteo');
        }
        
        const data = await response.json();
        displayWeatherData(data, lat, lon);
        
        // Salvataggio locale dei dati
        saveWeatherData(data);
        
    } catch (error) {
        showError(error.message);
    } finally {
        hideLoading();
    }
}

// Funzione per visualizzare i dati meteo
function displayWeatherData(data, lat, lon) {
    // Verifica che i dati necessari siano disponibili
    if (!data.current) {
        showError('Dati meteo non disponibili');
        return;
    }
    
    const current = data.current;
    
    // Coordinate arrotondate per la visualizzazione
    const displayLat = parseFloat(lat).toFixed(4);
    const displayLon = parseFloat(lon).toFixed(4);
    
    // Nome località (in questo caso usiamo le coordinate)
    locationName.textContent = `Posizione`;
    coordinatesDisplay.textContent = `Lat: ${displayLat}, Long: ${displayLon}`;
    
    // Dati meteo
    temperature.textContent = `${current.temperature_2m}${data.current_units.temperature_2m}`;
    
    // Weather code e descrizione
    const weatherCode = current.weather_code;
    const weatherInfo = weatherCodes[weatherCode] || { description: "Informazione non disponibile", icon: "❓" };
    
    weatherDescription.textContent = weatherInfo.description;
    weatherIcon.innerHTML = `<span style="font-size: 3rem;">${weatherInfo.icon}</span>`;
    
    // Altri dati
    humidity.textContent = `${current.relative_humidity_2m}${data.current_units.relative_humidity_2m}`;
    precipitation.textContent = `${current.precipitation}${data.current_units.precipitation}`;
    rain.textContent = `${current.rain}${data.current_units.rain}`;
    cloudCover.textContent = `${current.cloud_cover}${data.current_units.cloud_cover}`;
    windSpeed.textContent = `${current.wind_speed_10m}${data.current_units.wind_speed_10m}`;
    
    // Mostra il contenitore dei dati meteo
    weatherData.style.display = 'block';
}

// Funzione per salvare i dati meteo in localStorage
function saveWeatherData(data) {
    localStorage.setItem('weatherData', JSON.stringify(data));
    localStorage.setItem('weatherDataTimestamp', new Date().getTime());
}

// Funzione per caricare i dati meteo salvati
function loadSavedWeatherData() {
    const savedData = localStorage.getItem('weatherData');
    const timestamp = localStorage.getItem('weatherDataTimestamp');
    
    if (savedData && timestamp) {
        // Controlla se i dati sono recenti (meno di 30 minuti)
        const now = new Date().getTime();
        const thirtyMinutes = 30 * 60 * 1000;
        
        if (now - timestamp < thirtyMinutes) {
            return JSON.parse(savedData);
        }
    }
    
    return null;
}

// Funzione per ottenere la posizione corrente
function getCurrentPosition() {
    if (navigator.geolocation) {
        showLoading();
        hideError();
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                
                latitudeInput.value = lat.toFixed(6);
                longitudeInput.value = lon.toFixed(6);
                
                getWeatherData(lat, lon);
            },
            (error) => {
                hideLoading();
                let errorMsg = 'Impossibile ottenere la tua posizione';
                
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMsg = 'Accesso alla posizione negato. Controlla le impostazioni del browser.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMsg = 'Informazioni sulla posizione non disponibili.';
                        break;
                    case error.TIMEOUT:
                        errorMsg = 'Tempo di attesa per la posizione scaduto.';
                        break;
                }
                
                showError(errorMsg);
            }
        );
    } else {
        showError('La geolocalizzazione non è supportata dal tuo browser');
    }
}

// Funzioni helper per mostrare/nascondere elementi
function showLoading() {
    loading.style.display = 'block';
    weatherData.style.display = 'none';
}

function hideLoading() {
    loading.style.display = 'none';
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

function hideError() {
    errorMessage.style.display = 'none';
}

// Event listeners
searchBtn.addEventListener('click', () => {
    const lat = parseFloat(latitudeInput.value);
    const lon = parseFloat(longitudeInput.value);
    
    if (isNaN(lat) || isNaN(lon)) {
        showError('Inserisci coordinate valide');
        return;
    }
    
    getWeatherData(lat, lon);
});

locateBtn.addEventListener('click', getCurrentPosition);

// All'avvio, verifica se ci sono dati salvati
document.addEventListener('DOMContentLoaded', () => {
    const savedData = loadSavedWeatherData();
    
    if (savedData) {
        const lat = latitudeInput.value;
        const lon = longitudeInput.value;
        displayWeatherData(savedData, lat, lon);
    } else {
        // Carica dati per le coordinate predefinite
        getWeatherData(latitudeInput.value, longitudeInput.value);
    }
});