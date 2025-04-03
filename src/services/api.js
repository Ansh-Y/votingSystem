import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 (Unauthorized) errors
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (name, email, password, role) => api.post('/auth/register', { name, email, password, role })
};

// Polls API calls
export const pollsAPI = {
  getOngoingPolls: () => api.get('/polls/ongoing'),
  getPollDetails: (id) => api.get(`/polls/${id}`),
  createPoll: (pollData) => api.post('/polls/create', pollData),
  endPoll: (id) => api.put(`/polls/${id}/end`),
  vote: (pollId, candidateId) => api.post(`/polls/${pollId}/vote`, { candidateId }),
  getResults: (id) => api.get(`/polls/${id}/results`)
};

export default api; 