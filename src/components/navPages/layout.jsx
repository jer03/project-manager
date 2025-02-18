// src/components/Layout.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSignOut } from '../auth';
import { HomeIcon, CalendarIcon, BookOpenIcon, HeartIcon, UserIcon, LogOutIcon } from 'lucide-react';
import cuteSmile from '../../assets/cuteSmile.png';
import cin from '../../assets/cin.png';
const Layout = ({ children }) => {
  const location = useLocation();
  const signOutUser = useSignOut();

  // Helper to style active links
  const isActive = (path) =>
    location.pathname === path
      ? 'bg-blue-500 text-white'
      : 'text-gray-700 hover:bg-gray-300 transition duration-200';

  // Navigation Links
  const navItems = [
    { name: 'Home', path: '/homepage', icon: <HomeIcon size={20} /> },
    { name: 'Calendar', path: '/calendar', icon: <CalendarIcon size={20} /> },
    { name: 'Academic', path: '/academic', icon: <BookOpenIcon size={20} /> },
    { name: 'Health', path: '/health', icon: <HeartIcon size={20} /> },
    { name: 'Personal', path: '/personal', icon: <UserIcon size={20} /> },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 shadow-lg">
      <div 
  className="flex flex-row items-center justify-center h-20 border-b"
>
  <h1 className="text-2xl font-bold text-gray-800 bg-white bg-transparent px-4 py-1 rounded-md">
    My Dashboard
  </h1>
  </div>


        <ul className="mt-4 space-y-2">
          {navItems.map((item, index) => (
            <li key={index}>
              <Link
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg ${isActive(
                  item.path
                )}`}
              >
                {item.icon}
                <span className="text-md font-semibold">{item.name}</span>
              </Link>
            </li>
          ))}
          {/* Sign Out */}
          <li>
            <button
              onClick={(e) => {
                e.preventDefault();
                signOutUser();
              }}
              className="flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-100 w-full rounded-lg transition duration-200"
            >
              <LogOutIcon size={20} />
              <span className="text-md font-semibold">Sign Out</span>
            </button>
          </li>
        </ul>
  
        <img src={cuteSmile} 
  alt="Logo" 
  className="object-cover rounded-xl bg-transparent mt-10" />
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gray-50 p-6">
        {children} {/* Render content passed from parent */}
      </main>
    </div>
  );
};

export default Layout;
