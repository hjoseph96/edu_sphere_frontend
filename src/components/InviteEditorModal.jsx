import { useState } from 'react';
import api from '../api/axiosConfig';

const InviteEditorModal = ({ isOpen, onClose, user, documentId }) => {
  const [role, setRole] = useState('viewer');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user || !documentId) {
      setErrors(['Missing user or document information']);
      return;
    }

    try {
      setLoading(true);
      setErrors([]);

      const payload = {
        document_editors: {
          editors: [
            {
              user_id: user.id,
              role: role
            }
          ]
        }
      };

      const response = await api.post(`/documents/${documentId}/add_editors`, payload);


      
      // Success - close modal
      onClose(response.data);
    } catch (error) {
      console.error('Error inviting editor:', error);
      
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors(['Failed to invite editor. Please try again.']);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setRole('viewer');
    setErrors([]);
    onClose();
  };

  if (!isOpen || !user) return null;

  return (
    <div className="modal is-active">
      <div className="modal-background" onClick={handleClose}></div>
      <div className="modal-card">
        <header className="modal-card-head">
          <p className="modal-card-title">Invite Editors</p>
          
          <button 
            className="delete" 
            aria-label="close"
            onClick={handleClose}
          >
            <i className="fas fa-times"></i>
          </button>
        </header>
        
        <section className="modal-card-body">
          <div className="content">
           

            <form onSubmit={handleSubmit}>

              {/* User Information Display */}
              <div className="box mb-4">
                <h4 className="title is-5 mb-3">User Details</h4>
                <div className="field">
                  <label className="label">Name</label>
                  <p className="control">
                    <span className="input is-static">
                      {user.first_name} {user.last_name}
                    </span>
                  </p>
                </div>
                <div className="field">
                  <label className="label">Email</label>
                  <p className="control">
                    <span className="input is-static">
                      {user.email}
                    </span>
                  </p>
                </div>
              </div>

              {/* Role Selection */}
              <div className="field">
                <label className="label">Role</label>
                <div className="control">
                  <div className="select is-fullwidth">
                    <select 
                      value={role} 
                      onChange={(e) => setRole(e.target.value)}
                      disabled={loading}
                    >
                      <option value="viewer">Viewer</option>
                      <option value="editor">Editor</option>
                    </select>
                  </div>
                </div>
                <p className="help">
                  Viewers can only view the document. Editors can view and edit the document.
                </p>
              </div>

              {/* Error Display */}
              {errors.length > 0 && (
                <div className="notification is-danger">
                  <ul className="mb-0">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Buttons */}
              <div className="field is-grouped">
                <div className="control">
                  <button 
                    type="submit"
                    className={`button is-primary ${loading ? 'is-loading' : ''}`}
                    disabled={loading}
                  >
                    {loading ? 'Inviting...' : 'Invite'}
                  </button>
                </div>
                <div className="control">
                  <button 
                    type="button"
                    className="button"
                    onClick={handleClose}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>

             
          </div>
        </section>
      </div>
    </div>
  );
};

export default InviteEditorModal;
