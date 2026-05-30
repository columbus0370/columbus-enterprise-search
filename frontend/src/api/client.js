import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
});

export const fetchIndustries = async () => {
  const { data } = await api.get('/api/industries');
  return data.data;
};

export const searchCompanies = async (params) => {
  const { data } = await api.post('/api/search', params);
  return data;
};

export const generateProposal = async (companyInfo) => {
  const { data } = await api.post('/api/generate-proposal', companyInfo);
  return data.data;
};
