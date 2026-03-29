import { createBrowserRouter } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import DashboardView from './pages/DashboardView';
import UploadView from './pages/UploadView';
import JDInputView from './pages/JDInputView';
import EditorView from './pages/EditorView';
import HistoryView from './pages/HistoryView';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppLayout } from './components/AppLayout'; // Extracted for fast-refresh isolation


export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout><LandingPage /></AppLayout>,
  },
  {
    path: '/login',
    element: <AppLayout><AuthPage /></AppLayout>,
  },
  {
    path: '/dashboard',
    element: <AppLayout><ProtectedRoute><DashboardView /></ProtectedRoute></AppLayout>,
  },
  {
    path: '/upload',
    element: <AppLayout><ProtectedRoute><UploadView /></ProtectedRoute></AppLayout>,
  },
  {
    path: '/jd',
    element: <AppLayout><ProtectedRoute><JDInputView /></ProtectedRoute></AppLayout>,
  },
  {
    path: '/editor/:jobId',
    element: <AppLayout><ProtectedRoute><EditorView /></ProtectedRoute></AppLayout>,
  },
  {
    path: '/history',
    element: <AppLayout><ProtectedRoute><HistoryView /></ProtectedRoute></AppLayout>,
  },
]);
