import { useCallback, useEffect, useState } from 'react';
import { fetchNotifications } from '../api/notifications';
import LoadingSpinner from '../components/LoadingSpinner';
import { extractApiError, formatDate, formatTime } from '../utils/formatters';

const TYPE_LABELS = {
  REGISTER_SUCCESFUL: { label: 'Welcome', icon: '👋' },
  BOOKING_CONFIRMED: { label: 'Booking Confirmed', icon: '✅' },
  BOOKING_CANCELLED: { label: 'Booking Cancelled', icon: '❌' },
  BOOKING_CANCELLED_NO_REFUND: { label: 'Cancelled (No Refund)', icon: '⚠️' },
  BOOKING_REFUNDED: { label: 'Refund Processed', icon: '💰' },
  BOOKING_EXPIRED: { label: 'Booking Expired', icon: '⏰' },
  PAYMENT_FAILED: { label: 'Payment Failed', icon: '💳' },
  DEPARTURE_REMINDER: { label: 'Departure Reminder', icon: '🔔' },
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchNotifications();
      setNotifications(data || []);
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  return (
    <div className="page notifications-page">
      <div className="page-header">
        <h1>Notifications</h1>
        <p>Your email notification history</p>
      </div>

      <div className="notif-info-banner">
        <span className="notif-info-icon">📧</span>
        <span>These are summaries of emails sent to you. Check your inbox for full details.</span>
      </div>

      {loading && <LoadingSpinner message="Loading notifications..." />}
      {!loading && error && <div className="empty-state error-state">{error}</div>}

      {!loading && !error && notifications.length === 0 && (
        <div className="empty-state">
          <h3>No notifications yet</h3>
          <p>You'll see your email notifications here once you make a booking.</p>
        </div>
      )}

      {!loading && !error && notifications.length > 0 && (
        <div className="notif-list">
          {notifications.map((n) => {
            const meta = TYPE_LABELS[n.type] || { label: n.type, icon: '📋' };
            return (
              <div key={n.id} className="notif-card card">
                <div className="notif-card-header">
                  <span className="notif-icon">{meta.icon}</span>
                  <span className="notif-type">{meta.label}</span>
                  <span className="notif-date">
                    {formatDate(n.sentAt || n.createdAt)} · {formatTime(n.sentAt || n.createdAt)}
                  </span>
                </div>
                <p className="notif-subject">{n.subject}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
