import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axiosConfig';
import pageViewService from '../services/pageViewService';
import LoadingIndicator from './LoadingIndicator';

const StudentDocuments = () => {
  const { getCurrentUser } = useAuth();
  const currentUser = getCurrentUser();
  const navigate = useNavigate();
  
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(null);

  // Fetch documents on component mount
  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/documents');
      setDocuments(response.data.documents || []);
      
 
    } catch (error) {
      console.error('Error fetching documents:', error);
      setError('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadDocument = async (document) => {
    try {
      setDownloading(document.id);
      
      // Fetch the document as blob
      const response = await api.get(`/documents/${document.id}/download`, {
        responseType: 'blob'
      });
      
      // Create blob and download
      const blob = new Blob([response.data], { type: 'text/markdown' });
      const url = window.URL.createObjectURL(blob);
      
      // Create download link using a more reliable method
      if (typeof window !== 'undefined' && window.document) {
        const link = window.document.createElement('a');
        link.href = url;
        link.download = `${document.title}.md`;
        link.style.display = 'none';
        
        // Append to document body, click, then remove
        window.document.body.appendChild(link);
        link.click();
        window.document.body.removeChild(link);
        
        // Clean up blob URL
        window.URL.revokeObjectURL(url);
      } else {
        // Fallback: open in new tab
        window.open(url, '_blank');
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
        }, 1000);
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      setError('Failed to download document');
    } finally {
      setDownloading(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published':
        return 'text-success';
      case 'draft':
        return 'text-warning';
      default:
        return 'text-secondary';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'published':
        return 'fas fa-check-circle';
      case 'draft':
        return 'fas fa-edit';
      default:
        return 'fas fa-file';
    }
  };

  return (
    <div className="dashboard-page">
      <div className="container">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-4xl font-bold text-primary">
              Course Documents
            </h1>
          </div>
          <p className="text-lg text-secondary">
            View and download course materials shared by your teachers
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="alert alert-error mb-8">
            {error}
          </div>
        )}

        {/* Documents List */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-primary">
              Available Documents ({documents.length})
            </h2>
          </div>
          <div className="card-body">
            {loading ? (
              <div className="text-center py-8">
                <LoadingIndicator size="medium" text="Loading documents..." />
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-8">
                <i className="fas fa-file-alt text-4xl text-neutral-400 mb-4"></i>
                <p className="text-lg text-secondary mb-2">No documents available</p>
                <p className="text-sm text-secondary">
                  Your teachers haven't shared any documents yet
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div 
                    key={doc.id}
                    className="document-item flex items-center justify-between p-4 rounded-lg hover:bg-neutral-50"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <i className="fas fa-file-alt text-2xl text-primary"></i>
                      </div>
                      <div>
                        <h3 className="font-medium text-primary">{doc.title}</h3>
                        <div className="flex items-center space-x-4 text-sm text-secondary">
                          <span>•</span>
                          <span>Uploaded {doc.created_at}</span>
                          <span>•</span>
                          <span className={`flex items-center ${getStatusColor(doc.status)}`}>
                            <i className={`${getStatusIcon(doc.status)} mr-1`}></i>
                            {doc.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                        {doc.can_view && (
                            <button 
                                className="btn btn-outline btn-sm"
                                onClick={() => navigate(`/viewer/${doc.id}`)}
                            >
                                <i className="fas fa-eye mr-1"></i>
                                View
                          </button>
                        )}
                      <button 
                        className="btn btn-outline btn-sm"
                        onClick={() => handleDownloadDocument(doc)}
                        disabled={downloading === doc.id}
                      >
                        {downloading === doc.id ? (
                          <i className="fas fa-spinner fa-spin mr-1"></i>
                        ) : (
                          <i className="fas fa-download mr-1"></i>
                        )}
                        {downloading === doc.id ? 'Downloading...' : 'Download'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDocuments;
