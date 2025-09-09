import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axiosConfig';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);

  // Check if user is logged in on app start
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUserData = localStorage.getItem('userData');
    
    if (token) {
      // Set the token in axios defaults
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      if (storedUserData) {
        try {
          const parsedUserData = JSON.parse(storedUserData);
          setUser({ ...parsedUserData, token });
          setUserData(parsedUserData);
        } catch (err) {
          console.warn('Failed to parse stored user data:', err);
          // Clear invalid data
          localStorage.removeItem('userData');
        }
      } else {
        setUser({ token });
      }
    }
    setLoading(false);
  }, []);

  const login = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/sessions', {
        user: userData
      });

      const { user: userInfo, token } = response.data;
      
      // Store token and user data in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('userData', JSON.stringify(userInfo));
      
      // Set default authorization header
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser({ ...userInfo, token });
      setUserData(userInfo);
      return { success: true, data: userInfo };
    } catch (err) {
      let errorMessage = 'Login failed. Please try again.';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.errors) {
        // Handle validation errors
        const errors = err.response.data.errors;
        if (typeof errors === 'object') {
          errorMessage = Object.values(errors).flat().join(', ');
        } else {
          errorMessage = errors;
        }
      } else if (err.code === 'ECONNREFUSED') {
        errorMessage = 'Unable to connect to server. Please check if the backend is running.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/users', {
        user: userData
      });

      const { user: userInfo, token } = response.data;
      
      // Store token and user data in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('userData', JSON.stringify(userInfo));
      
      // Set default authorization header
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser({ ...userInfo, token });
      setUserData(userInfo);
      return { success: true, data: userInfo };
    } catch (err) {
      let errorMessage = 'Signup failed. Please try again.';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.errors) {
        // Handle validation errors
        const errors = err.response.data.errors;
        if (typeof errors === 'object') {
          errorMessage = Object.values(errors).flat().join(', ');
        } else {
          errorMessage = errors;
        }
      } else if (err.code === 'ECONNREFUSED') {
        errorMessage = 'Unable to connect to server. Please check if the backend is running.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    setUserData(null);
    setError(null);
  };

  // Function to update user data locally
  const updateUserData = (newUserData) => {
    const updatedData = { ...userData, ...newUserData };
    setUserData(updatedData);
    setUser(prev => ({ ...prev, ...newUserData }));
    localStorage.setItem('userData', JSON.stringify(updatedData));
  };

  // Function to get user data without API call
  const getCurrentUser = () => {
    return userData || user;
  };

  const value = {
    user,
    userData,
    login,
    signup,
    logout,
    loading,
    error,
    setError,
    updateUserData,
    getCurrentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
