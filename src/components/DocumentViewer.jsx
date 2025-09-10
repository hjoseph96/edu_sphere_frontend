import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import api from '../api/axiosConfig';
import pageViewService from '../services/pageViewService';
import LoadingIndicator from './LoadingIndicator';

const DocumentViewer = () => {
  const { getCurrentUser } = useAuth();
  const currentUser = getCurrentUser();
  const { document_id } = useParams();
  const navigate = useNavigate();
  
  const [content, setContent] = useState(null);
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState('');
  const [isShareDropdownOpen, setIsShareDropdownOpen] = useState(false);
  
  // Mock data for users currently viewing/editing
  const [viewingUsers] = useState([
    { id: 1, name: 'John Doe', avatar: 'JD', color: 'bg-blue-500' },
    { id: 2, name: 'Jane Smith', avatar: 'JS', color: 'bg-green-500' },
    { id: 3, name: 'Mike Johnson', avatar: 'MJ', color: 'bg-purple-500' },
    { id: 4, name: 'Sarah Wilson', avatar: 'SW', color: 'bg-pink-500' }
  ]);

  // Fetch document on component mount
  useEffect(() => {
    fetchDocument();
  }, [document_id]);

  const fetchDocument = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get(`/documents/${document_id}`);
      setDocument(response.data.document);
      setContent(response.data.file);
      
      // Track page view after successful document load
      if (currentUser && document_id) {
        const response = await pageViewService.fetchAnalytics({ pageview_id: document_id });
        console.log(response);
        
        setAnalytics(response.analytics);
      }
    } catch (error) {
      console.error('Error fetching document:', error);
      setError('Failed to load document');
    } finally {
      setLoading(false);
    }
  };

  const formatLastUpdated = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const shareOptions = [
    { label: 'Copy Link', action: () => copyToClipboard(window.location.href) },
    { label: 'Export PDF', action: () => console.log('Export PDF') },
    { label: 'Export HTML', action: () => console.log('Export HTML') },
    { label: 'Share via Email', action: () => console.log('Share via Email') }
  ];

  const getShareIcon = (label) => {
    switch (label) {
      case 'Copy Link': return 'copy';
      case 'Export PDF': return 'file-pdf';
      case 'Export HTML': return 'code';
      case 'Share via Email': return 'envelope';
      default: return 'share-alt';
    }
  };

  if (loading) {
    return <LoadingIndicator size="large" text="Loading document..." />;
  }

  if (error || !document) {
    return (
      <div className="document-viewer">
        <div className="document-header">
          <div className="container">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-6">
                <div>
                  <h1 className="text-2xl font-bold text-primary">Document Not Found</h1>
                  <p className="text-sm text-secondary mt-1">
                    The document you're looking for doesn't exist or you don't have permission to view it.
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  className="btn btn-outline"
                  onClick={() => navigate(-1)}
                >
                  <i className="fas fa-arrow-left mr-2"></i>
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="document-content">
          <div className="flex h-screen">
            <div className="w-full">
              <div className="h-full overflow-y-auto bg-white">
                <div className="p-8 max-w-4xl mx-auto text-center">
                  <i className="fas fa-file-alt text-6xl text-neutral-400 mb-4"></i>
                  <h2 className="text-2xl font-semibold text-primary mb-2">Document Not Found</h2>
                  <p className="text-secondary mb-6">
                    The document you're looking for doesn't exist or you don't have permission to view it.
                  </p>
                  <button
                    className="btn btn-primary"
                    onClick={() => navigate('/my-documents')}
                  >
                    <i className="fas fa-arrow-left mr-2"></i>
                    Back to Documents
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="document-viewer">
      {/* Header */}
      <div className="document-header">
        <div className="container">
          <div className="flex flex-row justify-between items-center py-4">
            {/* Left side - Document details */}
            <div className="flex flex-row items-center space-x-6">
              <div>
                <h1 className="text-2xl font-bold text-primary">
                  {document.title}
                </h1>
                <p className="text-sm text-secondary mt-1">
                  Last updated {formatLastUpdated(document.updated_at || document.created_at)}
                </p>
                {/* Viewing Users */}
            <div className="flex items-center space-x-2">
                    <span className="text-sm text-secondary">Viewing:</span>
                    <div className="flex -space-x-2">
                    {viewingUsers.slice(0, 4).map((user) => (
                        <div
                            key={user.id}
                            className={`w-8 h-8 rounded-full ${user.color} flex items-center justify-center text-white text-xs font-medium border-2 border-white`}
                            title={user.name}
                        >
                            {user.avatar}{viewingUsers.indexOf(user) === viewingUsers.length - 1 ? ' ' : ','}
                        </div>
                    ))}
                    {viewingUsers.length > 4 && (
                        <div className="w-8 h-8 rounded-full bg-neutral-300 flex items-center justify-center text-neutral-600 text-xs font-medium border-2 border-white">
                            +{viewingUsers.length - 4}
                        </div>
                    )}
                    {analytics && (
                        <div className="flex flex-row ml-4 items-center space-x-2">
                        <span className="text-sm text-secondary mr-2">Analytics:</span>
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-secondary">{analytics.unique_views} unique views</span>
                        </div>
                        </div>
                    )}
                    </div>
                </div>
              </div>

             
            </div>

            {/* Right side - Share button and viewing users */}
            <div className="block flex-row items-center space-x-4">
              {/* Share Button with Dropdown */}
              <div className={`dropdown ${isShareDropdownOpen ? 'is-active' : ''}`}>
                <div className="dropdown-trigger">
                  <button
                    className="button is-outlined"
                    aria-haspopup="true"
                    aria-controls="share-dropdown-menu"
                    onClick={() => setIsShareDropdownOpen(!isShareDropdownOpen)}
                  >
                    <span className="icon is-small">
                      <i className="fas fa-share-alt"></i>
                    </span>
                    <span>Share</span>
                    <span className="icon is-small">
                      <i className={`fas fa-angle-down ${isShareDropdownOpen ? 'is-rotated' : ''}`}></i>
                    </span>
                  </button>
                </div>
                <div className="dropdown-menu" id="share-dropdown-menu" role="menu">
                  <div className="dropdown-content">
                    {shareOptions.map((option, index) => (
                      <button
                        key={index}
                        className="dropdown-item button is-white is-fullwidth is-justify-content-flex-start"
                        onClick={() => {
                          option.action();
                          setIsShareDropdownOpen(false);
                        }}
                      >
                        <span className="icon is-small mr-2">
                          <i className={`fas fa-${getShareIcon(option.label)}`}></i>
                        </span>
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              

            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="document-content pt-6">
        <div className="flex h-screen justify-center items-center">
          {/* Full-width Markdown Viewer */}
          <div className="w-full">
            <div className="h-full overflow-y-auto bg-white">
              <div className="w-full flex justify-center">
                <div className="prose prose-lg max-w-none px-8 py-8">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code({ node, inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline && match ? (
                          <SyntaxHighlighter
                            style={tomorrow}
                            language={match[1]}
                            PreTag="div"
                            {...props}
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        ) : (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        );
                      },
                      table({ children, ...props }) {
                        return (
                          <div className="table-container">
                            <table className="table is-striped is-fullwidth" {...props}>
                              {children}
                            </table>
                          </div>
                        );
                      },
                      thead({ children, ...props }) {
                        return <thead className="has-background-light" {...props}>{children}</thead>;
                      },
                      th({ children, ...props }) {
                        return <th className="has-text-weight-semibold" {...props}>{children}</th>;
                      },
                      td({ children, ...props }) {
                        return <td {...props}>{children}</td>;
                      },
                    }}
                  >
                    {content || 'Document content not found'}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {isShareDropdownOpen && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setIsShareDropdownOpen(false)}
        />
      )}
    </div>
  );
};

export default DocumentViewer;
