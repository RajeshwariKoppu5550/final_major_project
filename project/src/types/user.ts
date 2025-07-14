export enum UserType {
  CONTRACTOR = 'contractor',
  WORKER = 'worker'
}

export interface User {
  id: string;
  email: string;
  name: string;
  type: UserType;
  profile?: ContractorProfile | WorkerProfile;
}

export interface ContractorProfile {
  companyName: string;
  companyType: string;
  businessLocation: string;
  description?: string;
  phone?: string;
}

export interface WorkerProfile {
  skills: string[];
  experience: number;
  location: string;
  hourlyRate?: number;
  availability: string;
  bio?: string;
  phone?: string;
  pincode?: string;
  expectedWage?: number;
}

export interface WorkPost {
  id: string;
  contractorId: string;
  contractorName: string;
  workType: string;
  pincode: string;
  description: string;
  budget: {
    min: number;
    max: number;
  };
  startDate?: string;
  endDate?: string;
  createdAt: string;
  status: 'active' | 'closed';
}

export interface WorkerPost {
  id: string;
  workerId: string;
  name: string;
  skills: string[];
  experience: number;
  pincode: string;
  expectedWage: number;
  bio: string;
  phone?: string;
  createdAt: string;
  status: 'active' | 'inactive';
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface ChatConversation {
  id: string;
  participants: string[];
  participantNames: { [userId: string]: string };
  lastMessage?: ChatMessage;
  lastActivity: string;
}

export interface SavedItem {
  id: string;
  userId: string;
  itemId: string;
  itemType: 'worker' | 'job';
  savedAt: string;
}