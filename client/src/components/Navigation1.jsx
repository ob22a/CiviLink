import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/components/Navigation1.css'; // We'll create this next
import logo from '../assets/logo.png'; // Import your logo

function Navigation1() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation(); // To track active link

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isMenuOpen && !e.target.closest('.nav-container') && !e.target.closest('.menu-toggle')) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMenuOpen]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Check if link is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <Link to="/" className="logo" onClick={closeMenu}>
        <img src={logo} alt="Civilink Logo" />
        <span>Civilink</span>
      </Link>
      
      <button 
        className={`menu-toggle ${isMenuOpen ? 'active' : ''}`}
        aria-label="Toggle navigation menu"
        aria-expanded={isMenuOpen}
        onClick={toggleMenu}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
      
      <div 
        className={`overlay ${isMenuOpen ? 'active' : ''}`}
        onClick={closeMenu}
      ></div>
      
      <div className={`nav-container ${isMenuOpen ? 'active' : ''}`}>
        <ul className="nav-links">
          <li>
            <Link 
              to="/" 
              className={isActive('/') ? 'active' : ''}
              onClick={closeMenu}
            >
              Home
            </Link>
          </li>
          <li>
            <Link 
              to="/about" 
              className={isActive('/about') ? 'active' : ''}
              onClick={closeMenu}
            >
              About
            </Link>
          </li>
          <li>
            <Link 
              to="/help" 
              className={isActive('/help') ? 'active' : ''}
              onClick={closeMenu}
            >
              Help Center
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navigation1;