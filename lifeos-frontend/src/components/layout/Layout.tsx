import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export const Layout = () => {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-theme-bg text-theme-main transition-colors duration-300">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto px-4 md:px-6 pb-6 space-y-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
