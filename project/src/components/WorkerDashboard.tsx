import React, { useState, useEffect } from 'react';
import { User, WorkPost, ConnectionRequest, ChatMessage } from '../types/user';
import { Search, MapPin, Clock, IndianRupee, MessageCircle, Heart, Edit, Trash2, Send, X, Check, Mail, Phone, Star, Calendar, User as UserIcon, Briefcase, Filter, Bell, LogOut } from 'lucide-react';

interface WorkerDashboardProps {
  user: User;
  onLogout: () => void;
  onUpdateUser: (user: User) => void;
}

export const WorkerDashboard: React.FC<WorkerDashboardProps> = ({ user, onLogout, onUpdateUser }) => {
  const [activeTab, setActiveTab] = useState('findWork');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchPincode, setSearchPincode] = useState('');
  const [workPosts, setWorkPosts] = useState<WorkPost[]>([]);
  const [savedJobs, setSavedJobs] = useState<WorkPost[]>([]);
  const [myProfiles, setMyProfiles] = useState<any[]>([]);
  const [connectionRequests, setConnectionRequests] = useState<ConnectionRequest[]>([]);
  const [chats, setChats] = useState<{ [key: string]: ChatMessage[] }>({});
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const [editingProfile, setEditingProfile] = useState<any | null>(null);
  const [newProfile, setNewProfile] = useState({
    skill: '',
    experience: '',
    pincode: '',
    expectedWage: '',
    description: '',
    mobile: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const authHeader = { 'Authorization': 'Bearer ' + localStorage.getItem('worklink_token') };
      const savedItemsUrl = `/api/saved-items?userId=${user.id}`;
      const [profilesRes, postsRes, requestsRes, chatsRes, savedRes] = await Promise.all([
        fetch('/api/worker-posts', { headers: authHeader }),
        fetch('/api/work-posts', { headers: authHeader }),
        fetch('/api/connection-requests', { headers: authHeader }),
        fetch('/api/chats', { headers: authHeader }),
        fetch(savedItemsUrl, { headers: authHeader })
      ]);

      const allProfiles = await profilesRes.json();
      const allWorkPosts = await postsRes.json();
      const allRequests = await requestsRes.json();
      const allChats = await chatsRes.json();
      const savedItemsResult = await savedRes.json();

      setWorkPosts(allWorkPosts && Array.isArray(allWorkPosts) ? allWorkPosts.filter((post: any) => post.status === 'active') : []);
      setMyProfiles(allProfiles && Array.isArray(allProfiles) ? allProfiles.filter((p: any) => p.workerId === user.id || p.userId === user.id) : []);
      setConnectionRequests(allRequests && Array.isArray(allRequests) ? allRequests.filter((r: ConnectionRequest) => 
        r.receiverId === user.id || r.senderId === user.id
      ) : []);
      setChats(allChats && typeof allChats === 'object' ? allChats : {});

      // Handle saved jobs from database
      if (Array.isArray(savedItemsResult)) {
        const savedIds = savedItemsResult
          .filter(item => item.itemType === 'job')
          .map(item => item.itemId);
        const savedWorkPosts = allWorkPosts.filter((post: any) => savedIds.includes(post.id || post._id));
        setSavedJobs(savedWorkPosts);
      }
    } catch (err) {
      console.error('Error loading data:', err);
    }
  };

  const handleSaveJob = async (workPost: WorkPost) => {
    const jobId = workPost.id || (workPost as any)._id;
    try {
      const response = await fetch('/api/saved-items', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('worklink_token')
        },
        body: JSON.stringify({
          userId: user.id,
          itemId: jobId,
          itemType: 'job'
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to save job');
      }

      await loadData();
      alert('Job saved to database successfully!');
    } catch (err: any) {
      alert(err.message === 'Already saved.' ? 'Job is already saved!' : 'Failed to save job.');
    }
  };

  const handleCreateProfile = async () => {
    if (!newProfile.skill || !newProfile.experience || !newProfile.pincode || !newProfile.expectedWage) {
      alert('Please fill all required fields');
      return;
    }

    const profileData = {
      workerId: user.id,
      name: user.name,
      ...newProfile,
      createdAt: new Date().toISOString(),
      status: 'active'
    };

    try {
      const response = await fetch('/api/worker-posts', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('worklink_token')
        },
        body: JSON.stringify(profileData)
      });
      if (!response.ok) throw new Error('Failed to create profile');
      
      setIsCreatingProfile(false);
      setNewProfile({ skill: '', experience: '', pincode: '', expectedWage: '', description: '', mobile: '' });
      await loadData();
      alert('Profile created in database successfully!');
    } catch (err) {
      alert('Failed to save profile.');
    }
  };

  const handleApplyToJob = async (post: WorkPost) => {
    const contractorId = post.contractorId || (post as any).userId;
    
    if (!contractorId) {
      alert('Cannot find contractor ID. Please try again later.');
      return;
    }

    const existingRequest = connectionRequests.find(r => 
      (r.workPostId === (post.id || (post as any)._id) && r.senderId === user.id && r.status === 'pending')
    );

    if (existingRequest) {
      alert('You have already applied for this job.');
      return;
    }

    const newRequestData = {
      senderId: user.id,
      receiverId: contractorId,
      senderName: user.name,
      receiverName: post.contractorName,
      type: 'worker_to_contractor',
      status: 'pending',
      workPostId: post.id || (post as any)._id,
      workPostTitle: post.title,
      jobDetails: {
        title: post.title,
        workType: post.workType,
        location: post.pincode,
        budget: post.budget
      }
    };

    try {
      const response = await fetch('/api/connection-requests', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('worklink_token')
        },
        body: JSON.stringify(newRequestData)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to apply for job');
      }

      await loadData();
      alert(`Successfully applied to ${post.title}!`);
    } catch (err: any) {
      alert(err.message || 'Failed to apply for job. Please try again.');
    }
  };

  const handleConnectionResponse = async (requestId: string, status: 'accepted' | 'declined') => {
    try {
      const response = await fetch(`/api/connection-requests/${requestId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('worklink_token')
        },
        body: JSON.stringify({ status })
      });
      if (!response.ok) throw new Error('Failed to update request');
      await loadData();
      alert(status === 'accepted' ? 'Connection accepted!' : 'Connection declined.');
    } catch (err) {
      alert('Failed to update connection request.');
    }
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

  const renderRequests = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-800">Connection Requests</h3>
      <div className="space-y-4">
        {connectionRequests.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
            No connection requests found.
          </div>
        ) : (
          connectionRequests.map((request) => (
            <div key={request.id || (request as any)._id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      request.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      request.status === 'accepted' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {request.status.toUpperCase()}
                    </span>
                    <span className="text-gray-400 text-xs">{formatTime(request.timestamp)}</span>
                  </div>
                  <h4 className="text-lg font-semibold">
                    {request.senderId === user.id ? `To: ${request.receiverName}` : `From: ${request.senderName}`}
                  </h4>
                  <p className="text-gray-600 text-sm">{request.workPostTitle}</p>
                  
                  {request.jobDetails && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                      <p><strong>Work:</strong> {request.jobDetails.title}</p>
                      <p><strong>Budget:</strong> {request.jobDetails.budget}</p>
                    </div>
                  )}
                </div>
                
                {request.status === 'pending' && request.receiverId === user.id && (
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleConnectionResponse(request.id || (request as any)._id, 'accepted')}
                      className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200"
                    >
                      <Check size={20} />
                    </button>
                    <button 
                      onClick={() => handleConnectionResponse(request.id || (request as any)._id, 'declined')}
                      className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                    >
                      <X size={20} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderFindWork = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Search Job Posts</h3>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, work type, or location..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div className="space-y-4">
        {workPosts.filter(p => !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.workType.toLowerCase().includes(searchQuery.toLowerCase()) || p.pincode.includes(searchQuery)).map(post => (
          <div key={post.id || post._id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">{post.title}</h3>
                <div className="text-gray-600 font-medium">{post.workType}</div>
                <div className="flex items-center text-gray-600 mt-2">
                  <MapPin size={16} className="mr-2" />
                  {post.pincode}
                </div>
                <div className="text-green-600 font-semibold mt-2">{post.budget}</div>
              </div>
              <div className="flex flex-col space-y-2">
                <button onClick={() => handleApplyToJob(post)} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Apply Now</button>
                <button onClick={() => handleSaveJob(post)} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 flex items-center">
                  <Heart size={16} className="mr-2" /> Save
                </button>
              </div>
            </div>
            <p className="text-gray-700">{post.description}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderMyProfiles = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">My Profiles</h3>
        <button onClick={() => setIsCreatingProfile(true)} className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center">
          <Briefcase size={16} className="mr-2" /> Add Profile
        </button>
      </div>
      {isCreatingProfile && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input value={newProfile.skill} onChange={e => setNewProfile({...newProfile, skill: e.target.value})} placeholder="Skill" className="w-full px-3 py-2 border rounded-md" />
            <input value={newProfile.experience} onChange={e => setNewProfile({...newProfile, experience: e.target.value})} placeholder="Experience (years)" className="w-full px-3 py-2 border rounded-md" />
            <input value={newProfile.pincode} onChange={e => setNewProfile({...newProfile, pincode: e.target.value})} placeholder="Pincode" className="w-full px-3 py-2 border rounded-md" />
            <input value={newProfile.expectedWage} onChange={e => setNewProfile({...newProfile, expectedWage: e.target.value})} placeholder="Expected Wage" className="w-full px-3 py-2 border rounded-md" />
            <input value={newProfile.mobile} onChange={e => setNewProfile({...newProfile, mobile: e.target.value})} placeholder="Mobile Number" className="w-full px-3 py-2 border rounded-md" />
          </div>
          <textarea value={newProfile.description} onChange={e => setNewProfile({...newProfile, description: e.target.value})} placeholder="Description" rows={4} className="w-full px-3 py-2 border rounded-md mt-4" />
          <div className="flex space-x-4 mt-6">
            <button onClick={handleCreateProfile} className="bg-blue-600 text-white px-6 py-2 rounded-md">Save Profile</button>
            <button onClick={() => setIsCreatingProfile(false)} className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md">Cancel</button>
          </div>
        </div>
      )}
      <div className="space-y-4">
        {myProfiles.map(p => (
            <div key={p.id || p._id} className="bg-white rounded-lg shadow-md p-6 relative">
               {connectionRequests.some(r => r.workerPostId === (p.id || p._id) && r.status === 'pending') && (
                 <div className="absolute top-2 right-2 bg-red-500 text-white text-[10px] px-2 py-1 rounded-full animate-pulse">
                   New Request!
                 </div>
               )}
               <h3 className="text-xl font-semibold text-gray-800">{p.skill}</h3>
               <p className="text-gray-600">{p.experience} years experience | {p.pincode}</p>
               <p className="font-semibold text-green-600">₹{p.expectedWage}/hour</p>
               
               {connectionRequests.filter(r => r.workerPostId === (p.id || p._id) && r.status === 'pending').length > 0 && (
                 <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                   <p className="text-sm font-medium text-blue-800 mb-2">Incoming Invitations:</p>
                   {connectionRequests.filter(r => r.workerPostId === (p.id || p._id) && r.status === 'pending').map(r => (
                     <div key={r.id || (r as any)._id} className="flex justify-between items-center py-2 border-t border-blue-100 first:border-0">
                       <span className="text-sm text-gray-700">{r.senderName}</span>
                       <button onClick={() => setActiveTab('requests')} className="text-xs text-blue-600 hover:underline">View</button>
                     </div>
                   ))}
                 </div>
               )}
            </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Worker Dashboard</h2>
            <p className="text-gray-600">Welcome back, {user.name}</p>
          </div>
          <button onClick={onLogout} className="flex items-center space-x-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg border border-red-200">
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
        <div className="mb-8 border-b">
          <nav className="flex space-x-8">
            <button onClick={() => setActiveTab('findWork')} className={`py-4 ${activeTab === 'findWork' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}>Find Jobs</button>
            <button onClick={() => setActiveTab('myProfiles')} className={`py-4 ${activeTab === 'myProfiles' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}>My Profiles</button>
            <button onClick={() => setActiveTab('requests')} className={`py-4 relative ${activeTab === 'requests' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}>
              Requests
              {connectionRequests.filter(r => r.receiverId === user.id && r.status === 'pending').length > 0 && (
                <span className="absolute top-2 -right-4 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                  {connectionRequests.filter(r => r.receiverId === user.id && r.status === 'pending').length}
                </span>
              )}
            </button>
            <button onClick={() => setActiveTab('savedJobs')} className={`py-4 ${activeTab === 'savedJobs' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}>Saved Jobs</button>
          </nav>
        </div>
        {activeTab === 'findWork' && renderFindWork()}
        {activeTab === 'myProfiles' && renderMyProfiles()}
        {activeTab === 'requests' && renderRequests()}
        {activeTab === 'savedJobs' && (
           <div className="space-y-4">
             {savedJobs.map(post => (
               <div key={post.id || post._id} className="bg-white rounded-lg shadow-md p-6">
                 <h3 className="text-xl font-semibold text-gray-800">{post.title}</h3>
                 <p className="text-gray-600">{post.workType} | {post.pincode}</p>
                 <p className="font-semibold text-green-600">{post.budget}</p>
               </div>
             ))}
           </div>
        )}
      </div>
    </div>
  );
};