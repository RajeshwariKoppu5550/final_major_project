import React, { useState, useEffect } from 'react';
import { User, WorkPost, ConnectionRequest, ChatMessage } from '../types/user';
import { Search, MapPin, Clock, IndianRupee, MessageCircle, Heart, Edit, Trash2, Send, X, Check, Mail, Phone, Star, Calendar, User as UserIcon, Briefcase, Plus, Filter, Bell } from 'lucide-react';

interface ContractorDashboardProps {
  user: User;
  onLogout: () => void;
  onUpdateUser: (user: User) => void;
}

export const ContractorDashboard: React.FC<ContractorDashboardProps> = ({ user, onLogout, onUpdateUser }) => {
  const [activeTab, setActiveTab] = useState('findWorkers');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchPincode, setSearchPincode] = useState('');
  const [searchExperience, setSearchExperience] = useState('');
  const [searchWageRange, setSearchWageRange] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [workers, setWorkers] = useState<any[]>([]);
  const [savedWorkers, setSavedWorkers] = useState<any[]>([]);
  const [myWorkPosts, setMyWorkPosts] = useState<WorkPost[]>([]);
  const [connectionRequests, setConnectionRequests] = useState<ConnectionRequest[]>([]);
  const [chats, setChats] = useState<{ [key: string]: ChatMessage[] }>({});
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [editingPost, setEditingPost] = useState<WorkPost | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    workType: '',
    pincode: '',
    description: '',
    budget: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    loadData();
    // Simulate real-time message checking
    const interval = setInterval(checkForNewMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  const checkWageRange = (wage: string, range: string) => {
    const wageNum = parseInt(wage);
    switch (range) {
      case '0-500': return wageNum <= 500;
      case '500-800': return wageNum >= 500 && wageNum <= 800;
      case '800-1200': return wageNum >= 800 && wageNum <= 1200;
      case '1200+': return wageNum >= 1200;
      default: return true;
    }
  };

  const loadData = () => {
    const allWorkers = JSON.parse(localStorage.getItem('workerProfiles') || '[]');
    const allWorkPosts = JSON.parse(localStorage.getItem('workPosts') || '[]');
    const allRequests = JSON.parse(localStorage.getItem('connectionRequests') || '[]');
    const allChats = JSON.parse(localStorage.getItem('chats') || '{}');
    const userSavedWorkers = JSON.parse(localStorage.getItem(`savedWorkers_${user.id}`) || '[]');

    setWorkers(allWorkers);
    setMyWorkPosts(allWorkPosts.filter((post: WorkPost) => post.contractorId === user.id));
    setConnectionRequests(allRequests.filter((r: ConnectionRequest) => 
      r.receiverId === user.id || r.senderId === user.id
    ));
    setChats(allChats);
    setSavedWorkers(userSavedWorkers);
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

  const filteredWorkers = workers.filter(worker => {
    const matchesQuery = !searchQuery || 
      worker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      worker.skill.toLowerCase().includes(searchQuery.toLowerCase()) ||
      worker.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPincode = !searchPincode || worker.pincode.includes(searchPincode);
    const matchesExperience = !searchExperience || parseInt(worker.experience) >= parseInt(searchExperience);
    const matchesWage = !searchWageRange || checkWageRange(worker.expectedWage, searchWageRange);
    
    return matchesQuery && matchesPincode && matchesExperience && matchesWage;
  });

  const handleContactWorker = (worker: any) => {
    const existingRequest = connectionRequests.find(r => 
      r.receiverId === worker.userId && r.senderId === user.id && r.status === 'pending'
    );

    if (existingRequest) {
      alert('You have already sent a contact request to this worker.');
      return;
    }

    const newRequest: ConnectionRequest = {
      id: Date.now().toString(),
      senderId: user.id,
      receiverId: worker.userId,
      senderName: user.name,
      receiverName: worker.name,
      type: 'contractor_to_worker',
      status: 'pending',
      workPostId: '',
      workPostTitle: 'Direct Contact',
      timestamp: new Date().toISOString(),
      workerDetails: {
        name: worker.name,
        skill: worker.skill,
        experience: worker.experience,
        location: worker.pincode,
        wage: worker.expectedWage
      }
    };

    const allRequests = JSON.parse(localStorage.getItem('connectionRequests') || '[]');
    allRequests.push(newRequest);
    localStorage.setItem('connectionRequests', JSON.stringify(allRequests));

    // Send email notification
    sendEmailNotification(worker, 'contact_request', {
      contractorName: user.name,
      contractorEmail: user.email,
      message: `Contractor ${user.name} is interested in discussing a work opportunity with you.`,
      action: 'contact request'
    });

    alert(`Contact request sent to ${worker.name}! They will receive an email notification.`);
    loadData();
  };

  const sendEmailNotification = (recipient: any, type: string, data: any) => {
    const timestamp = new Date().toLocaleString('en-IN', { 
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'short'
    });

    console.log(`📧 Email sent to ${recipient.email || recipient.name}:
    
Subject: New ${data.action} on WorkLink

Dear ${recipient.name},

${data.message}

${type === 'contact_request' ? `
Contractor Details:
- Name: ${data.contractorName}
- Email: ${data.contractorEmail}

Are you interested in connecting?
[Yes, Accept] [No, Decline]
` : ''}

${type === 'job_application' ? `
Job Details:
- Title: ${data.jobTitle}
- Work Type: ${data.workType}
- Location: ${data.location}
- Budget: ${data.budget}

Worker Profile:
- Name: ${data.workerName}
- Skill: ${data.skill}
- Experience: ${data.experience} years

Do you want to connect with this worker?
[Accept] [Decline]
` : ''}

Best regards,
WorkLink Team

Time: ${timestamp} IST`);
  };

  const handleSaveWorker = (worker: any) => {
    const userSavedWorkers = JSON.parse(localStorage.getItem(`savedWorkers_${user.id}`) || '[]');
    
    if (!userSavedWorkers.find((w: any) => w.id === worker.id)) {
      userSavedWorkers.push(worker);
      localStorage.setItem(`savedWorkers_${user.id}`, JSON.stringify(userSavedWorkers));
      setSavedWorkers(userSavedWorkers);
      alert('Worker saved successfully!');
    } else {
      alert('Worker already saved!');
    }
  };

  const handleCreatePost = () => {
    if (!newPost.title || !newPost.workType || !newPost.pincode || !newPost.description || !newPost.budget) {
      alert('Please fill all required fields');
      return;
    }

    const post: WorkPost = {
      id: Date.now().toString(),
      contractorId: user.id,
      contractorName: user.name,
      title: newPost.title,
      workType: newPost.workType,
      pincode: newPost.pincode,
      description: newPost.description,
      budget: newPost.budget,
      startDate: newPost.startDate,
      endDate: newPost.endDate,
      createdAt: new Date().toISOString(),
      status: 'active'
    };

    const allWorkPosts = JSON.parse(localStorage.getItem('workPosts') || '[]');
    allWorkPosts.push(post);
    localStorage.setItem('workPosts', JSON.stringify(allWorkPosts));

    setNewPost({
      title: '',
      workType: '',
      pincode: '',
      description: '',
      budget: '',
      startDate: '',
      endDate: ''
    });
    setIsCreatingPost(false);
    loadData();
    alert('Work post created successfully!');
  };

  const handleEditPost = (post: WorkPost) => {
    setEditingPost(post);
    setNewPost({
      title: post.title,
      workType: post.workType,
      pincode: post.pincode,
      description: post.description,
      budget: post.budget,
      startDate: post.startDate || '',
      endDate: post.endDate || ''
    });
    setIsCreatingPost(true);
  };

  const handleUpdatePost = () => {
    if (!editingPost) return;

    const allWorkPosts = JSON.parse(localStorage.getItem('workPosts') || '[]');
    const updatedPosts = allWorkPosts.map((post: WorkPost) => 
      post.id === editingPost.id ? { ...post, ...newPost } : post
    );
    localStorage.setItem('workPosts', JSON.stringify(updatedPosts));
    
    setEditingPost(null);
    setIsCreatingPost(false);
    setNewPost({
      title: '',
      workType: '',
      pincode: '',
      description: '',
      budget: '',
      startDate: '',
      endDate: ''
    });
    loadData();
    alert('Work post updated successfully!');
  };

  const handleDeletePost = (postId: string) => {
    if (window.confirm('Are you sure you want to delete this work post?')) {
      const allWorkPosts = JSON.parse(localStorage.getItem('workPosts') || '[]');
      const updatedPosts = allWorkPosts.filter((post: WorkPost) => post.id !== postId);
      localStorage.setItem('workPosts', JSON.stringify(updatedPosts));
      loadData();
      alert('Work post deleted successfully!');
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
      const chatId = `${request.senderId}_${request.receiverId}_${request.workPostId || 'direct'}`;
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
    setSearchExperience('');
    setSearchWageRange('');
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
        <h3 className="text-lg font-semibold text-gray-800">Search Workers</h3>
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
          placeholder="Search by name, skill, or description..."
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Min Experience (years)</label>
            <select
              value={searchExperience}
              onChange={(e) => setSearchExperience(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Any experience</option>
              <option value="1">1+ years</option>
              <option value="3">3+ years</option>
              <option value="5">5+ years</option>
              <option value="10">10+ years</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Wage Range (₹/hour)</label>
            <select
              value={searchWageRange}
              onChange={(e) => setSearchWageRange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Any range</option>
              <option value="0-500">₹0 - ₹500</option>
              <option value="500-800">₹500 - ₹800</option>
              <option value="800-1200">₹800 - ₹1,200</option>
              <option value="1200+">₹1,200+</option>
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
                    Search Workers
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

  const renderFindWorkers = () => (
    <div className="space-y-6">
      {renderSearchBar()}

      <div className="space-y-4">
        {filteredWorkers.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">No workers found</h3>
            <p className="text-gray-500">
              {searchQuery || searchPincode || searchExperience || searchWageRange
                ? 'Try adjusting your search criteria to find more workers.'
                : 'No worker profiles available yet. Check back later for new profiles.'}
            </p>
          </div>
        ) : (
          filteredWorkers.map((worker) => (
            <div key={worker.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{worker.name}</h3>
                  <div className="flex items-center text-gray-600 mb-2">
                    <Briefcase className="w-4 h-4 mr-2" />
                    <span className="font-medium">{worker.skill}</span>
                  </div>
                  <div className="flex items-center text-gray-600 mb-2">
                    <Star className="w-4 h-4 mr-2" />
                    <span>{worker.experience} years experience</span>
                  </div>
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{worker.pincode}</span>
                  </div>
                  <div className="flex items-center text-green-600 mb-2">
                    <IndianRupee className="w-4 h-4 mr-2" />
                    <span className="font-semibold">₹{worker.expectedWage}/hour</span>
                  </div>
                  {worker.mobile && (
                    <div className="flex items-center text-gray-600 mb-2">
                      <Phone className="w-4 h-4 mr-2" />
                      <span>{worker.mobile}</span>
                    </div>
                  )}
                  <div className="flex items-center text-gray-500 text-sm">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Joined {formatTime(worker.createdAt)}</span>
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <button
                    onClick={() => handleContactWorker(worker)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
                    disabled={connectionRequests.some(r => r.receiverId === worker.userId && r.senderId === user.id && r.status === 'pending')}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    {connectionRequests.some(r => r.receiverId === worker.userId && r.senderId === user.id && r.status === 'pending') ? 'Contacted' : 'Contact'}
                  </button>
                  <button
                    onClick={() => handleSaveWorker(worker)}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors flex items-center"
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Save
                  </button>
                </div>
              </div>
              {worker.description && (
                <p className="text-gray-700">{worker.description}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderMyWorkPosts = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">My Work Posts</h3>
        <button
          onClick={() => setIsCreatingPost(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Post Work
        </button>
      </div>

      {isCreatingPost && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">
            {editingPost ? 'Edit Work Post' : 'Create New Work Post'}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
              <input
                type="text"
                value={newPost.title}
                onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                placeholder="e.g. Plumbing Work Required"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Work Type *</label>
              <input
                type="text"
                value={newPost.workType}
                onChange={(e) => setNewPost({...newPost, workType: e.target.value})}
                placeholder="e.g. Plumbing, Electrical, Carpentry"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pincode *</label>
              <input
                type="text"
                value={newPost.pincode}
                onChange={(e) => setNewPost({...newPost, pincode: e.target.value})}
                placeholder="e.g. 400001"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Budget (₹) *</label>
              <input
                type="text"
                value={newPost.budget}
                onChange={(e) => setNewPost({...newPost, budget: e.target.value})}
                placeholder="e.g. ₹15,000 - ₹25,000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={newPost.startDate}
                onChange={(e) => setNewPost({...newPost, startDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={newPost.endDate}
                onChange={(e) => setNewPost({...newPost, endDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
              <textarea
                value={newPost.description}
                onChange={(e) => setNewPost({...newPost, description: e.target.value})}
                placeholder="Describe the work requirements, location details, and any specific requirements..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex space-x-4 mt-6">
            <button
              onClick={editingPost ? handleUpdatePost : handleCreatePost}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              {editingPost ? 'Update Post' : 'Create Post'}
            </button>
            <button
              onClick={() => {
                setIsCreatingPost(false);
                setEditingPost(null);
                setNewPost({
                  title: '',
                  workType: '',
                  pincode: '',
                  description: '',
                  budget: '',
                  startDate: '',
                  endDate: ''
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
        {myWorkPosts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">No work posts yet</h3>
            <p className="text-gray-500">Create your first work post to find skilled workers.</p>
          </div>
        ) : (
          myWorkPosts.map((post) => (
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
                  <div className="flex items-center text-gray-500 text-sm">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>Posted {formatTime(post.createdAt)}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditPost(post)}
                    className="bg-blue-100 text-blue-700 p-2 rounded-md hover:bg-blue-200 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className="bg-red-100 text-red-700 p-2 rounded-md hover:bg-red-200 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-gray-700 mb-4">{post.description}</p>
              {(post.startDate || post.endDate) && (
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>
                    {post.startDate && `Start: ${new Date(post.startDate).toLocaleDateString('en-IN')}`}
                    {post.startDate && post.endDate && ' | '}
                    {post.endDate && `End: ${new Date(post.endDate).toLocaleDateString('en-IN')}`}
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderSavedWorkers = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Saved Workers</h3>
      {savedWorkers.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">No saved workers yet</h3>
          <p className="text-gray-500">Save interesting worker profiles to contact them later.</p>
        </div>
      ) : (
        savedWorkers.map((worker) => (
          <div key={worker.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{worker.name}</h3>
                <div className="flex items-center text-gray-600 mb-2">
                  <Briefcase className="w-4 h-4 mr-2" />
                  <span className="font-medium">{worker.skill}</span>
                </div>
                <div className="flex items-center text-gray-600 mb-2">
                  <Star className="w-4 h-4 mr-2" />
                  <span>{worker.experience} years experience</span>
                </div>
                <div className="flex items-center text-gray-600 mb-2">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{worker.pincode}</span>
                </div>
                <div className="flex items-center text-green-600 mb-2">
                  <IndianRupee className="w-4 h-4 mr-2" />
                  <span className="font-semibold">₹{worker.expectedWage}/hour</span>
                </div>
              </div>
              <button
                onClick={() => handleContactWorker(worker)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
                disabled={connectionRequests.some(r => r.receiverId === worker.userId && r.senderId === user.id && r.status === 'pending')}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                {connectionRequests.some(r => r.receiverId === worker.userId && r.senderId === user.id && r.status === 'pending') ? 'Contacted' : 'Contact Now'}
              </button>
            </div>
            {worker.description && (
              <p className="text-gray-700">{worker.description}</p>
            )}
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
          <p className="text-gray-500">You'll see connection requests from workers here.</p>
        </div>
      ) : (
        connectionRequests
          .filter(r => r.receiverId === user.id && r.status === 'pending')
          .map((request) => (
            <div key={request.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Application from {request.senderName}
                  </h3>
                  {request.workerDetails && (
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-gray-600">
                        <Briefcase className="w-4 h-4 mr-2" />
                        <span>{request.workerDetails.skill}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Star className="w-4 h-4 mr-2" />
                        <span>{request.workerDetails.experience} years experience</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>{request.workerDetails.location}</span>
                      </div>
                      <div className="flex items-center text-green-600">
                        <IndianRupee className="w-4 h-4 mr-2" />
                        <span>₹{request.workerDetails.wage}/hour</span>
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
            const chatId = `${connection.senderId}_${connection.receiverId}_${connection.workPostId || 'direct'}`;
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
                <div className="text-sm text-gray-500">
                  {connection.workPostTitle === 'Direct Contact' ? 'Direct Contact' : connection.workPostTitle}
                </div>
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
                  `${c.senderId}_${c.receiverId}_${c.workPostId || 'direct'}` === activeChat
                )?.senderName === user.name ? 
                  getAcceptedConnections().find(c => 
                    `${c.senderId}_${c.receiverId}_${c.workPostId || 'direct'}` === activeChat
                  )?.receiverName :
                  getAcceptedConnections().find(c => 
                    `${c.senderId}_${c.receiverId}_${c.workPostId || 'direct'}` === activeChat
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
              <span className="ml-2 text-sm text-gray-600">Contractor Dashboard</span>
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
                { id: 'findWorkers', label: 'Find Workers', icon: Search },
                { id: 'myWorkPosts', label: 'My Work Posts', icon: Briefcase },
                { id: 'savedWorkers', label: 'Saved Workers', icon: Heart },
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

        {activeTab === 'findWorkers' && renderFindWorkers()}
        {activeTab === 'myWorkPosts' && renderMyWorkPosts()}
        {activeTab === 'savedWorkers' && renderSavedWorkers()}
        {activeTab === 'requests' && renderRequests()}
        {activeTab === 'messages' && renderMessages()}
      </div>
    </div>
  );
};