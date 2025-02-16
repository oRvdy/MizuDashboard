import axios from 'axios';

const API_URL = process.env.NODE_ENV === 'production'
  ? 'https://mizuapi.com'
  : 'http://localhost:8080';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

axiosInstance.interceptors.request.use(request => {
  console.log('API Request:', {
    url: request.url,
    method: request.method,
    headers: request.headers
  });
  return request;
});

axiosInstance.interceptors.response.use(
  response => {
    console.log('API Response:', {
      status: response.status,
      url: response.config.url
    });
    return response;
  },
  error => {
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message
    });
    return Promise.reject(error);
  }
);

// Funções auxiliares
const fetchBotAPI = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const response = await axiosInstance.get(endpoint);
    return response.data;
  } catch (error) {
    console.error(`Erro na requisição para ${endpoint}:`, error);
    throw error;
  }
};

const checkBotStatus = async (): Promise<boolean> => {
  try {
    const response = await axiosInstance.get('/api/status');
    return response.data.status === 'online';
  } catch (error) {
    console.error('Erro ao verificar status:', error);
    return false;
  }
};

interface ApiClient {
  clans: {
    getAll: () => Promise<any>;
    getByTag: (tag: string) => Promise<any>;
    getUserClan: (userId: string) => Promise<any>;
    removeMember: (tag: string, discordId: string) => Promise<any>;
  };
  utils: {
    healthCheck: () => Promise<any>;
    testConnection: () => Promise<boolean>;
    fetchBotAPI: typeof fetchBotAPI;
    checkBotStatus: typeof checkBotStatus;
  };
}

const api: ApiClient = {
  clans: {
    getAll: () => 
      axiosInstance.get('/api/clans').then(res => res.data),
    
    getByTag: (tag: string) => 
      axiosInstance.get(`/api/clans/${tag}`).then(res => res.data),
    
    getUserClan: (userId: string) => 
      axiosInstance.get('/api/clans', { 
        params: { userId }
      }).then(res => res.data),

    removeMember: (tag: string, discordId: string) =>
      axiosInstance.delete(`/api/clans/${tag}/members/${discordId}`).then(res => res.data),
  },
  utils: {
    healthCheck: () => 
      axiosInstance.get('/api/status').then(res => res.data),
    
    testConnection: async () => {
      try {
        const response = await axiosInstance.get('/api/test');
        return response.data.status === 'ok';
      } catch (error) {
        console.error('Erro na conexão:', error);
        return false;
      }
    },
    fetchBotAPI,
    checkBotStatus
  }
};

export { fetchBotAPI, checkBotStatus, API_URL };
export type { ApiClient };
export default api;