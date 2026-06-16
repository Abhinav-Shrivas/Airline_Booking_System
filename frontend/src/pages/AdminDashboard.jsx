import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import { extractApiError } from '../utils/formatters';
import * as adminApi from '../api/admin';
import { searchFlights } from '../api/flights';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('cities');
  const [loading, setLoading] = useState(false);

  // Data states
  const [cities, setCities] = useState([]);
  const [airports, setAirports] = useState([]);
  const [airplanes, setAirplanes] = useState([]);
  const [flights, setFlights] = useState([]);

  // Form states
  const [newCity, setNewCity] = useState({ name: '' });
  const [newAirport, setNewAirport] = useState({ name: '', city_id: '', address: '' });
  const [newAirplane, setNewAirplane] = useState({ modelNo: '', capacity: '' });
  const [newFlight, setNewFlight] = useState({ 
    flightNo: '', airplaneId: '', departureAirportId: '', arrivalAirportId: '', 
    departureTime: '', arrivalTime: '', price: '', boardingGate: '' 
  });
  
  // Booking admin action state
  const [bookingActionId, setBookingActionId] = useState('');

  useEffect(() => {
    loadData(activeTab);
  }, [activeTab]);

  const loadData = async (tab) => {
    setLoading(true);
    try {
      if (tab === 'cities') {
        const data = await adminApi.getAllCities();
        setCities(data);
      } else if (tab === 'airports') {
        const data = await adminApi.getAllAirports();
        setAirports(data);
      } else if (tab === 'airplanes') {
        const data = await adminApi.getAllAirplanes();
        setAirplanes(data);
      } else if (tab === 'flights') {
        const data = await adminApi.getAllFlights();
        setFlights(data);
      }
    } catch (err) {
      showToast(extractApiError(err), 'error');
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers ---
  const handleCreateCity = async (e) => {
    e.preventDefault();
    try {
      await adminApi.createCity(newCity);
      showToast('City created successfully', 'success');
      setNewCity({ name: '' });
      loadData('cities');
    } catch (err) {
      showToast(extractApiError(err), 'error');
    }
  };

  const handleDeleteCity = async (id) => {
    if (!window.confirm('Delete city?')) return;
    try {
      await adminApi.deleteCity(id);
      showToast('City deleted', 'success');
      loadData('cities');
    } catch (err) {
      showToast(extractApiError(err), 'error');
    }
  };

  const handleCreateAirport = async (e) => {
    e.preventDefault();
    try {
      await adminApi.createAirport({
        name: newAirport.name,
        city_id: Number(newAirport.city_id),
        address: newAirport.address || undefined
      });
      showToast('Airport created successfully', 'success');
      setNewAirport({ name: '', city_id: '', address: '' });
      loadData('airports');
    } catch (err) {
      showToast(extractApiError(err), 'error');
    }
  };

  const handleDeleteAirport = async (id) => {
    if (!window.confirm('Delete airport?')) return;
    try {
      await adminApi.deleteAirport(id);
      showToast('Airport deleted', 'success');
      loadData('airports');
    } catch (err) {
      showToast(extractApiError(err), 'error');
    }
  };

  const handleCreateAirplane = async (e) => {
    e.preventDefault();
    try {
      await adminApi.createAirplane({
        modelNo: newAirplane.modelNo,
        capacity: Number(newAirplane.capacity)
      });
      showToast('Airplane created successfully', 'success');
      setNewAirplane({ modelNo: '', capacity: '' });
      loadData('airplanes');
    } catch (err) {
      showToast(extractApiError(err), 'error');
    }
  };

  const handleDeleteAirplane = async (id) => {
    if (!window.confirm('Delete airplane?')) return;
    try {
      await adminApi.deleteAirplane(id);
      showToast('Airplane deleted', 'success');
      loadData('airplanes');
    } catch (err) {
      showToast(extractApiError(err), 'error');
    }
  };

  const handleCreateFlight = async (e) => {
    e.preventDefault();
    try {
      await adminApi.createFlight({
        ...newFlight,
        airplaneId: Number(newFlight.airplaneId),
        departureAirportId: Number(newFlight.departureAirportId),
        arrivalAirportId: Number(newFlight.arrivalAirportId),
        price: Number(newFlight.price)
      });
      showToast('Flight created successfully', 'success');
      setNewFlight({ flightNo: '', airplaneId: '', departureAirportId: '', arrivalAirportId: '', departureTime: '', arrivalTime: '', price: '', boardingGate: '' });
      loadData('flights');
    } catch (err) {
      showToast(extractApiError(err), 'error');
    }
  };

  const handleDeleteFlight = async (id) => {
    if (!window.confirm('Delete flight?')) return;
    try {
      await adminApi.deleteFlight(id);
      showToast('Flight deleted', 'success');
      loadData('flights');
    } catch (err) {
      showToast(extractApiError(err), 'error');
    }
  };

  const handleAdminBookingAction = async (action) => {
    if (!bookingActionId) return showToast('Please enter a Booking ID', 'error');
    if (!window.confirm(`Are you sure you want to perform an Admin ${action} on Booking #${bookingActionId}?`)) return;
    
    try {
      if (action === 'CANCEL') {
        await adminApi.adminCancelBooking(bookingActionId);
        showToast('Booking cancelled by admin successfully (no refund)', 'success');
      } else if (action === 'REFUND') {
        await adminApi.adminRefundBooking(bookingActionId);
        showToast('Booking refunded by admin successfully (bypassed 24h rule)', 'success');
      }
      setBookingActionId('');
    } catch (err) {
      showToast(extractApiError(err), 'error');
    }
  };

  if (!user?.roles?.includes('ADMIN')) {
    return <div className="page"><div className="empty-state error-state">Access Denied. Admins only.</div></div>;
  }

  return (
    <div className="page admin-dashboard">
      <div className="page-header">
        <h1>Admin Dashboard</h1>
        <p>Manage system entities, flights, and override bookings.</p>
      </div>

      <div className="admin-tabs" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
        {['cities', 'airports', 'airplanes', 'flights', 'bookings'].map(tab => (
          <button 
            key={tab} 
            className={`btn ${activeTab === tab ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Loading {activeTab}...</p>
      ) : (
        <div className="admin-content card">
          {activeTab === 'cities' && (
            <div>
              <h2>Manage Cities</h2>
              <form className="form-group" onSubmit={handleCreateCity} style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <label>City Name</label>
                  <input required value={newCity.name} onChange={e => setNewCity({ ...newCity, name: e.target.value })} />
                </div>
                <button className="btn btn-primary" type="submit">Add City</button>
              </form>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--color-border)', textAlign: 'left' }}>
                    <th>ID</th><th>Name</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cities.map(c => (
                    <tr key={c.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '0.5rem 0' }}>{c.id}</td>
                      <td>{c.name}</td>
                      <td><button className="btn btn-sm btn-outline" onClick={() => handleDeleteCity(c.id)}>Delete</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'airports' && (
            <div>
              <h2>Manage Airports</h2>
              <form className="form-group" onSubmit={handleCreateAirport} style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <div>
                  <label>Name</label>
                  <input required value={newAirport.name} onChange={e => setNewAirport({ ...newAirport, name: e.target.value })} />
                </div>
                <div>
                  <label>City ID</label>
                  <input type="number" required value={newAirport.city_id} onChange={e => setNewAirport({ ...newAirport, city_id: e.target.value })} />
                </div>
                <div>
                  <label>Address</label>
                  <input value={newAirport.address} onChange={e => setNewAirport({ ...newAirport, address: e.target.value })} />
                </div>
                <button className="btn btn-primary" type="submit">Add Airport</button>
              </form>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--color-border)', textAlign: 'left' }}>
                    <th>ID</th><th>Name</th><th>City ID</th><th>Address</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {airports.map(a => (
                    <tr key={a.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '0.5rem 0' }}>{a.id}</td>
                      <td>{a.name}</td>
                      <td>{a.city_id}</td>
                      <td>{a.address}</td>
                      <td><button className="btn btn-sm btn-outline" onClick={() => handleDeleteAirport(a.id)}>Delete</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'airplanes' && (
            <div>
              <h2>Manage Airplanes</h2>
              <form className="form-group" onSubmit={handleCreateAirplane} style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                <div>
                  <label>Model Number</label>
                  <input required value={newAirplane.modelNo} onChange={e => setNewAirplane({ ...newAirplane, modelNo: e.target.value })} />
                </div>
                <div>
                  <label>Capacity</label>
                  <input type="number" required value={newAirplane.capacity} onChange={e => setNewAirplane({ ...newAirplane, capacity: e.target.value })} />
                </div>
                <button className="btn btn-primary" type="submit">Add Airplane</button>
              </form>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--color-border)', textAlign: 'left' }}>
                    <th>ID</th><th>Model</th><th>Capacity</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {airplanes.map(a => (
                    <tr key={a.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '0.5rem 0' }}>{a.id}</td>
                      <td>{a.ModelNo || a.modelNo}</td>
                      <td>{a.capacity}</td>
                      <td><button className="btn btn-sm btn-outline" onClick={() => handleDeleteAirplane(a.id)}>Delete</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'flights' && (
            <div>
              <h2>Manage Flights</h2>
              <form className="form-group" onSubmit={handleCreateFlight} style={{ marginBottom: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label>Flight No</label>
                  <input required value={newFlight.flightNo} onChange={e => setNewFlight({ ...newFlight, flightNo: e.target.value })} />
                </div>
                <div>
                  <label>Airplane ID</label>
                  <input type="number" required value={newFlight.airplaneId} onChange={e => setNewFlight({ ...newFlight, airplaneId: e.target.value })} />
                </div>
                <div>
                  <label>Dep. Airport ID</label>
                  <input type="number" required value={newFlight.departureAirportId} onChange={e => setNewFlight({ ...newFlight, departureAirportId: e.target.value })} />
                </div>
                <div>
                  <label>Arr. Airport ID</label>
                  <input type="number" required value={newFlight.arrivalAirportId} onChange={e => setNewFlight({ ...newFlight, arrivalAirportId: e.target.value })} />
                </div>
                <div>
                  <label>Dep. Time</label>
                  <input type="datetime-local" required value={newFlight.departureTime} onChange={e => setNewFlight({ ...newFlight, departureTime: e.target.value })} />
                </div>
                <div>
                  <label>Arr. Time</label>
                  <input type="datetime-local" required value={newFlight.arrivalTime} onChange={e => setNewFlight({ ...newFlight, arrivalTime: e.target.value })} />
                </div>
                <div>
                  <label>Price</label>
                  <input type="number" required value={newFlight.price} onChange={e => setNewFlight({ ...newFlight, price: e.target.value })} />
                </div>
                <div>
                  <label>Gate</label>
                  <input value={newFlight.boardingGate} onChange={e => setNewFlight({ ...newFlight, boardingGate: e.target.value })} />
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <button className="btn btn-primary" type="submit">Add Flight</button>
                </div>
              </form>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--color-border)', textAlign: 'left' }}>
                    <th>ID</th><th>Flight No</th><th>From (Airport ID)</th><th>To (Airport ID)</th><th>Departs</th><th>Arrives</th><th>Price</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {flights.map(f => (
                    <tr key={f.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '0.5rem 0' }}>{f.id}</td>
                      <td>{f.flightNo}</td>
                      <td>{f.departure_airport_id}</td>
                      <td>{f.arrival_airport_id}</td>
                      <td>{new Date(f.departureTime).toLocaleString()}</td>
                      <td>{new Date(f.arrivalTime).toLocaleString()}</td>
                      <td>{f.price}</td>
                      <td><button className="btn btn-sm btn-outline" onClick={() => handleDeleteFlight(f.id)}>Delete</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div>
              <h2>Override Bookings</h2>
              <p className="muted">Force cancel or refund a user's booking, bypassing all validation rules.</p>
              
              <div className="form-group" style={{ maxWidth: '400px', marginTop: '1.5rem' }}>
                <label>Booking ID</label>
                <input 
                  type="number" 
                  value={bookingActionId} 
                  onChange={e => setBookingActionId(e.target.value)} 
                  placeholder="Enter Booking ID to override"
                />
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button 
                  className="btn btn-outline" 
                  style={{ borderColor: 'var(--color-error)', color: 'var(--color-error)' }}
                  onClick={() => handleAdminBookingAction('CANCEL')}
                >
                  Force Cancel (No Refund)
                </button>
                <button 
                  className="btn btn-outline" 
                  style={{ borderColor: 'var(--color-warning)', color: 'var(--color-warning)' }}
                  onClick={() => handleAdminBookingAction('REFUND')}
                >
                  Force Cancel & Refund
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
