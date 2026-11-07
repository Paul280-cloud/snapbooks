import { Routes, Route, Navigate } from 'react-router-dom';
import { useSession } from './hooks/useSession';
import Welcome from './pages/Welcome';
import SignUp from './pages/SignUp';
import LogIn from './pages/LogIn';
import ForgotPassword from './pages/ForgotPassword';
import ReceiptList from './pages/ReceiptList';
import UploadReceipt from './pages/UploadReceipt';
import EditReceipt from './pages/EditReceipt';
import Profile from './pages/Profile';
import Export from './pages/Export';

function ProtectedRoute({ children }: { children: React.ReactElement }) {
  const { session, loading } = useSession();
  if (loading) return null;
  return session ? children : <Navigate to="/log-in" replace />;
}

function PublicOnlyRoute({ children }: { children: React.ReactElement }) {
  const { session, loading } = useSession();
  if (loading) return null;
  return session ? <Navigate to="/receipts" replace /> : children;
}

function ForgotPasswordRoute({ children }: { children: React.ReactElement }) {
  // Accessible both logged-out (request mode) and when arriving via recovery hash
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route
        path="/sign-up"
        element={
          <PublicOnlyRoute>
            <SignUp />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/log-in"
        element={
          <PublicOnlyRoute>
            <LogIn />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <ForgotPasswordRoute>
            <ForgotPassword />
          </ForgotPasswordRoute>
        }
      />
      <Route
        path="/receipts"
        element={
          <ProtectedRoute>
            <ReceiptList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/receipts/new"
        element={
          <ProtectedRoute>
            <UploadReceipt />
          </ProtectedRoute>
        }
      />
      <Route
        path="/receipts/:id"
        element={
          <ProtectedRoute>
            <EditReceipt />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/export"
        element={
          <ProtectedRoute>
            <Export />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
