# Chrome/Opera Cookie Authentication Fix

## Problem

Safari works fine, but Chrome and Opera fail with:
```
SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON
```

This means the backend is returning HTML (login page) instead of JSON, indicating the JSESSIONID cookie is not being sent/received properly.

## Root Cause

Chrome and Opera are stricter about cookies in cross-origin scenarios, especially with:
1. **SameSite cookie attribute**
2. **Secure cookies on localhost**
3. **HTTPS/HTTP mixed content**

## Solution 1: Fix Spring Boot Cookie Configuration (RECOMMENDED)

Update your `application.properties`:

```properties
# Cookie configuration for Chrome/Opera compatibility
server.servlet.session.cookie.same-site=none
server.servlet.session.cookie.secure=false
server.servlet.session.cookie.http-only=true
server.servlet.session.cookie.domain=localhost

# IMPORTANT: For SameSite=None to work in development
# You need BOTH frontend and backend on same protocol (both HTTP or both HTTPS)
```

### Option A: Both HTTP (Easiest for Development)

**Backend** (`application.properties`):
```properties
server.port=8080
server.ssl.enabled=false
server.servlet.session.cookie.same-site=lax
server.servlet.session.cookie.secure=false
```

**Frontend** (`.env`):
```bash
VITE_API_BASE=http://localhost:8080
```

**Update Login.jsx**:
```javascript
window.location.href = 'http://localhost:8080/oauth2/authorization/google';
```

### Option B: Both HTTPS (Production-like)

**Backend** - Keep your current HTTPS setup

**Frontend** - Use HTTPS for Vite:

1. Install `@vitejs/plugin-basic-ssl`:
```bash
npm install -D @vitejs/plugin-basic-ssl
```

2. Update `vite.config.js`:
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
  plugins: [react(), basicSsl()],
  server: {
    https: true,
    port: 5173
  }
})
```

3. Update `.env`:
```bash
VITE_API_BASE=https://localhost:8443
```

4. Access frontend at: `https://localhost:5173`

**Backend** (`application.properties`):
```properties
server.servlet.session.cookie.same-site=none
server.servlet.session.cookie.secure=true

# Update CORS to use HTTPS
```

**Update SecurityConfig.java**:
```java
configuration.setAllowedOrigins(Arrays.asList("https://localhost:5173"));
```

## Solution 2: Update Spring Boot CORS Configuration

Ensure your CORS configuration explicitly allows credentials:

```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    
    // Use the SAME protocol as frontend
    configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173")); // or https
    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    configuration.setAllowedHeaders(Arrays.asList("*"));
    configuration.setAllowCredentials(true); // CRITICAL!
    configuration.setExposedHeaders(Arrays.asList("Set-Cookie")); // Allow cookie headers
    
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
}
```

## Solution 3: Update OAuth2 Success Handler

The issue might be that Spring Boot's OAuth redirect doesn't properly set the cookie. Create a custom success handler:

```java
@Component
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
    
    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, 
                                       HttpServletResponse response,
                                       Authentication authentication) throws IOException {
        
        // Ensure session is created
        HttpSession session = request.getSession(true);
        
        // Log for debugging
        System.out.println("Session ID: " + session.getId());
        System.out.println("JSESSIONID Cookie: " + getCookieValue(request, "JSESSIONID"));
        
        // Redirect to frontend callback
        getRedirectStrategy().sendRedirect(request, response, 
            "http://localhost:5173/auth/callback");
    }
    
    private String getCookieValue(HttpServletRequest request, String name) {
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if (cookie.getName().equals(name)) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }
}
```

Then use it in SecurityConfig:

```java
@Autowired
private OAuth2AuthenticationSuccessHandler successHandler;

@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
        .oauth2Login(oauth2 -> oauth2
            .successHandler(successHandler)
        )
        // ... rest of config
}
```

## Debugging Steps

1. **Check Console Logs** - The updated OAuthCallback.jsx now logs:
   - Current cookies
   - Response status
   - Response headers
   - Error details

2. **Check Browser DevTools**:
   - **Network tab**: Look at the OAuth redirect response
   - **Application tab → Cookies**: Check if JSESSIONID is set
   - Look for cookie attributes: `SameSite`, `Secure`, `HttpOnly`, `Domain`

3. **Expected Cookie Attributes for Development**:
   ```
   Name: JSESSIONID
   Value: <some-hash>
   Domain: localhost
   Path: /
   SameSite: Lax (or None if HTTPS)
   Secure: false (or true if HTTPS)
   HttpOnly: true
   ```

4. **Test the Cookie**:
   - After OAuth redirect, check if cookie exists: `document.cookie`
   - Should see: `JSESSIONID=...`
   - If empty in Chrome but works in Safari → SameSite issue

## Quick Test

Add this to your Spring Boot controller to test cookie behavior:

```java
@GetMapping("/api/test/cookie")
public ResponseEntity<?> testCookie(HttpServletRequest request) {
    HttpSession session = request.getSession(true);
    
    Map<String, Object> info = new HashMap<>();
    info.put("sessionId", session.getId());
    info.put("isNew", session.isNew());
    info.put("cookies", request.getCookies() != null ? 
        Arrays.stream(request.getCookies())
              .map(c -> c.getName() + "=" + c.getValue())
              .collect(Collectors.toList()) : 
        Collections.emptyList());
    
    return ResponseEntity.ok(info);
}
```

Then test from frontend:
```javascript
fetch('http://localhost:8080/api/test/cookie', { credentials: 'include' })
  .then(r => r.json())
  .then(console.log);
```

## Recommended Solution for Development

**Use Option A (Both HTTP)** - It's the simplest:

1. Change backend to HTTP (port 8080)
2. Update `.env`: `VITE_API_BASE=http://localhost:8080`
3. Update `Login.jsx` to use `http://localhost:8080`
4. Set `server.servlet.session.cookie.same-site=lax`
5. Set `server.servlet.session.cookie.secure=false`

This avoids all the HTTPS certificate issues in development while still being secure enough for local testing.

