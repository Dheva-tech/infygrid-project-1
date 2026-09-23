/**
 * MediCare Medical Store Management System
 * Orders Module - Management, Details Modal, New Order Creation with Expiry Safety
 */

const OrdersModule = {
  orders: [],
  activeOrderItems: [],

  init() {
    this.bindEvents();
  },

  bindEvents() {
    // New Order Line Items addition
    const btnAddItem = document.getElementById('btn-add-order-item');
    if (btnAddItem) {
      btnAddItem.addEventListener('click', () => this.addOrderItemRow());
    }

    // Submit New Order Form
    const formNewOrder = document.getElementById('form-new-order');
    if (formNewOrder) {
      formNewOrder.addEventListener('submit', (e) => this.handleCreateOrder(e));
    }

    // Order status filter
    const statusFilter = document.getElementById('filter-order-status');
    if (statusFilter) {
      statusFilter.addEventListener('change', () => this.renderOrdersTable());
    }
  },

  async loadOrders() {
    try {
      const res = await window.MedicareAPI.getOrders();
      if (res.success) {
        this.orders = res.data;
        this.renderOrdersTable();
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    }
  },

  populateCustomerDropdown() {
    const custSelect = document.getElementById('new-order-customer');
    if (!custSelect) return;

    window.MedicareAPI.getCustomers().then(res => {
      if (res.success) {
        let opts = '<option value="">-- Choose Customer --</option>';
        res.data.forEach(c => {
          opts += `<option value="${c.id}" data-address="${this.escapeHtml(c.address + ', ' + c.city)}">${this.escapeHtml(c.customer_name)} (${c.phone})</option>`;
        });
        custSelect.innerHTML = opts;
      }
    });

    custSelect.addEventListener('change', (e) => {
      const opt = custSelect.options[custSelect.selectedIndex];
      const addr = opt ? opt.getAttribute('data-address') : '';
      const addrInput = document.getElementById('new-order-address');
      if (addrInput && addr) addrInput.value = addr;
    });
  },

  renderOrdersTable() {
    const tbody = document.getElementById('orders-table-body');
    const filter = document.getElementById('filter-order-status')?.value || '';
    const countBadge = document.getElementById('orders-total-count');

    if (!tbody) return;

    let list = this.orders;
    if (filter) {
      list = list.filter(o => o.order_status === filter);
    }

    if (countBadge) countBadge.textContent = `${list.length} of ${this.orders.length} Orders`;

    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" class="text-center py-4 text-muted">No orders found.</td></tr>`;
      return;
    }

    tbody.innerHTML = list.map(o => {
      let statusClass = 'status-pill-pending';
      if (o.order_status === 'Completed') statusClass = 'status-pill-completed';
      else if (o.order_status === 'Processing') statusClass = 'status-pill-processing';
      else if (o.order_status === 'Confirmed') statusClass = 'status-pill-confirmed';
      else if (o.order_status === 'Cancelled') statusClass = 'status-pill-cancelled';

      return `
        <tr>
          <td class="font-mono-code fw-semibold text-primary">#ORD-${String(o.id).padStart(4, '0')}</td>
          <td>
            <div class="fw-semibold text-dark">${this.escapeHtml(o.customer_name)}</div>
            <div class="small text-muted font-mono-code">${this.escapeHtml(o.customer_phone || '')}</div>
          </td>
          <td><span class="font-mono-code small text-secondary">${o.order_date}</span></td>
          <td class="tabular-nums text-center"><span class="badge bg-light text-dark border">${o.item_count || 1} items</span></td>
          <td class="tabular-nums text-end fw-bold text-dark">₹${parseFloat(o.total_amount).toFixed(2)}</td>
          <td><span class="badge bg-light text-secondary border">${o.payment_method}</span></td>
          <td><span class="status-indicator ${statusClass}">${o.order_status}</span></td>
          <td>
            <div class="d-flex gap-1">
              <button class="btn btn-sm btn-outline-secondary btn-action-icon" title="View Order Receipt" onclick="OrdersModule.openOrderDetails(${o.id})">
                <i class="bi bi-file-text"></i>
              </button>
              <div class="dropdown">
                <button class="btn btn-sm btn-outline-primary btn-action-icon dropdown-toggle" data-bs-toggle="dropdown" title="Change Status">
                  <i class="bi bi-three-dots"></i>
                </button>
                <ul class="dropdown-menu dropdown-menu-end shadow-sm">
                  <li><a class="dropdown-item" href="javascript:void(0)" onclick="OrdersModule.changeStatus(${o.id}, 'Pending')">Mark Pending</a></li>
                  <li><a class="dropdown-item" href="javascript:void(0)" onclick="OrdersModule.changeStatus(${o.id}, 'Confirmed')">Mark Confirmed</a></li>
                  <li><a class="dropdown-item" href="javascript:void(0)" onclick="OrdersModule.changeStatus(${o.id}, 'Processing')">Mark Processing</a></li>
                  <li><a class="dropdown-item text-success" href="javascript:void(0)" onclick="OrdersModule.changeStatus(${o.id}, 'Completed')"><i class="bi bi-check2"></i> Mark Completed</a></li>
                  <li><hr class="dropdown-divider"></li>
                  <li><a class="dropdown-item text-danger" href="javascript:void(0)" onclick="OrdersModule.changeStatus(${o.id}, 'Cancelled')">Mark Cancelled</a></li>
                </ul>
              </div>
            </div>
          </td>
        </tr>`;
    }).join('');
  },

  async openOrderDetails(orderId) {
    try {
      const res = await window.MedicareAPI.getOrder(orderId);
      if (!res.success || !res.data) {
        window.MedicareApp.showToast('Order details not found', 'danger');
        return;
      }

      const ord = res.data;
      const modalBody = document.getElementById('view-order-content');
      if (!modalBody) return;

      const itemsHtml = (ord.items || []).map((item, idx) => `
        <tr>
          <td class="text-muted font-mono-code">${idx + 1}</td>
          <td>
            <div class="fw-semibold text-dark">${this.escapeHtml(item.product_name)}</div>
            <div class="small text-muted font-mono-code">${this.escapeHtml(item.product_code)} · Batch: ${this.escapeHtml(item.batch_number || '')}</div>
          </td>
          <td class="tabular-nums text-center">${item.quantity} ${this.escapeHtml(item.unit || '')}</td>
          <td class="tabular-nums text-end">₹${parseFloat(item.unit_price).toFixed(2)}</td>
          <td class="tabular-nums text-end fw-semibold">₹${parseFloat(item.subtotal).toFixed(2)}</td>
        </tr>
      `).join('');

      modalBody.innerHTML = `
        <div class="printable-receipt">
          <div class="d-flex justify-content-between align-items-start border-bottom pb-3 mb-3">
            <div>
              <div class="d-flex align-items-center gap-2 mb-1">
                <span class="brand-icon" style="width:28px;height:28px;font-size:0.9rem;">M</span>
                <span class="fs-5 fw-bold text-dark">MediCare Medical Store</span>
              </div>
              <div class="small text-muted">A Licensed OTC Healthcare & Medical Inventory Dispenser</div>
              <div class="small text-muted">Order Invoice Ref: <strong>#ORD-${String(ord.id).padStart(4, '0')}</strong></div>
            </div>
            <div class="text-end">
              <span class="status-indicator status-pill-${(ord.order_status || '').toLowerCase()} mb-1">${ord.order_status}</span>
              <div class="small font-mono-code text-muted">${ord.order_date}</div>
            </div>
          </div>

          <div class="row g-3 mb-4">
            <div class="col-sm-6">
              <div class="text-uppercase small fw-bold text-muted mb-1">Customer Information</div>
              <div class="fw-semibold text-dark">${this.escapeHtml(ord.customer_name)}</div>
              <div class="small text-muted"><i class="bi bi-telephone me-1"></i>${this.escapeHtml(ord.customer_phone || '')}</div>
              <div class="small text-muted"><i class="bi bi-envelope me-1"></i>${this.escapeHtml(ord.customer_email || '')}</div>
            </div>
            <div class="col-sm-6 text-sm-end">
              <div class="text-uppercase small fw-bold text-muted mb-1">Payment & Delivery</div>
              <div class="small">Method: <strong>${ord.payment_method}</strong></div>
              <div class="small text-muted text-break mt-1">Delivery Address:<br>${this.escapeHtml(ord.delivery_address || 'Walk-in Store Collection')}</div>
            </div>
          </div>

          <div class="table-responsive mb-3">
            <table class="table table-bordered table-sm align-middle">
              <thead class="table-light">
                <tr>
                  <th style="width: 40px;">#</th>
                  <th>Medical Product & Batch</th>
                  <th class="text-center" style="width: 90px;">Qty</th>
                  <th class="text-end" style="width: 120px;">Price</th>
                  <th class="text-end" style="width: 130px;">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="4" class="text-end fw-bold">Total Amount Payable:</td>
                  <td class="text-end fw-bold fs-6 text-primary tabular-nums">₹${parseFloat(ord.total_amount).toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div class="border-top pt-2 text-center text-muted small fst-italic">
            Notice: Over-the-counter wellness & diagnostics supplies. Keep medical receipts for health records.
          </div>
        </div>
      `;

      new bootstrap.Modal(document.getElementById('modal-view-order')).show();
    } catch (err) {
      window.MedicareApp.showToast('Failed to load order receipt: ' + err.message, 'danger');
    }
  },

  async changeStatus(orderId, newStatus) {
    try {
      const res = await window.MedicareAPI.updateOrderStatus(orderId, newStatus);
      if (res.success) {
        window.MedicareApp.showToast(`Order status updated to '${newStatus}'.`, 'success');
        await this.loadOrders();
        window.MedicareApp.refreshDashboard();
      } else {
        window.MedicareApp.showToast(res.message || 'Status update failed', 'danger');
      }
    } catch (err) {
      window.MedicareApp.showToast('Error: ' + err.message, 'danger');
    }
  },

  // Open Create Order Modal
  openCreateOrderModal() {
    this.populateCustomerDropdown();
    this.activeOrderItems = [];
    const container = document.getElementById('order-items-container');
    if (container) container.innerHTML = '';
    this.addOrderItemRow(); // add 1 initial row
    this.updateOrderTotal();

    new bootstrap.Modal(document.getElementById('modal-new-order')).show();
  },

  addOrderItemRow() {
    const container = document.getElementById('order-items-container');
    if (!container) return;

    const rowId = Date.now() + Math.random().toString(36).substring(2, 5);
    const row = document.createElement('div');
    row.className = 'row g-2 align-items-center mb-2 order-item-row';
    row.dataset.rowId = rowId;

    // Filter products: Only non-expired products can be ordered!
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const safeProducts = (window.ProductsModule.products || []).filter(p => {
      const exp = new Date(p.expiry_date);
      return exp >= today && p.stock_quantity > 0;
    });

    let productOpts = '<option value="">-- Choose In-Stock Product --</option>';
    safeProducts.forEach(p => {
      productOpts += `<option value="${p.id}" data-price="${p.selling_price}" data-stock="${p.stock_quantity}" data-unit="${p.unit || 'Pack'}">
        ${this.escapeHtml(p.product_name)} (Stock: ${p.stock_quantity} | ₹${p.selling_price})
      </option>`;
    });

    row.innerHTML = `
      <div class="col-md-6">
        <select class="form-select form-select-sm product-select" required>
          ${productOpts}
        </select>
      </div>
      <div class="col-md-2">
        <input type="number" class="form-control form-control-sm qty-input text-center" min="1" max="999" value="1" required>
      </div>
      <div class="col-md-3 text-end">
        <span class="font-mono-code row-subtotal fw-semibold">₹0.00</span>
      </div>
      <div class="col-md-1 text-center">
        <button type="button" class="btn btn-sm btn-link text-danger p-0" title="Remove Item" onclick="this.closest('.order-item-row').remove(); OrdersModule.updateOrderTotal();">
          <i class="bi bi-trash"></i>
        </button>
      </div>
    `;

    container.appendChild(row);

    const sel = row.querySelector('.product-select');
    const qty = row.querySelector('.qty-input');

    sel.addEventListener('change', () => {
      const opt = sel.options[sel.selectedIndex];
      const maxStock = parseInt(opt.getAttribute('data-stock') || '999', 10);
      qty.max = maxStock;
      if (parseInt(qty.value, 10) > maxStock) qty.value = maxStock;
      this.updateRowSubtotal(row);
    });

    qty.addEventListener('input', () => {
      this.updateRowSubtotal(row);
    });
  },

  updateRowSubtotal(row) {
    const sel = row.querySelector('.product-select');
    const qty = row.querySelector('.qty-input');
    const subtotalEl = row.querySelector('.row-subtotal');

    const opt = sel.options[sel.selectedIndex];
    const price = opt ? parseFloat(opt.getAttribute('data-price') || 0) : 0;
    const quantity = parseInt(qty.value || 0, 10);

    const sub = price * quantity;
    subtotalEl.textContent = '₹' + sub.toFixed(2);
    this.updateOrderTotal();
  },

  updateOrderTotal() {
    const rows = document.querySelectorAll('.order-item-row');
    let total = 0;
    rows.forEach(r => {
      const sel = r.querySelector('.product-select');
      const qty = r.querySelector('.qty-input');
      const opt = sel.options[sel.selectedIndex];
      if (opt && opt.value) {
        const price = parseFloat(opt.getAttribute('data-price') || 0);
        const q = parseInt(qty.value || 0, 10);
        total += price * q;
      }
    });

    const totalEl = document.getElementById('new-order-total-amount');
    if (totalEl) totalEl.textContent = '₹' + total.toFixed(2);
  },

  async handleCreateOrder(e) {
    e.preventDefault();
    const form = e.target;
    const custId = parseInt(document.getElementById('new-order-customer').value, 10);
    const paymentMethod = document.getElementById('new-order-payment').value;
    const deliveryAddress = document.getElementById('new-order-address').value.trim();

    if (!custId) {
      window.MedicareApp.showToast('Please select a customer', 'warning');
      return;
    }

    const rows = document.querySelectorAll('.order-item-row');
    const items = [];

    for (const r of rows) {
      const sel = r.querySelector('.product-select');
      const qtyInput = r.querySelector('.qty-input');
      const pid = parseInt(sel.value, 10);
      const qty = parseInt(qtyInput.value, 10);

      if (pid && qty > 0) {
        items.push({ product_id: pid, quantity: qty });
      }
    }

    if (items.length === 0) {
      window.MedicareApp.showToast('Please add at least one valid medical product item', 'warning');
      return;
    }

    const payload = {
      customer_id: custId,
      payment_method: paymentMethod,
      delivery_address: deliveryAddress || 'Pharmacy counter pickup',
      items: items
    };

    try {
      const res = await window.MedicareAPI.createOrder(payload);
      if (res.success) {
        bootstrap.Modal.getInstance(document.getElementById('modal-new-order'))?.hide();
        form.reset();
        window.MedicareApp.showToast(res.message || 'Order created successfully.', 'success');
        await this.loadOrders();
        await window.ProductsModule.loadProducts();
        window.MedicareApp.refreshDashboard();
      } else {
        window.MedicareApp.showToast(res.message || 'Failed to create order', 'danger');
      }
    } catch (err) {
      window.MedicareApp.showToast('Network error: ' + err.message, 'danger');
    }
  },

  escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
};

window.OrdersModule = OrdersModule;
