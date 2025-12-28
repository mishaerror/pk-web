import React, { useState, useEffect } from 'react';
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
    <main className="page-root">
      <div className="container">
        <div className="page-header">
          <h2>Items</h2>
          <button 
            className="btn" 
            onClick={() => setShowAddForm(true)}
          >
            Add Item
          </button>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search items..."
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
                fetchItems();
              }}
            >
              Clear
            </button>
          )}
        </form>

        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="grid-list">
            {items.map(item => (
              <div className="card list-item" key={item.itemRef}>
                <div className="item-left">
                  <div className="thumb" />
                </div>
                <div className="item-body">
                  <div className="item-title">{item.name}</div>
                  <div className="item-meta">{item.category} · {item.price}</div>
                </div>
                <div className="item-actions">
                  <button 
                    className="btn"
                    onClick={() => setEditingItem(item)}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn danger"
                    onClick={() => deleteItem(item.itemRef)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Form Modal would go here */}
      </div>
    </main>
  );
}
