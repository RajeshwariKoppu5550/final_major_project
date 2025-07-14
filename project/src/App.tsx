import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Auth from './components/Auth';
import { ContractorDashboard } from './components/ContractorDashboard';
import { WorkerDashboard } from './components/WorkerDashboard';
import Navigation from './components/Navigation';
import { User, UserType } from './types/user';

// Simulated database - In production, this would be a real database
const getUserDatabase = () => {
  const stored = localStorage.getItem('worklink_users_db');
  return stored ? JSON.parse(stored) : [];
};

const saveUserDatabase = (users: any[]) => {
  localStorage.setItem('worklink_users_db', JSON.stringify(users));
};

// Initialize with demo users if database is empty
const initializeDatabase = () => {
  const users = getUserDatabase();
  if (users.length === 0) {
    const demoUsers = [
      {
        id: '1',
        email: 'contractor@worklink.in',
        password: 'password123',
        name: 'Rahul Sharma',
        type: UserType.CONTRACTOR,
        profile: {
          companyName: 'Sharma Construction Co.',
          companyType: 'General Contracting',
          businessLocation: 'Mumbai, Maharashtra',
          description: 'Full-service construction company with 15 years of experience.',
          phone: '+91 98765 43210'
        },
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        email: 'worker@worklink.in',
        password: 'password123',
        name: 'Priya Patel',
        type: UserType.WORKER,
        profile: {
          skills: ['Electrical', 'Wiring', 'Panel Installation'],
          experience: 8,
          location: 'Pune, Maharashtra',
          pincode: '411001',
          availability: 'Available',
          bio: 'Licensed electrician with expertise in residential and commercial projects.',
          phone: '+91 87654 32109',
          hourlyRate: 800,
          expectedWage: 800
        },
        createdAt: new Date().toISOString()
      }
    ];
    saveUserDatabase(demoUsers);
  }
};

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // Initialize database with demo users
    initializeDatabase();
    
    // Check for existing user session
    const savedUser = localStorage.getItem('worklink_user');
    const rememberMe = localStorage.getItem('worklink_remember');
    
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        // Verify user still exists in database and get latest data
        const users = getUserDatabase();
        const currentUser = users.find((u: any) => u.id === userData.id);
        
        if (currentUser) {
          // Update user with latest data from database
          const updatedUser: User = {
            id: currentUser.id,
            email: currentUser.email,
            name: currentUser.name,
            type: currentUser.type,
            profile: currentUser.profile
          };
          setUser(updatedUser);
        } else {
          // User no longer exists, clear session
          localStorage.removeItem('worklink_user');
          localStorage.removeItem('worklink_remember');
        }
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('worklink_user');
        localStorage.removeItem('worklink_remember');
      }
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('worklink_user', JSON.stringify(userData));
  };

  const handleUserUpdate = (updatedUser: User) => {
    // Update user in state
    setUser(updatedUser);
    
    // Update user in localStorage
    localStorage.setItem('worklink_user', JSON.stringify(updatedUser));
    
    // Update user in database
    const users = getUserDatabase();
    const userIndex = users.findIndex((u: any) => u.id === updatedUser.id);
    if (userIndex !== -1) {
      users[userIndex] = {
        ...users[userIndex],
        name: updatedUser.name,
        profile: updatedUser.profile
      };
      saveUserDatabase(users);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('worklink_user');
    // Keep remember me setting unless explicitly cleared
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-blue-600 text-lg">Loading...</div>
      </div>
    );
  }

  if (!user && location.pathname !== '/auth') {
    return <Navigate to="/auth" replace />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Navigation user={user} onLogout={handleLogout} />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route 
            path="/auth" 
            element={
              user ? (
                <Navigate to={user.type === UserType.CONTRACTOR ? "/contractor-dashboard" : "/worker-dashboard"} />
              ) : (
                <Auth onLogin={handleLogin} />
              )
            } 
          />
          <Route 
            path="/contractor-dashboard" 
            element={
              user && user.type === UserType.CONTRACTOR ? (
                <ContractorDashboard user={user} onUserUpdate={handleUserUpdate} />
              ) : (
                <Navigate to="/auth" />
              )
            } 
          />
          <Route 
            path="/worker-dashboard" 
            element={
              user && user.type === UserType.WORKER ? (
                <WorkerDashboard user={user} onUserUpdate={handleUserUpdate} />
              ) : (
                <Navigate to="/auth" />
              )
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;