# EduSphere Frontend

A robust ed-tech platform starter template built with React, Vite, Axios, and Bulma CSS framework.

## Features

- 🔐 **User Authentication** - Complete login system with JWT token management
- 🎨 **Professional Design** - Custom color palette and Bulma CSS framework
- 📱 **Responsive Layout** - Mobile-first design that works on all devices
- 🚀 **Modern Stack** - React 19, Vite, React Router, and Axios
- ⚡ **Fast Development** - Hot module replacement and modern tooling
- 🛡️ **Error Handling** - Comprehensive error handling and loading states
- 🔒 **Protected Routes** - Secure routing with authentication guards

## Tech Stack

- **Frontend Framework**: React 19
- **Build Tool**: Vite
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **CSS Framework**: Bulma
- **Icons**: Font Awesome
- **State Management**: React Context API

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend API running on `http://localhost:3000`

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd edu_sphere_frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Backend API

The frontend expects a backend API running on `http://localhost:3000` with the following endpoint:

**POST** `/api/v1/users`

Request body:
```json
{
  "user": {
    "email": "test@test.com",
    "password": "password",
    "first_name": "Test",
    "last_name": "Test"
  }
}
```

Expected response:
```json
{
  "user": {
    "id": 1,
    "email": "test@test.com",
    "first_name": "Test",
    "last_name": "Test"
  },
  "token": "jwt-token-here"
}
```

## Project Structure

```
src/
├── api/
│   └── axiosConfig.js          # Axios configuration
├── components/
│   ├── Dashboard.jsx           # Main dashboard component
│   ├── LoginForm.jsx           # User login form
│   ├── LoadingSpinner.jsx      # Loading component
│   ├── Navbar.jsx              # Navigation component
│   └── ProtectedRoute.jsx      # Route protection wrapper
├── contexts/
│   └── AuthContext.jsx         # Authentication context
├── styles/
│   ├── variables.css           # CSS custom properties
│   ├── base.css               # Base styles and resets
│   └── components.css         # Component styles and utilities
├── colors.js                   # Color system definitions
├── App.jsx                     # Main app component
├── App.css                     # App-specific styles
├── main.jsx                    # App entry point
└── index.css                   # Global styles
```

## Color Palette

The application uses a professional color palette:

- **Primary Blue**: #2563eb - Main actions and headers
- **Secondary Blue**: #3b82f6 - Hover states and secondary elements
- **Accent Green**: #10b981 - Success states and positive actions
- **Warning Orange**: #f59e0b - Warnings and attention elements
- **Error Red**: #ef4444 - Errors and destructive actions
- **Neutral Gray**: #6b7280 - Text and secondary information
- **Light Gray**: #f3f4f6 - Backgrounds and subtle elements

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Features Overview

### Authentication
- Secure login with JWT tokens
- Automatic token refresh
- Protected routes
- Logout functionality

### Dashboard
- User welcome message
- Statistics cards
- Recent activity feed
- Quick action buttons
- Responsive navigation

### Error Handling
- Network error handling
- Validation error display
- Loading states
- User-friendly error messages

## Customization

### Adding New Pages
1. Create a new component in `src/components/`
2. Add a route in `src/App.jsx`
3. Use `ProtectedRoute` for authenticated pages

### Styling
- Modify `src/colors.js` for color changes
- Update `src/App.css` for custom styles
- Use Bulma classes for consistent styling

### API Integration
- Update `src/api/axiosConfig.js` for API configuration
- Add new API calls in components or create service files

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.