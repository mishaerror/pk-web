import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
  Stepper,
  Step,
  StepLabel,
  Alert,
  Chip,
  CardMedia,
  IconButton,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  ShoppingCart as CartIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { apiGet, apiPost } from '../utils/api';

const steps = ['Select Items', 'Review Order', 'Shipping Details', 'Confirmation'];

// Format price display
const formatPrice = (price) => {
  if (!price || typeof price !== 'object') return '$0.00';
  const amount = parseFloat(price.amount || 0);
  return `$${amount.toFixed(2)}`;
};

export default function CustomerOrder() {
  const { itemRef } = useParams();
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [orderError, setOrderError] = useState('');
  
  // Customer form data
  const [customerData, setCustomerData] = useState({
    customerName: '',
    email: '',
    phone: '',
    addressLineOne: '',
    addressLineTwo: '',
    addressCity: '',
    addressPostalCode: ''
  });
  
  const [formErrors, setFormErrors] = useState({});

  // Fetch items from backend or specific item
  const fetchItems = async () => {
    try {
      setLoading(true);
      let data;
      
      if (itemRef) {
        // Fetch specific item for direct order
        data = [await apiGet(`/api/customer/orders/item/${itemRef}`)];
        // Auto-add to cart and skip to review step
        if (data[0]) {
          setCart([{ ...data[0], quantity: 1 }]);
          setActiveStep(1);
        }
      } else {
        // Fetch all items for browsing
        data = await apiGet('/api/customer/items');
      }
      
      setItems(data);
    } catch (error) {
      console.error('Failed to fetch items:', error);
      setOrderError('Failed to load item details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [itemRef]);

  // Add item to cart
  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(cartItem => cartItem.ref === item.ref);
      if (existing) {
        return prev.map(cartItem =>
          cartItem.ref === item.ref
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  // Update cart quantity
  const updateCartQuantity = (itemRef, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemRef);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.ref === itemRef ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  // Remove from cart
  const removeFromCart = (itemRef) => {
    setCart(prev => prev.filter(item => item.ref !== itemRef));
  };

  // Handle customer input change
  const handleCustomerInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validate customer form
  const validateCustomerForm = () => {
    const errors = {};
    if (!customerData.customerName.trim()) {
      errors.customerName = 'Name is required';
    }
    if (!customerData.phone.trim()) {
      errors.phone = 'Phone number is required';
    }
    if (!customerData.addressLineOne.trim()) {
      errors.addressLineOne = 'Address is required';
    }
    if (!customerData.addressCity.trim()) {
      errors.addressCity = 'City is required';
    }
    if (!customerData.addressPostalCode.trim()) {
      errors.addressPostalCode = 'Postal code is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle next step
  const handleNext = () => {
    if (activeStep === 2) {
      if (validateCustomerForm()) {
        submitOrders();
      }
    } else {
      setActiveStep(prev => prev + 1);
    }
  };

  // Handle back step
  const handleBack = () => {
    // Don't allow going back to item selection if it's a direct item order
    if (itemRef && activeStep === 1) {
      return;
    }
    setActiveStep(prev => prev - 1);
  };

  // Submit orders
  const submitOrders = async () => {
    try {
      setLoading(true);
      setOrderError('');
      
      // Submit each cart item as separate order
      for (const cartItem of cart) {
        const orderRequest = {
          itemRef: cartItem.ref,
          count: cartItem.quantity,
          customerName: customerData.customerName,
          phone: customerData.phone,
          email: customerData.email || null,
          addressLineOne: customerData.addressLineOne,
          addressLineTwo: customerData.addressLineTwo,
          addressCity: customerData.addressCity,
          addressPostalCode: customerData.addressPostalCode
        };
        
        await apiPost('/api/customer/orders', orderRequest);
      }
      
      setOrderSubmitted(true);
      setActiveStep(3);
    } catch (error) {
      console.error('Failed to submit orders:', error);
      setOrderError('Failed to submit order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Reset order
  const resetOrder = () => {
    setCart([]);
    setCustomerData({
      customerName: '',
      email: '',
      phone: '',
      addressLineOne: '',
      addressLineTwo: '',
      addressCity: '',
      addressPostalCode: ''
    });
    setFormErrors({});
    setOrderSubmitted(false);
    setOrderError('');
    // Reset to appropriate step based on whether it's direct item order
    setActiveStep(itemRef ? 1 : 0);
  };

  // Calculate total
  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      const price = item.price?.amount || 0;
      return total + (parseFloat(price) * item.quantity);
    }, 0);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', py: 4 }}>
      <Container maxWidth="lg">
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h3" component="h1" gutterBottom color="primary">
            PK Web
          </Typography>
          <Typography variant="h4" component="h2" gutterBottom>
            Place Your Order
          </Typography>
        </Box>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Step 0: Select Items */}
        {activeStep === 0 && (
          <Box>
            <Typography variant="h5" gutterBottom>
              Select Items
            </Typography>
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
                        />
                      )}
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" component="h3" gutterBottom>
                          {item.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {item.description}
                        </Typography>
                        <Typography variant="h6" color="primary">
                          {formatPrice(item.price)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          In Stock: {item.count}
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <Button
                          fullWidth
                          variant="contained"
                          onClick={() => addToCart(item)}
                          disabled={item.count === 0}
                        >
                          Add to Cart
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}

        {/* Step 1: Review Order */}
        {activeStep === 1 && (
          <Box>
            <Typography variant="h5" gutterBottom>
              Review Your Order
            </Typography>
            {cart.length === 0 ? (
              <Alert severity="info">Your cart is empty</Alert>
            ) : (
              <Card>
                <CardContent>
                  {cart.map(item => (
                    <Box key={item.ref} sx={{ mb: 2 }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={6}>
                          <Typography variant="h6">{item.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {formatPrice(item.price)} each
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <IconButton
                              size="small"
                              onClick={() => updateCartQuantity(item.ref, item.quantity - 1)}
                            >
                              <RemoveIcon />
                            </IconButton>
                            <Typography>{item.quantity}</Typography>
                            <IconButton
                              size="small"
                              onClick={() => updateCartQuantity(item.ref, item.quantity + 1)}
                            >
                              <AddIcon />
                            </IconButton>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={2}>
                          <Typography variant="h6">
                            ${(parseFloat(item.price?.amount || 0) * item.quantity).toFixed(2)}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={1}>
                          <IconButton
                            color="error"
                            onClick={() => removeFromCart(item.ref)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Grid>
                      </Grid>
                      <Divider sx={{ mt: 2 }} />
                    </Box>
                  ))}
                  <Box sx={{ mt: 2, textAlign: 'right' }}>
                    <Typography variant="h5">
                      Total: ${calculateTotal().toFixed(2)}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            )}
          </Box>
        )}

        {/* Step 2: Shipping Details */}
        {activeStep === 2 && (
          <Box>
            <Typography variant="h5" gutterBottom>
              Shipping Details
            </Typography>
            <Card>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      name="customerName"
                      label="Full Name"
                      value={customerData.customerName}
                      onChange={handleCustomerInputChange}
                      error={!!formErrors.customerName}
                      helperText={formErrors.customerName}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      name="phone"
                      label="Phone Number"
                      type="tel"
                      value={customerData.phone}
                      onChange={handleCustomerInputChange}
                      error={!!formErrors.phone}
                      helperText={formErrors.phone}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      name="email"
                      label="Email (Optional)"
                      type="email"
                      value={customerData.email}
                      onChange={handleCustomerInputChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      name="addressLineOne"
                      label="Address Line 1"
                      value={customerData.addressLineOne}
                      onChange={handleCustomerInputChange}
                      error={!!formErrors.addressLineOne}
                      helperText={formErrors.addressLineOne}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      name="addressLineTwo"
                      label="Address Line 2 (Optional)"
                      value={customerData.addressLineTwo}
                      onChange={handleCustomerInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      name="addressCity"
                      label="City"
                      value={customerData.addressCity}
                      onChange={handleCustomerInputChange}
                      error={!!formErrors.addressCity}
                      helperText={formErrors.addressCity}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      name="addressPostalCode"
                      label="Postal Code"
                      value={customerData.addressPostalCode}
                      onChange={handleCustomerInputChange}
                      error={!!formErrors.addressPostalCode}
                      helperText={formErrors.addressPostalCode}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Step 3: Confirmation */}
        {activeStep === 3 && orderSubmitted && (
          <Box textAlign="center">
            <Alert severity="success" sx={{ mb: 3 }}>
              <Typography variant="h6">Order Submitted Successfully!</Typography>
              <Typography>Thank you for your order. We'll process it shortly.</Typography>
            </Alert>
            <Button variant="contained" onClick={resetOrder}>
              Place Another Order
            </Button>
          </Box>
        )}

        {/* Error Display */}
        {orderError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {orderError}
          </Alert>
        )}

        {/* Navigation Buttons */}
        {activeStep < 3 && !orderSubmitted && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0 || (itemRef && activeStep === 1)}
              onClick={handleBack}
            >
              Back
            </Button>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {cart.length > 0 && (
                <Chip
                  icon={<CartIcon />}
                  label={`${cart.length} items`}
                  color="primary"
                />
              )}
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={
                  (activeStep === 0 && cart.length === 0) ||
                  loading
                }
              >
                {loading ? <CircularProgress size={20} /> : 
                 activeStep === 2 ? 'Submit Order' : 'Next'}
              </Button>
            </Box>
          </Box>
        )}
      </Container>
    </Box>
  );
}
