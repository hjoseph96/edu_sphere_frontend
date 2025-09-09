import { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Documents = () => {
  const { getCurrentUser } = useAuth();
  const currentUser = getCurrentUser();
  const fileInputRef = useRef(null);
  
  const [documents, setDocuments] = useState([
    {
      id: 1,
      name: 'Introduction to React.md',
      size: '2.4 KB',
      uploadedAt: '2024-01-15',
      status: 'published'
    },
    {
      id: 2,
      name: 'Advanced JavaScript Concepts.md',
      size: '5.1 KB',
      uploadedAt: '2024-01-14',
      status: 'draft'
    },
    {
      id: 3,
      name: 'CSS Best Practices.md',
      size: '3.8 KB',
      uploadedAt: '2024-01-13',
      status: 'published'
    }
  ]);
  
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const validateFile = (file) => {
    const allowedExtensions = ['.md'];
    const fileName = file.name.toLowerCase();
    const isValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
    
    if (!isValidExtension) {
      setUploadError('Only Markdown (.md) files are allowed');
      return false;
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setUploadError('File size must be less than 10MB');
      return false;
    }
    
    setUploadError('');
    return true;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const validFiles = files.filter(validateFile);
    
    if (validFiles.length > 0) {
      // Process valid files
      validFiles.forEach(file => {
        const newDocument = {
          id: Date.now() + Math.random(),
          name: file.name,
          size: `${(file.size / 1024).toFixed(1)} KB`,
          uploadedAt: new Date().toISOString().split('T')[0],
          status: 'draft'
        };
        setDocuments(prev => [newDocument, ...prev]);
      });
    }
  };

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(validateFile);
    
    if (validFiles.length > 0) {
      validFiles.forEach(file => {
        const newDocument = {
          id: Date.now() + Math.random(),
          name: file.name,
          size: `${(file.size / 1024).toFixed(1)} KB`,
          uploadedAt: new Date().toISOString().split('T')[0],
          status: 'draft'
        };
        setDocuments(prev => [newDocument, ...prev]);
      });
    }
    
    // Reset file input
    e.target.value = '';
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
            <a 
              href="/editor" 
              className="btn btn-primary"
            >
              <i className="fas fa-plus mr-2"></i>
              New Document
            </a>
          </div>
          <p className="text-lg text-secondary">
            Manage your teaching materials and course documents
          </p>
        </div>

        {/* File Upload Area */}
        <div className="mb-8">
          <div
            className={`drag-drop-area border-2 border-dashed rounded-lg p-8 text-center ${
              isDragOver 
                ? 'border-primary bg-primary-50 drag-over' 
                : 'border-neutral-300 hover:border-primary-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{ cursor: 'pointer' }}
          >
            <div className="mb-4">
              <i className="fas fa-cloud-upload-alt text-4xl text-primary mb-4"></i>
              <h3 className="text-xl font-semibold text-primary mb-2">
                Drop Markdown files here
              </h3>
              <p className="text-secondary">
                or click to browse files
              </p>
            </div>
            <p className="text-sm text-secondary">
              Only .md files are accepted (max 10MB)
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
            accept=".md"
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
            {documents.length === 0 ? (
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
                        <h3 className="font-medium text-primary">{doc.name}</h3>
                        <div className="flex items-center space-x-4 text-sm text-secondary">
                          <span>{doc.size}</span>
                          <span>•</span>
                          <span>Uploaded {doc.uploadedAt}</span>
                          <span>•</span>
                          <span className={`flex items-center ${getStatusColor(doc.status)}`}>
                            <i className={`${getStatusIcon(doc.status)} mr-1`}></i>
                            {doc.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button className="btn btn-outline btn-sm">
                        <i className="fas fa-edit mr-1"></i>
                        Edit
                      </button>
                      <button className="btn btn-outline btn-sm">
                        <i className="fas fa-download mr-1"></i>
                        Download
                      </button>
                      <button className="btn btn-outline btn-sm text-error">
                        <i className="fas fa-trash mr-1"></i>
                        Delete
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
