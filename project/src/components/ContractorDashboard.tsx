import React, { useState, useEffect } from 'react';
import { User, WorkPost, ConnectionRequest, ChatMessage } from '../types/user';
import { Search, MapPin, Clock, IndianRupee, MessageCircle, Heart, Edit, Trash2, Send, X, Check, Mail, Phone, Star, Calendar, User as UserIcon, Briefcase, Plus, Filter, Bell, LogOut } from 'lucide-react';

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

  const loadData = async () => {
    try {
      const authHeader = { 'Authorization': 'Bearer ' + localStorage.getItem('worklink_token') };
      const savedItemsUrl = `/api/saved-items?userId=${user.id}`;
      const [postsRes, profilesRes, requestsRes, chatsRes, savedRes] = await Promise.all([
        fetch('/api/work-posts', { headers: authHeader }),
        fetch('/api/worker-posts', { headers: authHeader }),
        fetch('/api/connection-requests', { headers: authHeader }),
        fetch('/api/chats', { headers: authHeader }),
        fetch(savedItemsUrl, { headers: authHeader })
      ]);

      const allWorkPosts = await postsRes.json();
      const allWorkerProfiles = await profilesRes.json();
      const allRequests = await requestsRes.json();
      const allChats = await chatsRes.json();
      const savedItemsResult = await savedRes.json();

      setMyWorkPosts(allWorkPosts && Array.isArray(allWorkPosts) ? allWorkPosts.filter((post: any) => post.contractorId === user.id || post.userId === user.id) : []);
      setWorkers(allWorkerProfiles && Array.isArray(allWorkerProfiles) ? allWorkerProfiles.filter((p: any) => p.status === 'active') : []);
      setConnectionRequests(allRequests && Array.isArray(allRequests) ? allRequests.filter((r: ConnectionRequest) => 
        r.receiverId === user.id || r.senderId === user.id
      ) : []);
      setChats(allChats && typeof allChats === 'object' ? allChats : {});

      // Handle saved workers from database
      if (Array.isArray(savedItemsResult)) {
        const savedIds = savedItemsResult
          .filter(item => item.itemType === 'worker')
          .map(item => item.itemId);
        const savedProfiles = allWorkerProfiles.filter((p: any) => savedIds.includes(p.id || p._id));
        setSavedWorkers(savedProfiles);
      }

      calculateUnreadMessages(allChats);
    } catch (err) {
      console.error('Error loading data:', err);
    }
  };

  const checkForNewMessages = () => {
    const allChats = chats; // Use current state or fetch again
    calculateUnreadMessages(allChats);
  };

  const calculateUnreadMessages = (allChats: any) => {
    let count = 0;
    Object.keys(allChats).forEach(chatId => {
      const messages = allChats[chatId];
      if (Array.isArray(messages)) {
        count += messages.filter((msg: ChatMessage) => 
          msg.senderId !== user.id && !msg.read
        ).length;
      }
    });
    setUnreadCount(count);
  };

  const showMessageNotification = (message: ChatMessage) => {
    const notification = {
      id: Date.now().toString(),
      type: 'message',
      title: 'New Message',
      message: `New message from ${message.senderName}`,
      timestamp: new Date().toISOString()
    };
    setNotifications(prev => [notification, ...prev.slice(0, 4)]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
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
    // In real app, post to /api/connection-requests
    alert(`Contact request sent to ${worker.name}!`);
  };

  const handleSaveWorker = async (worker: any) => {
    const workerId = worker.id || worker._id;
    try {
      const response = await fetch('/api/saved-items', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('worklink_token')
        },
        body: JSON.stringify({
          userId: user.id,
          itemId: workerId,
          itemType: 'worker'
        })
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to save candidate');
      }
      await loadData();
      alert('Candidate saved successfully to database!');
    } catch (err: any) {
      alert(err.message === 'Already saved.' ? 'Candidate already saved!' : 'Failed to save candidate.');
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.title || !newPost.workType || !newPost.pincode || !newPost.description || !newPost.budget) {
      alert('Please fill all required fields');
      return;
    }
    const postData = {
      contractorId: user.id,
      contractorName: user.name,
      ...newPost,
      createdAt: new Date().toISOString(),
      status: 'active'
    };
    try {
      const response = await fetch('/api/work-posts', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('worklink_token')
        },
        body: JSON.stringify(postData)
      });
      if (!response.ok) throw new Error('Failed to create post');
      setIsCreatingPost(false);
      setNewPost({ title: '', workType: '', pincode: '', description: '', budget: '', startDate: '', endDate: '' });
      await loadData();
      alert('Work post created successfully!');
    } catch (err) {
      alert('Failed to save work post.');
    }
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

  const handleUpdatePost = async () => {
    if (!editingPost) return;
    try {
      const response = await fetch(`/api/work-posts/${editingPost.id || editingPost._id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('worklink_token')
        },
        body: JSON.stringify(newPost)
      });
      if (!response.ok) throw new Error('Failed to update post');
      setEditingPost(null);
      setIsCreatingPost(false);
      setNewPost({ title: '', workType: '', pincode: '', description: '', budget: '', startDate: '', endDate: '' });
      await loadData();
      alert('Work post updated successfully!');
    } catch (err) {
      alert('Failed to update work post.');
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (window.confirm('Are you sure you want to delete this work post?')) {
      try {
        const response = await fetch(`/api/work-posts/${postId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('worklink_token')
          }
        });
        if (!response.ok) throw new Error('Failed to delete post');
        await loadData();
        alert('Work post deleted.');
      } catch (err) {
        alert('Failed to delete work post.');
      }
    }
  };

  const handleConnectionResponse = (requestId: string, response: 'accepted' | 'declined') => {
    // In real app, patch /api/connection-requests/:id
    loadData();
    alert(response === 'accepted' ? 'Connection accepted!' : 'Connection declined.');
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !activeChat) return;
    // In real app, post to /api/messages
    setNewMessage('');
  };

  const markMessagesAsRead = (chatId: string) => {
    // In real app, patch /api/messages/read
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

  const renderSearchBar = () => (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Search Workers</h3>
        <button onClick={() => setShowFilters(!showFilters)} className="flex items-center space-x-2 text-blue-600 hover:text-blue-700">
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
          <div className="md:col-span-3 flex justify-end">
            <button
               onClick={() => setShowFilters(false)}
               className="text-gray-600 hover:text-gray-800 text-sm px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Close Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderFindWorkers = () => (
    <div className="space-y-6">
      {renderSearchBar()}
      <div className="space-y-4">
        {filteredWorkers.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p>No workers found.</p>
          </div>
        ) : (
          filteredWorkers.map((worker) => (
            <div key={worker.id || worker._id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">{worker.name}</h3>
                  <div className="text-gray-600">{worker.skill}</div>
                  <div className="text-gray-600">{worker.experience} years exp</div>
                  <div className="text-green-600 font-semibold">₹{worker.expectedWage}/hour</div>
                </div>
                <div className="flex flex-col space-y-2">
                  <button onClick={() => handleContactWorker(worker)} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">Contact</button>
                  <button onClick={() => handleSaveWorker(worker)} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors flex items-center">
                    <Heart className="w-4 h-4 mr-2" /> Save
                  </button>
                </div>
              </div>
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
        <button onClick={() => setIsCreatingPost(true)} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center">
          <Plus className="w-4 h-4 mr-2" /> Post Work
        </button>
      </div>
      {isCreatingPost && (
        <div className="bg-white rounded-lg shadow-md p-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <input value={newPost.title} onChange={e => setNewPost({...newPost, title: e.target.value})} placeholder="Title" className="w-full px-3 py-2 border rounded-md" />
             <input value={newPost.workType} onChange={e => setNewPost({...newPost, workType: e.target.value})} placeholder="Work Type" className="w-full px-3 py-2 border rounded-md" />
             <input value={newPost.pincode} onChange={e => setNewPost({...newPost, pincode: e.target.value})} placeholder="Pincode" className="w-full px-3 py-2 border rounded-md" />
             <input value={newPost.budget} onChange={e => setNewPost({...newPost, budget: e.target.value})} placeholder="Budget" className="w-full px-3 py-2 border rounded-md" />
           </div>
           <textarea value={newPost.description} onChange={e => setNewPost({...newPost, description: e.target.value})} placeholder="Description" rows={4} className="w-full px-3 py-2 border rounded-md mt-4" />
           <div className="flex space-x-4 mt-6">
             <button onClick={editingPost ? handleUpdatePost : handleCreatePost} className="bg-blue-600 text-white px-6 py-2 rounded-md">{editingPost ? 'Update' : 'Create'}</button>
             <button onClick={() => setIsCreatingPost(false)} className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md">Cancel</button>
           </div>
        </div>
      )}
      <div className="space-y-4">
        {myWorkPosts.map(post => (
          <div key={post.id || post._id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between">
              <h3 className="text-xl font-semibold">{post.title}</h3>
              <div className="flex space-x-2">
                <button onClick={() => handleEditPost(post)} className="text-blue-600"><Edit size={18} /></button>
                <button onClick={() => handleDeletePost(post.id || post._id || '')} className="text-red-600"><Trash2 size={18} /></button>
              </div>
            </div>
            <p className="text-gray-600">{post.workType} | {post.pincode}</p>
            <p className="font-semibold text-green-600">{post.budget}</p>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center bg-white p-6 rounded-lg shadow-sm">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Contractor Dashboard</h2>
            <p className="text-gray-600">Welcome back, {user.name}</p>
          </div>
          <button onClick={onLogout} className="flex items-center space-x-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg border border-red-200">
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
        <div className="mb-8 border-b">
          <nav className="flex space-x-8">
            <button onClick={() => setActiveTab('findWorkers')} className={`py-4 ${activeTab === 'findWorkers' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}>Find Workers</button>
            <button onClick={() => setActiveTab('myWorkPosts')} className={`py-4 ${activeTab === 'myWorkPosts' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}>My Work Posts</button>
          </nav>
        </div>
        {activeTab === 'findWorkers' && renderFindWorkers()}
        {activeTab === 'myWorkPosts' && renderMyWorkPosts()}
      </div>
    </div>
  );
};