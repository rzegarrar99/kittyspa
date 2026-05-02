import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const Layout: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      {/* ml-[290px] = 260px (Sidebar width) + 16px (left-4) + 14px (gap) */}
      <div className="flex-1 ml-[290px] flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
