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
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Grid
} from '@mui/material';
import { Visibility as VisibilityIcon, FilterList as FilterIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { apiGet } from '../utils/api';

export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateFilter, setDateFilter] = useState('7'); // Default to last 7 days
  const [customDateFrom, setCustomDateFrom] = useState(null);
  const [customDateTo, setCustomDateTo] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  const statusOptions = [
    { value: 'CUSTOMER_INITIATED', label: 'Initiated' },
    { value: 'CUSTOMER_ABANDONED', label: 'Abandoned' },
    { value: 'CUSTOMER_ENTERED', label: 'Entered' },
    { value: 'MERCHANT_CONFIRMED', label: 'Confirmed' },
    { value: 'MERCHANT_DECLINED', label: 'Declined' },
    { value: 'MERCHANT_SENT', label: 'Sent' },
    { value: 'DELIVERED_TO_CUSTOMER', label: 'Delivered' },
    { value: 'RETURNED_TO_MERCHANT', label: 'Returned' }
  ];

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      
      let endpoint = '/api/admin/orders';
      const params = new URLSearchParams();
      
      if (dateFilter === 'custom') {
        if (customDateFrom) {
          params.append('dateFrom', customDateFrom.toISOString().split('T')[0]);
        }
        if (customDateTo) {
          params.append('dateTo', customDateTo.toISOString().split('T')[0]);
        }
      } else {
        params.append('days', dateFilter);
      }
      
      // Add status filter if selected
      if (statusFilter) {
        params.append('status', statusFilter);
      }
      
      if (params.toString()) {
        endpoint += `?${params.toString()}`;
      }
      
      const data = await apiGet(endpoint);
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
  }, [dateFilter, customDateFrom, customDateTo, statusFilter]);

  const handleDateFilterChange = (value) => {
    setDateFilter(value);
    if (value !== 'custom') {
      setCustomDateFrom(null);
      setCustomDateTo(null);
    }
  };

  const applyCustomDateFilter = () => {
    if (dateFilter === 'custom') {
      fetchOrders();
    }
  };

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

      {/* Date Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <FilterIcon color="primary" />
          <Typography variant="h6">Filter Orders</Typography>
        </Box>
        
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Time Period</InputLabel>
              <Select
                value={dateFilter}
                label="Time Period"
                onChange={(e) => handleDateFilterChange(e.target.value)}
              >
                <MenuItem value="1">Last 24 hours</MenuItem>
                <MenuItem value="7">Last 7 days</MenuItem>
                <MenuItem value="30">Last 30 days</MenuItem>
                <MenuItem value="90">Last 90 days</MenuItem>
                <MenuItem value="custom">Custom Date Range</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Status Filter</InputLabel>
              <Select
                value={statusFilter}
                label="Status Filter"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="">All Statuses</MenuItem>
                {statusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {dateFilter === 'custom' && (
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Grid item xs={12} sm={6} md={3}>
                <DatePicker
                  label="From Date"
                  value={customDateFrom}
                  onChange={setCustomDateFrom}
                  renderInput={(params) => <TextField {...params} size="small" fullWidth />}
                  maxDate={new Date()}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <DatePicker
                  label="To Date"
                  value={customDateTo}
                  onChange={setCustomDateTo}
                  renderInput={(params) => <TextField {...params} size="small" fullWidth />}
                  minDate={customDateFrom}
                  maxDate={new Date()}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="contained"
                  onClick={applyCustomDateFilter}
                  disabled={!customDateFrom || !customDateTo}
                  fullWidth
                >
                  Apply Filter
                </Button>
              </Grid>
            </LocalizationProvider>
          )}
        </Grid>
      </Paper>

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
