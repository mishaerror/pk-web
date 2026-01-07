import React from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box
} from '@mui/material';
import { TrendingUp, ShoppingCart, Inventory } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%', cursor: 'pointer' }} onClick={() => navigate('/sales-summary')}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <TrendingUp color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" component="h2">
                  Sales Summary
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                View your sales performance and trends
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%', cursor: 'pointer' }} onClick={() => navigate('/orders')}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <ShoppingCart color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" component="h2">
                  Recent Orders
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Latest customer orders and status
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%', cursor: 'pointer' }} onClick={() => navigate('/items')}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Inventory color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" component="h2">
                  Inventory
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Manage your product inventory
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
