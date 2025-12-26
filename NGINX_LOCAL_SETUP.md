
# Local Nginx Setup for pk-commerce

## Overview
This guide sets up nginx on Mac with HTTPS to serve the React app and proxy API calls to the Spring Boot backend using the local domain `pk-commerce.co`.

## Prerequisites
- nginx installed on Mac: `brew install nginx`
- OpenSSL for certificate generation
- React app built: `npm run build`
- Spring Boot backend running on `https://localhost:8443`

## Setup Steps

### 1. Generate Self-Signed SSL Certificate

```bash
# Create directory for certificates
sudo mkdir -p /usr/local/etc/nginx/ssl

# Generate private key and certificate
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /usr/local/etc/nginx/ssl/pk-commerce.co.key \
  -out /usr/local/etc/nginx/ssl/pk-commerce.co.crt \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=pk-commerce.co"

# Set proper permissions
sudo chmod 600 /usr/local/etc/nginx/ssl/pk-commerce.co.key
sudo chmod 644 /usr/local/etc/nginx/ssl/pk-commerce.co.crt
```

### 2. Create Nginx HTTPS Configuration

Create file: `/usr/local/etc/nginx/servers/pk-commerce.conf`

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name pk-commerce.co www.pk-commerce.co;
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl;
    server_name pk-commerce.co www.pk-commerce.co;
    
    # Enable HTTP/2
    http2 on;
    
    # SSL Configuration
    ssl_certificate /usr/local/etc/nginx/ssl/pk-commerce.co.crt;
    ssl_certificate_key /usr/local/etc/nginx/ssl/pk-commerce.co.key;
    
    # SSL Security Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    
    # Serve React app static files
    location / {
        root /Users/milosstoiljkovic/Development/pk-web/dist;
        try_files $uri $uri/ /index.html;
        
        # Disable caching for development
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }
    
    # Proxy API requests to Spring Boot backend
    location /api/ {
        proxy_pass https://localhost:8443;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Origin $http_origin;
        
        # SSL settings for backend
        proxy_ssl_verify off;
        proxy_ssl_server_name on;
    }
    
    # Proxy OAuth2 requests to Spring Boot backend
    location /oauth2/ {
        proxy_pass https://localhost:8443;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # SSL settings for backend
        proxy_ssl_verify off;
        proxy_ssl_server_name on;
    }
    # Proxy Login requests to Spring Boot backend, including redirection 
    location /login/ {
        proxy_pass https://localhost:8443;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # SSL settings for backend
        proxy_ssl_verify off;
        proxy_ssl_server_name on;
    }
}
```

### 3. Update Main Nginx Config

Ensure `/usr/local/etc/nginx/nginx.conf` includes:

```nginx
http {
    include       mime.types;
    default_type  application/octet-stream;
    
    sendfile        on;
    keepalive_timeout  65;
    
    # Include all server configurations
    include /usr/local/etc/nginx/servers/*;
}
```

### 4. Add Local Domain to Hosts

Add to `/etc/hosts`:
```
127.0.0.1 pk-commerce.co
127.0.0.1 www.pk-commerce.co
```

### 5. Create Production Environment File

Create `.env.production` in project root:
```bash
# Production API Base URL - using nginx HTTPS proxy
VITE_API_BASE=https://pk-commerce.co
```

### 6. Build and Start Nginx

```bash
# Build React app
npm run build

# Test configuration
sudo nginx -t

# Start nginx
sudo brew services start nginx

# Restart nginx (after config changes)
sudo brew services restart nginx

# Reload configuration (without restart)
sudo nginx -s reload

# Stop nginx
sudo brew services stop nginx
```

### 7. Update Spring Boot OAuth2

Update your Spring Boot OAuth2 redirect URLs from:
- `http://localhost:5173/auth/callback`

To:
- `https://pk-commerce.co/auth/callback`

### 8. Accept Self-Signed Certificate

When you first visit `https://pk-commerce.co`, your browser will show a security warning. Click "Advanced" → "Proceed to pk-commerce.co (unsafe)" to accept the self-signed certificate.

## Access Your App

After setup, access your app at: **https://pk-commerce.co**

## Troubleshooting

- **Certificate warnings**: Normal for self-signed certificates - click "Proceed"
- **403 Forbidden**: Check nginx has read permissions to your dist folder
- **502 Bad Gateway**: Ensure Spring Boot backend is running on HTTPS port 8443
- **Domain not found**: Verify `/etc/hosts` entry and nginx is running
- **Config errors**: Run `sudo nginx -t` to test configuration
- **SSL errors**: Check certificate paths and permissions

## File Locations Summary

- Nginx config: `/usr/local/etc/nginx/servers/pk-commerce.conf`
- Main nginx config: `/usr/local/etc/nginx/nginx.conf`
- SSL certificate: `/usr/local/etc/nginx/ssl/pk-commerce.co.crt`
- SSL private key: `/usr/local/etc/nginx/ssl/pk-commerce.co.key`
- Hosts file: `/etc/hosts`
- Environment file: `.env.production` (in project root)
- React build: `/Users/milosstoiljkovic/Development/pk-web/dist`
