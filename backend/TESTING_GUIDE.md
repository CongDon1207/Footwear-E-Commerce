# Testing the Refresh Token System

## Quick Start

### 1. Update Environment Variables

Make sure your `.env` file has the correct settings:

```bash
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string

# Access token should be short-lived
JWT_SECRET=your_super_secure_jwt_secret_key_min_32_chars
JWT_EXPIRE=15m
```

**Important:** `JWT_EXPIRE=15m` means access token expires in 15 minutes.

### 2. Start the Server

```bash
cd backend
npm install
npm run dev
```

You should see:
```
✓ MongoDB connected successfully
✓ Server is running on port 5000
```

### 3. Run the Test Suite

Open a new terminal:

```bash
cd backend
node test-refresh-token.js
```

Expected output:
```
🧪 REFRESH TOKEN SYSTEM TEST SUITE
============================================================

⚠ Make sure your server is running on http://localhost:5000

ℹ Test 1: Register new user
✓ User registered successfully
  User ID: "507f1f77bcf86cd799439011"
  Access Token (first 20 chars): "eyJhbGciOiJIUzI1NiIs..."
  Refresh Token (first 20 chars): "a1b2c3d4e5f6g7h8i9j0..."

ℹ Test 2: Login with existing user
✓ Login successful
  New Access Token: "eyJhbGciOiJIUzI1NiIs..."
  New Refresh Token: "k1l2m3n4o5p6q7r8s9t0..."

... (more tests)

============================================================
📊 TEST RESULTS
============================================================
Total: 8 | Passed: 8 | Failed: 0

✓ 🎉 All tests passed!
```

## Manual Testing with Postman/cURL

### 1. Register

```bash
POST http://localhost:5000/api/users/register
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123",
  "full_name": "John Doe"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "john@example.com",
    "full_name": "John Doe",
    "role": "user"
  }
}
```

**Save the tokens:**
- `accessToken` → Use for API calls
- `refreshToken` → Use to get new access token

### 2. Access Protected Route

```bash
GET http://localhost:5000/api/users/profile
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "john@example.com",
    "full_name": "John Doe",
    "role": "user",
    "status": "active",
    ...
  }
}
```

### 3. Wait for Token to Expire

If `JWT_EXPIRE=15m`, wait 15+ minutes, then try step 2 again.

**Expected Response:**
```json
{
  "message": "Invalid token"
}
```
Status: 401 Unauthorized

### 4. Refresh Access Token

```bash
POST http://localhost:5000/api/users/refresh
Content-Type: application/json

{
  "refreshToken": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0..."
}
```

**Response:**
```json
{
  "message": "Token refreshed successfully",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Now you can use this new `accessToken` for the next 15 minutes!

### 5. Logout (Revoke Refresh Token)

```bash
POST http://localhost:5000/api/users/logout
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "refreshToken": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0..."
}
```

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

Now if you try to refresh with that token:

```bash
POST http://localhost:5000/api/users/refresh
Content-Type: application/json

{
  "refreshToken": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0..."
}
```

**Response:**
```json
{
  "message": "Refresh token expired or revoked"
}
```
Status: 401 Unauthorized

## Testing Scenarios

### Scenario 1: Token Expiry Flow

**Goal:** Simulate real-world token expiry

1. **For quick testing**, change `.env`:
   ```
   JWT_EXPIRE=1m
   ```

2. **Restart server** (important!)

3. **Register/Login**

4. **Wait 1 minute**

5. **Try to access protected route** → Should get 401

6. **Call /refresh** → Should get new access token

7. **Try protected route again** → Should work!

### Scenario 2: Logout All Devices

**Goal:** Test revoking all user sessions

1. **Login from "Device 1"** (first browser/Postman tab)
   - Save `accessToken1` and `refreshToken1`

2. **Login from "Device 2"** (second browser/Postman tab)
   - Save `accessToken2` and `refreshToken2`

3. **From Device 1**, call `/logout-all`:
   ```bash
   POST http://localhost:5000/api/users/logout-all
   Authorization: Bearer <accessToken1>
   ```

4. **From Device 2**, try to refresh:
   ```bash
   POST http://localhost:5000/api/users/refresh
   Content-Type: application/json
   
   {
     "refreshToken": "<refreshToken2>"
   }
   ```
   
   **Expected:** 401 Unauthorized (token was revoked)

### Scenario 3: Refresh Token Expiry

**Goal:** Test refresh token expiry (7 days)

**Note:** This requires waiting 7 days or manually changing database entry.

**Quick test using MongoDB:**

```javascript
// Connect to MongoDB
use footwear-ecommerce

// Find a refresh token
db.refresh_tokens.findOne()

// Manually expire it
db.refresh_tokens.updateOne(
  { _id: ObjectId("...") },
  { $set: { expires_at: new Date("2020-01-01") } }
)

// Now try to refresh with that token → Should get 401
```

## Database Inspection

### View Refresh Tokens

```javascript
// MongoDB Shell
use footwear-ecommerce

// Show all refresh tokens
db.refresh_tokens.find().pretty()

// Show tokens for specific user
db.refresh_tokens.find({ 
  user_id: ObjectId("507f1f77bcf86cd799439011") 
}).pretty()

// Show only active tokens
db.refresh_tokens.find({ 
  revoked_at: null,
  expires_at: { $gt: new Date() }
}).pretty()

// Count tokens per user
db.refresh_tokens.aggregate([
  {
    $match: {
      revoked_at: null,
      expires_at: { $gt: new Date() }
    }
  },
  {
    $group: {
      _id: "$user_id",
      tokenCount: { $sum: 1 }
    }
  }
])
```

## Common Issues & Solutions

### Issue 1: "Invalid token" immediately after login

**Cause:** JWT_SECRET mismatch or server not restarted after .env change

**Solution:**
```bash
# Stop server (Ctrl+C)
# Check .env has correct JWT_SECRET
# Restart server
npm run dev
```

### Issue 2: "User not found or inactive"

**Cause:** User's `status` is not 'active' or user was deleted

**Solution:**
```javascript
// MongoDB Shell
db.users.updateOne(
  { email: "john@example.com" },
  { $set: { status: "active" } }
)
```

### Issue 3: Refresh token immediately expired

**Cause:** System time incorrect or database time zone issue

**Solution:**
```javascript
// Check token in database
db.refresh_tokens.findOne({ token: "your_token_here" })

// Check expires_at vs current time
// If expires_at is in the past, recreate token by logging in again
```

### Issue 4: Can't refresh after logout

**Cause:** This is expected behavior! Logout revokes the refresh token.

**Solution:** This is not a bug. User must login again to get new tokens.

## Performance Testing

### Load Test with Apache Bench

```bash
# Test login endpoint
ab -n 1000 -c 10 -p login.json -T application/json \
  http://localhost:5000/api/users/login

# login.json:
# {"email":"test@example.com","password":"Test1234"}
```

### Check Token Cleanup

Expired tokens should auto-delete thanks to MongoDB TTL index:

```javascript
// Create 100 expired tokens for testing
for (let i = 0; i < 100; i++) {
  db.refresh_tokens.insertOne({
    user_id: ObjectId("507f1f77bcf86cd799439011"),
    token: `expired_token_${i}`,
    expires_at: new Date("2020-01-01"),
    created_by_ip: "127.0.0.1",
    revoked_at: null,
    createdAt: new Date(),
    updatedAt: new Date()
  })
}

// Wait ~60 seconds for MongoDB TTL to run
// Then check:
db.refresh_tokens.countDocuments({ 
  expires_at: { $lt: new Date() } 
})
// Should be 0 (auto-deleted)
```

## Integration Testing Checklist

- [ ] User can register with valid credentials
- [ ] User cannot register with duplicate email
- [ ] User can login with correct credentials
- [ ] User cannot login with wrong password
- [ ] Access token is received on login/register
- [ ] Refresh token is received on login/register
- [ ] Protected routes work with valid access token
- [ ] Protected routes reject invalid/expired access token
- [ ] Refresh endpoint returns new access token
- [ ] Refresh endpoint rejects invalid refresh token
- [ ] Refresh endpoint rejects expired refresh token
- [ ] Refresh endpoint rejects revoked refresh token
- [ ] Logout revokes single refresh token
- [ ] Logout-all revokes all user's refresh tokens
- [ ] Expired refresh tokens are auto-deleted
- [ ] Multiple logins create separate refresh tokens
- [ ] IP addresses are tracked correctly

## Next Steps

After testing completes successfully:

1. **Deploy to production** with strong JWT_SECRET
2. **Set up monitoring** for failed refresh attempts
3. **Add email notifications** for new device logins
4. **Implement rate limiting** on auth endpoints
5. **Add password strength validation**
6. **Add email verification flow**

## Support

If tests fail, check:
- Server logs: `npm run dev` output
- MongoDB logs: Check connection and TTL index
- Network: Ensure port 5000 is not blocked
- Environment: Verify all .env variables are set

For more details, see `REFRESH_TOKEN_GUIDE.md`
