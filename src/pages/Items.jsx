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
  Avatar
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';
import { apiGet, apiPost, apiPut, apiDelete } from '../utils/api';

export default function Items() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

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

  // Add new item
  const addItem = async (itemData) => {
    try {
      const newItem = await apiPost('/api/items', itemData);
      setItems(prev => [...prev, newItem]);
      setShowAddForm(false);
    } catch (error) {
      console.error('Failed to add item:', error);
    }
  };

  // Update item
  const updateItem = async (itemRef, itemData) => {
    try {
      const updatedItem = await apiPut(`/api/items/${itemRef}`, itemData);
      setItems(prev => prev.map(item => 
        item.itemRef === itemRef ? updatedItem : item
      ));
      setEditingItem(null);
    } catch (error) {
      console.error('Failed to update item:', error);
    }
  };

  // Delete item
  const deleteItem = async (itemRef) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      await apiDelete(`/api/items/${itemRef}`);
      setItems(prev => prev.filter(item => item.itemRef !== itemRef));
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
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

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {items.map(item => (
            <Grid item xs={12} sm={6} md={4} key={item.itemRef}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Avatar 
                      sx={{ 
                        width: 64, 
                        height: 64, 
                        mr: 2,
                        bgcolor: 'grey.300'
                      }}
                    />
                    <Box>
                      <Typography variant="h6" component="h2" gutterBottom>
                        {item.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.category} • {item.price}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => setEditingItem(item)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => deleteItem(item.itemRef)}
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
