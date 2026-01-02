import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Box,
  CircularProgress,
  Alert,
  Chip,
  Button,
  Divider,
  Paper
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon,
  Inventory as InventoryIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import { apiGet } from '../utils/api';

export default function OrderDetail() {
  const { orderRef } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await apiGet(`/api/admin/orders/${orderRef}`);
      setOrder(data);
    } catch (error) {
      console.error('Failed to fetch order:', error);
      setError('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderRef]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'CUSTOMER_INITIATED': return 'info';
      case 'CUSTOMER_ABANDONED': return 'default';
      case 'CUSTOMER_ENTERED': return 'warning';
      case 'MERCHANT_CONFIRMED': return 'primary';
      case 'MERCHANT_DECLINED': return 'error';
      case 'MERCHANT_SENT': return 'info';
      case 'DELIVERED_TO_CUSTOMER': return 'success';
      case 'RETURNED_TO_MERCHANT': return 'warning';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'CUSTOMER_INITIATED': return 'Initiated';
      case 'CUSTOMER_ABANDONED': return 'Abandoned';
      case 'CUSTOMER_ENTERED': return 'Entered';
      case 'MERCHANT_CONFIRMED': return 'Confirmed';
      case 'MERCHANT_DECLINED': return 'Declined';
      case 'MERCHANT_SENT': return 'Sent';
      case 'DELIVERED_TO_CUSTOMER': return 'Delivered';
      case 'RETURNED_TO_MERCHANT': return 'Returned';
      default: return status;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !order) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/orders')}
          sx={{ mb: 2 }}
        >
          Back to Orders
        </Button>
        <Alert severity="error">
          {error || 'Order not found'}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/orders')}
        sx={{ mb: 3 }}
      >
        Back to Orders
      </Button>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Order Details
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Order Reference: {order.orderRef}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Order Status */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mb: 2 }}>
            <Box display="flex" alignItems="center" gap={2}>
              <TimelineIcon color="primary" />
              <Typography variant="h6">Order Status</Typography>
              <Chip 
                label={getStatusLabel(order.state)} 
                color={getStatusColor(order.state)}
                size="medium"
              />
            </Box>
          </Paper>
        </Grid>

        {/* Customer Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <PersonIcon color="primary" />
                <Typography variant="h6">Customer Information</Typography>
              </Box>
              <Typography variant="body1" gutterBottom>
                <strong>Name:</strong> {order.orderAddress.customerName}
              </Typography>
              {order.orderAddress.email && (
                <Typography variant="body1" gutterBottom>
                  <strong>Email:</strong> {order.orderAddress.email}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Shipping Address */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <LocationIcon color="primary" />
                <Typography variant="h6">Shipping Address</Typography>
              </Box>
              <Typography variant="body1">
                {order.orderAddress.addressLineOne}
              </Typography>
              {order.orderAddress.addressLineTwo && (
                <Typography variant="body1">
                  {order.orderAddress.addressLineTwo}
                </Typography>
              )}
              <Typography variant="body1">
                {order.orderAddress.addressCity}, {order.orderAddress.adressPostalCode}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Order Items */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <InventoryIcon color="primary" />
                <Typography variant="h6">Order Items</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={6}>
                  <Typography variant="body1">
                    <strong>Item Reference:</strong> {order.itemRef || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1">
                    <strong>Quantity:</strong> {order.count}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}