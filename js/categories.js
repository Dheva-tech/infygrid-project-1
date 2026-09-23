/**
 * MediCare Medical Store Management System
 * Categories Module - Full CRUD
 */

const CategoriesModule = {
  categories: [],

  init() {
    this.bindEvents();
  },

  bindEvents() {
    const addForm = document.getElementById('form-add-category');
    if (addForm) {
      addForm.addEventListener('submit', (e) => this.handleCreateCategory(e));
    }

    const editForm = document.getElementById('form-edit-category');
    if (editForm) {
      editForm.addEventListener('submit', (e) => this.handleUpdateCategory(e));
    }

    const btnDelete = document.getElementById('btn-confirm-delete-category');
    if (btnDelete) {
      btnDelete.addEventListener('click', () => this.executeDeleteCategory());
    }
  },

  async loadCategories() {
    try {
      const res = await window.MedicareAPI.getCategories();
      if (res.success) {
        this.categories = res.data;
        this.renderTable();
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  },

  renderTable() {
    const tbody = document.getElementById('categories-table-body');
    const countBadge = document.getElementById('categories-total-count');
    if (countBadge) countBadge.textContent = `${this.categories.length} Categories`;

    if (!tbody) return;

    if (this.categories.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">No categories found.</td></tr>`;
      return;
    }

    tbody.innerHTML = this.categories.map(c => `
      <tr>
        <td class="font-mono-code text-muted">#${c.id}</td>
        <td><strong class="text-dark">${this.escapeHtml(c.category_name)}</strong></td>
        <td><span class="text-secondary small">${this.escapeHtml(c.description || 'N/A')}</span></td>
        <td class="tabular-nums text-center"><span class="badge bg-light text-dark border">${c.product_count || 0} Products</span></td>
        <td><span class="badge ${c.status === 'active' ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-secondary-subtle text-secondary'}">${c.status}</span></td>
        <td>
          <div class="d-flex gap-1">
            <button class="btn btn-sm btn-outline-primary btn-action-icon" title="Edit Category" onclick="CategoriesModule.openEditModal(${c.id})">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger btn-action-icon" title="Delete Category" onclick="CategoriesModule.promptDelete(${c.id})">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  },

  async handleCreateCategory(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);

    const errors = window.FormValidator.validateCategory(formData);
    if (Object.keys(errors).length > 0) {
      window.FormValidator.showServerErrors(form, errors);
      return;
    }

    const payload = Object.fromEntries(formData.entries());

    try {
      const res = await window.MedicareAPI.createCategory(payload);
      if (res.success) {
        bootstrap.Modal.getInstance(document.getElementById('modal-add-category'))?.hide();
        form.reset();
        window.MedicareApp.showToast('Category created successfully.', 'success');
        await this.loadCategories();
        window.ProductsModule.loadProducts();
      } else {
        if (res.errors) window.FormValidator.showServerErrors(form, res.errors);
        window.MedicareApp.showToast(res.message || 'Error creating category', 'danger');
      }
    } catch (err) {
      window.MedicareApp.showToast('Error: ' + err.message, 'danger');
    }
  },

  async openEditModal(id) {
    try {
      const res = await window.MedicareAPI.getCategory(id);
      if (!res.success || !res.data) return;
      const c = res.data;
      const form = document.getElementById('form-edit-category');
      window.FormValidator.clearErrors(form);

      form.querySelector('[name="id"]').value = c.id;
      form.querySelector('[name="category_name"]').value = c.category_name;
      form.querySelector('[name="description"]').value = c.description || '';
      form.querySelector('[name="status"]').value = c.status || 'active';

      new bootstrap.Modal(document.getElementById('modal-edit-category')).show();
    } catch (err) {
      window.MedicareApp.showToast('Failed to load category', 'danger');
    }
  },

  async handleUpdateCategory(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const id = formData.get('id');

    const errors = window.FormValidator.validateCategory(formData);
    if (Object.keys(errors).length > 0) {
      window.FormValidator.showServerErrors(form, errors);
      return;
    }

    const payload = Object.fromEntries(formData.entries());

    try {
      const res = await window.MedicareAPI.updateCategory(id, payload);
      if (res.success) {
        bootstrap.Modal.getInstance(document.getElementById('modal-edit-category'))?.hide();
        window.MedicareApp.showToast('Category updated successfully.', 'success');
        await this.loadCategories();
        window.ProductsModule.loadProducts();
      } else {
        if (res.errors) window.FormValidator.showServerErrors(form, res.errors);
        window.MedicareApp.showToast(res.message || 'Error updating category', 'danger');
      }
    } catch (err) {
      window.MedicareApp.showToast('Error: ' + err.message, 'danger');
    }
  },

  categoryToDeleteId: null,

  promptDelete(id) {
    const c = this.categories.find(item => item.id == id);
    if (!c) return;
    this.categoryToDeleteId = id;
    document.getElementById('delete-category-name').textContent = c.category_name;
    document.getElementById('delete-category-count').textContent = c.product_count || 0;

    new bootstrap.Modal(document.getElementById('modal-delete-category')).show();
  },

  async executeDeleteCategory() {
    if (!this.categoryToDeleteId) return;

    try {
      const res = await window.MedicareAPI.deleteCategory(this.categoryToDeleteId);
      bootstrap.Modal.getInstance(document.getElementById('modal-delete-category'))?.hide();

      if (res.success) {
        window.MedicareApp.showToast('Category deleted successfully.', 'success');
        this.categoryToDeleteId = null;
        await this.loadCategories();
        window.ProductsModule.loadProducts();
      } else {
        window.MedicareApp.showToast(res.message || 'Failed to delete category.', 'warning');
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

window.CategoriesModule = CategoriesModule;
