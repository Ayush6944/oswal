// ===============================
// OSWAL ERP – FINAL STABLE VERSION
// ===============================

// LOGIN CHECK
if (localStorage.getItem("erp_logged_in") !== "true") {
  window.location.href = "admin-login.html";
}

let role = localStorage.getItem("erp_user_role") || "Admin";
let email = localStorage.getItem("erp_user_email") || "admin@admin.com";

document.getElementById("roleBadge").innerText = role;
document.getElementById("userEmail").innerText = email;

// LOAD DATA
let orders = JSON.parse(localStorage.getItem("erp_orders")) || [];
let cart = [];

// ===============================
// AUTO DEMO ORDER (IMPORTANT)
// ===============================
if (orders.length === 0) {
  orders.push({
    id: Date.now(),
    client: "demo@client.com",
    items: [
      { book: "Class 10 Maths", qty: 5 },
      { book: "Class 8 Science", qty: 3 }
    ],
    status: "Pending"
  });
  localStorage.setItem("erp_orders", JSON.stringify(orders));
}

// BOOK LIST
const books = [
  { name: "Class 3 English", category: "primary" },
  { name: "Class 8 Science", category: "middle" },
  { name: "Class 10 Maths", category: "middle" },
  { name: "Class 12 Physics", category: "senior" },
  { name: "NEET Guide", category: "competitive" }
];

function saveData() {
  localStorage.setItem("erp_orders", JSON.stringify(orders));
}

// ===============================
// CATEGORY FILTER
// ===============================
function filterCategory(category) {
  const container = document.getElementById("bookContainer");
  container.innerHTML = "";

  books
    .filter(b => b.category === category)
    .forEach(book => {
      container.innerHTML += `
      <div class="col-md-3 mb-3">
        <div class="book-card">
          <h6>${book.name}</h6>
          <input type="number" min="1" value="1"
            id="qty-${book.name}"
            class="form-control mb-2">
          <button class="btn btn-primary btn-sm w-100"
            onclick="addToCart('${book.name}')">
            Add to Cart
          </button>
        </div>
      </div>`;
    });
}

// ===============================
// CART LOGIC
// ===============================
function addToCart(book) {
  let qty = parseInt(document.getElementById("qty-" + book).value) || 1;

  let existing = cart.find(i => i.book === book);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ book, qty });
  }

  renderCart();
}

function renderCart() {
  let container = document.getElementById("cartContainer");
  if (!container) return;

  container.innerHTML = "";

  if (cart.length === 0) {
    container.innerHTML = "Cart Empty";
    return;
  }

  cart.forEach(item => {
    container.innerHTML += `
    <div class="d-flex justify-content-between mb-2">
      <span>${item.book} (x${item.qty})</span>
    </div>`;
  });
}

function checkout() {
  if (cart.length === 0) {
    alert("Cart Empty");
    return;
  }

  orders.push({
    id: Date.now(),
    client: email,
    items: cart,
    status: "Pending"
  });

  cart = [];
  saveData();
  render();
  renderCart();
  alert("Order Submitted!");
}

// ===============================
// ADMIN APPROVE
// ===============================
function approveOrder(id) {
  let o = orders.find(x => x.id === id);
  if (o) {
    o.status = "Completed";
    saveData();
    render();
  }
}

// ===============================
// RENDER
// ===============================
function render() {
  let table = document.getElementById("orderTable");
  let clientOrders = document.getElementById("clientOrders");

  if (table) table.innerHTML = "";
  if (clientOrders) clientOrders.innerHTML = "";

  let total = 0, pending = 0, completed = 0;

  orders.forEach(o => {

    if (role === "Client" && o.client !== email) return;

    total++;
    if (o.status === "Pending") pending++;
    if (o.status === "Completed") completed++;

    // ADMIN VIEW
    if (role === "Admin" && table) {
      table.innerHTML += `
      <tr>
        <td>${o.id}</td>
        <td>${o.client}</td>
        <td>${o.items.map(i => i.book + " x" + i.qty).join("<br>")}</td>
        <td class="${o.status === "Completed" ? "status-completed" : "status-pending"}">
          ${o.status}
        </td>
        <td>
          ${o.status === "Pending"
            ? `<button class="btn btn-sm btn-success"
               onclick="approveOrder(${o.id})">Approve</button>`
            : "-"}
        </td>
      </tr>`;
    }

    // CLIENT VIEW
    if (role === "Client" && clientOrders) {
      clientOrders.innerHTML += `
      <div class="card p-3 mb-2">
        <h6>Order #${o.id}</h6>
        ${o.items.map(i => `<div>${i.book} x${i.qty}</div>`).join("")}
        <span class="${o.status === "Completed" ? "status-completed" : "status-pending"}">
          ${o.status}
        </span>
      </div>`;
    }
  });

  document.getElementById("totalOrders").innerText = total;
  document.getElementById("pendingOrders").innerText = pending;
  document.getElementById("completedOrders").innerText = completed;

  if (role === "Admin")
    document.getElementById("adminOrders").style.display = "block";

  if (role === "Client")
    document.getElementById("clientStore").style.display = "block";
}

// ===============================
// NAV SWITCH
// ===============================
document.querySelectorAll("#sidebar a[data-section]").forEach(link => {
  link.onclick = function () {
    document.querySelectorAll("section").forEach(s => s.style.display = "none");
    document.getElementById(this.dataset.section + "-section").style.display = "block";
  };
});

// LOGOUT
document.getElementById("logoutBtn").onclick = function () {
  localStorage.clear();
  window.location.href = "admin-login.html";
};

render();
renderCart();