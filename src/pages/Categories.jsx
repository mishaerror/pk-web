import React, { useState, useEffect } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '../utils/api';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', ref: '' });
  const [formErrors, setFormErrors] = useState({});

  // Fetch categories from backend
  const fetchCategories = async (search = '') => {
    try {
      setLoading(true);
      const params = search ? `?name=${encodeURIComponent(search)}` : '';
      const data = await apiGet(`/api/categories${params}`);
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Category name is required';
    } else {
      // Check for uniqueness (case-insensitive)
      const existingCategory = categories.find(category => 
        category.name.toLowerCase() === formData.name.trim().toLowerCase() &&
        (!editingCategory || category.ref !== editingCategory.ref)
      );
      
      if (existingCategory) {
        errors.name = 'Category name already exists';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Add new category
  const addCategory = async (categoryData) => {
    try {
      await apiPost('/api/categories', categoryData);
      setShowAddForm(false);
      setFormData({ name: '' });
      setFormErrors({});
      // Reload categories from backend
      await fetchCategories();
    } catch (error) {
      console.error('Failed to add category:', error);
    }
  };

  // Update category
  const updateCategory = async (categoryData) => {
    try {
      await apiPut(`/api/categories`, categoryData);
      setEditingCategory(null);
      setShowAddForm(false);
      setFormData({ name: '', ref: '' });
      setFormErrors({});
      // Reload categories from backend
      await fetchCategories();
    } catch (error) {
      console.error('Failed to update category:', error);
    }
  };

  // Delete category
  const deleteCategory = async (categoryRef) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    
    try {
      await apiDelete(`/api/categories/${categoryRef}`);
      // Reload categories from backend
      await fetchCategories();
    } catch (error) {
      console.error('Failed to delete category:', error);
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editingCategory) {
      updateCategory(formData);
    } else {
      addCategory(formData);
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle edit button click
  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, ref: category.ref });
    setShowAddForm(true);
  };

  // Handle cancel
  const handleCancel = () => {
    setShowAddForm(false);
    setEditingCategory(null);
    setFormData({ name: '', ref: '' });
    setFormErrors({});
  };

  // Search handler
  const handleSearch = (e) => {
    e.preventDefault();
    fetchCategories(searchTerm);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <main className="page-root">
      <div className="container">
        <div className="page-header">
          <h2>Categories</h2>
          <button 
            className="btn" 
            onClick={() => setShowAddForm(true)}
          >
            Add Category
          </button>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="btn">Search</button>
          {searchTerm && (
            <button 
              type="button" 
              className="btn" 
              onClick={() => {
                setSearchTerm('');
                fetchCategories();
              }}
            >
              Clear
            </button>
          )}
        </form>

        {/* Add/Edit Form Modal */}
        {showAddForm && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h3>{editingCategory ? 'Edit Category' : 'Add Category'}</h3>
                <button className="close-btn" onClick={handleCancel}>×</button>
              </div>
              <form onSubmit={handleSubmit} className="modal-form">
                <div className="form-group">
                  <label htmlFor="name">Category Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={formErrors.name ? 'error' : ''}
                    placeholder="Enter category name"
                  />
                  <input
                    type="hidden"
                    id="ref"
                    name="ref"
                    value={formData.ref}
                    onChange={handleInputChange}
                  />
                  {formErrors.name && <span className="error-text">{formErrors.name}</span>}
                </div>
                <div className="form-actions">
                  <button type="button" className="btn secondary" onClick={handleCancel}>
                    Cancel
                  </button>
                  <button type="submit" className="btn primary">
                    {editingCategory ? 'Update' : 'Add'} Category
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="grid-list categories">
            {categories.map(category => (
              <div className="card category-item" key={category.ref}>
                <div className="category-title">{category.name}</div>
                <div className="category-actions">
                  <button 
                    className="btn"
                    onClick={() => handleEdit(category)}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn danger"
                    onClick={() => deleteCategory(category.ref)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
