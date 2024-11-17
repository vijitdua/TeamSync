// authContextProvider.js
// Provides a React context for managing authentication state throughout the application.

import React, { createContext, useContext, useEffect, useState } from 'react';
import LoadingPage from "../screens/LoadingPage";

const AuthContextProvider = createContext();

// Important variable -> isLoggedIn, currentUserID

/**
 * Custom hook to use the authentication context.
 */
export function useAuth() {
    return useContext(AuthContextProvider);
}

/**
 * Provider component that manages the authentication state and renders children based on authentication status.
 * @param {Object} children - Child components that consume authentication context.
 * @returns {JSX.Element} - The provider component with conditional rendering based on authentication status.
 */
export function AuthProvider({ children }) {
    const [isLoggedIn, setIsLoggedIn] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // note: browser js cannot access cookies. need to check login state with backend instead!!!
        // make get request to check if carrying cookie
        // change isLoggedIn and modify loading to false
        
        setIsLoggedIn(true);  // change manually for development
        setLoading(false);
    }, []);

    const value = {isLoggedIn};

    if (loading) {
        return (
            <LoadingPage />
        );
    }

    return (
        <AuthContextProvider.Provider value={value}>
            {!loading && children}
        </AuthContextProvider.Provider>
    );
}
