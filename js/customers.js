/**
 * MediCare Medical Store Management System
 * Customers Module - Full CRUD
 */

const CustomersModule = {
  customers: [],

  init() {
    this.bindEvents();
  },

  bindEvents() {
    const addForm = document.getElementById('form-add-customer');
    if (addForm) {
      addForm.addEventListener('submit', (e) => this.handleCreateCustomer(e));
    }

    const editForm = document.getElementById('form-edit-customer');
    if (editForm) {
      editForm.addEventListener('submit', (e) => this.handleUpdateCustomer(e));
    }

    const btnDelete = document.getElementById('btn-confirm-delete-customer');
    if (btnDelete) {
      btnDelete.addEventListener('click', () => this.executeDeleteCustomer());
    }
  },

  async loadCustomers() {
    try {
      const res = await window.MedicareAPI.getCustomers();
      if (res.success) {
        this.customers = res.data;
        this.renderTable();
      }
    } catch (err) {
      console.error('Failed to load customers:', err);
    }
  },

  renderTable() {
    const tbody = document.getElementById('customers-table-body');
    const countBadge = document.getElementById('customers-total-count');
    if (countBadge) countBadge.textContent = `${this.customers.length} Customers`;

    if (!tbody) return;

    if (this.customers.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" class="text-center py-4 text-muted">No customers registered.</td></tr>`;
      return;
    }

    tbody.innerHTML = this.customers.map(c => `
      <tr>
        <td class="font-mono-code text-muted">#${c.id}</td>
        <td><strong class="text-dark">${this.escapeHtml(c.customer_name)}</strong></td>
        <td>
          <div><i class="bi bi-envelope text-secondary me-1"></i>${this.escapeHtml(c.email)}</div>
          <div class="small font-mono-code text-muted"><i class="bi bi-telephone text-secondary me-1"></i>${this.escapeHtml(c.phone)}</div>
        </td>
        <td>${this.escapeHtml(c.city)}, ${this.escapeHtml(c.state)} <span class="text-muted font-mono-code small">(${this.escapeHtml(c.pincode)})</span></td>
        <td class="tabular-nums text-center"><span class="badge bg-light text-dark border">${c.order_count || 0} Orders</span></td>
        <td class="tabular-nums text-end fw-semibold">₹${parseFloat(c.total_spent || 0).toFixed(2)}</td>
        <td>
          <div class="d-flex gap-1">
            <button class="btn btn-sm btn-outline-primary btn-action-icon" title="Edit Customer" onclick="CustomersModule.openEditModal(${c.id})">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger btn-action-icon" title="Delete Customer" onclick="CustomersModule.promptDelete(${c.id})">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  },

  async handleCreateCustomer(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);

    const errors = window.FormValidator.validateCustomer(formData);
    if (Object.keys(errors).length > 0) {
      window.FormValidator.showServerErrors(form, errors);
      return;
    }

    const payload = Object.fromEntries(formData.entries());

    try {
      const res = await window.MedicareAPI.createCustomer(payload);
      if (res.success) {
        bootstrap.Modal.getInstance(document.getElementById('modal-add-customer'))?.hide();
        form.reset();
        window.MedicareApp.showToast('Customer added successfully.', 'success');
        await this.loadCustomers();
        window.OrdersModule.populateCustomerDropdown();
      } else {
        if (res.errors) window.FormValidator.showServerErrors(form, res.errors);
        window.MedicareApp.showToast(res.message || 'Failed to add customer', 'danger');
      }
    } catch (err) {
      window.MedicareApp.showToast('Network error: ' + err.message, 'danger');
    }
  },

  async openEditModal(id) {
    try {
      const res = await window.MedicareAPI.getCustomer(id);
      if (!res.success || !res.data) return;
      const c = res.data;
      const form = document.getElementById('form-edit-customer');
      window.FormValidator.clearErrors(form);

      form.querySelector('[name="id"]').value = c.id;
      form.querySelector('[name="customer_name"]').value = c.customer_name;
      form.querySelector('[name="email"]').value = c.email;
      form.querySelector('[name="phone"]').value = c.phone;
      form.querySelector('[name="date_of_birth"]').value = c.date_of_birth || '';
      form.querySelector('[name="address"]').value = c.address;
      form.querySelector('[name="city"]').value = c.city;
      form.querySelector('[name="state"]').value = c.state;
      form.querySelector('[name="pincode"]').value = c.pincode;

      new bootstrap.Modal(document.getElementById('modal-edit-customer')).show();
    } catch (err) {
      window.MedicareApp.showToast('Failed to load customer: ' + err.message, 'danger');
    }
  },

  async handleUpdateCustomer(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const id = formData.get('id');

    const errors = window.FormValidator.validateCustomer(formData);
    if (Object.keys(errors).length > 0) {
      window.FormValidator.showServerErrors(form, errors);
      return;
    }

    const payload = Object.fromEntries(formData.entries());

    try {
      const res = await window.MedicareAPI.updateCustomer(id, payload);
      if (res.success) {
        bootstrap.Modal.getInstance(document.getElementById('modal-edit-customer'))?.hide();
        window.MedicareApp.showToast('Customer updated successfully.', 'success');
        await this.loadCustomers();
      } else {
        if (res.errors) window.FormValidator.showServerErrors(form, res.errors);
        window.MedicareApp.showToast(res.message || 'Update failed', 'danger');
      }
    } catch (err) {
      window.MedicareApp.showToast('Error: ' + err.message, 'danger');
    }
  },

  customerToDeleteId: null,

  promptDelete(id) {
    const c = this.customers.find(item => item.id == id);
    if (!c) return;

    this.customerToDeleteId = id;
    document.getElementById('delete-customer-name').textContent = c.customer_name;
    document.getElementById('delete-customer-phone').textContent = c.phone;

    new bootstrap.Modal(document.getElementById('modal-delete-customer')).show();
  },

  async executeDeleteCustomer() {
    if (!this.customerToDeleteId) return;

    try {
      const res = await window.MedicareAPI.deleteCustomer(this.customerToDeleteId);
      bootstrap.Modal.getInstance(document.getElementById('modal-delete-customer'))?.hide();

      if (res.success) {
        window.MedicareApp.showToast('Customer deleted successfully.', 'success');
        this.customerToDeleteId = null;
        await this.loadCustomers();
      } else {
        window.MedicareApp.showToast(res.message || 'Failed to delete customer.', 'warning');
      }
    } catch (err) {
      window.MedicareApp.showToast('Error: ' + err.message, 'danger');
    }
  },

  escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
};

window.CustomersModule = CustomersModule;
