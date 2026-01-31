# Refresh Token Implementation Guide

## Overview

This project now implements a **secure dual-token authentication system**:

- **Access Token (JWT)**: Short-lived (15 minutes), used for API authentication
- **Refresh Token**: Long-lived (7 days), stored in database, used to obtain new access tokens

## Architecture

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       │ POST /api/users/login
       ▼
┌─────────────────────────────────┐
│      userController.js          │
│  - Validates credentials         │
│  - Generates accessToken (JWT)   │
│  - Generates refreshToken (hex)  │
└──────┬──────────────────────────┘
       │
       │ Saves to DB
       ▼
┌─────────────────────────────────┐
│   RefreshToken Collection       │
│  {                               │
│    user_id: ObjectId,            │
│    token: "abc123...",           │
│    expires_at: Date,             │
│    created_by_ip: "1.2.3.4",    │
│    revoked_at: null              │
│  }                               │
└─────────────────────────────────┘
```

## API Endpoints

### 1. Register
```http
POST /api/users/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "full_name": "John Doe"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "a1b2c3d4e5f6...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "user"
  }
}
```

### 2. Login
```http
POST /api/users/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response:** Same as register

### 3. Refresh Access Token
```http
POST /api/users/refresh
Content-Type: application/json

{
  "refreshToken": "a1b2c3d4e5f6..."
}
```

**Response:**
```json
{
  "message": "Token refreshed successfully",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 4. Get Profile (Protected)
```http
GET /api/users/profile
Authorization: Bearer <accessToken>
```

### 5. Update Profile (Protected)
```http
PUT /api/users/profile
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "full_name": "Jane Doe",
  "avatar_url": "https://example.com/avatar.jpg"
}
```

### 6. Logout (Revoke Single Token)
```http
POST /api/users/logout
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "refreshToken": "a1b2c3d4e5f6..."
}
```

### 7. Logout All Devices
```http
POST /api/users/logout-all
Authorization: Bearer <accessToken>
```

## Client-Side Implementation

### JavaScript/TypeScript Example

```javascript
class AuthService {
  constructor() {
    this.accessToken = localStorage.getItem('accessToken');
    this.refreshToken = localStorage.getItem('refreshToken');
  }

  async login(email, password) {
    const response = await fetch('http://localhost:5000/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      this.saveTokens(data.accessToken, data.refreshToken);
      return data;
    }

    throw new Error(data.message);
  }

  saveTokens(accessToken, refreshToken) {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }

  async refreshAccessToken() {
    const response = await fetch('http://localhost:5000/api/users/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: this.refreshToken }),
    });

    const data = await response.json();

    if (response.ok) {
      this.accessToken = data.accessToken;
      localStorage.setItem('accessToken', data.accessToken);
      return data.accessToken;
    }

    // Refresh failed, redirect to login
    this.logout();
    window.location.href = '/login';
    throw new Error(data.message);
  }

  async apiCall(url, options = {}) {
    // Add access token to request
    options.headers = {
      ...options.headers,
      'Authorization': `Bearer ${this.accessToken}`,
    };

    let response = await fetch(url, options);

    // If 401, try to refresh token
    if (response.status === 401) {
      await this.refreshAccessToken();

      // Retry original request with new token
      options.headers['Authorization'] = `Bearer ${this.accessToken}`;
      response = await fetch(url, options);
    }

    return response;
  }

  async logout() {
    try {
      await fetch('http://localhost:5000/api/users/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.accessToken}`,
        },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      this.accessToken = null;
      this.refreshToken = null;
    }
  }
}

// Usage
const auth = new AuthService();

// Login
await auth.login('user@example.com', 'password123');

// Make authenticated request
const response = await auth.apiCall('http://localhost:5000/api/users/profile');
const userData = await response.json();

// Logout
await auth.logout();
```

### Axios Interceptor Example

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Request interceptor - add access token
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401 and refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const { data } = await axios.post(
          'http://localhost:5000/api/users/refresh',
          { refreshToken }
        );

        localStorage.setItem('accessToken', data.accessToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
```

## Database Schema

### RefreshToken Collection

```javascript
{
  _id: ObjectId("..."),
  user_id: ObjectId("507f1f77bcf86cd799439011"),
  token: "a1b2c3d4e5f6g7h8i9j0...",
  expires_at: ISODate("2026-02-05T10:30:00.000Z"),
  created_by_ip: "192.168.1.100",
  revoked_at: null,
  revoked_by_ip: null,
  replaced_by_token: null,
  device_info: null,
  createdAt: ISODate("2026-01-29T10:30:00.000Z"),
  updatedAt: ISODate("2026-01-29T10:30:00.000Z")
}
```

### Index Strategy

```javascript
// Indexes in RefreshToken model:
- user_id (for finding user's tokens)
- token (unique, for fast lookup)
- expires_at (TTL index - auto-delete expired tokens)
```

## Security Features

### ✅ Implemented

1. **Separate Token Storage**
   - Access tokens: JWT (stateless, short-lived)
   - Refresh tokens: Database (stateful, revocable)

2. **Token Rotation**
   - Each refresh generates new access token
   - Optional: Can implement refresh token rotation

3. **Revocation Support**
   - Single device logout: Revokes one refresh token
   - All devices logout: Revokes all user's refresh tokens

4. **Automatic Cleanup**
   - MongoDB TTL index auto-deletes expired tokens
   - Manual cleanup method: `RefreshToken.cleanupUserTokens(userId)`

5. **IP Tracking**
   - Records IP when token created
   - Records IP when token revoked

6. **Expiry Check**
   - Virtual `isActive`: Checks not revoked AND not expired
   - Virtual `isExpired`: Checks current time vs expires_at

### 🔒 Best Practices

1. **Environment Variables**
   ```bash
   JWT_SECRET=your_super_secret_key_min_32_chars_here
   JWT_EXPIRE=15m  # Short-lived access token
   ```

2. **HTTPS Only**
   - Always use HTTPS in production
   - Never send tokens over HTTP

3. **HttpOnly Cookies (Alternative)**
   - For web apps, consider storing refresh token in HttpOnly cookie
   - Prevents XSS attacks

4. **Rate Limiting**
   - Add rate limiting to `/refresh` endpoint
   - Prevent refresh token brute force

## Testing

### Manual Testing with curl

```bash
# 1. Register
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234",
    "full_name": "Test User"
  }'

# Save the tokens from response
ACCESS_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
REFRESH_TOKEN="a1b2c3d4e5f6..."

# 2. Access protected route
curl http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# 3. Wait 15+ minutes (or change JWT_EXPIRE to 1m for testing)
# Then try again - should get 401

# 4. Refresh access token
curl -X POST http://localhost:5000/api/users/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\": \"$REFRESH_TOKEN\"}"

# 5. Logout
curl -X POST http://localhost:5000/api/users/logout \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\": \"$REFRESH_TOKEN\"}"
```

### Testing Scenarios

1. **Access token expires**
   - Set `JWT_EXPIRE=1m` in .env
   - Login, wait 1 minute, try to access protected route
   - Should get 401
   - Call `/refresh` with refreshToken
   - Should get new accessToken

2. **Refresh token expires**
   - Login, wait 7+ days
   - Call `/refresh`
   - Should get 401 (expired token)

3. **Logout**
   - Login, get tokens
   - Call `/logout` with refreshToken
   - Try to `/refresh` with same token
   - Should get 401 (revoked token)

4. **Logout all devices**
   - Login from "device 1", get tokens1
   - Login from "device 2", get tokens2
   - Call `/logout-all` from device 1
   - Try to `/refresh` from device 2
   - Should get 401 (all tokens revoked)

## Migration Guide

If you have existing users, you don't need to migrate anything:

1. **Old tokens still work** until they expire (7 days)
2. **Next login** will use new refresh token system
3. **No user data migration needed**

## Future Enhancements

- [ ] Refresh token rotation (generate new refresh token on each refresh)
- [ ] Device tracking (user-agent, device name)
- [ ] Email notification on new device login
- [ ] Admin panel to view/revoke user sessions
- [ ] Refresh token reuse detection (security feature)

## Troubleshooting

### "Invalid refresh token" error
- Token may be expired (> 7 days)
- Token may have been revoked (logout)
- Token not found in database
- **Solution**: User must login again

### "Token expired" on protected routes
- Access token expired (> 15 minutes)
- **Solution**: Call `/refresh` endpoint with refreshToken

### "User not found or inactive"
- User account was deleted or deactivated
- **Solution**: User must register again or contact admin

## Files Modified/Created

```
backend/
├── src/
│   ├── models/
│   │   └── RefreshToken.js          ← NEW
│   ├── controllers/
│   │   └── userController.js        ← MODIFIED (added refresh/logout)
│   └── routes/
│       └── userRoutes.js            ← MODIFIED (added routes)
├── .env.example                     ← MODIFIED (updated JWT_EXPIRE)
└── REFRESH_TOKEN_GUIDE.md           ← NEW (this file)
```
