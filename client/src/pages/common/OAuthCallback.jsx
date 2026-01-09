/**
 * OAuth Callback Page
 * 
 * Handles Google OAuth callback after authentication.
 * The backend redirects here with user data in the response.
 * 
 * Flow:
 * 1. Backend sets cookies and returns JSON with user data
 * 2. This page receives the response, updates auth state
 * 3. Redirects to appropriate dashboard based on role
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext.jsx';
import * as userAPI from '../../api/user.api.js';
import '../../styles/common/OAuthCallback.css';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loadUser, isAuthenticated, user } = useAuth();
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Check if there's an error in URL params
        const errorParam = searchParams.get('error');
        if (errorParam) {
          setError(errorParam);
          setIsLoading(false);
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        // Backend sets cookies, so we need to load user profile
        // This will verify the cookies and update auth state
        const result = await loadUser();
        
        if (result.success && result.data) {
          // Auth state is now updated via loadUser
          // The second useEffect will handle redirect based on auth state
        } else {
          setError('Failed to authenticate. Please try again.');
          setTimeout(() => navigate('/login'), 3000);
        }
      } catch (err) {
        console.error('OAuth callback error:', err);
        setError(err.message || 'Authentication failed');
        setTimeout(() => navigate('/login'), 3000);
      } finally {
        setIsLoading(false);
      }
    };

    handleOAuthCallback();
  }, [navigate, searchParams, loadUser]);

  // Watch for auth state changes and redirect - single source of truth
  useEffect(() => {
    if (!isLoading && isAuthenticated && user && user.role) {
      // Single source of truth for redirect logic
      const role = user.role;
      if (role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (role === 'officer') {
        navigate('/officer/dashboard', { replace: true });
      } else {
        // Default to citizen dashboard
        navigate('/user/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="oauth-callback-container">
        <div className="oauth-callback-content">
          <div className="spinner"></div>
          <h2>Completing authentication...</h2>
          <p>Please wait while we sign you in.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="oauth-callback-container">
        <div className="oauth-callback-content error">
          <i className="fas fa-exclamation-circle"></i>
          <h2>Authentication Failed</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/login')} className="retry-btn">
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default OAuthCallback;

