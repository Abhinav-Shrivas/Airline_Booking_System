import { authAPI } from './axios';

export async function register({ name, email, password }) {
  const { data } = await authAPI.post('/api/v1/auth/register', {
    name,
    email,
    password,
  });
  return data;
}

export async function login({ email, password }) {
  const { data } = await authAPI.post('/api/v1/auth/login', { email, password });
  return data;
}

export async function refreshToken() {
  const { data } = await authAPI.post('/api/v1/auth/refresh');
  return data;
}

export async function logout() {
  const { data } = await authAPI.post('/api/v1/auth/logout');
  return data;
}

export async function fetchUser(userId, accessToken) {
  const { data } = await authAPI.get(`/api/v1/users/${userId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data;
}

export async function sendOtp(email) {
  const { data } = await authAPI.post('/api/v1/auth/sendOtp', { email });
  return data;
}

export async function verifyOtp({ otpId, otp }) {
  const { data } = await authAPI.post('/api/v1/auth/verifyOtp', { otpId, otp: Number(otp) });
  return data;
}

export async function resetPassword({ resetToken, newPassword }) {
  const { data } = await authAPI.patch('/api/v1/auth/change-password-using-token', { newPassword }, {
    headers: { Authorization: `Bearer ${resetToken}` },
  });
  return data;
}

export function getGoogleAuthUrl() {
  return `${import.meta.env.VITE_AUTH_SERVICE_URL}/api/v1/auth/google`;
}
