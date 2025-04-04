import axios from 'axios';

// Create an axios instance with defaults
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`);
    
    const token = localStorage.getItem('token');
    if (token) {
      console.log(`Adding token to request: ${config.url}`);
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn(`No token available for request: ${config.url}`);
    }
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.method.toUpperCase()} ${response.config.url}`, 
      response.data ? JSON.stringify(response.data) : '');
    return response;
  },
  (error) => {
    // Log error details
    console.error('API Response Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data
    });
    
    // Handle session expiration
    if (error.response && error.response.status === 401) {
      // Check if not login or register request
      if (!error.config.url.includes('/auth/')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login?expired=true';
      }
    }
    
    // Enhanced error messages for better debugging
    const enhancedError = error;
    enhancedError.friendlyMessage = 
      error.response?.data?.message || 
      'An error occurred. Please try again later.';
    
    return Promise.reject(enhancedError);
  }
);

// Helper to extract just the data from response
const responseBody = (response) => response.data;

// Define API requests
const requests = {
  get: (url) => api.get(url).then(responseBody),
  post: (url, body) => api.post(url, body).then(responseBody),
  put: (url, body) => api.put(url, body).then(responseBody),
  delete: (url) => api.delete(url).then(responseBody),
};

// Auth related requests
const Auth = {
  login: (email, password) => 
    requests.post('/auth/login', { email, password }),
  register: (name, email, password, role = 'voter') => 
    requests.post('/auth/register', { name, email, password, role }),
  verifyToken: () => {
    console.log("Calling /auth/verify with token", 
      localStorage.getItem('token') ? "present" : "missing");
    return requests.get('/auth/verify')
      .then(data => {
        console.log("Token verification successful:", data);
        return data;
      })
      .catch(err => {
        console.error("Token verification failed:", err);
        throw err;
      });
  }
};

// Poll related requests
const Polls = {
  getAll: () => 
    requests.get('/polls'),
  getById: (id) => 
    requests.get(`/polls/${id}`),
  getOngoing: () => 
    requests.get('/polls/ongoing'),
  getPast: () => 
    requests.get('/polls/past'),
  getPending: () => 
    requests.get('/polls/pending'),
  create: (pollData) => 
    requests.post('/polls/create', pollData),
  update: (id, pollData) => 
    requests.put(`/polls/${id}`, pollData),
  delete: (id) => 
    requests.delete(`/polls/${id}`),
  start: (id) => 
    requests.put(`/polls/${id}/start`),
  end: (id) => 
    requests.put(`/polls/${id}/end`),
  getResults: (id) => 
    requests.get(`/polls/${id}/results`),
};

// Vote related requests
const Votes = {
  create: (voteData) => 
    requests.post('/votes', voteData),
  getUserVotes: () => 
    requests.get('/votes/user'),
  checkUserVoted: (pollId) => 
    requests.get(`/votes/user/${pollId}`),
};

// User profile requests
const User = {
  getCurrent: () => 
    requests.get('/users/profile'),
  update: (userData) => 
    requests.put('/users/profile', userData),
  getAll: () => 
    requests.get('/users'),
};

export default api;
export { Auth, Polls, Votes, User }; 