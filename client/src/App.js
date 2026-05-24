import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [view, setView] = useState('landing'); // landing, staff_dashboard, customer_dashboard
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [customerCompany, setCustomerCompany] = useState('');
  const [shipments, setShipments] = useState([]);
  const [searchId, setSearchId] = useState('');
  const [selectedShipmentId, setSelectedShipmentId] = useState(null);

  // Form state for creating a shipment
  const [formData, setFormData] = useState({
    itemName: '', senderName: '', source: '', destination: ''
  });

  // --- STAFF FUNCTIONS works here ---
  const handleStaffLogin = () => {
    if (password === "yakshu123") { // password that i have created 
      fetchStaffShipments();
      setView('staff_dashboard');
    } else {
      alert("Wrong password!");
    }
  };
   
  const fetchStaffShipments = async () => {
  try {
    const res = await axios.get('http://localhost:5000/api/staff/shipments');
    setShipments(res.data);
  } catch (error) {
    console.error("Connection failed:", error);
    alert("Backend not responding. Please check if your server terminal is running 'node server.js'");
  }
};
  
  const createShipment = async (e) => {
  e.preventDefault();
  try {
    await axios.post('http://localhost:5000/api/shipments', formData);
    alert("Shipment Created!");
    fetchStaffShipments(); // Refreshing the list of all shipment that i have created
  } catch (error) {
    console.error("Create failed:", error);
    alert("Failed to create shipment. Is the backend server still running?");
  }
};

  

  const updateStatus = async (id, status) => {
    await axios.patch(`http://localhost:5000/api/shipments/${id}`, { status });
    fetchStaffShipments();
  };

  // --- CUSTOMER FUNCTIONS starts here ---
  const handleCustomerLogin = async () => {
    if (!companyName.trim()) {
      alert('Please enter your company name.');
      return;
    }

    try {
      const res = await axios.get(`http://localhost:5000/api/customer/shipments?companyName=${encodeURIComponent(companyName.trim())}`);
      setShipments(res.data);
      setCustomerCompany(companyName.trim());
      setSearchId('');
      setSelectedShipmentId(null);
      setView('customer_dashboard');
    } catch (error) {
      console.error('Customer lookup failed:', error);
      alert('Unable to reach the backend. Please ensure the server is running.');
    }
  };

  // Filter for Customer Search 
  const filteredShipments = shipments.filter(s => s.trackingId.toLowerCase().includes(searchId.toLowerCase()));

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-gray-800">
      {/* LANDING PAGE  */}
      {view === 'landing' && (
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold text-blue-600 mb-6 text-center">ShipTrack</h1>
          
          <div className="mb-8 p-4 border rounded">
            <h2 className="font-bold mb-2">Staff Portal</h2>
            <input type="password" placeholder="Enter Password" title="Staff Password"
              className="border p-2 w-full mb-2" onChange={(e) => setPassword(e.target.value)} />
            <button onClick={handleStaffLogin} className="w-full bg-blue-500 text-white p-2 rounded">Staff Login</button>
          </div>

          <div className="p-4 border rounded">
            <h2 className="font-bold mb-2">Customer Portal</h2>
            <input
              value={companyName}
              placeholder="Enter Company Name"
              title="Customer Login"
              className="border p-2 w-full mb-2"
              onChange={(e) => setCompanyName(e.target.value)}
            />
            <button onClick={handleCustomerLogin} className="w-full bg-green-500 text-white p-2 rounded">Track My Shipments</button>
          </div>
        </div>
      )}

      {/* STAFF DASHBOARD starts Here*/}
      {view === 'staff_dashboard' && (
        <div>
          <div className="flex justify-between mb-6">
            <h2 className="text-2xl font-bold">Logistics Staff Dashboard</h2>
            <button onClick={() => setView('landing')} className="text-red-500 underline">Logout</button>
          </div>

          {/* Creating Shipment Form  */}
          <form onSubmit={createShipment} className="bg-white p-6 rounded shadow mb-8 grid grid-cols-2 gap-4">
            <input placeholder="Item Name" required className="border p-2" onChange={(e) => setFormData({...formData, itemName: e.target.value})} />
            <input placeholder="Sender Name (Company)" required className="border p-2" onChange={(e) => setFormData({...formData, senderName: e.target.value})} />
            <input placeholder="Source" required className="border p-2" onChange={(e) => setFormData({...formData, source: e.target.value})} />
            <input placeholder="Destination" required className="border p-2" onChange={(e) => setFormData({...formData, destination: e.target.value})} />
            <button type="submit" className="col-span-2 bg-blue-600 text-white p-2 rounded">Create Shipment</button>
          </form>

          {/* Shipment List */}
          <div className="grid gap-4">
            {shipments.map(s => (
              <div key={s._id} className="bg-white p-4 rounded shadow flex justify-between items-center">
                <div>
                  <p className="font-bold">{s.itemName} ({s.trackingId})</p>
                  <p className="text-sm text-gray-500">To: {s.destination} | Status: <span className="text-blue-600 font-bold">{s.currentStatus}</span></p>
                </div>
                <div className="flex gap-2">
                  {['In Transit', 'Out for Delivery', 'Delivered'].map(status => (
                    <button key={status} onClick={() => updateStatus(s._id, status)} className="text-xs bg-gray-200 p-1 rounded hover:bg-gray-300">{status}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CUSTOMER PORTAL */}
      {view === 'customer_dashboard' && (
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold">Shipments for {customerCompany}</h2>
            <button
              onClick={() => {
                setView('landing');
                setShipments([]);
                setSearchId('');
                setSelectedShipmentId(null);
                setCompanyName('');
              }}
              className="text-red-500 underline"
            >
              Logout
            </button>
          </div>

          <input
            value={searchId}
            placeholder="Search by Tracking ID..."
            className="w-full p-3 border rounded mb-6 shadow-sm"
            onChange={(e) => setSearchId(e.target.value)}
          />

          {filteredShipments.length === 0 ? (
            <div className="bg-white p-6 rounded shadow text-center text-gray-600">
              No shipments found for {customerCompany}. Try a different company name or check back later.
            </div>
          ) : (
            filteredShipments.map(s => (
              <div key={s._id} className="bg-white p-6 rounded shadow mb-4 border-l-4 border-green-500">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-3">
                  <div>
                    <h3 className="text-xl font-bold">{s.itemName}</h3>
                    <p className="text-gray-600">Tracking ID: {s.trackingId}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold">{s.currentStatus}</span>
                    <button
                      onClick={() => setSelectedShipmentId(selectedShipmentId === s._id ? null : s._id)}
                      className="text-blue-600 underline text-sm"
                    >
                      {selectedShipmentId === s._id ? 'Hide details' : 'View details'}
                    </button>
                  </div>
                </div>

                {selectedShipmentId === s._id && (
                  <div className="border-t pt-4 mt-4">
                    <h4 className="text-sm font-bold uppercase text-gray-400 mb-2">Status History</h4>
                    {s.history.map((h, i) => (
                      <div key={i} className="flex justify-between text-sm py-2 border-b last:border-b-0">
                        <span>{h.status}</span>
                        <span className="text-gray-400">{new Date(h.timestamp).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default App;
