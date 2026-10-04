const products = [
  {
    id: 1,
    name: "Chocolate Celebration Cake",
    category: "Birthday Cakes",
    price: 35000,
    rating: 4.9,
    tag: "Bestseller",
    image:
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=700&q=85",
    description: "Rich chocolate sponge with silky chocolate frosting.",
  },
  {
    id: 2,
    name: "Vanilla Berry Dream",
    category: "Birthday Cakes",
    price: 32000,
    rating: 4.8,
    tag: "Popular",
    image:
      "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=700&q=85",
    description: "Soft vanilla layers, cream and fresh berry notes.",
  },
  {
    id: 3,
    name: "Classic Red Velvet",
    category: "Birthday Cakes",
    price: 38000,
    rating: 5.0,
    tag: "Quinns pick",
    image:
      "https://images.unsplash.com/photo-1614707267537-2b0c2a4f0e7c?auto=format&fit=crop&w=700&q=85",
    description: "Velvety cocoa cake with smooth cream cheese frosting.",
  },
  {
    id: 4,
    name: "Elegant Wedding Cake",
    category: "Wedding Cakes",
    price: 95000,
    rating: 5.0,
    tag: "Custom",
    image:
      "https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&w=700&q=85",
    description: "A refined celebration centerpiece made to order.",
  },
  {
    id: 5,
    name: "Strawberry Cream Cake",
    category: "Birthday Cakes",
    price: 40000,
    rating: 4.9,
    tag: "Fresh",
    image:
      "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?auto=format&fit=crop&w=700&q=85",
    description: "Light sponge, strawberry cream and fresh fruit.",
  },
  {
    id: 6,
    name: "Vanilla Cupcake Box",
    category: "Cupcakes",
    price: 18000,
    rating: 4.8,
    tag: "Box of 6",
    image:
      "https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=700&q=85",
    description: "Six fluffy vanilla cupcakes with creamy frosting.",
  },
  {
    id: 7,
    name: "Chocolate Cupcake Box",
    category: "Cupcakes",
    price: 20000,
    rating: 4.9,
    tag: "Box of 6",
    image:
      "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?auto=format&fit=crop&w=700&q=85",
    description: "Six rich chocolate cupcakes with chocolate swirl.",
  },
  {
    id: 8,
    name: "Butter Croissant Box",
    category: "Pastries",
    price: 12000,
    rating: 4.7,
    tag: "Fresh",
    image:
      "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=700&q=85",
    description: "Flaky, buttery pastries baked fresh for your table.",
  },
];

const STORAGE_KEY = "quinnsConfectionariesCart";
let cart = loadCart();
let activeFilter = "All";
let searchTerm = "";

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function saveCart() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}

function formatPrice(value) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  })
    .format(value)
    .replace("NGN", "₦");
}

function renderProducts() {
  const grid = $("#productGrid");
  const empty = $("#emptyProducts");
  const term = searchTerm.toLowerCase().trim();

  const filtered = products.filter((product) => {
    const categoryMatch =
      activeFilter === "All" || product.category === activeFilter;
    const searchMatch =
      !term ||
      `${product.name} ${product.category} ${product.description}`
        .toLowerCase()
        .includes(term);
    return categoryMatch && searchMatch;
  });

  grid.innerHTML = filtered
    .map(
      (product) => `
    <article class="product-card">
      <div class="product-image">
        <img src="${product.image}" alt="${product.name}" loading="lazy">
        <span class="product-tag">${product.tag}</span>
      </div>
      <div class="product-info">
        <div class="product-rating">★ ${product.rating}</div>
        <h3>${product.name}</h3>
        <p class="product-description">${product.description}</p>
        <div class="product-bottom">
          <span class="price">${formatPrice(product.price)}</span>
          <button class="add-btn" data-add="${product.id}" aria-label="Add ${product.name} to cart">+</button>
        </div>
      </div>
    </article>
  `,
    )
    .join("");

  empty.hidden = filtered.length !== 0;
  $$("[data-add]").forEach((button) =>
    button.addEventListener("click", () =>
      addToCart(Number(button.dataset.add)),
    ),
  );
}

function addToCart(productId) {
  const existing = cart.find((item) => item.id === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ id: productId, quantity: 1 });
  }
  saveCart();
  renderCart();
  // openCart();
  showToast("Added to your cart");
}

function changeQuantity(productId, change) {
  const item = cart.find((cartItem) => cartItem.id === productId);
  if (!item) return;

  item.quantity += change;
  if (item.quantity <= 0) {
    cart = cart.filter((cartItem) => cartItem.id !== productId);
  }

  saveCart();
  renderCart();
}

function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId);
  saveCart();
  renderCart();
  showToast("Item removed from cart");
}

function getCartCount() {
  return cart.reduce((total, item) => total + item.quantity, 0);
}

function getCartTotal() {
  return cart.reduce((total, item) => {
    const product = products.find((productItem) => productItem.id === item.id);
    return total + (product ? product.price * item.quantity : 0);
  }, 0);
}

function renderCart() {
  const items = $("#cartItems");
  const empty = $("#cartEmpty");
  const footer = $("#cartFooter");
  const total = getCartTotal();

  $("#cartCount").textContent = getCartCount();
  $("#cartTotal").textContent = formatPrice(total);
  $("#checkoutTotal").textContent = formatPrice(total);

  if (!cart.length) {
    items.innerHTML = "";
    empty.classList.add("visible");
    footer.style.display = "none";
    return;
  }

  empty.classList.remove("visible");
  footer.style.display = "block";

  items.innerHTML = cart
    .map((item) => {
      const product = products.find(
        (productItem) => productItem.id === item.id,
      );
      if (!product) return "";
      return `
      <article class="cart-item">
        <img src="${product.image}" alt="${product.name}">
        <div class="cart-item-info">
          <h3>${product.name}</h3>
          <div class="cart-item-price">${formatPrice(product.price)} each</div>
          <div class="quantity-control" aria-label="Quantity controls for ${product.name}">
            <button class="qty-btn" data-qty="${product.id}" data-change="-1" aria-label="Decrease quantity">−</button>
            <span class="qty-value">${item.quantity}</span>
            <button class="qty-btn" data-qty="${product.id}" data-change="1" aria-label="Increase quantity">+</button>
          </div>
        </div>
        <button class="remove-item" data-remove="${product.id}" aria-label="Remove ${product.name}">🗑</button>
        <div class="cart-item-total">${formatPrice(product.price * item.quantity)}</div>
      </article>
    `;
    })
    .join("");

  $$("[data-qty]").forEach((button) =>
    button.addEventListener("click", () =>
      changeQuantity(Number(button.dataset.qty), Number(button.dataset.change)),
    ),
  );
  $$("[data-remove]").forEach((button) =>
    button.addEventListener("click", () =>
      removeFromCart(Number(button.dataset.remove)),
    ),
  );
}

function openCart() {
  $("#cartDrawer").classList.add("open");
  $("#cartDrawer").setAttribute("aria-hidden", "false");
  $("#overlay").classList.add("visible");
  document.body.classList.add("cart-open");
}

function closeCart() {
  $("#cartDrawer").classList.remove("open");
  $("#cartDrawer").setAttribute("aria-hidden", "true");
  $("#overlay").classList.remove("visible");
  document.body.classList.remove("cart-open");
}

function openCheckout() {
  if (!cart.length) {
    showToast("Your cart is empty");
    return;
  }
  closeCart();
  $("#checkoutModal").classList.add("open");
  $("#checkoutModal").setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
}

function closeCheckout() {
  $("#checkoutModal").classList.remove("open");
  $("#checkoutModal").setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2200);
}
const eyebrow = document.querySelector(".eyebrow");
const word = document.querySelector(".word");
function openCheckout2() {
  if (!cart.length) {
    showToast("Your cart is empty");
    return;
  }
  closeCart();
  $("#checkoutModal").classList.add("open");
  $("#checkoutModal").setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  eyebrow.textContent = "";
  word.textContent = "Order your custom cake";
}
// const customCakeBtn = document.querySelector(".custom_btn");
$("#cartBtn").addEventListener("click", openCart);
$("#closeCart").addEventListener("click", closeCart);
$("#overlay").addEventListener("click", closeCart);
$("#checkoutBtn").addEventListener("click", openCheckout);
$("#customCakeBtn").addEventListener("click", openCheckout2);
$("#closeCheckout").addEventListener("click", closeCheckout);
$("#startShopping").addEventListener("click", () => {
  closeCart();
  $("#shop").scrollIntoView({ behavior: "smooth" });
});

$("#menuBtn").addEventListener("click", () => {
  const menu = $("#mobileNav");
  const isOpen = menu.classList.toggle("open");
  $("#menuBtn").setAttribute("aria-expanded", String(isOpen));
});

$$("#mobileNav a").forEach((link) =>
  link.addEventListener("click", () => {
    $("#mobileNav").classList.remove("open");
    $("#menuBtn").setAttribute("aria-expanded", "false");
  }),
);

$("#searchBtn").addEventListener("click", () => {
  $("#searchPanel").classList.toggle("open");
  if ($("#searchPanel").classList.contains("open")) $("#searchInput").focus();
});

$("#searchInput").addEventListener("input", (event) => {
  searchTerm = event.target.value;
  renderProducts();
});

$("#clearSearch").addEventListener("click", () => {
  $("#searchInput").value = "";
  searchTerm = "";
  renderProducts();
});

$$(".filter").forEach((button) =>
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    $$(".filter").forEach((filter) =>
      filter.classList.toggle("active", filter === button),
    );
    renderProducts();
    $("#shop").scrollIntoView({ behavior: "smooth", block: "start" });
  }),
);

$$(".category-card").forEach((button) =>
  button.addEventListener("click", () => {
    activeFilter = button.dataset.category;
    searchTerm = "";
    $("#searchInput").value = "";
    $$(".filter").forEach((filter) =>
      filter.classList.toggle("active", filter.dataset.filter === activeFilter),
    );
    renderProducts();
    $("#shop").scrollIntoView({ behavior: "smooth" });
  }),
);

$("#announcement-close")?.addEventListener("click", () =>
  $(".announcement-bar").remove(),
);

$(".announcement-close").addEventListener("click", () =>
  $(".announcement-bar").remove(),
);

$("#newsletterForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const email = $("#newsletterEmail").value.trim();
  if (!email) return;
  event.target.reset();
  showToast("Thanks! You are on the Quinns list.");
});

$("#checkoutForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const orderNumber = `QCN-${Date.now().toString().slice(-6)}`;
  cart = [];
  saveCart();
  renderCart();
  closeCheckout();
  event.target.reset();
  showToast(`Order ${orderNumber} received. Thank you!`);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeCart();
    closeCheckout();
    $("#searchPanel").classList.remove("open");
  }
});

$("#year").textContent = new Date().getFullYear();
renderProducts();
renderCart();
