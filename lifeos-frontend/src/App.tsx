import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { DataProvider } from './context/DataContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ToastContainer } from './components/common/ToastContainer';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Layout } from './components/layout/Layout';

import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Trackers from './pages/Trackers';
import DSARevision from './pages/DSARevision';
import Notes from './pages/Notes';
import Journal from './pages/Journal';
import Planner from './pages/Planner';
import Projects from './pages/Projects';
import JobSearch from './pages/JobSearch';
import Settings from './pages/Settings';

export function App() {
  return (
    <ThemeProvider>
      <DataProvider>
        <AuthProvider>
          <ToastProvider>
            <BrowserRouter>
              <Routes>
                {/* Public Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />

                {/* Protected Workspace Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/" element={<Layout />}>
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="trackers" element={<Trackers />} />
                    <Route path="dsa" element={<DSARevision />} />
                    <Route path="notes" element={<Notes />} />
                    <Route path="journal" element={<Journal />} />
                    <Route path="planner" element={<Planner />} />
                    <Route path="projects" element={<Projects />} />
                    <Route path="job-search" element={<JobSearch />} />
                    <Route path="settings" element={<Settings />} />
                  </Route>
                </Route>

                {/* Catch-all route */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
              <ToastContainer />
            </BrowserRouter>
          </ToastProvider>
        </AuthProvider>
      </DataProvider>
    </ThemeProvider>
  );
}

export default App;
