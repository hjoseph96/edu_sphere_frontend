import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const SignupForm = () => {
  const { signup, loading, error, setError } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: ''
  });
  const [touched, setTouched] = useState({
    email: false,
    password: false,
    first_name: false,
    last_name: false
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  };

  const validatePassword = (password) => {
    const hasMinLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    return hasMinLength && hasUppercase && hasNumber;
  };

  const getFieldClassName = (fieldName) => {
    const baseClass = 'form-input';
    const isTouched = touched[fieldName];
    const hasValue = formData[fieldName].trim() !== '';
    let isValid = false;
    
    if (fieldName === 'email') {
      isValid = hasValue && formData.email.includes('@');
    } else if (fieldName === 'password') {
      isValid = hasValue && validatePassword(formData.password);
    } else {
      isValid = hasValue;
    }
    
    if (isTouched && !isValid) {
      return `${baseClass} is-invalid`;
    }
    return baseClass;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.email || !formData.password || !formData.first_name || !formData.last_name) {
      setError('All fields are required');
      return;
    }

    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    if (!validatePassword(formData.password)) {
      setError('Password must be at least 8 characters with one uppercase letter and one number');
      return;
    }

    const result = await signup(formData);
    
    if (result.success) {
      // Redirect will be handled by the router
      console.log('Login successful:', result.data);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-card">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-primary mb-2">
            Welcome to EduSphere
          </h1>
          <p className="text-secondary">
            Create your account
          </p>
        </div>

        {error && (
          <div className="alert alert-error mb-4">
            <button 
              className="delete" 
              onClick={() => setError(null)}
            ></button>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">First Name</label>
            <input
              className={getFieldClassName('first_name')}
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter your first name"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Last Name</label>
            <input
              className={getFieldClassName('last_name')}
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter your last name"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className={getFieldClassName('email')}
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className={getFieldClassName('password')}
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter your password (min 8 chars, 1 uppercase, 1 number)"
              required
            />
            {touched.password && formData.password && !validatePassword(formData.password) && (
              <div className="password-requirements">
                <p className="text-sm text-error mt-1">Password must contain:</p>
                <ul className="text-xs text-error ml-4">
                  <li className={formData.password.length >= 8 ? 'text-success' : 'text-error'}>
                    • At least 8 characters
                  </li>
                  <li className={/[A-Z]/.test(formData.password) ? 'text-success' : 'text-error'}>
                    • One uppercase letter
                  </li>
                  <li className={/\d/.test(formData.password) ? 'text-success' : 'text-error'}>
                    • One number
                  </li>
                </ul>
              </div>
            )}
          </div>

          <div className="form-group">
            <button
              className={`btn btn-primary btn-full ${loading ? 'is-loading' : ''}`}
              type="submit"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-secondary">
            By signing up, you agree to our Terms of Service and Privacy Policy
          </p>
          <p className="text-sm text-secondary mt-2">
            Already have an account? <Link to="/login" className="text-primary">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;
