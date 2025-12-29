import React from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box
} from '@mui/material';
import { Google as GoogleIcon } from '@mui/icons-material';

export default function Login() {
  const handleGoogleLogin = () => {
    // Redirect to Spring Boot OAuth2 endpoint via proxy
    window.location.href = '/oauth2/authorization/google';
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Typography component="h1" variant="h4" gutterBottom>
            Sign in
          </Typography>

          <Box sx={{ mt: 3, width: '100%', display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="outlined"
              startIcon={<GoogleIcon />}
              onClick={handleGoogleLogin}
              sx={{
                minWidth: 240,
                py: 1.5,
                px: 3,
                borderColor: '#dadce0',
                color: '#3c4043',
                backgroundColor: '#fff',
                '&:hover': {
                  backgroundColor: '#f8f9fa',
                  borderColor: '#dadce0',
                },
                textTransform: 'none',
                fontSize: '14px',
                fontWeight: 500,
              }}
            >
              Sign in with Google
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
