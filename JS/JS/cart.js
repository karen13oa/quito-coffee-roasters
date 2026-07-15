export const cartState = {
    items: [],
    shippingCost: 1.80, // Por defecto Centro
};

// Tarifas de envío por sector en Quito (según PDF)
export const shippingRates = {
    norte: 2.50,
    centro: 1.80,
    sur: 3.00,
    valles: 3.50
};

export function addToCart(product) {
    const existing = cartState.items.find(item => item.id === product.id);
    if (existing) {
        existing.quantity += 1;
    } else {
        cartState.items.push({ ...product, quantity: 1 });
    }
}

export function updateShippingZone(zone) {
    if (shippingRates[zone] !== undefined) {
        cartState.shippingCost = shippingRates[zone];
    }
}

export function calculateTotals() {
    const subtotal = cartState.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const shipping = cartState.items.length > 0 ? cartState.shippingCost : 0;
    const total = subtotal + shipping;
    return { subtotal, shipping, total };
}

export function clearCart() {
    cartState.items = [];
}