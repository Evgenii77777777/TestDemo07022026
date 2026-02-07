import React, { useState, useEffect } from 'react';

const AdminPanel = ({ apiBase }) => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('все');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${apiBase}/admin/orders`);
      const data = await response.json();
      
      if (data.success) {
        setOrders(data.orders);
      } else {
        setError('Ошибка загрузки заявок');
      }
    } catch (error) {
      setError('Ошибка соединения с сервером');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    if (newStatus === 'отменено') {
      setSelectedOrder(orderId);
      setShowModal(true);
      return;
    }
    
    await updateOrderStatus(orderId, newStatus);
  };

  const updateOrderStatus = async (orderId, newStatus, reason = '') => {
    try {
      const response = await fetch(`${apiBase}/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: newStatus, 
          cancelReason: reason 
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setOrders(prev => prev.map(order => 
          order.id === orderId ? data.order : order
        ));
      }
    } catch (error) {
      setError('Ошибка обновления статуса');
    }
  };

  const handleCancelConfirm = async () => {
    if (!cancelReason.trim()) {
      alert('Укажите причину отмены');
      return;
    }
    
    await updateOrderStatus(selectedOrder, 'отменено', cancelReason);
    setShowModal(false);
    setCancelReason('');
    setSelectedOrder(null);
  };

  const filteredOrders = orders.filter(order => {
    if (statusFilter === 'все') return true;
    return order.status === statusFilter;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
  };

  const formatTime = (timeString) => {
    return timeString ? timeString.substring(0, 5) : '';
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'новая': 'status-new',
      'в работе': 'status-in-progress',
      'выполнено': 'status-completed',
      'отменено': 'status-cancelled'
    };
    
    return (
      <span className={`status-badge ${statusMap[status] || ''}`}>
        {status}
      </span>
    );
  };

  const statusOptions = ['все', 'новая', 'в работе', 'выполнено', 'отменено'];

  return (
    <div className="form-container">
      <div className="table-header">
        <h2>Панель администратора</h2>
        <div className="table-actions">
          <button className="btn btn-primary" onClick={fetchOrders}>
            <i className="fas fa-sync-alt"></i> Обновить
          </button>
        </div>
      </div>
      
      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </div>
      )}
      
      <div className="filters">
        <div className="filter-group">
          <label>Фильтр по статусу:</label>
          <select 
            className="form-control"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {statusOptions.map(option => (
              <option key={option} value={option}>
                {option === 'все' ? 'Все статусы' : option}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <i className="fas fa-spinner fa-spin fa-2x"></i>
          <p>Загрузка заявок...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <i className="fas fa-inbox fa-3x" style={{ color: '#6c757d', marginBottom: '1rem' }}></i>
          <h3>Нет заявок</h3>
          <p>{statusFilter !== 'все' ? `Нет заявок со статусом "${statusFilter}"` : 'Заявки отсутствуют'}</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>№</th>
                <th>ФИО</th>
                <th>Контакты</th>
                <th>Услуга</th>
                <th>Адрес</th>
                <th>Дата/Время</th>
                <th>Оплата</th>
                <th>Статус</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.full_name}</td>
                  <td>
                    <div>{order.phone}</div>
                    <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>
                      {order.email}
                    </div>
                  </td>
                  <td>
                    {order.service_type}
                    {order.custom_service && (
                      <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>
                        {order.custom_service}
                      </div>
                    )}
                  </td>
                  <td>{order.address}</td>
                  <td>
                    <div>{formatDate(order.preferred_date)}</div>
                    <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>
                      {formatTime(order.preferred_time)}
                    </div>
                  </td>
                  <td>{order.payment_type}</td>
                  <td>{getStatusBadge(order.status)}</td>
                  <td>
                    <div className="action-buttons">
                      {order.status !== 'в работе' && order.status !== 'отменено' && (
                        <button 
                          className="btn btn-sm" 
                          onClick={() => handleStatusChange(order.id, 'в работе')}
                          style={{ background: '#ffc107', color: '#000' }}
                        >
                          В работу
                        </button>
                      )}
                      {order.status !== 'выполнено' && order.status !== 'отменено' && (
                        <button 
                          className="btn btn-sm" 
                          onClick={() => handleStatusChange(order.id, 'выполнено')}
                          style={{ background: '#28a745', color: '#fff' }}
                        >
                          Выполнено
                        </button>
                      )}
                      {order.status !== 'отменено' && (
                        <button 
                          className="btn btn-sm" 
                          onClick={() => handleStatusChange(order.id, 'отменено')}
                          style={{ background: '#dc3545', color: '#fff' }}
                        >
                          Отменить
                        </button>
                      )}
                    </div>
                    {order.cancel_reason && (
                      <div style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
                        <strong>Причина отмены:</strong> {order.cancel_reason}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Отмена заявки</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>Укажите причину отмены заявки:</p>
              <textarea
                className="form-control"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows="4"
                placeholder="Причина отмены..."
              />
            </div>
            <div className="modal-footer" style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
              <button className="btn btn-primary" onClick={handleCancelConfirm}>
                Подтвердить отмену
              </button>
              <button className="btn" onClick={() => setShowModal(false)}>
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;