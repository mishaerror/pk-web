import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Box,
  CircularProgress,
  Alert,
  IconButton
} from '@mui/material';
import { Visibility as VisibilityIcon } from '@mui/icons-material';
import { apiGet } from '../utils/api';

export default function Orders(){
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await apiGet('/api/admin/orders');
      setOrders(data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

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

  const handleViewOrder = (orderRef) => {
    navigate(`/orders/${orderRef}`);
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Orders
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell><strong>Order Ref</strong></TableCell>
              <TableCell><strong>Customer</strong></TableCell>
              <TableCell><strong>Address</strong></TableCell>
              <TableCell><strong>Count</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map(order => (
              <TableRow 
                key={order.orderRef}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {order.orderRef}
                </TableCell>
                <TableCell>{order.orderAddress.customerName}</TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2">
                      {order.orderAddress.addressLineOne}
                    </Typography>
                    {order.orderAddress.addressLineTwo && (
                      <Typography variant="body2">
                        {order.orderAddress.addressLineTwo}
                      </Typography>
                    )}
                    <Typography variant="body2">
                      {order.orderAddress.addressCity}, {order.orderAddress.adressPostalCode}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>{order.count}</TableCell>
                <TableCell>
                  <Chip 
                    label={getStatusLabel(order.state)} 
                    color={getStatusColor(order.state)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => handleViewOrder(order.orderRef)}
                    title="View Details"
                  >
                    <VisibilityIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}
