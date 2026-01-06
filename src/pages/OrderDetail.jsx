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
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ButtonGroup
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon,
  Inventory as InventoryIcon,
  Timeline as TimelineIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Send as SendIcon,
  LocalShipping as DeliveredIcon,
  Undo as ReturnIcon
} from '@mui/icons-material';
import { apiGet, apiPost } from '../utils/api';

export default function OrderDetail() {
  const { orderRef } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, action: null, title: '', message: '' });

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

  const getAvailableActions = (currentState) => {
    switch(currentState) {
      case 'CUSTOMER_ENTERED':
        return [
          { action: 'CONFIRM', label: 'Confirm Order', icon: <CheckIcon />, color: 'primary' },
          { action: 'DECLINE', label: 'Decline Order', icon: <CloseIcon />, color: 'error' }
        ];
      case 'MERCHANT_CONFIRMED':
        return [
          { action: 'SEND', label: 'Mark as Sent', icon: <SendIcon />, color: 'primary' }
        ];
      case 'MERCHANT_SENT':
        return [
          { action: 'DELIVER', label: 'Mark as Delivered', icon: <DeliveredIcon />, color: 'success' },
          { action: 'RETURN', label: 'Mark as Returned', icon: <ReturnIcon />, color: 'warning' }
        ];
      default:
        return [];
    }
  };

  const handleAction = (action) => {
    const actionConfig = {
      CONFIRM: { title: 'Confirm Order', message: 'Are you sure you want to confirm this order?' },
      DECLINE: { title: 'Decline Order', message: 'Are you sure you want to decline this order?' },
      SEND: { title: 'Mark as Sent', message: 'Are you sure the order has been sent?' },
      DELIVER: { title: 'Mark as Delivered', message: 'Are you sure the order has been delivered?' },
      RETURN: { title: 'Mark as Returned', message: 'Are you sure the order has been returned?' }
    };

    setConfirmDialog({
      open: true,
      action,
      title: actionConfig[action].title,
      message: actionConfig[action].message
    });
  };

  const executeAction = async () => {
    try {
      setActionLoading(true);
      const { action } = confirmDialog;
      
      await apiPost(`/api/admin/orders/${orderRef}/actions`, { action });
      
      // Refresh order data
      await fetchOrder();
      
      setConfirmDialog({ open: false, action: null, title: '', message: '' });
    } catch (error) {
      console.error('Failed to execute action:', error);
      setError('Failed to update order status');
    } finally {
      setActionLoading(false);
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

  const availableActions = getAvailableActions(order.state);

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
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box display="flex" alignItems="center" gap={2}>
                <TimelineIcon color="primary" />
                <Typography variant="h6">Order Status</Typography>
                <Chip 
                  label={getStatusLabel(order.state)} 
                  color={getStatusColor(order.state)}
                  size="medium"
                />
              </Box>
              
              {availableActions.length > 0 && (
                <ButtonGroup variant="contained" size="small">
                  {availableActions.map(({ action, label, icon, color }) => (
                    <Button
                      key={action}
                      startIcon={icon}
                      color={color}
                      onClick={() => handleAction(action)}
                      disabled={actionLoading}
                    >
                      {label}
                    </Button>
                  ))}
                </ButtonGroup>
              )}
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
              <Typography variant="body1" gutterBottom>
                <strong>Phone:</strong> {order.orderContact.phone}
              </Typography>
              {order.orderContact.email && (
                <Typography variant="body1" gutterBottom>
                  <strong>Email:</strong> {order.orderContact.email}
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

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ open: false, action: null, title: '', message: '' })}>
        <DialogTitle>{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <Typography>{confirmDialog.message}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false, action: null, title: '', message: '' })}>
            Cancel
          </Button>
          <Button onClick={executeAction} disabled={actionLoading} variant="contained">
            {actionLoading ? <CircularProgress size={20} /> : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
