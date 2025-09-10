import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axiosConfig';
import pageViewService from '../services/pageViewService';
import LoadingIndicator from './LoadingIndicator';

const Documents = () => {
  const { getCurrentUser } = useAuth();
  const currentUser = getCurrentUser();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [documents, setDocuments] = useState([]);
  const [sharedDocuments, setSharedDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(null);
  const [deleting, setDeleting] = useState(null);

  // Fetch documents on component mount
  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/documents');
      setDocuments(response.data.documents || []);
      setSharedDocuments(response.data.shared_documents || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      setUploadError('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleEditDocument = async (document) => {
    // Navigate to DocumentEditor with just the document ID
    navigate(`/editor/${document.id}`);
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
      setUploadError('Failed to download document');
    } finally {
      setDownloading(null);
    }
  };

  const handleDeleteDocument = async (document) => {
    if (!window.confirm(`Are you sure you want to delete "${document.title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeleting(document.id);
      await api.delete(`/documents/${document.id}`);
      
      // Remove the document from the local state
      setDocuments(prev => prev.filter(doc => doc.id !== document.id));
    } catch (error) {
      console.error('Error deleting document:', error);
      setUploadError('Failed to delete document');
    } finally {
      setDeleting(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const validateFile = (file) => {
    const allowedExtensions = ['.md', '.pdf', '.docx', '.doc', '.txt', '.xls', '.xlsx', '.ppt', '.pptx'];
    const fileName = file.name.toLowerCase();
    const isValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
    
    if (!isValidExtension) {
      setUploadError('Only Markdown (.md), PDF (.pdf), DOCX (.docx), DOC (.doc), TXT (.txt), XLS (.xls), XLSX (.xlsx), PPT (.ppt), PPTX (.pptx) files are allowed');
      return false;
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setUploadError('File size must be less than 10MB');
      return false;
    }
    
    setUploadError('');
    return true;
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragOver(false);
    setUploadError('');
    
    const files = Array.from(e.dataTransfer.files);
    const validFiles = files.filter(validateFile);
    
    if (validFiles.length === 0) {
      setUploadError('Please upload only .md, .pdf, .docx, .doc, .txt, .xls, .xlsx, .ppt, .pptx files');
      return;
    }

    try {
      setUploading(true);
      
      // Prepare form data for API
      const formData = new FormData();
      const filesData = validFiles.map(file => ({
        title: file.name,
        file: file
      }));

      // Add files to form data
      validFiles.forEach((file, index) => {

        formData.append(`files[${index}][title]`, file.name.replace('.md', ''));
        formData.append(`files[${index}][file]`, file);
      });

      const response = await api.post('/documents', { documents: { files: filesData } }, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.errors && response.data.errors.length > 0) {
        setUploadError(response.data.errors.join(', '));
      } else {
        // Update documents list with new data
        setDocuments(response.data.documents || []);
        setUploadError('');
      }
    } catch (error) {
      console.error('Error uploading documents:', error);
      if (error.response?.data?.errors) {
        setUploadError(error.response.data.errors.join(', '));
      } else {
        setUploadError('Failed to upload documents:', error);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleFileInput = async (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(validateFile);
    
    if (validFiles.length === 0) {
      setUploadError('Please upload only .md files');
      e.target.value = '';
      return;
    }

    try {
      setUploading(true);
      setUploadError('');
      
      // Prepare form data for API
      const formData = new FormData();
      
      // Add files to form data
      validFiles.forEach((file, index) => {
        formData.append(`files[${index}][title]`, file.name.replace('.md', ''));
        formData.append(`files[${index}][file]`, file);
      });

      const filesData = validFiles.map(file => ({
        title: file.name,
        file: file
      }));

      const response = await api.post('/documents', 
        {
          documents: { files: filesData }
        }, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.errors && response.data.errors.length > 0) {
        setUploadError(response.data.errors.join(', '));
      } else {
        // Update documents list with new data
        setDocuments([...documents, ...response.data.documents || []]);
        setUploadError('');
      }
    } catch (error) {
      console.error('Error uploading documents:', error);

      if (error.response?.data?.errors) {
        setUploadError(error.response.data.errors.join(', '));
      } else {
        setUploadError('Failed to upload documents:',  error);
      }
    } finally {
      setUploading(false);
      // Reset file input
      e.target.value = '';
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
              My Documents
            </h1>
            <button 
              onClick={() => navigate('/editor/new')}
              className="btn btn-primary"
            >
              <i className="fas fa-plus mr-2"></i>
              New Document
            </button>
          </div>
          <p className="text-lg text-secondary">
            Manage your teaching materials and course documents
          </p>
        </div>

        {/* File Upload Area */}
        <div className="mb-8">
          <div
            className={`drag-drop-area border-2 border-dashed rounded-lg p-8 text-center ${
              uploading 
                ? 'border-neutral-300 bg-neutral-50 cursor-not-allowed'
                : isDragOver 
                  ? 'border-primary bg-primary-50 drag-over' 
                  : 'border-neutral-300 hover:border-primary-400'
            }`}
            onDragOver={uploading ? undefined : handleDragOver}
            onDragLeave={uploading ? undefined : handleDragLeave}
            onDrop={uploading ? undefined : handleDrop}
            onClick={uploading ? undefined : () => fileInputRef.current?.click()}
            style={{ cursor: uploading ? 'not-allowed' : 'pointer' }}
          >
            <div className="mb-4">
              {uploading ? (
                <>
                  <i className="fas fa-spinner fa-spin text-4xl text-primary mb-4"></i>
                  <h3 className="text-xl font-semibold text-primary mb-2">
                    Uploading files...
                  </h3>
                  <p className="text-secondary">
                    Please wait while your files are being processed
                  </p>
                </>
              ) : (
                <>
                  <i className="fas fa-cloud-upload-alt text-4xl text-primary mb-4"></i>
                  <h3 className="text-xl font-semibold text-primary mb-2">
                    Drop Documents here
                  </h3>
                  <p className="text-secondary">
                    or click to browse files
                  </p>
                </>
              )}
            </div>
            <p className="text-sm text-secondary">
              Only .md, .pdf, .docx, .doc, .txt, .xls, .xlsx, .ppt, .pptx files are accepted (max 10MB)
            </p>
          </div>
          
          {uploadError && (
            <div className="alert alert-error mt-4">
              {uploadError}
            </div>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            accept={'.md, .pdf, .docx, .doc, .txt, .xls, .xlsx, .ppt, .pptx'}
            multiple
            onChange={handleFileInput}
            className="hidden"
          />
        </div>

        {/* Documents List */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-primary">
              Documents ({documents.length})
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
                <p className="text-lg text-secondary mb-2">No documents yet</p>
                <p className="text-sm text-secondary">
                  Upload your first Markdown document to get started
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
                          {/* <span>{doc.size}</span> */}
                          <span>•</span>
                          <span>Uploaded {doc.created_at}</span>
                          <span>•</span>
                          <span className={`flex items-center`}>
                            <i className={`mr-1`}></i>
                            {doc.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      { doc.can_view && (
                        <>
                         <button 
                          className="btn btn-outline btn-sm"
                            onClick={() => navigate(`/viewer/${doc.id}`)}
                          >
                            <i className="fas fa-eye mr-1"></i>
                            View
                          </button>
                          
                          <button 
                            className="btn btn-outline btn-sm"
                            onClick={() => handleEditDocument(doc)}
                          >
                            <i className="fas fa-edit mr-1"></i>
                            Edit
                          </button>
                        </>
                       
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
                      <button 
                        className="btn btn-outline btn-sm text-error"
                        onClick={() => handleDeleteDocument(doc)}
                        disabled={deleting === doc.id}
                      >
                        {deleting === doc.id ? (
                          <i className="fas fa-spinner fa-spin mr-1"></i>
                        ) : (
                          <i className="fas fa-trash mr-1"></i>
                        )}
                        {deleting === doc.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Shared Documents List */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-primary">
              Shared Documents ({sharedDocuments.length})
            </h2>
          </div>
          <div className="card-body">
            {loading ? (
              <div className="text-center py-8">
                <LoadingIndicator size="medium" text="Loading documents..." />
              </div>
            ) : sharedDocuments.length === 0 ? (
              <div className="text-center py-8">
                <i className="fas fa-file-alt text-4xl text-neutral-400 mb-4"></i>
                <p className="text-lg text-secondary mb-2">No documents yet</p>
                <p className="text-sm text-secondary">
                  Upload your first Markdown document to get started
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {sharedDocuments.map((doc) => (
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
                          {/* <span>{doc.size}</span> */}
                          <span>•</span>
                          <span>Uploaded {doc.created_at}</span>
                          <span>•</span>
                          <span className={`flex items-center`}>
                            <i className={`mr-1`}></i>
                            {doc.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      { doc.can_view && (
                        <>
                         <button 
                          className="btn btn-outline btn-sm"
                            onClick={() => navigate(`/viewer/${doc.id}`)}
                          >
                            <i className="fas fa-eye mr-1"></i>
                            View
                          </button>
                          <button 
                            className="btn btn-outline btn-sm"
                            onClick={() => handleEditDocument(doc)}
                          >
                            <i className="fas fa-edit mr-1"></i>
                            Edit
                        </button>
                        </>
                       
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
                      <button 
                        className="btn btn-outline btn-sm text-error"
                        onClick={() => handleDeleteDocument(doc)}
                        disabled={deleting === doc.id}
                      >
                        {deleting === doc.id ? (
                          <i className="fas fa-spinner fa-spin mr-1"></i>
                        ) : (
                          <i className="fas fa-trash mr-1"></i>
                        )}
                        {deleting === doc.id ? 'Deleting...' : 'Delete'}
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

export default Documents;
