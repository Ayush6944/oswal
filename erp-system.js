// ===============================
// OSWAL ERP – FINAL CLEAN VERSION
// ===============================

// -------------------------------
// GLOBAL STORAGE
// -------------------------------

let cart = JSON.parse(localStorage.getItem("erp_cart")) || [];
let orders = JSON.parse(localStorage.getItem("erp_orders")) || [];
let payments = JSON.parse(localStorage.getItem("erp_payments")) || [];

function saveCart(){
  localStorage.setItem("erp_cart", JSON.stringify(cart));
}

function savePayments(){
  localStorage.setItem("erp_payments", JSON.stringify(payments));
}

function saveOrders(){
  localStorage.setItem("erp_orders", JSON.stringify(orders));
}

// -------------------------------
// ADD TO CART
// -------------------------------

function addToCart(name, price){

  let qtyInput = document.getElementById("qty-"+name);
  let qty = qtyInput ? parseInt(qtyInput.value) : 1;

  if(!qty || qty < 1) qty = 1;

  let existing = cart.find(item => item.name === name);

  if(existing){
    existing.qty += qty;
  } else {
    cart.push({ name, price, qty });
  }

  saveCart();
  alert("Added to Cart");
}

// -------------------------------
// REMOVE FROM CART
// -------------------------------

function removeFromCart(index){
  cart.splice(index,1);
  saveCart();
  renderCart();
}

// -------------------------------
// CHANGE QUANTITY
// -------------------------------

function changeQty(index, value){
  cart[index].qty += value;
  if(cart[index].qty < 1) cart[index].qty = 1;
  saveCart();
  renderCart();
}

// -------------------------------
// RENDER CART
// -------------------------------

function renderCart(){

  const container = document.getElementById("cartItems");
  if(!container) return;

  container.innerHTML = "";

  let subtotal = 0;

  if(cart.length === 0){
    container.innerHTML = "<p>Your cart is empty</p>";
    document.getElementById("cartTotal").innerText = 0;
    return;
  }

  cart.forEach((item,index)=>{

    let itemTotal = item.price * item.qty;
    subtotal += itemTotal;

    container.innerHTML += `
      <div class="card p-3 mb-3">
        <div class="d-flex justify-content-between">
          <div>
            <h6>${item.name}</h6>
            <p>₹${item.price}</p>
            <div>
              <button onclick="changeQty(${index},-1)">-</button>
              <span class="mx-2">${item.qty}</span>
              <button onclick="changeQty(${index},1)">+</button>
            </div>
          </div>
          <div class="text-end">
            <h6>₹${itemTotal}</h6>
            <button class="btn btn-sm btn-danger"
              onclick="removeFromCart(${index})">
              Remove
            </button>
          </div>
        </div>
      </div>
    `;
  });

  let discount = Math.floor(subtotal * 0.15);
  let finalTotal = subtotal - discount;

  document.getElementById("cartTotal").innerText = finalTotal;

  localStorage.setItem("erp_total", finalTotal);
}

// -------------------------------
// GO TO PAYMENT
// -------------------------------

function goToPayment(){

  if(cart.length === 0){
    alert("Cart is empty");
    return;
  }

  let subtotal = 0;
  cart.forEach(item=>{
    subtotal += item.price * item.qty;
  });

  let discount = Math.floor(subtotal * 0.15);
  let finalTotal = subtotal - discount;

  localStorage.setItem("erp_total", finalTotal);

  window.location.href = "payment.html";
}

// -------------------------------
// COMPLETE PAYMENT
// -------------------------------

function completePayment(){

  if(cart.length === 0){
    alert("Your cart is empty");
    return;
  }

  let total = localStorage.getItem("erp_total");
  let email = localStorage.getItem("erp_user_email");
  let method = localStorage.getItem("payment_method");
  let deliveryDetails = JSON.parse(localStorage.getItem("delivery_details"));

  if(!method){
    alert("Please select payment method");
    return;
  }

  if(!deliveryDetails){
    alert("Delivery details missing");
    return;
  }

  let today = new Date();
  let deliveryDate = new Date();
  deliveryDate.setDate(today.getDate() + 7);

  let invoiceNo = "INV-" + Date.now();

  let order = {
    id: Date.now(),
    client: email,
    items: cart,
    total: total,
    paymentMethod: method,
    paymentStatus: method === "COD" ? "Pending (COD)" : "Paid",
    orderStatus: "Processing",
    deliveryDate: deliveryDate.toDateString(),
    invoiceNumber: invoiceNo,
    date: today.toDateString(),
    customerDetails: deliveryDetails
  };

  orders.push(order);
  saveOrders();

  // create payment record for admin dashboard tracking
  payments.push({ id: order.id + 1000, orderId: order.id, amount: order.total, method: order.paymentMethod, status: order.paymentStatus && order.paymentStatus.includes('Paid')? 'Paid' : 'Pending', date: order.date });
  savePayments();

  cart = [];
  saveCart();

  localStorage.removeItem("erp_total");
  localStorage.removeItem("payment_method");
  localStorage.removeItem("delivery_details");

  alert("Order Placed Successfully!");

  window.location.href = "tracking.html";
}

// -------------------------------
// RENDER TRACKING
// -------------------------------

function renderTracking(){

  let orders = JSON.parse(localStorage.getItem("erp_orders")) || [];
  let lastOrder = orders[orders.length - 1];

  if(!lastOrder) return;

  const div = document.getElementById("trackingDetails");
  if(!div) return;

  div.innerHTML = `
    <div class="card p-4">
      <h5>Order ID: ${lastOrder.id}</h5>
      <p>Status: ${lastOrder.orderStatus}</p>
      <p>Payment: ${lastOrder.paymentStatus}</p>
      <p>Delivery By: ${lastOrder.deliveryDate}</p>
      <p>Invoice: ${lastOrder.invoiceNumber}</p>
      <a href="invoice.html" class="btn btn-primary mt-3">
        View Invoice
      </a>
    </div>
  `;
}

// -------------------------------
// AUTO RUN
// -------------------------------

renderCart();
renderTracking();