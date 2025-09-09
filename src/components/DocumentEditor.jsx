import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

const DocumentEditor = () => {
  const { getCurrentUser } = useAuth();
  const currentUser = getCurrentUser();
  const canEdit = currentUser?.role === 'teacher';
  
  const [isEditorExpanded, setIsEditorExpanded] = useState(false);
  const [markdownContent, setMarkdownContent] = useState(`# Welcome to EduSphere Document Editor

This is a sample Markdown document. You can edit this content in the left panel (if you have edit permissions).

## Features

- **Real-time preview**: See your changes instantly
- **Markdown support**: Full Markdown syntax support
- **Code highlighting**: Syntax highlighting for code blocks
- **Collaborative editing**: See who else is viewing the document

## Code Example

\`\`\`javascript
function greetUser(name) {
  return \`Hello, \${name}! Welcome to EduSphere.\`;
}

console.log(greetUser('Teacher'));
\`\`\`

## Lists

### Unordered List
- Item 1
- Item 2
- Item 3

### Ordered List
1. First item
2. Second item
3. Third item

## Tables

| Feature | Status | Description |
|---------|--------|-------------|
| Markdown | ✅ | Full support |
| Code Highlighting | ✅ | Multiple languages |
| Real-time Preview | ✅ | Instant updates |
| Collaboration | ✅ | Multi-user support |

## Links and Images

[Visit EduSphere](https://edusphere.com)

> This is a blockquote. It can contain important information or notes.

---

*Happy editing!*`);

  const [documentTitle, setDocumentTitle] = useState('Sample Document');
  const [lastUpdated, setLastUpdated] = useState(new Date().toISOString());
  const [isShareDropdownOpen, setIsShareDropdownOpen] = useState(false);
  
  // Mock data for users currently viewing/editing
  const [viewingUsers] = useState([
    { id: 1, name: 'John Doe', avatar: 'JD', color: 'bg-blue-500' },
    { id: 2, name: 'Jane Smith', avatar: 'JS', color: 'bg-green-500' },
    { id: 3, name: 'Mike Johnson', avatar: 'MJ', color: 'bg-purple-500' },
    { id: 4, name: 'Sarah Wilson', avatar: 'SW', color: 'bg-pink-500' }
  ]);

  const textareaRef = useRef(null);

  // No auto-resize needed - we want scrolling instead

  const handleMarkdownChange = (e) => {
    setMarkdownContent(e.target.value);
    setLastUpdated(new Date().toISOString());
  };

  const handleTitleChange = (e) => {
    setDocumentTitle(e.target.value);
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

  return (
    <div className="document-editor">
      {/* Header */}
      <div className="document-header">
        <div className="container">
          <div className="flex justify-between items-center py-4">
            {/* Left side - Document details */}
            <div className="flex items-center space-x-6">
              <div>
                <input
                  type="text"
                  value={documentTitle}
                  onChange={handleTitleChange}
                  className="text-2xl font-bold text-primary bg-transparent border-none outline-none focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
                  disabled={!canEdit}
                />
                <p className="text-sm text-secondary mt-1">
                  Last updated {formatLastUpdated(lastUpdated)}
                </p>
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
    </div>
  );
};

export default DocumentEditor;
