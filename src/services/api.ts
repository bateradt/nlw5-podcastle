import axios from 'axios';

const api = axios.create({
  baseURL: 'http://699514e17dff.ngrok.io/',
});

export default api;
