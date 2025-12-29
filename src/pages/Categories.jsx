import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  CardActions,
  Grid,
  Box,
  CircularProgress,
  Alert
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
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
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Categories
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowAddForm(true)}
        >
          Add Category
        </Button>
      </Box>

      {/* Search Form */}
      <Box component="form" onSubmit={handleSearch} mb={3}>
        <Box display="flex" gap={2}>
          <TextField
            fullWidth
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            variant="outlined"
            size="small"
          />
          <Button type="submit" variant="outlined">
            Search
          </Button>
          {searchTerm && (
            <Button
              variant="outlined"
              onClick={() => {
                setSearchTerm('');
                fetchCategories();
              }}
            >
              Clear
            </Button>
          )}
        </Box>
      </Box>

      {/* Add/Edit Form Dialog */}
      <Dialog open={showAddForm} onClose={handleCancel} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCategory ? 'Edit Category' : 'Add Category'}
        </DialogTitle>
        <Box component="form" onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              name="name"
              label="Category Name"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.name}
              onChange={handleInputChange}
              error={!!formErrors.name}
              helperText={formErrors.name}
              placeholder="Enter category name"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancel}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingCategory ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Categories List */}
      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={2}>
          {categories.map(category => (
            <Grid item xs={12} sm={6} md={4} key={category.ref}>
              <Card>
                <CardContent>
                  <Typography variant="h6" component="h2">
                    {category.name}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => handleEdit(category)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => deleteCategory(category.ref)}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
