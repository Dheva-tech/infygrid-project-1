/**
 * MediCare Medical Store Management System
 * Client-Side & Server-Error Form Validation Module
 */

const FormValidator = {
  /**
   * Reset validation states on a form
   */
  clearErrors(formElement) {
    if (!formElement) return;
    const inputs = formElement.querySelectorAll('.is-invalid');
    inputs.forEach(input => input.classList.remove('is-invalid'));
    const feedbacks = formElement.querySelectorAll('.invalid-feedback');
    feedbacks.forEach(fb => fb.textContent = '');
  },

  /**
   * Show error on a specific field
   */
  showFieldError(formElement, fieldName, message) {
    if (!formElement) return;
    const field = formElement.querySelector(`[name="${fieldName}"]`);
    if (field) {
      field.classList.add('is-invalid');
      let feedback = field.parentNode.querySelector('.invalid-feedback');
      if (!feedback) {
        feedback = document.createElement('div');
        feedback.className = 'invalid-feedback';
        field.parentNode.appendChild(feedback);
      }
      feedback.textContent = message;
    }
  },

  /**
   * Display multiple errors from API response { field_name: "message" }
   */
  showServerErrors(formElement, errorObject) {
    this.clearErrors(formElement);
    if (!errorObject || typeof errorObject !== 'object') return;
    for (const [field, msg] of Object.entries(errorObject)) {
      this.showFieldError(formElement, field, msg);
    }
  },

  /**
   * Validate Product Form
   */
  validateProduct(formData) {
    const errors = {};
    const name = (formData.get('product_name') || '').trim();
    const code = (formData.get('product_code') || '').trim();
    const category = formData.get('category_id');
    const supplier = formData.get('supplier_id');
    const brand = (formData.get('brand') || '').trim();
    const batch = (formData.get('batch_number') || '').trim();
    const mfgDate = formData.get('manufacturing_date');
    const expDate = formData.get('expiry_date');
    const purchasePrice = parseFloat(formData.get('purchase_price'));
    const sellingPrice = parseFloat(formData.get('selling_price'));
    const stockQuantity = parseInt(formData.get('stock_quantity'), 10);
    const reorderLevel = parseInt(formData.get('reorder_level'), 10);

    if (!name) errors['product_name'] = 'Product name is required';
    if (!code) errors['product_code'] = 'Product code is required';
    if (!category) errors['category_id'] = 'Please select a category';
    if (!supplier) errors['supplier_id'] = 'Please select a supplier';
    if (!brand) errors['brand'] = 'Brand name is required';
    if (!batch) errors['batch_number'] = 'Batch number is required';
    if (!mfgDate) errors['manufacturing_date'] = 'Manufacturing date is required';
    if (!expDate) errors['expiry_date'] = 'Expiry date is required';

    if (mfgDate && expDate) {
      if (new Date(expDate) <= new Date(mfgDate)) {
        errors['expiry_date'] = 'Expiry date must be later than manufacturing date';
      }
    }

    if (isNaN(purchasePrice) || purchasePrice < 0) {
      errors['purchase_price'] = 'Purchase price must be a valid non-negative number';
    }

    if (isNaN(sellingPrice) || sellingPrice < 0) {
      errors['selling_price'] = 'Selling price cannot be negative';
    }

    if (isNaN(stockQuantity) || stockQuantity < 0) {
      errors['stock_quantity'] = 'Stock quantity cannot be negative';
    }

    if (isNaN(reorderLevel) || reorderLevel < 0) {
      errors['reorder_level'] = 'Reorder level cannot be negative';
    }

    return errors;
  },

  /**
   * Validate Supplier Form
   */
  validateSupplier(formData) {
    const errors = {};
    const name = (formData.get('supplier_name') || '').trim();
    const comp = (formData.get('company_name') || '').trim();
    const email = (formData.get('email') || '').trim();
    const phone = (formData.get('phone') || '').trim();
    const addr = (formData.get('address') || '').trim();

    if (!name) errors['supplier_name'] = 'Supplier contact name is required';
    if (!comp) errors['company_name'] = 'Company name is required';
    if (!email) {
      errors['email'] = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors['email'] = 'Please provide a valid email address';
    }
    if (!phone) errors['phone'] = 'Contact phone number is required';
    if (!addr) errors['address'] = 'Registered address is required';

    return errors;
  },

  /**
   * Validate Customer Form
   */
  validateCustomer(formData) {
    const errors = {};
    const name = (formData.get('customer_name') || '').trim();
    const email = (formData.get('email') || '').trim();
    const phone = (formData.get('phone') || '').trim();
    const addr = (formData.get('address') || '').trim();
    const city = (formData.get('city') || '').trim();
    const state = (formData.get('state') || '').trim();
    const pincode = (formData.get('pincode') || '').trim();

    if (!name) errors['customer_name'] = 'Customer name is required';
    if (!email) {
      errors['email'] = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors['email'] = 'Please enter a valid email format';
    }
    if (!phone) errors['phone'] = 'Phone number is required';
    if (!addr) errors['address'] = 'Address is required';
    if (!city) errors['city'] = 'City is required';
    if (!state) errors['state'] = 'State is required';
    if (!pincode) errors['pincode'] = 'Postal pincode is required';

    return errors;
  },

  /**
   * Validate Category Form
   */
  validateCategory(formData) {
    const errors = {};
    const name = (formData.get('category_name') || '').trim();
    if (!name) errors['category_name'] = 'Category name is required';
    return errors;
  }
};

window.FormValidator = FormValidator;
