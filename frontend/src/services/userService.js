import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const getToken = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return user?.token || null;
};

const getHeaders = () => ({
    'Authorization': `Bearer ${getToken()}`,
    'Content-Type': 'application/json',
});

const userService = {
    getAll: () => axios.get(`${API_URL}/users`, { headers: getHeaders() }),
    getById: (id) => axios.get(`${API_URL}/users/${id}`, { headers: getHeaders() }),
    create: (data) => axios.post(`${API_URL}/users`, data, { headers: getHeaders() }),
    update: (id, data) => axios.put(`${API_URL}/users/${id}`, data, { headers: getHeaders() }),
    delete: (id) => axios.delete(`${API_URL}/users/${id}`, { headers: getHeaders() }),
};

export default userService;
