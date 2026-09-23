/**
 * MediCare Medical Store Management System
 * Suppliers Module - Full CRUD
 */

const SuppliersModule = {
  suppliers: [],

  init() {
    this.bindEvents();
  },

  bindEvents() {
    const addForm = document.getElementById('form-add-supplier');
    if (addForm) {
      addForm.addEventListener('submit', (e) => this.handleCreateSupplier(e));
    }

    const editForm = document.getElementById('form-edit-supplier');
    if (editForm) {
      editForm.addEventListener('submit', (e) => this.handleUpdateSupplier(e));
    }

    const btnDelete = document.getElementById('btn-confirm-delete-supplier');
    if (btnDelete) {
      btnDelete.addEventListener('click', () => this.executeDeleteSupplier());
    }
  },

  async loadSuppliers() {
    try {
      const res = await window.MedicareAPI.getSuppliers();
      if (res.success) {
        this.suppliers = res.data;
        this.renderTable();
      }
    } catch (err) {
      console.error('Failed to load suppliers:', err);
    }
  },

  renderTable() {
    const tbody = document.getElementById('suppliers-table-body');
    const countBadge = document.getElementById('suppliers-total-count');
    if (countBadge) countBadge.textContent = `${this.suppliers.length} Suppliers`;

    if (!tbody) return;

    if (this.suppliers.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" class="text-center py-4 text-muted">No suppliers registered.</td></tr>`;
      return;
    }

    tbody.innerHTML = this.suppliers.map(s => `
      <tr>
        <td class="font-mono-code text-muted">#${s.id}</td>
        <td>
          <strong class="text-dark">${this.escapeHtml(s.company_name)}</strong>
          <div class="small text-muted">Contact: ${this.escapeHtml(s.supplier_name)}</div>
        </td>
        <td>
          <div><i class="bi bi-envelope text-secondary me-1"></i>${this.escapeHtml(s.email)}</div>
          <div class="small font-mono-code text-muted"><i class="bi bi-telephone text-secondary me-1"></i>${this.escapeHtml(s.phone)}</div>
        </td>
        <td><span class="font-mono-code text-secondary small">${this.escapeHtml(s.gst_number || 'N/A')}</span></td>
        <td><span class="small text-muted d-inline-block text-truncate" style="max-width: 200px;" title="${this.escapeHtml(s.address)}">${this.escapeHtml(s.address)}</span></td>
        <td class="tabular-nums text-center"><span class="badge bg-light text-dark border">${s.product_count || 0} Items</span></td>
        <td><span class="badge ${s.status === 'active' ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-secondary-subtle text-secondary'}">${s.status}</span></td>
        <td>
          <div class="d-flex gap-1">
            <button class="btn btn-sm btn-outline-primary btn-action-icon" title="Edit Supplier" onclick="SuppliersModule.openEditModal(${s.id})">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger btn-action-icon" title="Delete Supplier" onclick="SuppliersModule.promptDelete(${s.id})">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  },

  async handleCreateSupplier(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);

    const errors = window.FormValidator.validateSupplier(formData);
    if (Object.keys(errors).length > 0) {
      window.FormValidator.showServerErrors(form, errors);
      return;
    }

    const payload = Object.fromEntries(formData.entries());

    try {
      const res = await window.MedicareAPI.createSupplier(payload);
      if (res.success) {
        bootstrap.Modal.getInstance(document.getElementById('modal-add-supplier'))?.hide();
        form.reset();
        window.MedicareApp.showToast('Supplier registered successfully.', 'success');
        await this.loadSuppliers();
        window.ProductsModule.loadProducts();
      } else {
        if (res.errors) window.FormValidator.showServerErrors(form, res.errors);
        window.MedicareApp.showToast(res.message || 'Failed to add supplier', 'danger');
      }
    } catch (err) {
      window.MedicareApp.showToast('Network error: ' + err.message, 'danger');
    }
  },

  async openEditModal(id) {
    try {
      const res = await window.MedicareAPI.getSupplier(id);
      if (!res.success || !res.data) return;
      const s = res.data;
      const form = document.getElementById('form-edit-supplier');
      window.FormValidator.clearErrors(form);

      form.querySelector('[name="id"]').value = s.id;
      form.querySelector('[name="supplier_name"]').value = s.supplier_name;
      form.querySelector('[name="company_name"]').value = s.company_name;
      form.querySelector('[name="email"]').value = s.email;
      form.querySelector('[name="phone"]').value = s.phone;
      form.querySelector('[name="gst_number"]').value = s.gst_number || '';
      form.querySelector('[name="address"]').value = s.address;
      form.querySelector('[name="status"]').value = s.status || 'active';

      new bootstrap.Modal(document.getElementById('modal-edit-supplier')).show();
    } catch (err) {
      window.MedicareApp.showToast('Failed to load supplier: ' + err.message, 'danger');
    }
  },

  async handleUpdateSupplier(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const id = formData.get('id');

    const errors = window.FormValidator.validateSupplier(formData);
    if (Object.keys(errors).length > 0) {
      window.FormValidator.showServerErrors(form, errors);
      return;
    }

    const payload = Object.fromEntries(formData.entries());

    try {
      const res = await window.MedicareAPI.updateSupplier(id, payload);
      if (res.success) {
        bootstrap.Modal.getInstance(document.getElementById('modal-edit-supplier'))?.hide();
        window.MedicareApp.showToast('Supplier updated successfully.', 'success');
        await this.loadSuppliers();
        window.ProductsModule.loadProducts();
      } else {
        if (res.errors) window.FormValidator.showServerErrors(form, res.errors);
        window.MedicareApp.showToast(res.message || 'Update failed', 'danger');
      }
    } catch (err) {
      window.MedicareApp.showToast('Error: ' + err.message, 'danger');
    }
  },

  supplierToDeleteId: null,

  promptDelete(id) {
    const s = this.suppliers.find(item => item.id == id);
    if (!s) return;

    this.supplierToDeleteId = id;
    document.getElementById('delete-supplier-name').textContent = s.company_name;
    document.getElementById('delete-supplier-contact').textContent = s.supplier_name;

    new bootstrap.Modal(document.getElementById('modal-delete-supplier')).show();
  },

  async executeDeleteSupplier() {
    if (!this.supplierToDeleteId) return;

    try {
      const res = await window.MedicareAPI.deleteSupplier(this.supplierToDeleteId);
      bootstrap.Modal.getInstance(document.getElementById('modal-delete-supplier'))?.hide();

      if (res.success) {
        window.MedicareApp.showToast('Supplier deleted successfully.', 'success');
        this.supplierToDeleteId = null;
        await this.loadSuppliers();
        window.ProductsModule.loadProducts();
      } else {
        window.MedicareApp.showToast(res.message || 'Failed to delete supplier.', 'warning');
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

window.SuppliersModule = SuppliersModule;
