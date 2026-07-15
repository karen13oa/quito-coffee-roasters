// open-meteo.com - Coordenadas para la ciudad de Quito
const WEATHER_API_URL = 'https://api.open-meteo.com/v1/forecast?latitude=-0.2186&longitude=-78.5097&current_weather=true';

// official-joke-api.appspot.com - Para chistes dinámicos de café
const JOKE_API_URL = 'https://official-joke-api.appspot.com/jokes/coffee/random';

// exchange rate - Conversión de precios USD a EUR
const EXCHANGE_API_URL = 'https://open.er-api.com/v6/latest/USD';

/**
 * Obtiene el clima de Quito desde Open-Meteo
 */
export async function getQuitoWeather() {
    try {
        const response = await fetch(WEATHER_API_URL);
        if (!response.ok) throw new Error('Error al consultar la API del clima.');
        const data = await response.json();
        return data.current_weather;
    } catch (error) {
        console.error('Error al cargar clima:', error);
        throw error;
    }
}

/**
 * Obtiene una broma o frase sobre café
 */
export async function getCoffeeJoke() {
    try {
        const response = await fetch(JOKE_API_URL);
        if (!response.ok) throw new Error('Error al consultar la API de chistes.');
        const data = await response.json();
        return data[0];
    } catch (error) {
        console.error('Error al cargar la frase:', error);
        throw error;
    }
}

/**
 * Obtiene la tasa de conversión USD/EUR
 */
export async function getEuroRate() {
    try {
        const response = await fetch(EXCHANGE_API_URL);
        if (!response.ok) throw new Error('Error al cargar la tasa de cambio.');
        const data = await response.json();
        return data.rates.EUR;
    } catch (error) {
        console.error('Error al cargar tasa de cambio:', error);
        throw error;
    }
}