const CONFIG = {
      SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbxTe5ZXvV-RyvN3Ogxg1qXmOdqCBDo3mZK3Oo6d0U2wvkqbrjEzktZ6Hws6upnTfC1F/exec'
};

let inventory = [];
  let cart = [];

document.addEventListener('DOMContentLoaded', () => {
      fetchInventory();
      setupEventListeners();
});

async function fetchInventory() {
      try {
                const response = await fetch(`${CONFIG.SCRIPT_URL}?action=getInventory`);
                const data = await response.json();
                if (data.status === 'success') {
                              inventory = data.data;
                              updateDatalist();
                              setConnectionStatus(true);
                }
      } catch (error) {
                console.error('Fetch error:', error);
                setConnectionStatus(false);
      }
}

function setupEventListeners() {
      const searchInput = document.getElementById('itemSearch');
      const addItemBtn = document.getElementById('addItemBtn');
      if(searchInput) {
                searchInput.addEventListener('input', (e) => {
                              const item = inventory.find(i => i.name === e.target.value || i.barcode === e.target.value);
                              if (item) showSelectedItem(item);
                });
      }
      if(addItemBtn) addItemBtn.addEventListener('click', addToCart);

    const submitBtn = document.getElementById('submitSale');
      if(submitBtn) submitBtn.addEventListener('click', submitSale);

    const clearBtn = document.getElementById('clearCart');
      if(clearBtn) clearBtn.addEventListener('click', () => {
                cart = [];
                updateCartUI();
      });
}

function showSelectedItem(item) {
      const info = document.getElementById('selectedItemInfo');
      document.getElementById('currentName').textContent = item.name;
      document.getElementById('currentPrice').textContent = `${item.price} EGP`;
      info.classList.remove('d-none');
      window.currentItem = item;
}

function addToCart() {
      const item = window.currentItem;
      if(!item) return;
      cart.push({ ...item, quantity: 1 });
      updateCartUI();
      document.getElementById('itemSearch').value = '';
      document.getElementById('selectedItemInfo').classList.add('d-none');
}

function updateCartUI() {
      const container = document.getElementById('cartItems');
      if(!container) return;
      container.innerHTML = '';
      let total = 0;
      cart.forEach((item, index) => {
                total += item.price * item.quantity;
                const div = document.createElement('div');
                div.className = 'cart-item d-flex justify-content-between align-items-center';
                div.innerHTML = `<div><div class="fw-bold text-white">${item.name}</div><small class="text-accent-light">${item.price} x ${item.quantity}</small></div><button class="btn btn-sm text-danger" onclick="removeFromCart(${index})"><i class="fas fa-trash"></i></button>`;
                container.appendChild(div);
      });
      document.getElementById('totalDisplay').textContent = total.toFixed(2);
}

window.removeFromCart = function(index) {
      cart.splice(index, 1);
      updateCartUI();
};

async function submitSale() {
      if (cart.length === 0) return;
      const btn = document.getElementById('submitSale');
      btn.disabled = true;
      try {
                await fetch(CONFIG.SCRIPT_URL, {
                              method: 'POST',
                              mode: 'no-cors',
                              body: JSON.stringify({ action: 'addSale', items: cart, total: document.getElementById('totalDisplay').textContent })
                });
                alert('Success');
                cart = [];
                updateCartUI();
      } catch (e) { alert('Error'); }
      finally { btn.disabled = false; }
}

function setConnectionStatus(isOnline) {
      const dot = document.getElementById('connectionStatus');
      if(dot) dot.className = `status-dot ${isOnline ? 'online' : 'offline'}`;
}

function updateDatalist() {
      const list = document.getElementById('inventoryList');
      if(list) list.innerHTML = inventory.map(item => `<option value="${item.name}">${item.price} EGP</option>`).join('');
}
