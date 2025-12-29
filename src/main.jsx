import React from "react"
import { createRoot } from "react-dom/client"
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import App from "./App"

const theme = createTheme({
  palette: {
    primary: {
      main: '#6b46c1',
    },
    secondary: {
      main: '#f50057',
    },
  },
});

createRoot(document.getElementById("root")).render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <App />
  </ThemeProvider>
)
