# Footwear E-commerce - Frontend

Modern authentication system with React, Vite, and Tailwind CSS.

## Design System

**Style:** Accessible Modern E-commerce  
**Colors:** Sky Blue (#0EA5E9) + Warm Orange (#F97316)  
**Typography:** Outfit (headings) + Inter (body)  
**Accessibility:** WCAG AA compliant  

## Features

- ✅ User Registration with validation
- ✅ User Login with httpOnly cookies
- ✅ Auto refresh token with axios interceptors
- ✅ Protected routes for authenticated users
- ✅ Responsive design (mobile-first)
- ✅ Form validation with error messages
- ✅ Password show/hide toggle
- ✅ Loading states

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Routing
- **Axios** - HTTP client
- **Lucide React** - Icons

## Getting Started

### Prerequisites

- Node.js 18+ 
- Backend server running on `http://localhost:5000`

### Installation

```bash
cd frontend
npm install
```

### Environment Variables

Create `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

### Run Development Server

```bash
npm run dev
```

Frontend will run at: `http://localhost:5173`

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   └── ProtectedRoute.jsx    # Route guard
│   ├── context/
│   │   └── AuthContext.jsx       # Auth state management
│   ├── pages/
│   │   ├── Home.jsx              # Landing page
│   │   ├── Login.jsx             # Login form
│   │   ├── Register.jsx          # Registration form
│   │   └── Dashboard.jsx         # Protected dashboard
│   ├── services/
│   │   └── api.js                # Axios instance + interceptors
│   ├── App.jsx                   # Main app component
│   └── main.jsx                  # Entry point
├── tailwind.config.js            # Tailwind + design tokens
└── package.json
```

## Routes

| Path | Public | Description |
|------|--------|-------------|
| `/` | ✅ | Home/landing page |
| `/login` | ✅ | Login page |
| `/register` | ✅ | Registration page |
| `/dashboard` | 🔒 | Protected dashboard (requires auth) |

## Authentication Flow

1. **Register/Login** → Receives `accessToken` in response
2. **Token Storage** → `accessToken` in localStorage, `refreshToken` in httpOnly cookie
3. **API Requests** → Auto-attaches Bearer token in headers
4. **Token Expiry** → Auto-refreshes using `/auth/refresh` endpoint
5. **Logout** → Clears tokens and redirects to login

## Design Tokens

Located in `tailwind.config.js`:

```js
colors: {
  primary: '#0EA5E9',       // Sky blue
  cta: '#F97316',           // Warm orange
  success: '#059669',       // Green
  error: '#DC2626',         // Red
  text: {
    primary: '#0C4A6E',     // Deep blue
    secondary: '#475569',   // Grey
  },
}
```

## Build for Production

```bash
npm run build
```

Output will be in `dist/` folder.

## Testing Locally

1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm run dev`
3. Open browser: `http://localhost:5173`
4. Test flow:
   - Register new account
   - Login with credentials
   - Access protected dashboard
   - Logout

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)

## Accessibility Features

- ✅ WCAG AA contrast ratios
- ✅ Keyboard navigation support
- ✅ Focus visible indicators (4px rings)
- ✅ Screen reader compatible
- ✅ Touch targets minimum 48x48px
- ✅ Error messages with icons (not color-only)
