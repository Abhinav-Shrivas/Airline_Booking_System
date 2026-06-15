import { notificationAPI } from './axios';

export async function fetchNotifications() {
  const { data } = await notificationAPI.get('/api/v1/notifications');
  return data.data;
}
