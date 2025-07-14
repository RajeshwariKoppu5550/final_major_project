import React, { useState } from 'react';
import { User, UserType } from '../types/user';
import { Eye, EyeOff, User as UserIcon, Building, ArrowLeft, AlertCircle, CheckCircle, Mail, Lock, UserPlus, LogIn } from 'lucide-react';

interface AuthProps {
  onLogin: (user: User) => void;
}

// Database helper functions
const getUserDatabase = () => {
  const stored = localStorage.getItem('worklink_users_db');
  return stored ? JSON.parse(stored) : [];
};

const saveUserDatabase = (users: any[]) => {
  localStorage.setItem('worklink_users_db', JSON.stringify(users));
};

const findUserByEmail = (email: string) => {
  const users = getUserDatabase();
  return users.find((user: any) => user.email.toLowerCase() === email.toLowerCase());
};

const createUser = (userData: any) => {
  const users = getUserDatabase();
  const newUser = {
    ...userData,
    id: Date.now().toString(),
    createdAt: new Date().toISOString()
  };
  users.push(newUser);
  saveUserDatabase(users);
  return newUser;
};

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userType, setUserType] = useState<UserType>(UserType.CONTRACTOR);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    location: ''
  });

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, text: '', color: '' };
    if (password.length < 6) return { strength: 1, text: 'Too short', color: 'text-red-500' };
    if (password.length < 8) return { strength: 2, text: 'Weak', color: 'text-orange-500' };
    if (password.length < 12) return { strength: 3, text: 'Good', color: 'text-yellow-500' };
    return { strength: 4, text: 'Strong', color: 'text-green-500' };
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Please fill in all required fields.');
      return false;
    }

    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address.');
      return false;
    }

    if (!isLogin) {
      if (!formData.name.trim()) {
        setError('Please enter your full name.');
        return false;
      }
      
      if (!formData.confirmPassword) {
        setError('Please confirm your password.');
        return false;
      }
      
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match.');
        return false;
      }
      
      if (!validatePassword(formData.password)) {
        setError('Password must be at least 6 characters long.');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      if (isLogin) {
        // Sign In Process
        const existingUser = findUserByEmail(formData.email);
        
        if (!existingUser) {
          setError('Invalid email. No account found with this email address.');
          setIsLoading(false);
          return;
        }
        
        if (existingUser.password !== formData.password) {
          setError('Invalid email or password.');
          setIsLoading(false);
          return;
        }
        
        // Successful login
        const user: User = {
          id: existingUser.id,
          email: existingUser.email,
          name: existingUser.name,
          type: existingUser.type,
          profile: existingUser.profile
        };
        
        setSuccess('Welcome back! Redirecting to your dashboard...');
        
        // Handle remember me
        if (rememberMe) {
          localStorage.setItem('worklink_remember', 'true');
        } else {
          localStorage.removeItem('worklink_remember');
        }
        
        setTimeout(() => {
          onLogin(user);
        }, 1000);
        
      } else {
        // Sign Up Process
        const existingUser = findUserByEmail(formData.email);
        
        if (existingUser) {
          setError('This email is already registered. Please sign in.');
          setIsLoading(false);
          return;
        }
        
        // Create new user data
        const newUserData = {
          email: formData.email,
          password: formData.password,
          name: formData.name,
          type: userType,
          profile: userType === UserType.CONTRACTOR ? {
            companyName: '',
            companyType: '',
            businessLocation: ''
          } : {
            skills: [],
            experience: 0,
            location: formData.location || '',
            availability: 'Available'
          }
        };

        // Save to database
        const savedUser = createUser(newUserData);
        
        // Create user object for login
        const user: User = {
          id: savedUser.id,
          email: savedUser.email,
          name: savedUser.name,
          type: savedUser.type,
          profile: savedUser.profile
        };

        setSuccess('Account created successfully! Redirecting to your dashboard...');
        setTimeout(() => {
          onLogin(user);
        }, 1000);
      }
      
      setIsLoading(false);
    }, 1000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setError('');
    setSuccess('');
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const switchToSignIn = () => {
    setIsLogin(true);
    setError('');
    setSuccess('');
    setFormData({
      email: formData.email,
      password: '',
      confirmPassword: '',
      name: '',
      location: ''
    });
  };

  const switchToSignUp = () => {
    setIsLogin(false);
    setError('');
    setSuccess('');
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
      location: ''
    });
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              {isLogin ? (
                <LogIn className="text-white" size={24} />
              ) : (
                <UserPlus className="text-white" size={24} />
              )}
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-gray-600">
            {isLogin 
              ? 'Sign in to access your WorkLink dashboard' 
              : 'Join WorkLink and start connecting today'
            }
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {/* Success Message */}
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle className="text-green-600 mr-3 flex-shrink-0" size={20} />
                <div>
                  <h3 className="text-sm font-medium text-green-800">Success!</h3>
                  <p className="mt-1 text-sm text-green-700">{success}</p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="text-red-600 mr-3 flex-shrink-0" size={20} />
                <div>
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <p className="mt-1 text-sm text-red-700">{error}</p>
                  {error === 'This email is already registered. Please sign in.' && (
                    <button
                      onClick={switchToSignIn}
                      className="mt-2 text-blue-600 hover:text-blue-500 font-medium underline text-sm"
                    >
                      Go to Sign In
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection for Sign Up */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  I am a: <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setUserType(UserType.CONTRACTOR)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      userType === UserType.CONTRACTOR
                        ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <Building className="mx-auto mb-2" size={24} />
                    <span className="text-sm font-medium">Contractor</span>
                    <p className="text-xs text-gray-500 mt-1">Hire skilled workers</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserType(UserType.WORKER)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      userType === UserType.WORKER
                        ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <UserIcon className="mx-auto mb-2" size={24} />
                    <span className="text-sm font-medium">Worker</span>
                    <p className="text-xs text-gray-500 mt-1">Find opportunities</p>
                  </button>
                </div>
              </div>
            )}

            {/* Name Field for Sign Up */}
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    formData.email && !validateEmail(formData.email) 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-300'
                  }`}
                  placeholder="Enter your email address"
                />
              </div>
              {formData.email && !validateEmail(formData.email) && (
                <p className="mt-1 text-sm text-red-600">Please enter a valid email address</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder={isLogin ? "Enter your password" : "Create a password (min. 6 characters)"}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              
              {/* Password Strength Indicator for Sign Up */}
              {!isLogin && formData.password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500">Password strength:</span>
                    <span className={`text-xs font-medium ${passwordStrength.color}`}>
                      {passwordStrength.text}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        passwordStrength.strength === 1 ? 'bg-red-500 w-1/4' :
                        passwordStrength.strength === 2 ? 'bg-orange-500 w-2/4' :
                        passwordStrength.strength === 3 ? 'bg-yellow-500 w-3/4' :
                        passwordStrength.strength === 4 ? 'bg-green-500 w-full' : 'w-0'
                      }`}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Field for Sign Up */}
            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      formData.confirmPassword && formData.password !== formData.confirmPassword
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-300'
                    }`}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">Passwords do not match</p>
                )}
              </div>
            )}

            {/* Location Field for Workers */}
            {!isLogin && userType === UserType.WORKER && (
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  Location <span className="text-gray-400">(Optional)</span>
                </label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter your city, state"
                />
              </div>
            )}

            {/* Remember Me for Sign In */}
            {isLogin && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:text-blue-500 font-medium"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {isLogin ? 'Signing in...' : 'Creating Account...'}
                </div>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          {/* Switch Between Sign In/Sign Up */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={isLogin ? switchToSignUp : switchToSignIn}
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>

          {/* Demo Accounts Info */}
          {isLogin && (
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Demo Accounts</h4>
              <div className="text-xs text-blue-700 space-y-1">
                <p><strong>Contractor:</strong> contractor@worklink.in</p>
                <p><strong>Worker:</strong> worker@worklink.in</p>
                <p><strong>Password:</strong> password123</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;