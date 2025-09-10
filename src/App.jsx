import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import SignupForm from './components/SignupForm';
import LoginForm from './components/LoginForm';
import Dashboard from './components/Dashboard';
import Documents from './components/Documents';
import StudentDocuments from './components/StudentDocuments';
import DocumentEditor from './components/DocumentEditor';
import DocumentViewer from './components/DocumentViewer';
import ProtectedRoute from './components/ProtectedRoute';

function AppContent() {
  const { user } = useAuth();

  return (
    <Router>
      <div className="app-container">
        {<Navbar user={user} />}
        <main className="main-content">
          <Routes>
            <Route 
              path="/signup" 
              element={user ? <Navigate to="/dashboard" replace /> : <SignupForm />} 
            />
            <Route 
              path="/login" 
              element={user ? <Navigate to="/dashboard" replace /> : <LoginForm />} 
            />
            <Route 
              path="/dashboard" 
              element={
                user ? (
                  user.role === 'teacher' ? (
                    <Navigate to="/my-documents" replace />
                  ) : (
                    <Navigate to="/documents" replace />
                  )
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
            <Route 
              path="/editor" 
              element={
                <ProtectedRoute>
                  <DocumentEditor />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/my-documents" 
              element={
                <ProtectedRoute>
                  <Documents />
                </ProtectedRoute>
              } 
            />
            <Route
              path="/documents" 
              element={
                user && user.role === 'student' ? (
                  <ProtectedRoute>
                    <StudentDocuments user={user} />
                  </ProtectedRoute>
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
            <Route 
              path="/viewer/:document_id" 
              element={
                <ProtectedRoute>
                  <DocumentViewer />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/" 
              element={<Navigate to={user ? "/dashboard" : "/login"} replace />} 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
