import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  TextField,
  Card,
  CardContent,
  CardActions,
  Grid,
  Box,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
  Alert,
  IconButton,
  CardMedia,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Search as SearchIcon, 
  Clear as ClearIcon,
  PhotoCamera,
  Close as CloseIcon
} from '@mui/icons-material';
import { apiGet, apiPost, apiPut, apiDelete } from '../utils/api';
import { uploadImage } from '../utils/imageApi';

const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
];

export default function Items() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    ref: '',
    price: {
      amount: '',
      currency: 'USD'
    },
    discount: '',
    discountEnabled: false,
    imageRef: null
  });
  const [formErrors, setFormErrors] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState('');

  // Fetch items from backend
  const fetchItems = async (search = '') => {
    try {
      setLoading(true);
      const params = search ? `?searchTerm=${encodeURIComponent(search)}` : '';
      const data = await apiGet(`/api/items${params}`);
      setItems(data);
    } catch (error) {
      console.error('Failed to fetch items:', error);
    } finally {
      setLoading(false);
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Item name is required';
    }
    
    if (!formData.price.amount || isNaN(formData.price.amount) || parseFloat(formData.price.amount) <= 0) {
      errors.amount = 'Valid amount is required';
    }
    
    if (!formData.price.currency) {
      errors.currency = 'Currency is required';
    }
    
    if (formData.discountEnabled && (!formData.discount || isNaN(formData.discount) || parseFloat(formData.discount) < 0 || parseFloat(formData.discount) > 100)) {
      errors.discount = 'Discount must be between 0 and 100';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Get currency symbol
  const getCurrencySymbol = (currencyCode) => {
    const currency = currencies.find(c => c.code === currencyCode);
    return currency ? currency.symbol : currencyCode;
  };

  // Format price display
  const formatPrice = (price) => {
    const symbol = getCurrencySymbol(price.currency);
    return `${symbol}${parseFloat(price.amount).toFixed(2)}`;
  };

  // Handle image selection
  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImageFile(file);
      setImageError('');
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  // Upload image
  const handleImageUpload = async () => {
    if (!imageFile) return null;
    
    try {
      setImageUploading(true);
      setImageError('');
      const response = await uploadImage(imageFile);
      
      if (response.status === 'uploaded') {
        return response.ref;
      } else if (response.status === 'rejected') {
        setImageError(response.message || 'Image was rejected');
        return null;
      } else {
        setImageError(response.message || 'Image upload failed');
        return null;
      }
    } catch (error) {
      setImageError(error.message || 'Image upload failed');
      return null;
    } finally {
      setImageUploading(false);
    }
  };

  // Add new item
  const addItem = async (itemData) => {
    try {
      // Upload image first if selected
      let imageRef = null;
      if (imageFile) {
        imageRef = await handleImageUpload();
        if (imageError) return; // Stop if image upload failed
      }

      const dataToSend = {
        ...itemData,
        imageRef
      };

      await apiPost('/api/items', dataToSend);
      handleCancel();
      await fetchItems(); // Reload items from backend
    } catch (error) {
      console.error('Failed to add item:', error);
    }
  };

  // Update item
  const updateItem = async (itemData) => {
    try {
      // Upload image first if new image selected
      let imageRef = formData.imageRef;
      if (imageFile) {
        const newImageRef = await handleImageUpload();
        if (imageError) return; // Stop if image upload failed
        if (newImageRef) imageRef = newImageRef;
      }

      const dataToSend = {
        ...itemData,
        imageRef
      };

      await apiPut(`/api/items`, dataToSend);
      handleCancel();
      await fetchItems(); // Reload items from backend
    } catch (error) {
      console.error('Failed to update item:', error);
    }
  };

  // Delete item
  const deleteItem = async (itemRef) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      await apiDelete(`/api/items/${itemRef}`);
      await fetchItems(); // Reload items from backend
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const itemData = {
      name: formData.name.trim(),
      ref: formData.ref,
      price: {
        amount: parseFloat(formData.price.amount),
        currency: formData.price.currency
      },
      discount: formData.discountEnabled ? parseFloat(formData.discount) : null
    };

    if (editingItem) {
      await updateItem(itemData);
    } else {
      await addItem(itemData);
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'amount' || name === 'currency') {
      setFormData(prev => ({
        ...prev,
        price: {
          ...prev.price,
          [name]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
    
    // Clear discount if disabled
    if (name === 'discountEnabled' && !checked) {
      setFormData(prev => ({ ...prev, discount: '' }));
    }
  };

  // Handle edit
  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      ref: item.ref,
      price: {
        amount: item.price?.amount ? item.price.amount.toString() : '',
        currency: item.price?.currency || 'USD'
      },
      discount: item.discount ? item.discount.toString() : '',
      discountEnabled: item.discount !== null,
      imageRef: item.imageRef
    });
    setShowAddForm(true);
  };

  // Handle cancel
  const handleCancel = () => {
    setShowAddForm(false);
    setEditingItem(null);
    setFormData({
      name: '',
      ref: '',
      price: {
        amount: '',
        currency: 'USD'
      },
      discount: '',
      discountEnabled: false,
      imageRef: null
    });
    setFormErrors({});
    setImageFile(null);
    setImagePreview(null);
    setImageError('');
  };

  // Search handler
  const handleSearch = (e) => {
    e.preventDefault();
    fetchItems(searchTerm);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Items
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowAddForm(true)}
        >
          Add Item
        </Button>
      </Box>

      {/* Search Form */}
      <Box component="form" onSubmit={handleSearch} mb={3}>
        <Box display="flex" gap={2}>
          <TextField
            fullWidth
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            variant="outlined"
            size="small"
          />
          <Button 
            type="submit" 
            variant="outlined"
            startIcon={<SearchIcon />}
          >
            Search
          </Button>
          {searchTerm && (
            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={() => {
                setSearchTerm('');
                fetchItems();
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
          {editingItem ? 'Edit Item' : 'Add Item'}
          <IconButton
            onClick={handleCancel}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Box component="form" onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              name="name"
              label="Item Name"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.name}
              onChange={handleInputChange}
              error={!!formErrors.name}
              helperText={formErrors.name}
              sx={{ mb: 2 }}
            />
            
            <Box display="flex" gap={2} sx={{ mb: 2 }}>
              <TextField
                margin="dense"
                name="amount"
                label="Amount"
                type="number"
                variant="outlined"
                value={formData.price.amount}
                onChange={handleInputChange}
                error={!!formErrors.amount}
                helperText={formErrors.amount}
                inputProps={{ step: "0.01", min: "0" }}
                sx={{ flex: 2 }}
              />
              
              <FormControl variant="outlined" margin="dense" sx={{ flex: 1 }}>
                <InputLabel>Currency</InputLabel>
                <Select
                  name="currency"
                  value={formData.price.currency}
                  onChange={handleInputChange}
                  label="Currency"
                  error={!!formErrors.currency}
                >
                  {currencies.map((currency) => (
                    <MenuItem key={currency.code} value={currency.code}>
                      {currency.symbol} {currency.code}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.discountEnabled}
                  onChange={handleInputChange}
                  name="discountEnabled"
                />
              }
              label="Enable Discount"
              sx={{ mb: 1 }}
            />

            {formData.discountEnabled && (
              <TextField
                margin="dense"
                name="discount"
                label="Discount (%)"
                type="number"
                fullWidth
                variant="outlined"
                value={formData.discount}
                onChange={handleInputChange}
                error={!!formErrors.discount}
                helperText={formErrors.discount}
                inputProps={{ step: "0.01", min: "0", max: "100" }}
                sx={{ mb: 2 }}
              />
            )}

            {/* Image Upload */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Item Image
              </Typography>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="image-upload"
                type="file"
                onChange={handleImageSelect}
              />
              <label htmlFor="image-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<PhotoCamera />}
                  disabled={imageUploading}
                >
                  {imageFile ? 'Change Image' : 'Upload Image'}
                </Button>
              </label>
              
              {imagePreview && (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'cover' }}
                  />
                </Box>
              )}
              
              {imageError && (
                <Alert severity="error" sx={{ mt: 1 }}>
                  {imageError}
                </Alert>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancel}>Cancel</Button>
            <Button 
              type="submit" 
              variant="contained"
              disabled={imageUploading}
            >
              {imageUploading ? <CircularProgress size={20} /> : (editingItem ? 'Update' : 'Add')}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Items List */}
      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {items.map(item => (
            <Grid item xs={12} sm={6} md={4} key={item.ref}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {item.imageRef && (
                  <CardMedia
                    component="img"
                    height="200"
                    image={`/api/images/${item.imageRef}`}
                    alt={item.name}
                    sx={{ objectFit: 'cover' }}
                  />
                )}
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {item.name}
                  </Typography>
                  <Typography variant="h6" color="primary" gutterBottom>
                    {formatPrice(item.price)}
                    {item.discount && (
                      <Typography component="span" variant="body2" color="error" sx={{ ml: 1 }}>
                        ({item.discount}% off)
                      </Typography>
                    )}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => handleEdit(item)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => deleteItem(item.ref)}
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
