import React, { useState, useEffect } from 'react';
import { Link  } from 'react-router-dom';


// API клиент
const api = {
  createOrder: (data) => fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json()),

  getUserOrders: (userId) => fetch(`/api/orders/${userId}`).then(res => res.json()),

  getAdminOrders: () => fetch('/api/admin/orders').then(res => res.json()),

  updateOrderStatus: (id, data) => fetch(`/api/admin/orders/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json())
};






// Панель администратора
const AdminPage = () => {
  const [user] = useState(JSON.parse(localStorage.getItem('user')));
  const [orders, setOrders] = useState([]);
  const [editingOrder, setEditingOrder] = useState(null);

  useEffect(() => {
    if (user && user.login === 'adminka') {
      api.getAdminOrders().then(setOrders);
    }
  }, [user]);

  const updateStatus = async (id, status, reason = '') => {
    await api.updateOrderStatus(id, { status, cancelReason: reason });
    api.getAdminOrders().then(setOrders);
    setEditingOrder(null);
  };

  if (!user || user.login !== 'adminka') return <Navigate to="/" />;

  return (
    <div className="admin-page">
    
      <div className="page-header-with-nav">
        <div className="header-left">
          <Link to="/" className="btn-home">
            <span className="home-icon">🏠</span>
            На главную
          </Link>
        </div>
        <div className="header-center">
          <h2>Панель администратора</h2>
          <p className="page-subtitle">Управление всеми заявками</p>
        </div>
        <div className="header-right">
          <span className="user-greeting">⚙️ Администратор</span>
        </div>
     </div>
      
      <div className="orders-table">
        {orders.map(order => (
          <div key={order.id} className="admin-order">
            <p><strong>Клиент:</strong> {order.full_name}</p>
            <p><strong>Телефон:</strong> {order.contact_phone}</p>
            <p><strong>Услуга:</strong> {order.service_type}</p>
            <p><strong>Статус:</strong> {order.status}</p>
            
            <div className="status-actions">
              <button onClick={() => updateStatus(order.id, 'в работе')}>В работе</button>
              <button onClick={() => updateStatus(order.id, 'выполнено')}>Выполнено</button>
              <button onClick={() => {
                const reason = prompt('Причина отмены:');
                if (reason) updateStatus(order.id, 'отменено', reason);
              }}>Отменить</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPage;