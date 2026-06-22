import api from './api';

export const connect = () => api.put('/relay');

export const disconnect = () => api.delete('/relay');
