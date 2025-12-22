# Spring Boot JSESSIONID Authentication Integration

This document explains how the frontend integrates with Spring Boot's session-based authentication using JSESSIONID cookies.

## Overview

The application uses **cookie-based session authentication** with Spring Boot's JSESSIONID cookie. This is more secure than storing tokens in localStorage because:
- Cookies can be `httpOnly` (not accessible via JavaScript)
- Cookies can be `secure` (only sent over HTTPS)
- Cookies are automatically included in requests
- No risk of XSS attacks stealing tokens from localStorage

## Authentication Flow

### 1. Login Flow

```
User clicks "Sign in with Google"
    ↓
Frontend redirects to: https://localhost:8443/oauth2/authorization/google
    ↓
Spring Boot handles Google OAuth2 flow
    ↓
Google authenticates user
    ↓
Spring Boot creates session and sets JSESSIONID cookie
    ↓
Spring Boot redirects to: http://localhost:5173/auth/callback
    ↓
Frontend calls GET /api/auth/me to verify session and get user info
    ↓
Frontend stores user info in localStorage (for UI display only)
    ↓
Frontend redirects to /dashboard
```

### 2. Authenticated Requests

All API requests automatically include the JSESSIONID cookie via `credentials: 'include'`:

```javascript
import { apiGet, apiPost } from './utils/api';

// GET request
const orders = await apiGet('/api/orders');

// POST request
const newOrder = await apiPost('/api/orders', { customer: 'John', total: 100 });
```

### 3. Session Validation

Protected routes verify the session with the backend on mount:

```javascript
// ProtectedRoute component checks authentication
<Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
```

### 4. Logout Flow

```
User clicks "Logout"
    ↓
Frontend calls POST /api/auth/logout
    ↓
Spring Boot invalidates session
    ↓
Frontend clears localStorage
    ↓
Frontend redirects to /login
```

## Spring Boot Backend Requirements

### 1. OAuth2 Configuration

Your Spring Boot application should have OAuth2 configured with Google:

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .oauth2Login(oauth2 -> oauth2
                .defaultSuccessUrl("http://localhost:5173/auth/callback", true)
            )
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
            );
        return http.build();
    }
}
```

### 2. CORS Configuration

Enable CORS to allow credentials (cookies) from the frontend:

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
            .allowedOrigins("http://localhost:5173")
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
            .allowCredentials(true)
            .allowedHeaders("*");
    }
}
```

### 3. Required API Endpoints

#### GET /api/auth/me
Returns the current authenticated user/merchant information.

**Response:**
```json
{
  "id": "123",
  "name": "John Doe",
  "email": "john@example.com"
}
```

Or with nested merchant object:
```json
{
  "merchant": {
    "id": "123",
    "name": "John's Store",
    "email": "john@example.com"
  }
}
```

#### POST /api/auth/logout
Invalidates the current session.

**Request:** Empty body `{}`

**Response:** 200 OK

### 4. Session Cookie Configuration

Configure the JSESSIONID cookie in `application.properties`:

```properties
# Session configuration
server.servlet.session.cookie.name=JSESSIONID
server.servlet.session.cookie.http-only=true
server.servlet.session.cookie.secure=true
server.servlet.session.cookie.same-site=lax
server.servlet.session.timeout=30m

# For development with different ports
server.servlet.session.cookie.domain=localhost
```

## Frontend Configuration

### Environment Variables

Create a `.env` file:

```bash
VITE_API_BASE=https://localhost:8443
```

### API Utility Usage

The `src/utils/api.js` provides helper functions:

```javascript
import { apiGet, apiPost, apiPut, apiDelete, logout } from './utils/api';

// All requests automatically include credentials (JSESSIONID cookie)
const data = await apiGet('/api/endpoint');
```

## Security Considerations

1. **HTTPS in Production**: Always use HTTPS in production
2. **SameSite Cookie**: Set to `Lax` or `Strict` to prevent CSRF
3. **HttpOnly Cookie**: Prevents XSS attacks from stealing session
4. **Secure Cookie**: Only sent over HTTPS
5. **Session Timeout**: Configure appropriate timeout (e.g., 30 minutes)
6. **CORS**: Only allow your frontend domain

## Troubleshooting

### Cookies Not Being Sent

- Ensure `credentials: 'include'` is set in fetch requests
- Check CORS configuration allows credentials
- Verify cookie domain matches request domain

### 401 Unauthorized Errors

- Session may have expired
- User may not be authenticated
- Check Spring Security configuration

### Redirect Loop

- Verify OAuth2 success URL is correct
- Check that `/auth/callback` is not protected
- Ensure `/api/auth/me` endpoint is accessible

