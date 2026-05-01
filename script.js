const products = [
  {
    id: "rainy-day-pack",
    name: "Rainy Day Activity Pack",
    price: 5.99,
    pages: "40 printable pages",
    emoji: "☁️"
  },
  {
    id: "dinosaur-pack",
    name: "Dinosaur Activity Pack",
    price: 6.99,
    pages: "35 printable pages",
    emoji: "🦕"
  },
  {
    id: "travel-pack",
    name: "Travel Activity Pack",
    price: 4.99,
    pages: "30 printable pages",
    emoji: "✈️"
  },
  {
    id: "starter-bundle",
    name: "Starter Activity Bundle",
    price: 12.99,
    pages: "3 activity packs",
    emoji: "🌈"
  }
];

let cart = [];

const cartDrawer = document.getElementById("cartDrawer");
const cartOverlay = document.getElementById("cartOverlay");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const cartCount = document.getElementById("cartCount");

function openCart() {
  cartDrawer.classList.add("open");
  cartOverlay.classList.add("open");
}

function closeCart() {
  cartDrawer.classList.remove("open");
  cartOverlay.classList.remove("open");
}

function addToCart(productId) {
  const product = products.find(item => item.id === productId);
  const existingItem = cart.find(item => item.id === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      ...product,
      quantity: 1
    });
  }

  renderCart();
  openCart();
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  renderCart();
}

function increaseQuantity(productId) {
  const item = cart.find(item => item.id === productId);

  if (item) {
    item.quantity += 1;
  }

  renderCart();
}

function decreaseQuantity(productId) {
  const item = cart.find(item => item.id === productId);

  if (!item) return;

  if (item.quantity > 1) {
    item.quantity -= 1;
  } else {
    removeFromCart(productId);
    return;
  }

  renderCart();
}

function calculateTotal() {
  return cart.reduce((total, item) => total + item.price * item.quantity, 0);
}

function calculateCount() {
  return cart.reduce((total, item) => total + item.quantity, 0);
}

function renderCart() {
  cartCount.textContent = calculateCount();

  if (cart.length === 0) {
    cartItems.innerHTML = `
      <div class="empty-cart">
        <p>Your cart is empty.</p>
        <small>Add an activity pack to get started.</small>
      </div>
    `;

    cartTotal.textContent = "$0.00";
    return;
  }

  cartItems.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-icon">${item.emoji}</div>

      <div class="cart-item-info">
        <h4>${item.name}</h4>
        <p>${item.pages}</p>
        <strong>$${item.price.toFixed(2)}</strong>

        <div class="quantity-controls">
          <button onclick="decreaseQuantity('${item.id}')">−</button>
          <span>${item.quantity}</span>
          <button onclick="increaseQuantity('${item.id}')">+</button>
        </div>
      </div>

      <button class="remove-button" onclick="removeFromCart('${item.id}')">
        Remove
      </button>
    </div>
  `).join("");

  cartTotal.textContent = `$${calculateTotal().toFixed(2)}`;
}

document.querySelectorAll("[data-add-to-cart]").forEach(button => {
  button.addEventListener("click", () => {
    addToCart(button.dataset.addToCart);
  });
});

document.getElementById("openCart").addEventListener("click", openCart);
document.getElementById("closeCart").addEventListener("click", closeCart);
cartOverlay.addEventListener("click", closeCart);

document.getElementById("checkoutButton").addEventListener("click", () => {
  if (cart.length === 0) {
    alert("Your cart is empty.");
    return;
  }

  alert("Next step: we will connect this button to Stripe Checkout.");
});

renderCart();
