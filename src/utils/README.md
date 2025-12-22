# API Utilities

This directory contains utilities for making authenticated API requests to the Spring Boot backend.

## Usage Examples

### Basic GET Request

```javascript
import { apiGet } from '../utils/api';

function MyComponent() {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    async function fetchData() {
      try {
        const result = await apiGet('/api/orders');
        setData(result);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      }
    }
    fetchData();
  }, []);
  
  return <div>{/* render data */}</div>;
}
```

### POST Request

```javascript
import { apiPost } from '../utils/api';

async function createOrder(orderData) {
  try {
    const newOrder = await apiPost('/api/orders', orderData);
    console.log('Order created:', newOrder);
  } catch (error) {
    console.error('Failed to create order:', error);
  }
}
```

### PUT Request

```javascript
import { apiPut } from '../utils/api';

async function updateOrder(orderId, updates) {
  try {
    const updated = await apiPut(`/api/orders/${orderId}`, updates);
    console.log('Order updated:', updated);
  } catch (error) {
    console.error('Failed to update order:', error);
  }
}
```

### DELETE Request

```javascript
import { apiDelete } from '../utils/api';

async function deleteOrder(orderId) {
  try {
    await apiDelete(`/api/orders/${orderId}`);
    console.log('Order deleted');
  } catch (error) {
    console.error('Failed to delete order:', error);
  }
}
```

### Logout

```javascript
import { logout } from '../utils/api';

function LogoutButton() {
  return (
    <button onClick={logout}>
      Logout
    </button>
  );
}
```

## Features

- **Automatic Cookie Handling**: All requests include `credentials: 'include'` to send JSESSIONID cookie
- **Auto-Redirect on 401**: Automatically redirects to login if session expires
- **Error Handling**: Throws errors with response text for easy debugging
- **Consistent API**: All methods follow the same pattern

## API Reference

### `apiGet(endpoint)`
Make a GET request.
- **endpoint**: API endpoint (e.g., '/api/orders')
- **Returns**: Promise resolving to JSON response

### `apiPost(endpoint, data)`
Make a POST request.
- **endpoint**: API endpoint
- **data**: Request body object
- **Returns**: Promise resolving to JSON response

### `apiPut(endpoint, data)`
Make a PUT request.
- **endpoint**: API endpoint
- **data**: Request body object
- **Returns**: Promise resolving to JSON response

### `apiDelete(endpoint)`
Make a DELETE request.
- **endpoint**: API endpoint
- **Returns**: Promise resolving to JSON response (or null if empty)

### `checkAuth()`
Check if user is authenticated.
- **Returns**: Promise resolving to boolean

### `getCurrentUser()`
Get current user/merchant information.
- **Returns**: Promise resolving to user object

### `logout()`
Logout the current user.
- **Returns**: Promise (always redirects to /login)

