import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../colors';
import logo from '../assets/edu_sphere_logo.png';

const Navbar = ({ user }) => {
  const { logout } = useAuth();
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
        borderBottom: `1px solid ${colors.border.light}`
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
              href="/courses"
              style={{ color: colors.text.primary }}
            >
              <i className="fas fa-book mr-2"></i>
              Courses
            </a>
            <a 
              className="navbar-item" 
              href="/assignments"
              style={{ color: colors.text.primary }}
            >
              <i className="fas fa-tasks mr-2"></i>
              Assignments
            </a>
            <a 
              className="navbar-item" 
              href="/grades"
              style={{ color: colors.text.primary }}
            >
              <i className="fas fa-chart-line mr-2"></i>
              Grades
            </a>
          </div>

          <div className="navbar-end">
            <div className="navbar-item has-dropdown is-hoverable">
              <a 
                className="navbar-link"
                style={{ color: colors.text.primary }}
              >
                <i className="fas fa-user mr-2"></i>
                {user?.first_name} {user?.last_name}
              </a>
              <div className="navbar-dropdown is-right">
                <a 
                  className="navbar-item"
                  href="/profile"
                >
                  <i className="fas fa-user-circle mr-2"></i>
                  Profile
                </a>
                <a 
                  className="navbar-item"
                  href="/settings"
                >
                  <i className="fas fa-cog mr-2"></i>
                  Settings
                </a>
                <hr className="navbar-divider" />
                <a 
                  className="navbar-item"
                  onClick={handleLogout}
                  style={{ cursor: 'pointer' }}
                >
                  <i className="fas fa-sign-out-alt mr-2"></i>
                  Sign Out
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
