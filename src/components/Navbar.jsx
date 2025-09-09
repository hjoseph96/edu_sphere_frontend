import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../colors';
import logo from '../assets/edu_sphere_logo.png';

const Navbar = ({ user }) => {
  const { logout, getCurrentUser } = useAuth();
  
  // Get current user data (from cache if available)
  const currentUser = getCurrentUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  return (
    <nav 
      className="navbar is-fixed-top" 
      role="navigation" 
      aria-label="main navigation"
      style={{ 
        backgroundColor: colors.surface,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        borderBottom: `1px solid ${colors.border.light}`,
        padding: '14px 0'
      }}
    >
      <div className="container">
        <div className="navbar-brand">
          <a 
            className="navbar-item" 
            href="/"
            style={{ 
              fontSize: '1.5rem',
              fontWeight: '700',
              color: colors.primary[600]
            }}
          >
            <img 
              src={logo} 
              alt="EduSphere" 
              className="logo"
              style={{ 
                height: '32px', 
                width: 'auto',
                marginRight: '8px'
              }} 
            />

            <span style={{ color: colors.primary[600] }}>EduSphere</span>
          </a>

          <a
            role="button"
            className={`navbar-burger ${isMenuOpen ? 'is-active' : ''}`}
            aria-label="menu"
            aria-expanded="false"
            onClick={toggleMenu}
          >
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
          </a>
        </div>

        <div className={`navbar-menu ${isMenuOpen ? 'is-active' : ''}`}>
          <div className="navbar-start">
            { currentUser?.role === 'teacher' && (
              <>
                <a 
                  className="navbar-item" 
                  href="/my-documents"
                  style={{ color: colors.text.primary }}
                >
                  <i className="fas fa-book mr-2"></i>
                  Documents
                </a>
              </>
            )}

            { currentUser?.role === 'student' && (
              <>
                <a 
                  className="navbar-item" 
                  href="/dashboard"
                  style={{ color: colors.text.primary }}
                >
                  <i className="fas fa-home mr-2"></i>
                  Dashboard
                </a>

                <a 
                  className="navbar-item" 
                  href="/my-courses"
                  style={{ color: colors.text.primary }}
                >
                  <i className="fas fa-book mr-2"></i>
                  My Courses
                </a>
              </>
            )}
          </div>

          <div className="navbar-end">
            <div className="navbar-item has-dropdown is-hoverable">
              <a 
                className="navbar-link"
                style={{ color: colors.text.primary }}
              >
                <i className="fas fa-user mr-2"></i>
                {currentUser?.first_name || user?.first_name} {currentUser?.last_name || user?.last_name}
              </a>
              <div className="navbar-dropdown is-right">
                <hr className="navbar-divider" />

                {user ? (
                <a 
                  className="navbar-item"
                  onClick={handleLogout}
                  style={{ cursor: 'pointer' }}
                >
                  <i className="fas fa-sign-out-alt mr-2"></i>
                  Sign Out
                </a>
                ) : (
                  <>
                    <a 
                      className="navbar-item"
                      href="/login"
                      style={{ cursor: 'pointer' }}
                    >
                      Sign In
                    </a>

                    <a 
                      className="navbar-item"
                      href="/signup"
                      style={{ cursor: 'pointer' }}
                    >
                      Sign Up
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
