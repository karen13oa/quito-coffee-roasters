import { getQuitoWeather, getCoffeeJoke, getEuroRate } from './api.js';
import { cartState, addToCart, updateShippingZone, calculateTotals, clearCart } from './cart.js';

// Productos del catálogo del café de Quito
const CATALOG_PRODUCTS = [
    { id: 1, name: "Pichincha Honey", origin: "Ecuador", notes: "Notas dulces a chocolate, miel y acidez cítrica brillante.", price: 12.50 },
    { id: 2, name: "Cerrado Mineiro", origin: "Brasil", notes: "Cuerpo medio, notas a frutos secos, nuez y caramelo.", price: 10.00 },
    { id: 3, name: "Huila Premium", origin: "Colombia", notes: "Notas a frutos rojos, caña de azúcar y balance perfecto.", price: 11.50 },
    { id: 4, name: "Sidama Organic", origin: "Etiopía", notes: "Aroma floral, notas a jazmín, arándanos y té negro.", price: 14.00 },
    { id: 5, name: "Zaruma Tradición", origin: "Ecuador", notes: "Sabor intenso, tostado medio-oscuro, notas maderosas.", price: 9.50 }
];

// ELEMENTOS DOM
const weatherTempEl = document.getElementById('weather-temp');
const quoteTextEl = document.querySelector('#quote-container p');
const quoteAuthorEl = document.getElementById('quote-author');
const catalogGrid = document.getElementById('catalog-grid');
const searchInput = document.getElementById('search-input');
const originFilter = document.getElementById('origin-filter');
const cartList = document.getElementById('cart-list');
const shippingSelect = document.getElementById('shipping-zone');
const subtotalValEl = document.getElementById('subtotal-val');
const shippingValEl = document.getElementById('shipping-val');
const totalValEl = document.getElementById('total-val');
const convertBtn = document.getElementById('convert-currency-btn');
const eurDisplay = document.getElementById('eur-total-display');

// ELEMENTOS DEL FORMULARIO
const contactForm = document.getElementById('contact-form');
const nameInput = document.getElementById('form-name');
const emailInput = document.getElementById('form-email');
const phoneInput = document.getElementById('form-phone');

// EVENT LISTENERS
window.addEventListener('DOMContentLoaded', initApp);
searchInput.addEventListener('input', renderCatalog);
originFilter.addEventListener('change', renderCatalog);
shippingSelect.addEventListener('change', handleShippingChange);
convertBtn.addEventListener('click', handleCurrencyConversion);
contactForm.addEventListener('submit', handleFormSubmit);

// FUNCIONES DE INICIALIZACIÓN
async function initApp() {
    renderCatalog();
    await loadWeather();
    await loadQuote();
}

// 1. CARGA DE LAS APIS
async function loadWeather() {
    try {
        const weather = await getQuitoWeather();
        weatherTempEl.innerHTML = `Quito Clima: <strong>${weather.temperature}°C</strong>`;
    } catch (err) {
        weatherTempEl.textContent = 'Clima temporalmente no disponible.';
    }
}

async function loadQuote() {
    try {
        const joke = await getCoffeeJoke();
        quoteTextEl.textContent = `"${joke.setup}" - ${joke.punchline}`;
        quoteAuthorEl.textContent = '☕ API de Chistes de Café';
    } catch (err) {
        quoteTextEl.textContent = '"El café de especialidad es el combustible del alma en Quito."';
        quoteAuthorEl.textContent = 'Tradición Quiteña';
    }
}

// 2. RENDERIZACIÓN DINÁMICA DEL CATÁLOGO (Uso de filter/map)
function renderCatalog() {
    const searchText = searchInput.value.toLowerCase();
    const selectedOrigin = originFilter.value;

    const filtered = CATALOG_PRODUCTS.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchText);
        const matchesOrigin = selectedOrigin === "" || product.origin === selectedOrigin;
        return matchesSearch && matchesOrigin;
    });

    catalogGrid.innerHTML = '';

    if (filtered.length === 0) {
        catalogGrid.innerHTML = '<p class="empty-cart">No se encontraron cafés que coincidan con los filtros.</p>';
        return;
    }

    filtered.forEach(product => {
        const card = document.createElement('article');
        card.className = 'coffee-card';
        card.innerHTML = `
            <h4>${product.name}</h4>
            <span class="coffee-origin">${product.origin}</span>
            <p class="coffee-notes">${product.notes}</p>
            <div class="coffee-price">$${product.price.toFixed(2)}</div>
            <button class="btn-primary btn-add" data-id="${product.id}">Agregar al pedido</button>
        `;
        catalogGrid.appendChild(card);
    });

    // Agregar manejadores a los nuevos botones
    document.querySelectorAll('.btn-add').forEach(button => {
        button.addEventListener('click', (e) => {
            const id = parseInt(e.target.dataset.id);
            const product = CATALOG_PRODUCTS.find(p => p.id === id);
            addToCart(product);
            updateCartUI();
        });
    });
}

// 3. ACTUALIZAR INTERFAZ DEL CARRITO
function updateCartUI() {
    cartList.innerHTML = '';
    eurDisplay.classList.add('hidden'); // Reiniciar tasa en EUR al cambiar carrito

    if (cartState.items.length === 0) {
        cartList.innerHTML = '<li class="empty-cart">El carrito está vacío.</li>';
    } else {
        cartState.items.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span><strong>${item.quantity}x</strong> ${item.name}</span>
                <span>$${(item.price * item.quantity).toFixed(2)}</span>
            `;
            cartList.appendChild(li);
        });
    }

    const { subtotal, shipping, total } = calculateTotals();
    subtotalValEl.textContent = subtotal.toFixed(2);
    shippingValEl.textContent = shipping.toFixed(2);
    totalValEl.textContent = total.toFixed(2);
}

function handleShippingChange(e) {
    updateShippingZone(e.target.value);
    updateCartUI();
}

// Conversión de divisas interactiva
async function handleCurrencyConversion() {
    const { total } = calculateTotals();
    if (total === 0) {
        alert('Añade productos al pedido para calcular el total.');
        return;
    }

    try {
        convertBtn.disabled = true;
        convertBtn.textContent = 'Convirtiendo...';
        const rate = await getEuroRate();
        const totalInEur = total * rate;
        eurDisplay.innerHTML = `Total en Euros: <strong>€${totalInEur.toFixed(2)}</strong> (Tasa: ${rate.toFixed(4)})`;
        eurDisplay.classList.remove('hidden');
    } catch (err) {
        alert('No se pudo obtener la cotización del Euro.');
    } finally {
        convertBtn.disabled = false;
        convertBtn.textContent = 'Mostrar Total en EUR (€)';
    }
}

// 4. VALIDACIÓN DE FORMULARIO DE CONTACTO (En tiempo real)
function handleFormSubmit(e) {
    e.preventDefault();
    let isValid = true;

    // Resetear mensajes de error
    document.querySelectorAll('.error-msg').forEach(el => el.textContent = '');

    // Validar nombre
    if (nameInput.value.trim() === '') {
        document.getElementById('error-name').textContent = 'El nombre es obligatorio.';
        isValid = false;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput.value.trim())) {
        document.getElementById('error-email').textContent = 'Ingresa un email válido.';
        isValid = false;
    }

    // Validar teléfono ecuatoriano
    const phoneRegex = /^[0-9]{9,10}$/;
    if (!phoneRegex.test(phoneInput.value.trim())) {
        document.getElementById('error-phone').textContent = 'Ingresa un teléfono válido (9-10 dígitos).';
        isValid = false;
    }

    if (isValid) {
        const successMsg = document.getElementById('form-success-msg');
        successMsg.classList.remove('hidden');
        contactForm.reset();
        clearCart();
        updateCartUI();
        
        setTimeout(() => {
            successMsg.classList.add('hidden');
        }, 5000);
    }
}