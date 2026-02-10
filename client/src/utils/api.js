const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('token');
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || '请求失败');
  return data;
}

export const api = {
  // Auth
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  getMe: () => request('/auth/me'),

  // Shops
  getShops: () => request('/shops'),
  getShop: (id) => request(`/shops/${id}`),
  getMyShop: () => request('/shops/owner/mine'),
  createShop: (body) => request('/shops', { method: 'POST', body: JSON.stringify(body) }),
  updateShop: (id, body) => request(`/shops/${id}`, { method: 'PUT', body: JSON.stringify(body) }),

  // Services
  addService: (body) => request('/services', { method: 'POST', body: JSON.stringify(body) }),
  updateService: (id, body) => request(`/services/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteService: (id) => request(`/services/${id}`, { method: 'DELETE' }),

  // Appointments
  getSlots: (shop_id, date) => request(`/appointments/slots?shop_id=${shop_id}&date=${date}`),
  createAppointment: (body) => request('/appointments', { method: 'POST', body: JSON.stringify(body) }),
  getMyAppointments: () => request('/appointments/mine'),
  getShopAppointments: (query = '') => request(`/appointments/shop${query ? '?' + query : ''}`),
  updateAppointmentStatus: (id, status) => request(`/appointments/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  cancelAppointment: (id) => request(`/appointments/${id}/cancel`, { method: 'PUT' }),
  addReview: (id, body) => request(`/appointments/${id}/review`, { method: 'POST', body: JSON.stringify(body) }),
};
