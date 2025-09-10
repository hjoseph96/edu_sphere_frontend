import logo from '../assets/edu_sphere_logo.png';

const LoadingIndicator = ({ 
  size = 'medium', 
  showText = true, 
  text = 'Loading...',
  className = ''
}) => {
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { height: '24px', width: 'auto' };
      case 'large':
        return { height: '48px', width: 'auto' };
      case 'xlarge':
        return { height: '64px', width: 'auto' };
      default: // medium
        return { height: '32px', width: 'auto' };
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small':
        return 'text-sm';
      case 'large':
        return 'text-lg';
      case 'xlarge':
        return 'text-xl';
      default: // medium
        return 'text-base';
    }
  };

  return (
    <div className={`loading-indicator ${className}`}>
      <div className="loading-content">
        <img 
          src={logo} 
          alt="EduSphere" 
          className="logo"
          style={getSizeStyles()}
        />
        {showText && (
          <span className={`loading-text ${getTextSize()}`}>
            {text}
          </span>
        )}
      </div>
    </div>
  );
};

export default LoadingIndicator;
