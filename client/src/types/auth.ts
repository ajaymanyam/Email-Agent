export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  preferences: {
    defaultTone: 'professional' | 'friendly' | 'formal' | 'concise';
    theme: 'light' | 'dark' | 'system';
    emailsPerPage: number;
    autoSummarize: boolean;
    notificationsEnabled: boolean;
  };
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
