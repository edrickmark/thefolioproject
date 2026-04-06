// frontend/src/components/Navbar.js
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <header>
      <div className="logo">Mi Ilao</div>
      <nav>
        <ul>
          {/* Home link - always visible */}
          <li>
            <NavLink to="/home" className={({ isActive }) => isActive ? 'active' : ''}>
              Home
            </NavLink>
          </li>
          
          {/* About link - always visible */}
          <li>
            <NavLink to="/about" className={({ isActive }) => isActive ? 'active' : ''}>
              About
            </NavLink>
          </li>

          {/* Resources/Contact link - visible for NOT LOGGED IN and MEMBERS only */}
          {(!user || user.role === 'member') && (
            <li>
              <NavLink to="/contact" className={({ isActive }) => isActive ? 'active' : ''}>
                Resources
              </NavLink>
            </li>
          )}

          {/* Show for non-logged in users */}
          {!user ? (
            <>
              <li>
                <NavLink to="/register" className={({ isActive }) => isActive ? 'active' : ''}>
                  Sign Up
                </NavLink>
              </li>
              <li>
                <NavLink to="/login" className={({ isActive }) => isActive ? 'active' : ''}>
                  Login
                </NavLink>
              </li>
            </>
          ) : (
            <>
              {/* Show for logged-in users (members and admins) */}
              <li>
                <NavLink to="/profile" className={({ isActive }) => isActive ? 'active' : ''}>
                  Profile
                </NavLink>
              </li>
              <li>
                <NavLink to="/create-post" className={({ isActive }) => isActive ? 'active' : ''}>
                  Create Post
                </NavLink>
              </li>
              
              {/* Admin page - only for admins */}
              {user.role === 'admin' && (
                <li>
                  <NavLink to="/admin" className={({ isActive }) => isActive ? 'active' : ''}>
                    Admin Page
                  </NavLink>
                </li>
              )}
              
              <li>
                <button onClick={handleLogout} className="logout-btn">
                  Log Out
                </button>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
}

export default Navbar;