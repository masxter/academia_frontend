import axios from 'axios';

const api = axios.create({
  baseURL: 'https://academia-backend-production-d035.up.railway.app/', 
  //baseURL: 'http://localhost:3001'
});

export default api;