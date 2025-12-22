# Quick Start Guide - Spring Boot JSESSIONID Authentication

## Frontend Setup (Already Done ✅)

The frontend is now configured to work with Spring Boot's JSESSIONID cookie-based authentication.

### What's Been Implemented:

1. ✅ OAuth callback handler that works with JSESSIONID cookies
2. ✅ API utility module for authenticated requests
3. ✅ Protected routes with backend session verification
4. ✅ Logout functionality
5. ✅ Dynamic navigation showing user info

## Backend Setup (Your Next Steps)

### 1. Add Required Dependencies

Add to your `pom.xml`:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-oauth2-client</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
```

### 2. Configure OAuth2 in `application.properties`

```properties
# Google OAuth2
spring.security.oauth2.client.registration.google.client-id=YOUR_CLIENT_ID
spring.security.oauth2.client.registration.google.client-secret=YOUR_CLIENT_SECRET
spring.security.oauth2.client.registration.google.scope=profile,email

# Session configuration
server.servlet.session.cookie.http-only=true
server.servlet.session.cookie.secure=false
server.servlet.session.cookie.same-site=lax
server.servlet.session.cookie.domain=localhost
server.servlet.session.timeout=30m

# Server port
server.port=8443
```

### 3. Create Security Configuration

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable()) // Or configure CSRF properly
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
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
```

### 4. Create Auth Controller

```java
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal OAuth2User principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        Map<String, Object> user = new HashMap<>();
        user.put("id", principal.getAttribute("sub"));
        user.put("name", principal.getAttribute("name"));
        user.put("email", principal.getAttribute("email"));
        
        return ResponseEntity.ok(user);
    }
    
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        return ResponseEntity.ok().build();
    }
}
```

### 5. Get Google OAuth2 Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `https://localhost:8443/login/oauth2/code/google`
6. Copy Client ID and Client Secret to `application.properties`

## Testing the Flow

### 1. Start Backend
```bash
./mvnw spring-boot:run
```

### 2. Start Frontend
```bash
npm run dev
```

### 3. Test Authentication

1. Navigate to `http://localhost:5173`
2. Click "Sign in with Google"
3. Authenticate with Google
4. You should be redirected to `/dashboard`
5. Check browser DevTools → Application → Cookies → `JSESSIONID` should be present

### 4. Test Protected Routes

- Try accessing `/dashboard`, `/orders`, `/items`, `/categories`
- All should work when authenticated
- Try clearing cookies and accessing - should redirect to login

### 5. Test Logout

- Click "Logout" in navigation
- Should clear session and redirect to login

## Troubleshooting

### Issue: Cookies not being sent

**Solution:** Check CORS configuration allows credentials:
```java
configuration.setAllowCredentials(true);
```

### Issue: 401 Unauthorized on /api/auth/me

**Solution:** Ensure endpoint is accessible:
```java
.requestMatchers("/api/auth/**").permitAll()
```

### Issue: OAuth redirect not working

**Solution:** Verify redirect URI in Google Console matches:
```
https://localhost:8443/login/oauth2/code/google
```

### Issue: CORS errors

**Solution:** Check allowed origins include frontend URL:
```java
configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173"));
```

## Production Checklist

Before deploying to production:

- [ ] Set `server.servlet.session.cookie.secure=true`
- [ ] Use HTTPS for both frontend and backend
- [ ] Update CORS to allow only production domain
- [ ] Set proper session timeout
- [ ] Enable CSRF protection
- [ ] Use environment variables for OAuth credentials
- [ ] Configure proper cookie domain for production

## Need Help?

See detailed documentation:
- `SPRING_BOOT_AUTH.md` - Complete integration guide
- `src/utils/README.md` - API utility usage
- `IMPLEMENTATION_SUMMARY.md` - What was implemented

