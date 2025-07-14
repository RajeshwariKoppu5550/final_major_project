import React, { useState, useEffect } from 'react';
import { User, WorkPost, ConnectionRequest, ChatMessage } from '../types/user';
import { Search, MapPin, Clock, IndianRupee, MessageCircle, Heart, Edit, Trash2, Send, X, Check, Mail, Phone, Star, Calendar, User as UserIcon, Briefcase, Filter, Bell } from 'lucide-react';

interface WorkerDashboardProps {
  user: User;
  onLogout: () => void;
  onUpdateUser: (user: User) => void;
}

export const WorkerDashboard: React.FC<WorkerDashboardProps> = ({ user, onLogout, onUpdateUser }) => {
  const [activeTab, setActiveTab] = useState('findWork');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchPincode, setSearchPincode] = useState('');
  const [searchWorkType, setSearchWorkType] = useState('');
  const [searchBudgetMin, setSearchBudgetMin] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [workPosts, setWorkPosts] = useState<WorkPost[]>([]);
  const [savedJobs, setSavedJobs] = useState<WorkPost[]>([]);
  const [myProfiles, setMyProfiles] = useState<any[]>([]);
  const [connectionRequests, setConnectionRequests] = useState<ConnectionRequest[]>([]);
  const [chats, setChats] = useState<{ [key: string]: ChatMessage[] }>({});
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const [editingProfile, setEditingProfile] = useState<any>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [newProfile, setNewProfile] = useState({
    name: user.name,
    skill: '',
    experience: '',
    pincode: '',
    expectedWage: '',
    description: '',
    mobile: ''
  });

  useEffect(() => {
    loadData();
    // Simulate real-time message checking
    const interval = setInterval(checkForNewMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  const checkBudgetRange = (budget: string, minBudget: string) => {
    // Extract numbers from budget string (e.g., "₹15,000 - ₹25,000")
    const numbers = budget.match(/\d+/g);
    if (!numbers || numbers.length === 0) return true;
    
    const budgetAmount = parseInt(numbers[0].replace(/,/g, ''));
    const minAmount = parseInt(minBudget);
    
    return budgetAmount >= minAmount;
  };

  const loadData = () => {
    const allWorkPosts = JSON.parse(localStorage.getItem('workPosts') || '[]');
    const allProfiles = JSON.parse(localStorage.getItem('workerProfiles') || '[]');
    const allRequests = JSON.parse(localStorage.getItem('connectionRequests') || '[]');
    const allChats = JSON.parse(localStorage.getItem('chats') || '{}');
    const userSavedJobs = JSON.parse(localStorage.getItem(`savedJobs_${user.id}`) || '[]');

    setWorkPosts(allWorkPosts.filter((post: WorkPost) => post.status === 'active'));
    setMyProfiles(allProfiles.filter((p: any) => p.userId === user.id));
    setConnectionRequests(allRequests.filter((r: ConnectionRequest) => 
      r.receiverId === user.id || r.senderId === user.id
    ));
    setChats(allChats);
    setSavedJobs(userSavedJobs);
    calculateUnreadMessages(allChats);
  };

  const checkForNewMessages = () => {
    const allChats = JSON.parse(localStorage.getItem('chats') || '{}');
    calculateUnreadMessages(allChats);
    
    // Check for new messages and show notifications
    Object.keys(allChats).forEach(chatId => {
      const messages = allChats[chatId];
      const lastMessage = messages[messages.length - 1];
      if (lastMessage && lastMessage.senderId !== user.id && !lastMessage.read) {
        showMessageNotification(lastMessage);
      }
    });
  };

  const calculateUnreadMessages = (allChats: any) => {
    let count = 0;
    Object.keys(allChats).forEach(chatId => {
      const messages = allChats[chatId];
      count += messages.filter((msg: ChatMessage) => 
        msg.senderId !== user.id && !msg.read
      ).length;
    });
    setUnreadCount(count);
  };

  const showMessageNotification = (message: ChatMessage) => {
    // Create notification
    const notification = {
      id: Date.now().toString(),
      type: 'message',
      title: 'New Message',
      message: `New message from ${message.senderName}`,
      timestamp: new Date().toISOString()
    };

    setNotifications(prev => [notification, ...prev.slice(0, 4)]);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);

    // Play notification sound (optional)
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
      audio.play().catch(() => {}); // Ignore errors if audio fails
    } catch (e) {}
  };

  const filteredWorkPosts = workPosts.filter(post => {
    const matchesQuery = !searchQuery || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.workType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPincode = !searchPincode || post.pincode.includes(searchPincode);
    const matchesWorkType = !searchWorkType || post.workType.toLowerCase().includes(searchWorkType.toLowerCase());
    const matchesBudget = !searchBudgetMin || checkBudgetRange(post.budget, searchBudgetMin);
    
    return matchesQuery && matchesPincode && matchesWorkType && matchesBudget;
  });

  const handleApplyForJob = (workPost: WorkPost) => {
    const existingRequest = connectionRequests.find(r => 
      r.workPostId === workPost.id && r.senderId === user.id && r.status === 'pending'
    );

    if (existingRequest) {
      alert('You have already applied for this job.');
      return;
    }

    const newRequest: ConnectionRequest = {
      id: Date.now().toString(),
      senderId: user.id,
      receiverId: workPost.contractorId,
      senderName: user.name,
      receiverName: workPost.contractorName,
      type: 'worker_to_contractor',
      status: 'pending',
      workPostId: workPost.id,
      workPostTitle: workPost.title,
      timestamp: new Date().toISOString(),
      jobDetails: {
        title: workPost.title,
        workType: workPost.workType,
        location: workPost.pincode,
        budget: workPost.budget
      }
    };

    const allRequests = JSON.parse(localStorage.getItem('connectionRequests') || '[]');
    allRequests.push(newRequest);
    localStorage.setItem('connectionRequests', JSON.stringify(allRequests));

    // Send email notification to contractor
    sendEmailNotification(workPost, 'job_application', {
      workerName: user.name,
      workerEmail: user.email,
      jobTitle: workPost.title,
      workType: workPost.workType,
      location: workPost.pincode,
      budget: workPost.budget,
      skill: myProfiles[0]?.skill || 'Not specified',
      experience: myProfiles[0]?.experience || 'Not specified',
      message: `Worker ${user.name} is interested in your job posting: "${workPost.title}".`,
      action: 'job application'
    });

    alert(`Application sent to ${workPost.contractorName}! They will receive an email notification.`);
    loadData();
  };

  const sendEmailNotification = (recipient: any, type: string, data: any) => {
    const timestamp = new Date().toLocaleString('en-IN', { 
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'short'
    });

    console.log(`📧 Email sent to ${recipient.contractorName || recipient.name}:
    
Subject: New ${data.action} on WorkLink

Dear ${recipient.contractorName || recipient.name},

${data.message}

${type === 'job_application' ? `
Job Details:
- Title: ${data.jobTitle}
- Work Type: ${data.workType}
- Location: ${data.location}
- Budget: ${data.budget}

Worker Profile:
- Name: ${data.workerName}
- Email: ${data.workerEmail}
- Skill: ${data.skill}
- Experience: ${data.experience} years

Do you want to connect with this worker?
[Accept] [Decline]
` : ''}

Best regards,
WorkLink Team

Time: ${timestamp} IST`);
  };

  const handleSaveJob = (workPost: WorkPost) => {
    const userSavedJobs = JSON.parse(localStorage.getItem(`savedJobs_${user.id}`) || '[]');
    
    if (!userSavedJobs.find((job: WorkPost) => job.id === workPost.id)) {
      userSavedJobs.push(workPost);
      localStorage.setItem(`savedJobs_${user.id}`, JSON.stringify(userSavedJobs));
      setSavedJobs(userSavedJobs);
      alert('Job saved successfully!');
    } else {
      alert('Job already saved!');
    }
  };

  const handleCreateProfile = () => {
    if (!newProfile.skill || !newProfile.experience || !newProfile.pincode || !newProfile.expectedWage) {
      alert('Please fill all required fields');
      return;
    }

    const profile = {
      id: Date.now().toString(),
      userId: user.id,
      ...newProfile,
      createdAt: new Date().toISOString()
    };

    const allProfiles = JSON.parse(localStorage.getItem('workerProfiles') || '[]');
    allProfiles.push(profile);
    localStorage.setItem('workerProfiles', JSON.stringify(allProfiles));

    setNewProfile({
      name: user.name,
      skill: '',
      experience: '',
      pincode: '',
      expectedWage: '',
      description: '',
      mobile: ''
    });
    setIsCreatingProfile(false);
    loadData();
    alert('Profile created successfully!');
  };

  const handleEditProfile = (profile: any) => {
    setEditingProfile(profile);
    setNewProfile(profile);
    setIsCreatingProfile(true);
  };

  const handleUpdateProfile = () => {
    const allProfiles = JSON.parse(localStorage.getItem('workerProfiles') || '[]');
    const updatedProfiles = allProfiles.map((p: any) => 
      p.id === editingProfile.id ? { ...p, ...newProfile } : p
    );
    localStorage.setItem('workerProfiles', JSON.stringify(updatedProfiles));
    
    setEditingProfile(null);
    setIsCreatingProfile(false);
    setNewProfile({
      name: user.name,
      skill: '',
      experience: '',
      pincode: '',
      expectedWage: '',
      description: '',
      mobile: ''
    });
    loadData();
    alert('Profile updated successfully!');
  };

  const handleDeleteProfile = (profileId: string) => {
    if (window.confirm('Are you sure you want to delete this profile?')) {
      const allProfiles = JSON.parse(localStorage.getItem('workerProfiles') || '[]');
      const updatedProfiles = allProfiles.filter((p: any) => p.id !== profileId);
      localStorage.setItem('workerProfiles', JSON.stringify(updatedProfiles));
      loadData();
      alert('Profile deleted successfully!');
    }
  };

  const handleConnectionResponse = (requestId: string, response: 'accepted' | 'declined') => {
    const allRequests = JSON.parse(localStorage.getItem('connectionRequests') || '[]');
    const updatedRequests = allRequests.map((r: ConnectionRequest) => 
      r.id === requestId ? { ...r, status: response } : r
    );
    localStorage.setItem('connectionRequests', JSON.stringify(updatedRequests));

    const request = allRequests.find((r: ConnectionRequest) => r.id === requestId);
    if (request && response === 'accepted') {
      // Initialize chat
      const chatId = `${request.senderId}_${request.receiverId}_${request.workPostId}`;
      const allChats = JSON.parse(localStorage.getItem('chats') || '{}');
      if (!allChats[chatId]) {
        allChats[chatId] = [];
        localStorage.setItem('chats', JSON.stringify(allChats));
      }
    }

    loadData();
    alert(response === 'accepted' ? 'Connection accepted! You can now chat.' : 'Connection declined.');
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !activeChat) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      senderId: user.id,
      senderName: user.name,
      receiverId: '', // Will be set based on chat participants
      message: newMessage,
      timestamp: new Date().toISOString(),
      read: false
    };

    const allChats = JSON.parse(localStorage.getItem('chats') || '{}');
    if (!allChats[activeChat]) allChats[activeChat] = [];
    allChats[activeChat].push(message);
    localStorage.setItem('chats', JSON.stringify(allChats));

    setChats(allChats);
    setNewMessage('');
  };

  const markMessagesAsRead = (chatId: string) => {
    const allChats = JSON.parse(localStorage.getItem('chats') || '{}');
    if (allChats[chatId]) {
      allChats[chatId] = allChats[chatId].map((msg: ChatMessage) => 
        msg.senderId !== user.id ? { ...msg, read: true } : msg
      );
      localStorage.setItem('chats', JSON.stringify(allChats));
      setChats(allChats);
      calculateUnreadMessages(allChats);
    }
  };

  const getAcceptedConnections = () => {
    return connectionRequests.filter(r => r.status === 'accepted');
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-IN', { 
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: 'short'
    });
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchPincode('');
    setSearchWorkType('');
    setSearchBudgetMin('');
  };

  const handleSearch = () => {
    setIsSearching(true);
    // Simulate search delay
    setTimeout(() => {
      setIsSearching(false);
    }, 500);
  };

  const renderSearchBar = () => (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Search Jobs</h3>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
        >
          <Filter size={16} />
          <span>Filters</span>
        </button>
      </div>
      
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by job title, work type, or description..."
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pincode</label>
            <input
              type="text"
              value={searchPincode}
              onChange={(e) => setSearchPincode(e.target.value)}
              placeholder="e.g. 400001"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Work Type</label>
            <input
              type="text"
              value={searchWorkType}
              onChange={(e) => setSearchWorkType(e.target.value)}
              placeholder="e.g. Plumbing, Electrical"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Min Budget (₹)</label>
            <select
              value={searchBudgetMin}
              onChange={(e) => setSearchBudgetMin(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Any budget</option>
              <option value="5000">₹5,000+</option>
              <option value="10000">₹10,000+</option>
              <option value="20000">₹20,000+</option>
              <option value="50000">₹50,000+</option>
            </select>
          </div>
          <div className="md:col-span-3 flex justify-end">
            <div className="flex space-x-4">
              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
              >
                {isSearching ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Search Jobs
                  </>
                )}
              </button>
              <button
                onClick={clearSearch}
                className="text-gray-600 hover:text-gray-800 text-sm px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderNotifications = () => (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm animate-slide-in"
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <Bell className="text-blue-600" size={20} />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-gray-900">{notification.title}</h4>
              <p className="text-sm text-gray-600">{notification.message}</p>
            </div>
            <button
              onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderFindWork = () => (
    <div className="space-y-6">
      {renderSearchBar()}

      <div className="space-y-4">
        {filteredWorkPosts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">No work opportunities found</h3>
            <p className="text-gray-500">
              {searchQuery || searchPincode || searchWorkType || searchBudgetMin
                ? 'Try adjusting your search criteria to find more opportunities.'
                : 'No job posts available yet. Check back later for new opportunities.'}
            </p>
          </div>
        ) : (
          filteredWorkPosts.map((post) => (
            <div key={post.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{post.title}</h3>
                  <div className="flex items-center text-gray-600 mb-2">
                    <Briefcase className="w-4 h-4 mr-2" />
                    <span className="font-medium">{post.workType}</span>
                  </div>
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{post.pincode}</span>
                  </div>
                  <div className="flex items-center text-green-600 mb-2">
                    <IndianRupee className="w-4 h-4 mr-2" />
                    <span className="font-semibold">{post.budget}</span>
                  </div>
                  <div className="flex items-center text-gray-500 text-sm">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>Posted {formatTime(post.createdAt)}</span>
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <button
                    onClick={() => handleApplyForJob(post)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
                    disabled={connectionRequests.some(r => r.workPostId === post.id && r.senderId === user.id && r.status === 'pending')}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    {connectionRequests.some(r => r.workPostId === post.id && r.senderId === user.id && r.status === 'pending') ? 'Applied' : 'Apply'}
                  </button>
                  <button
                    onClick={() => handleSaveJob(post)}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors flex items-center"
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Save
                  </button>
                </div>
              </div>
              <p className="text-gray-700 mb-4">{post.description}</p>
              <div className="flex items-center text-sm text-gray-600">
                <UserIcon className="w-4 h-4 mr-2" />
                <span>Posted by {post.contractorName}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderMyProfiles = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">My Professional Profiles</h3>
        <button
          onClick={() => setIsCreatingProfile(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Create Profile
        </button>
      </div>

      {isCreatingProfile && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">
            {editingProfile ? 'Edit Profile' : 'Create New Profile'}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input
                type="text"
                value={newProfile.name}
                onChange={(e) => setNewProfile({...newProfile, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Skill/Trade *</label>
              <input
                type="text"
                value={newProfile.skill}
                onChange={(e) => setNewProfile({...newProfile, skill: e.target.value})}
                placeholder="e.g. Plumber, Electrician, Carpenter"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Experience (years) *</label>
              <input
                type="number"
                value={newProfile.experience}
                onChange={(e) => setNewProfile({...newProfile, experience: e.target.value})}
                placeholder="e.g. 5"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pincode *</label>
              <input
                type="text"
                value={newProfile.pincode}
                onChange={(e) => setNewProfile({...newProfile, pincode: e.target.value})}
                placeholder="e.g. 400001"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Expected Wage (₹/hour) *</label>
              <input
                type="number"
                value={newProfile.expectedWage}
                onChange={(e) => setNewProfile({...newProfile, expectedWage: e.target.value})}
                placeholder="e.g. 600"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
              <input
                type="tel"
                value={newProfile.mobile}
                onChange={(e) => setNewProfile({...newProfile, mobile: e.target.value})}
                placeholder="e.g. +91 98765 43210"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={newProfile.description}
                onChange={(e) => setNewProfile({...newProfile, description: e.target.value})}
                placeholder="Brief description of your skills and experience..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex space-x-4 mt-6">
            <button
              onClick={editingProfile ? handleUpdateProfile : handleCreateProfile}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              {editingProfile ? 'Update Profile' : 'Create Profile'}
            </button>
            <button
              onClick={() => {
                setIsCreatingProfile(false);
                setEditingProfile(null);
                setNewProfile({
                  name: user.name,
                  skill: '',
                  experience: '',
                  pincode: '',
                  expectedWage: '',
                  description: '',
                  mobile: ''
                });
              }}
              className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {myProfiles.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">No profiles created yet</h3>
            <p className="text-gray-500">Create your first professional profile to get discovered by contractors.</p>
          </div>
        ) : (
          myProfiles.map((profile) => (
            <div key={profile.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{profile.name}</h3>
                  <div className="flex items-center text-gray-600 mb-2">
                    <Briefcase className="w-4 h-4 mr-2" />
                    <span className="font-medium">{profile.skill}</span>
                  </div>
                  <div className="flex items-center text-gray-600 mb-2">
                    <Star className="w-4 h-4 mr-2" />
                    <span>{profile.experience} years experience</span>
                  </div>
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{profile.pincode}</span>
                  </div>
                  <div className="flex items-center text-green-600 mb-2">
                    <IndianRupee className="w-4 h-4 mr-2" />
                    <span className="font-semibold">₹{profile.expectedWage}/hour</span>
                  </div>
                  {profile.mobile && (
                    <div className="flex items-center text-gray-600 mb-2">
                      <Phone className="w-4 h-4 mr-2" />
                      <span>{profile.mobile}</span>
                    </div>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditProfile(profile)}
                    className="bg-blue-100 text-blue-700 p-2 rounded-md hover:bg-blue-200 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteProfile(profile.id)}
                    className="bg-red-100 text-red-700 p-2 rounded-md hover:bg-red-200 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {profile.description && (
                <p className="text-gray-700 mb-4">{profile.description}</p>
              )}
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="w-4 h-4 mr-2" />
                <span>Created {formatTime(profile.createdAt)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderSavedJobs = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Saved Jobs</h3>
      {savedJobs.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">No saved jobs yet</h3>
          <p className="text-gray-500">Save interesting job posts to apply for them later.</p>
        </div>
      ) : (
        savedJobs.map((post) => (
          <div key={post.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{post.title}</h3>
                <div className="flex items-center text-gray-600 mb-2">
                  <Briefcase className="w-4 h-4 mr-2" />
                  <span className="font-medium">{post.workType}</span>
                </div>
                <div className="flex items-center text-gray-600 mb-2">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{post.pincode}</span>
                </div>
                <div className="flex items-center text-green-600 mb-2">
                  <IndianRupee className="w-4 h-4 mr-2" />
                  <span className="font-semibold">{post.budget}</span>
                </div>
              </div>
              <button
                onClick={() => handleApplyForJob(post)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
                disabled={connectionRequests.some(r => r.workPostId === post.id && r.senderId === user.id && r.status === 'pending')}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                {connectionRequests.some(r => r.workPostId === post.id && r.senderId === user.id && r.status === 'pending') ? 'Applied' : 'Apply Now'}
              </button>
            </div>
            <p className="text-gray-700">{post.description}</p>
          </div>
        ))
      )}
    </div>
  );

  const renderRequests = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Connection Requests</h3>
      {connectionRequests.filter(r => r.receiverId === user.id && r.status === 'pending').length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">No pending requests</h3>
          <p className="text-gray-500">You'll see connection requests from contractors here.</p>
        </div>
      ) : (
        connectionRequests
          .filter(r => r.receiverId === user.id && r.status === 'pending')
          .map((request) => (
            <div key={request.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Connection Request from {request.senderName}
                  </h3>
                  {request.jobDetails && (
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-gray-600">
                        <Briefcase className="w-4 h-4 mr-2" />
                        <span>{request.jobDetails.title}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>{request.jobDetails.location}</span>
                      </div>
                      <div className="flex items-center text-green-600">
                        <IndianRupee className="w-4 h-4 mr-2" />
                        <span>{request.jobDetails.budget}</span>
                      </div>
                    </div>
                  )}
                  <p className="text-sm text-gray-500">
                    Received {formatTime(request.timestamp)}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleConnectionResponse(request.id, 'accepted')}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Accept
                  </button>
                  <button
                    onClick={() => handleConnectionResponse(request.id, 'declined')}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Decline
                  </button>
                </div>
              </div>
            </div>
          ))
      )}
    </div>
  );

  const renderMessages = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-96">
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Conversations</h3>
        <div className="space-y-2">
          {getAcceptedConnections().map((connection) => {
            const chatId = `${connection.senderId}_${connection.receiverId}_${connection.workPostId}`;
            const otherPersonName = connection.senderId === user.id ? connection.receiverName : connection.senderName;
            const unreadInChat = (chats[chatId] || []).filter((msg: ChatMessage) => 
              msg.senderId !== user.id && !msg.read
            ).length;
            
            return (
              <button
                key={chatId}
                onClick={() => {
                  setActiveChat(chatId);
                  markMessagesAsRead(chatId);
                }}
                className={`w-full text-left p-3 rounded-md transition-colors relative ${
                  activeChat === chatId ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'
                }`}
              >
                <div className="font-medium">{otherPersonName}</div>
                <div className="text-sm text-gray-500">{connection.workPostTitle}</div>
                {unreadInChat > 0 && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadInChat}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="lg:col-span-2 bg-white rounded-lg shadow-md flex flex-col">
        {activeChat ? (
          <>
            <div className="p-4 border-b">
              <h3 className="font-semibold text-gray-800">
                {getAcceptedConnections().find(c => 
                  `${c.senderId}_${c.receiverId}_${c.workPostId}` === activeChat
                )?.senderName === user.name ? 
                  getAcceptedConnections().find(c => 
                    `${c.senderId}_${c.receiverId}_${c.workPostId}` === activeChat
                  )?.receiverName :
                  getAcceptedConnections().find(c => 
                    `${c.senderId}_${c.receiverId}_${c.workPostId}` === activeChat
                  )?.senderName
                }
              </h3>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-4">
                {(chats[activeChat] || []).map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId === user.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.senderId === user.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      <p>{message.message}</p>
                      <p className="text-xs mt-1 opacity-75">
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 border-t">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={sendMessage}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {renderNotifications()}
      
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-800">WorkLink</h1>
              <span className="ml-2 text-sm text-gray-600">Worker Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user.name}</span>
              <button
                onClick={onLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'findWork', label: 'Find Work', icon: Search },
                { id: 'myProfiles', label: 'My Profiles', icon: UserIcon },
                { id: 'savedJobs', label: 'Saved Jobs', icon: Heart },
                { id: 'requests', label: 'Requests', icon: Mail },
                { id: 'messages', label: 'Messages', icon: MessageCircle, badge: unreadCount }
              ].map(({ id, label, icon: Icon, badge }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center relative ${
                    activeTab === id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {label}
                  {badge && badge > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {activeTab === 'findWork' && renderFindWork()}
        {activeTab === 'myProfiles' && renderMyProfiles()}
        {activeTab === 'savedJobs' && renderSavedJobs()}
        {activeTab === 'requests' && renderRequests()}
        {activeTab === 'messages' && renderMessages()}
      </div>
    </div>
  );
};