// Layout.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { signOutUser} from '../auth';

const Layout = ({ children }) => {

  return (
    <div className="flex">
      {/* Sidebar */}
      <div className="w-1/6 bg-gray-200 min-h-screen">
        <ul className="mt-20">
          <li>
          <Link to="/homepage" className="block py-2 px-4 hover:bg-gray-300 text-center">Home</Link>
          </li>
          <li>
            <Link to="/calendar" className="block py-2 px-4 hover:bg-gray-300 text-center">Calendar</Link>
          </li>
          <li>
            <Link to="/academic" className="block py-2 px-4 hover:bg-gray-300 text-center">Academic</Link>
          </li>
          <li>
            <Link to="/health" className="block py-2 px-4 hover:bg-gray-300 text-center">Health</Link>
          </li>
          <li>
            <Link to="/personal" className="block py-2 px-4 hover:bg-gray-300 text-center">Personal</Link>
          </li>
          <li>
            <a href="/" onClick={signOutUser} className="block py-2 px-4 hover:bg-gray-300 text-center">
              Sign Out
            </a>
          </li>
        </ul>
      </div>
      
      {/* Main Content */}
      <div className="flex-1">
        {children} {/* This will render the content of the specific page */}
      </div>
    </div>
  );
};

export default Layout;
