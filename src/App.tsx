import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { ComingSoonPage } from './pages/ComingSoonPage';
import { WorkspacePage } from './pages/WorkspacePage';

export default function App() {
  return (
    <BrowserRouter>
      <Sidebar />
      <Routes>
        <Route path="/workspace" element={<WorkspacePage />} />
        <Route path="/analytics" element={<ComingSoonPage label="Analytics" />} />
        <Route path="/practice" element={<ComingSoonPage label="Practice" />} />
        <Route path="/bookmarks" element={<ComingSoonPage label="Bookmarks" />} />
        <Route path="/settings" element={<ComingSoonPage label="Settings" />} />
        <Route path="*" element={<Navigate to="/workspace" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
