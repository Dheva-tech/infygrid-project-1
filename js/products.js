/**
 * MediCare Medical Store Management System
 * Products Module - CRUD, Search, Filtering, Sorting, Modals
 */

const ProductsModule = {
  products: [],
  categories: [],
  suppliers: [],

  init() {
    this.bindEvents();
  },

  bindEvents() {
    // Search input with debounce
    const searchInput = document.getElementById('product-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', () => this.applyFilters());
    }

    // Filter selects
    ['filter-category', 'filter-supplier', 'filter-stock-status', 'filter-expiry-status', 'sort-products'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('change', () => this.applyFilters());
    });

    // Reset filters button
    const btnReset = document.getElementById('btn-reset-product-filters');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        document.getElementById('filter-category').value = '';
        document.getElementById('filter-supplier').value = '';
        document.getElementById('filter-stock-status').value = '';
        document.getElementById('filter-expiry-status').value = '';
        document.getElementById('sort-products').value = 'name_asc';
        this.applyFilters();
      });
    }

    // Save New Product Form
    const addForm = document.getElementById('form-add-product');
    if (addForm) {
      addForm.addEventListener('submit', (e) => this.handleCreateProduct(e));
    }

    // Save Edit Product Form
    const editForm = document.getElementById('form-edit-product');
    if (editForm) {
      editForm.addEventListener('submit', (e) => this.handleUpdateProduct(e));
    }

    // Confirm Delete Button
    const btnConfirmDelete = document.getElementById('btn-confirm-delete-product');
    if (btnConfirmDelete) {
      btnConfirmDelete.addEventListener('click', () => this.executeDeleteProduct());
    }
  },

  async loadProducts() {
    try {
      const [resProd, resCat, resSup] = await Promise.all([
        window.MedicareAPI.getProducts(),
        window.MedicareAPI.getCategories(),
        window.MedicareAPI.getSuppliers()
      ]);

      if (resProd.success) {
        this.products = resProd.data;
      }
      if (resCat.success) {
        this.categories = resCat.data;
        this.populateCategoryDropdowns();
      }
      if (resSup.success) {
        this.suppliers = resSup.data;
        this.populateSupplierDropdowns();
      }

      this.applyFilters();
    } catch (err) {
      console.error('Failed to load products:', err);
      window.MedicareApp.showToast('Error loading products: ' + err.message, 'danger');
    }
  },

  populateCategoryDropdowns() {
    const filterSelect = document.getElementById('filter-category');
    const addSelect = document.getElementById('add-product-category');
    const editSelect = document.getElementById('edit-product-category');

    let filterOptions = '<option value="">All Categories</option>';
    let formOptions = '<option value="">-- Select Category --</option>';

    this.categories.forEach(cat => {
      filterOptions += `<option value="${cat.id}">${cat.category_name}</option>`;
      formOptions += `<option value="${cat.id}">${cat.category_name}</option>`;
    });

    if (filterSelect) filterSelect.innerHTML = filterOptions;
    if (addSelect) addSelect.innerHTML = formOptions;
    if (editSelect) editSelect.innerHTML = formOptions;
  },

  populateSupplierDropdowns() {
    const filterSelect = document.getElementById('filter-supplier');
    const addSelect = document.getElementById('add-product-supplier');
    const editSelect = document.getElementById('edit-product-supplier');

    let filterOptions = '<option value="">All Suppliers</option>';
    let formOptions = '<option value="">-- Select Supplier --</option>';

    this.suppliers.forEach(sup => {
      filterOptions += `<option value="${sup.id}">${sup.company_name} (${sup.supplier_name})</option>`;
      formOptions += `<option value="${sup.id}">${sup.company_name}</option>`;
    });

    if (filterSelect) filterSelect.innerHTML = filterOptions;
    if (addSelect) addSelect.innerHTML = formOptions;
    if (editSelect) editSelect.innerHTML = formOptions;
  },

  applyFilters() {
    const searchVal = (document.getElementById('product-search-input')?.value || '').toLowerCase().trim();
    const catVal = document.getElementById('filter-category')?.value || '';
    const supVal = document.getElementById('filter-supplier')?.value || '';
    const stockVal = document.getElementById('filter-stock-status')?.value || '';
    const expVal = document.getElementById('filter-expiry-status')?.value || '';
    const sortVal = document.getElementById('sort-products')?.value || 'name_asc';

    let filtered = this.products.filter(p => {
      // Search by name, code, brand, batch
      if (searchVal) {
        const matchesName = (p.product_name || '').toLowerCase().includes(searchVal);
        const matchesCode = (p.product_code || '').toLowerCase().includes(searchVal);
        const matchesBrand = (p.brand || '').toLowerCase().includes(searchVal);
        const matchesBatch = (p.batch_number || '').toLowerCase().includes(searchVal);
        if (!matchesName && !matchesCode && !matchesBrand && !matchesBatch) return false;
      }

      // Filter category
      if (catVal && String(p.category_id) !== String(catVal)) return false;

      // Filter supplier
      if (supVal && String(p.supplier_id) !== String(supVal)) return false;

      // Filter stock status
      if (stockVal) {
        if (stockVal === 'out_of_stock' && p.stock_quantity > 0) return false;
        if (stockVal === 'low_stock' && (p.stock_quantity <= 0 || p.stock_quantity > p.reorder_level)) return false;
        if (stockVal === 'in_stock' && p.stock_quantity <= p.reorder_level) return false;
      }

      // Filter expiry status
      if (expVal) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const expDate = new Date(p.expiry_date);
        const diffDays = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));

        if (expVal === 'expired' && diffDays >= 0) return false;
        if (expVal === 'expiring_soon' && (diffDays < 0 || diffDays > 30)) return false;
        if (expVal === 'safe' && diffDays <= 30) return false;
      }

      return true;
    });

    // Sorting
    filtered.sort((a, b) => {
      switch (sortVal) {
        case 'name_desc':
          return b.product_name.localeCompare(a.product_name);
        case 'price_low':
          return parseFloat(a.selling_price) - parseFloat(b.selling_price);
        case 'price_high':
          return parseFloat(b.selling_price) - parseFloat(a.selling_price);
        case 'stock_low':
          return parseInt(a.stock_quantity) - parseInt(b.stock_quantity);
        case 'stock_high':
          return parseInt(b.stock_quantity) - parseInt(a.stock_quantity);
        case 'expiry_asc':
          return new Date(a.expiry_date) - new Date(b.expiry_date);
        case 'name_asc':
        default:
          return a.product_name.localeCompare(b.product_name);
      }
    });

    this.renderProductsTable(filtered);
  },

  renderProductsTable(items) {
    const tbody = document.getElementById('products-table-body');
    const countBadge = document.getElementById('products-total-count');
    if (countBadge) countBadge.textContent = `${items.length} of ${this.products.length} Products`;

    if (!tbody) return;

    if (items.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="14" class="text-center py-5 text-muted">
            <i class="bi bi-box-seam fs-2 d-block mb-2 text-secondary"></i>
            No medical products found matching your search or filters.
          </td>
        </tr>`;
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    tbody.innerHTML = items.map(p => {
      // Stock Status
      let stockBadge = '';
      if (p.stock_quantity === 0) {
        stockBadge = '<span class="status-indicator status-out-stock"><i class="bi bi-x-circle"></i> Out of Stock</span>';
      } else if (p.stock_quantity <= p.reorder_level) {
        stockBadge = '<span class="status-indicator status-low-stock"><i class="bi bi-exclamation-triangle"></i> Low Stock</span>';
      } else {
        stockBadge = '<span class="status-indicator status-in-stock"><i class="bi bi-check2-circle"></i> In Stock</span>';
      }

      // Expiry calculation
      const exp = new Date(p.expiry_date);
      const diffDays = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
      let expiryBadge = '';
      if (diffDays < 0) {
        expiryBadge = `<div class="status-indicator status-expired mt-1"><i class="bi bi-shield-x"></i> Expired</div>`;
      } else if (diffDays <= 30) {
        expiryBadge = `<div class="status-indicator status-expiring mt-1"><i class="bi bi-clock-history"></i> ${diffDays}d left</div>`;
      }

      return `
        <tr data-id="${p.id}">
          <td class="font-mono-code text-muted">#${p.id}</td>
          <td><span class="font-mono-code fw-semibold text-primary">${p.product_code}</span></td>
          <td>
            <div class="fw-semibold text-dark">${this.escapeHtml(p.product_name)}</div>
            <div class="small text-muted">${this.escapeHtml(p.unit || 'Pack')} · ${this.escapeHtml(p.rack_number || '')}</div>
          </td>
          <td><span class="text-secondary">${this.escapeHtml(p.category_name || 'N/A')}</span></td>
          <td>${this.escapeHtml(p.brand)}</td>
          <td><span class="font-mono-code text-muted">${this.escapeHtml(p.batch_number)}</span></td>
          <td>
            <span class="font-mono-code">${p.expiry_date}</span>
            ${expiryBadge}
          </td>
          <td class="tabular-nums text-end">₹${parseFloat(p.purchase_price).toFixed(2)}</td>
          <td class="tabular-nums text-end fw-semibold">₹${parseFloat(p.selling_price).toFixed(2)}</td>
          <td class="tabular-nums text-center">
            <span class="fw-bold ${p.stock_quantity <= p.reorder_level ? 'text-danger' : 'text-dark'}">${p.stock_quantity}</span>
          </td>
          <td class="tabular-nums text-center text-muted">${p.reorder_level}</td>
          <td><span class="small text-truncate d-inline-block" style="max-width: 130px;" title="${this.escapeHtml(p.company_name || '')}">${this.escapeHtml(p.company_name || p.supplier_name || 'N/A')}</span></td>
          <td>${stockBadge}</td>
          <td>
            <div class="d-flex gap-1">
              <button class="btn btn-sm btn-outline-secondary btn-action-icon" title="View Details" onclick="ProductsModule.openViewModal(${p.id})">
                <i class="bi bi-eye"></i>
              </button>
              <button class="btn btn-sm btn-outline-primary btn-action-icon" title="Edit Product" onclick="ProductsModule.openEditModal(${p.id})">
                <i class="bi bi-pencil"></i>
              </button>
              <button class="btn btn-sm btn-outline-danger btn-action-icon" title="Delete Product" onclick="ProductsModule.promptDelete(${p.id})">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </td>
        </tr>`;
    }).join('');
  },

  async handleCreateProduct(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);

    // Frontend validation
    const errors = window.FormValidator.validateProduct(formData);
    if (Object.keys(errors).length > 0) {
      window.FormValidator.showServerErrors(form, errors);
      return;
    }

    const payload = Object.fromEntries(formData.entries());

    try {
      const res = await window.MedicareAPI.createProduct(payload);
      if (res.success) {
        bootstrap.Modal.getInstance(document.getElementById('modal-add-product'))?.hide();
        form.reset();
        window.FormValidator.clearErrors(form);
        window.MedicareApp.showToast('Product added successfully.', 'success');
        await this.loadProducts();
        window.MedicareApp.refreshDashboard();
      } else {
        if (res.errors) {
          window.FormValidator.showServerErrors(form, res.errors);
        }
        window.MedicareApp.showToast(res.message || 'Failed to add product', 'danger');
      }
    } catch (err) {
      window.MedicareApp.showToast('Network error: ' + err.message, 'danger');
    }
  },

  async openEditModal(id) {
    try {
      const res = await window.MedicareAPI.getProduct(id);
      if (!res.success || !res.data) {
        window.MedicareApp.showToast('Product record could not be loaded', 'danger');
        return;
      }
      const prod = res.data;
      const form = document.getElementById('form-edit-product');
      window.FormValidator.clearErrors(form);

      form.querySelector('[name="id"]').value = prod.id;
      form.querySelector('[name="product_code"]').value = prod.product_code;
      form.querySelector('[name="product_name"]').value = prod.product_name;
      form.querySelector('[name="category_id"]').value = prod.category_id;
      form.querySelector('[name="supplier_id"]').value = prod.supplier_id;
      form.querySelector('[name="brand"]').value = prod.brand;
      form.querySelector('[name="batch_number"]').value = prod.batch_number;
      form.querySelector('[name="manufacturing_date"]').value = prod.manufacturing_date;
      form.querySelector('[name="expiry_date"]').value = prod.expiry_date;
      form.querySelector('[name="purchase_price"]').value = prod.purchase_price;
      form.querySelector('[name="selling_price"]').value = prod.selling_price;
      form.querySelector('[name="stock_quantity"]').value = prod.stock_quantity;
      form.querySelector('[name="reorder_level"]').value = prod.reorder_level;
      form.querySelector('[name="unit"]').value = prod.unit || 'Pack';
      form.querySelector('[name="rack_number"]').value = prod.rack_number || 'Rack A-1';
      form.querySelector('[name="description"]').value = prod.description || '';
      form.querySelector('[name="status"]').value = prod.status || 'active';

      const modal = new bootstrap.Modal(document.getElementById('modal-edit-product'));
      modal.show();
    } catch (err) {
      window.MedicareApp.showToast('Failed to load product: ' + err.message, 'danger');
    }
  },

  async handleUpdateProduct(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const id = formData.get('id');

    // Frontend validation
    const errors = window.FormValidator.validateProduct(formData);
    if (Object.keys(errors).length > 0) {
      window.FormValidator.showServerErrors(form, errors);
      return;
    }

    const payload = Object.fromEntries(formData.entries());

    try {
      const res = await window.MedicareAPI.updateProduct(id, payload);
      if (res.success) {
        bootstrap.Modal.getInstance(document.getElementById('modal-edit-product'))?.hide();
        window.MedicareApp.showToast('Product updated successfully.', 'success');
        await this.loadProducts();
        window.MedicareApp.refreshDashboard();
      } else {
        if (res.errors) {
          window.FormValidator.showServerErrors(form, res.errors);
        }
        window.MedicareApp.showToast(res.message || 'Update failed', 'danger');
      }
    } catch (err) {
      window.MedicareApp.showToast('Network error: ' + err.message, 'danger');
    }
  },

  productToDeleteId: null,

  promptDelete(id) {
    const prod = this.products.find(p => p.id == id);
    if (!prod) return;

    this.productToDeleteId = id;
    document.getElementById('delete-product-name').textContent = prod.product_name;
    document.getElementById('delete-product-code').textContent = prod.product_code;

    const modal = new bootstrap.Modal(document.getElementById('modal-delete-product'));
    modal.show();
  },

  async executeDeleteProduct() {
    if (!this.productToDeleteId) return;

    try {
      const res = await window.MedicareAPI.deleteProduct(this.productToDeleteId);
      bootstrap.Modal.getInstance(document.getElementById('modal-delete-product'))?.hide();

      if (res.success) {
        window.MedicareApp.showToast('Product deleted successfully.', 'success');
        this.productToDeleteId = null;
        await this.loadProducts();
        window.MedicareApp.refreshDashboard();
      } else {
        window.MedicareApp.showToast(res.message || 'Failed to delete product.', 'warning');
      }
    } catch (err) {
      window.MedicareApp.showToast('Error: ' + err.message, 'danger');
    }
  },

  async openViewModal(id) {
    try {
      const res = await window.MedicareAPI.getProduct(id);
      if (!res.success || !res.data) return;
      const p = res.data;

      const body = document.getElementById('view-product-details');
      if (body) {
        const margin = (parseFloat(p.selling_price) - parseFloat(p.purchase_price)).toFixed(2);
        const marginPct = (parseFloat(p.purchase_price) > 0 ? (margin / p.purchase_price * 100).toFixed(1) : 0);

        body.innerHTML = `
          <div class="row g-3">
            <div class="col-md-8">
              <h5 class="fw-bold mb-1 text-dark">${this.escapeHtml(p.product_name)}</h5>
              <div class="text-muted small mb-3">Code: <span class="font-mono-code fw-semibold text-primary">${p.product_code}</span> · Brand: <strong>${this.escapeHtml(p.brand)}</strong></div>
              <p class="text-secondary small mb-3">${this.escapeHtml(p.description || 'No detailed pharmaceutical description available.')}</p>
            </div>
            <div class="col-md-4 text-md-end">
              <div class="p-3 bg-light rounded border">
                <div class="text-muted small">Selling Price</div>
                <div class="fs-4 fw-bold text-dark tabular-nums">₹${parseFloat(p.selling_price).toFixed(2)}</div>
                <div class="small text-success mt-1">Margin: ₹${margin} (+${marginPct}%)</div>
              </div>
            </div>
            <div class="col-12"><hr class="my-1"></div>
            <div class="col-sm-6 col-md-3">
              <div class="text-muted small">Category</div>
              <div class="fw-semibold">${this.escapeHtml(p.category_name || 'N/A')}</div>
            </div>
            <div class="col-sm-6 col-md-3">
              <div class="text-muted small">Supplier</div>
              <div class="fw-semibold">${this.escapeHtml(p.company_name || p.supplier_name || 'N/A')}</div>
            </div>
            <div class="col-sm-6 col-md-3">
              <div class="text-muted small">Batch Number</div>
              <div class="font-mono-code">${this.escapeHtml(p.batch_number)}</div>
            </div>
            <div class="col-sm-6 col-md-3">
              <div class="text-muted small">Rack Location</div>
              <div>${this.escapeHtml(p.rack_number || 'A-1')}</div>
            </div>
            <div class="col-sm-6 col-md-3">
              <div class="text-muted small">Mfg Date</div>
              <div class="font-mono-code">${p.manufacturing_date}</div>
            </div>
            <div class="col-sm-6 col-md-3">
              <div class="text-muted small">Expiry Date</div>
              <div class="font-mono-code text-danger fw-semibold">${p.expiry_date}</div>
            </div>
            <div class="col-sm-6 col-md-3">
              <div class="text-muted small">Current Stock</div>
              <div class="fw-bold tabular-nums">${p.stock_quantity} ${this.escapeHtml(p.unit || 'Pack')}</div>
            </div>
            <div class="col-sm-6 col-md-3">
              <div class="text-muted small">Reorder Threshold</div>
              <div class="tabular-nums">${p.reorder_level}</div>
            </div>
          </div>
        `;
      }

      const modal = new bootstrap.Modal(document.getElementById('modal-view-product'));
      modal.show();
    } catch (err) {
      window.MedicareApp.showToast('Failed to view product: ' + err.message, 'danger');
    }
  },

  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
};

window.ProductsModule = ProductsModule;
