import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import api from '../api/axiosConfig';
import InviteEditorModal from './InviteEditorModal';
import LoadingIndicator from './LoadingIndicator';

const DocumentEditor = () => {
  const { getCurrentUser } = useAuth();
  const currentUser = getCurrentUser();
  const { document_id } = useParams();
  const location = useLocation();
  const canEdit = currentUser?.role === 'teacher';
  
  // Document data state
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isEditorExpanded, setIsEditorExpanded] = useState(false);
  const [markdownContent, setMarkdownContent] = useState('');
  const [documentTitle, setDocumentTitle] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');
  const [isShareDropdownOpen, setIsShareDropdownOpen] = useState(false);
  
  // Search functionality
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);
  
  // Modal state
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  

  const [documentEditors, setDocumentEditors] = useState([]);
  const [currentlyViewingUsers, setCurrentlyViewingUsers] = useState([]);
  
  // Auto-save state
  const [updateTimeout, setUpdateTimeout] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Mock data for users currently viewing/editing
  const [viewingUsers] = useState([
    { id: 1, name: 'John Doe', avatar: 'JD', color: 'bg-blue-500' },
    { id: 2, name: 'Jane Smith', avatar: 'JS', color: 'bg-green-500' },
    { id: 3, name: 'Mike Johnson', avatar: 'MJ', color: 'bg-purple-500' },
    { id: 4, name: 'Sarah Wilson', avatar: 'SW', color: 'bg-pink-500' }
  ]);

  const textareaRef = useRef(null);

  // Fetch document data on component mount
  useEffect(() => {
    if (document_id && document_id !== 'new') {
      fetchDocument();
    } else if (document_id === 'new') {
      // Handle new document creation
      setLoading(false);
      setDocument({ title: 'Untitled Document', editors: [] });
      setDocumentTitle('Untitled Document');
      setMarkdownContent(document.markdown || '');
      setLastUpdated(new Date().toISOString());
      setDocumentEditors([]);
      setIsEditorExpanded(canEdit);
    }
  }, [document_id]);

  const fetchDocument = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get(`/documents/${document_id}`);
      
      const documentData = response.data.document;
      const fileContent = response.data.file || '';
      
      // Set document data
      setDocument(documentData);
      setDocumentTitle(documentData.title || 'Untitled Document');
      setMarkdownContent(fileContent);
      setLastUpdated(documentData.updated_at || documentData.created_at);
      setDocumentEditors(documentData.editors || []);
      
      // Set editor expanded if user has edit permissions
      setIsEditorExpanded(canEdit);
      
    } catch (error) {
      console.error('Error fetching document:', error);
      setError('Failed to load document');
    } finally {
      setLoading(false);
    }
  };

  // No auto-resize needed - we want scrolling instead

  const handleMarkdownChange = (e) => {
    setMarkdownContent(e.target.value);
    setLastUpdated(new Date().toISOString());
    
    // Auto-save document
    if (document_id && document_id !== 'new') {
      updateDocument();
    }
  };

  const handleTitleChange = (e) => {
    setDocumentTitle(e.target.value);
    setLastUpdated(new Date().toISOString());
    
    // Auto-save document
    if (document_id && document_id !== 'new') {
      updateDocument();
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

  // Search functionality
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    if (query.trim().length === 0) {
      setSearchResults([]);
      return;
    }

    // Set new timeout for debounced search
    const newTimeout = setTimeout(() => {
      performSearch(query);
    }, 300); // 300ms delay

    setSearchTimeout(newTimeout);
  };

  const performSearch = async (query) => {
    try {
      setSearchLoading(true);
      const response = await api.get(`/users?query=${encodeURIComponent(query)}`);

      const results = response.data.users;

      let filteredUsers = results;
      // Filter out users that are already editors
      if (documentEditors.length > 0)
      {
        filteredUsers = results.filter((user) => !documentEditors.some((editor) => editor.id === user.id));
      }

      // Filter out current user
      filteredUsers = filteredUsers.filter((user) => user.id !== currentUser.id);

      // Set search results
      setSearchResults(filteredUsers || []);
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleInviteUser = (user) => {
    setSelectedUser(user);
    setInviteModalOpen(true);
  };

  const handleCloseInviteModal = (response) => {
    setDocumentEditors([...documentEditors, ...response.editors]);

    setInviteModalOpen(false);
    setSelectedUser(null);
  };

  // Auto-save document with debouncing
  const updateDocument = async () => {
    // Clear existing timeout
    if (updateTimeout) {
      clearTimeout(updateTimeout);
    }

    // Set new timeout for debounced save
    const newTimeout = setTimeout(async () => {
      try {
        setIsSaving(true);
        
        const payload = {
          document: {
            title: documentTitle,
            markdown: markdownContent
          }
        };

        await api.put(`/documents/${document_id}`, payload);
        
        // Update last updated time
        setLastUpdated(new Date().toISOString());
        
      } catch (error) {
        console.error('Error updating document:', error);
        // You could add a toast notification here for error feedback
      } finally {
        setIsSaving(false);
      }
    }, 1000); // 1 second delay

    setUpdateTimeout(newTimeout);
  };

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
      if (updateTimeout) {
        clearTimeout(updateTimeout);
      }
    };
  }, [searchTimeout, updateTimeout]);

  const getShareIcon = (label) => {
    switch (label) {
      case 'Copy Link': return 'copy';
      case 'Export PDF': return 'file-pdf';
      case 'Export HTML': return 'code';
      case 'Share via Email': return 'envelope';
      default: return 'share-alt';
    }
  };

  // Loading state
  if (loading) {
    return <LoadingIndicator size="large" text="Loading document..." />;
  }

  // Error state
  if (error || !document) {
    return (
      <div className="document-editor">
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
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="document-editor">
      {/* Header */}
      <div className="document-header">
        <div className="container">
          <div className="flex justify-between items-center py-4">
            {/* Left side - Document details */}
            <div className="flex items-center space-x-6 document-details">
              <div className="document-title">
                <input
                  type="text"
                  value={documentTitle}
                  onChange={handleTitleChange}
                  className="text-2xl font-bold text-primary bg-transparent border-none outline-none focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
                  disabled={!canEdit}
                />
                <p className="text-sm text-secondary mt-1">
                  Last updated {formatLastUpdated(lastUpdated)}
                  {isSaving && (
                    <span className="ml-2">
                      <i className="fas fa-spinner fa-spin text-primary"></i>
                      <span className="ml-1">Saving...</span>
                    </span>
                  )}
                </p>
                {documentEditors.length > 0 && (
                  <div className="text-sm text-secondary mt-1 document-editors">
                    <span className="font-bold">Editors:</span>

                    <div className="flex -space-x-2 editors">
                      { documentEditors.map((editor) => ( <img src={editor.avatar_url} alt={editor.first_name} className="user-avatar" /> )) }
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right side - Share button and viewing users */}
            <div className="flex items-center space-x-4">
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
                  <div className="dropdown-content" style={{ width: '400px', padding: '1rem' }}>
                    {/* Search Input */}
                    <div className="field">
                      <div className="control has-icons-left">
                        <input
                          className="input"
                          type="text"
                          placeholder="Search users..."
                          value={searchQuery}
                          onChange={handleSearchChange}
                        />
                        <span className="icon is-left">
                          <i className="fas fa-search"></i>
                        </span>
                      </div>
                    </div>

                    <hr className="my-3" />

                    {/* Search Results */}
                    <div className="search-results" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                      {searchLoading ? (
                        <div className="has-text-centered py-4">
                          <i className="fas fa-spinner fa-spin"></i>
                          <span className="ml-2">Searching...</span>
                        </div>
                      ) : searchResults.length > 0 ? (
                        <ul className="menu-list">
                          {searchResults.map((user) => {
                            return (
                              <li key={user.id} className="is-flex is-justify-content-space-between is-align-items-center">
                                <div className="is-flex is-align-items-left">
                                  <img src={user.avatar_url} alt={user.first_name} className="user-avatar" />
                                </div>

                                <div>
                                  <div className="has-text-weight-semibold">
                                    {user.first_name} {user.last_name}
                                  </div>
                                  <div className="has-text-grey is-size-7">
                                    {user.email}
                                  </div>
                                </div>

                                <button
                                  className="button is-small is-primary invite-btn"
                                  onClick={() => handleInviteUser(user)}
                                >
                                  Invite
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      ) : searchQuery.trim().length > 0 ? (
                        <div className="has-text-centered py-4 has-text-grey">
                          No users found
                        </div>
                      ) : (
                        <div className="has-text-centered py-4 has-text-grey">
                          Start typing to search for users
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

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
                      {user.avatar}
                    </div>
                  ))}
                  {viewingUsers.length > 4 && (
                    <div className="w-8 h-8 rounded-full bg-neutral-300 flex items-center justify-center text-neutral-600 text-xs font-medium border-2 border-white">
                      +{viewingUsers.length - 4}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="document-content">
        <div className="flex" style={{ height: 'calc(100vh - 80px)' }}>
          {/* Left Side - Markdown Editor (only for teachers) */}
          {canEdit && (
            <div className={`editor-sidebar transition-all duration-300 ${isEditorExpanded ? 'expanded' : 'collapsed'}`}>
              <div className="h-full border-r border-neutral-200 bg-neutral-50">
                <div className="p-4 border-b border-neutral-200 bg-white">
                  <div className="flex items-center justify-between">
                    {isEditorExpanded && (
                      <h3 className="text-lg font-semibold text-primary">Markdown Editor</h3>
                    )}
                    <button
                      onClick={() => setIsEditorExpanded(!isEditorExpanded)}
                      className="btn btn-sm btn-outline"
                      title={isEditorExpanded ? 'Collapse Editor' : 'Expand Editor'}
                    >
                      <i className={`fas fa-chevron-${isEditorExpanded ? 'left' : 'right'} transition-transform`}></i>
                    </button>
                  </div>
                </div>
                <div className="p-4 h-full">
                  <textarea
                    ref={textareaRef}
                    value={markdownContent}
                    onChange={handleMarkdownChange}
                    className="w-full h-full resize-none border-none outline-none font-mono text-sm leading-relaxed"
                    placeholder={isEditorExpanded ? "Start writing your Markdown here..." : ""}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Right Side - Markdown Viewer */}
          <div className={`viewer-panel transition-all duration-300 ${isEditorExpanded ? 'expanded' : 'full-width'}`}>
            <div className="h-full overflow-y-auto bg-white">
              <div className="p-8 max-w-4xl mx-auto">
                <div className="prose prose-lg max-w-none">
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
                    {markdownContent}
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

      {/* Invite Editor Modal */}
      <InviteEditorModal
        isOpen={inviteModalOpen}
        onClose={handleCloseInviteModal}
        user={selectedUser}
        documentId={document_id !== 'new' ? document_id : null}
      />
    </div>
  );
};

export default DocumentEditor;
