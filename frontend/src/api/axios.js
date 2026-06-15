import axios from 'axios';
import {
  AUTH_SERVICE_URL,
  FLIGHT_SERVICE_URL,
  BOOKING_SERVICE_URL,
  NOTIFICATION_SERVICE_URL,
} from '../utils/constants';

let getAccessToken = () => null;
let setAccessToken = () => {};
let onLogout = () => {};

let isRefreshing = false;
let refreshSubscribers = [];

let firstRequestPending = false;
let firstRequestListeners = new Set();

export function subscribeFirstRequest(listener) {
  firstRequestListeners.add(listener);
  return () => firstRequestListeners.delete(listener);
}

export function isFirstRequestPending() {
  return firstRequestPending;
}

function notifyFirstRequest(pending) {
  firstRequestPending = pending;
  firstRequestListeners.forEach((listener) => listener(pending));
}

function subscribeTokenRefresh(callback) {
  refreshSubscribers.push(callback);
}

function onRefreshed(token) {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
}

export function configureAuth({ getToken, setToken, logout }) {
  getAccessToken = getToken;
  setAccessToken = setToken;
  onLogout = logout;
}

export const authAPI = axios.create({
  baseURL: AUTH_SERVICE_URL,
  withCredentials: true,
});

export const flightAPI = axios.create({
  baseURL: FLIGHT_SERVICE_URL,
  withCredentials: true,
});

export const bookingAPI = axios.create({
  baseURL: BOOKING_SERVICE_URL,
  withCredentials: true,
});

export const notificationAPI = axios.create({
  baseURL: NOTIFICATION_SERVICE_URL,
  withCredentials: true,
});

const apiInstances = [authAPI, flightAPI, bookingAPI, notificationAPI];

let hasMadeRequest = false;

function attachInterceptors(instance) {
  instance.interceptors.request.use((config) => {
    if (!hasMadeRequest) {
      hasMadeRequest = true;
      notifyFirstRequest(true);
    }

    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  instance.interceptors.response.use(
    (response) => {
      notifyFirstRequest(false);
      return response;
    },
    async (error) => {
      notifyFirstRequest(false);
      const originalRequest = error.config;

      if (
        error.response?.status === 401 &&
        !originalRequest._retry &&
        !originalRequest.url?.includes('/auth/refresh') &&
        !originalRequest.url?.includes('/auth/login') &&
        !originalRequest.url?.includes('/auth/register')
      ) {
        if (isRefreshing) {
          return new Promise((resolve) => {
            subscribeTokenRefresh((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(instance(originalRequest));
            });
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const { data } = await authAPI.post('/api/v1/auth/refresh');
          const newToken = data.data.accessToken;
          setAccessToken(newToken);
          onRefreshed(newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return instance(originalRequest);
        } catch (refreshError) {
          onLogout();
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );
}

apiInstances.forEach(attachInterceptors);
