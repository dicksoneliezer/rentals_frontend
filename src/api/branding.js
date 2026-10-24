import api from './axios';

export const getBranding = (params = {}) => api.get('/branding', { params });
export const getMyBranding = () => api.get('/branding/me');
export const uploadLogo = (formData) => api.post('/branding/logo', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteLogo = () => api.delete('/branding/logo');
export const uploadSignature = (formData) => api.post('/branding/signature', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteSignature = () => api.delete('/branding/signature');
