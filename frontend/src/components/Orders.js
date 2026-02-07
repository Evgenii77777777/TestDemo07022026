import React, { useState, useEffect } from 'react';

const Orders = ({ user, onCreateOrder, apiBase }) => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${apiBase}/orders/${user.id}`);
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
  };

  const formatTime = (timeString) => {
    return timeString.substring(0, 5);
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

  return (
    <div className="form-container">
      <div className="table-header">
        <h2>Мои заявки</h2>
        <div className="table-actions">
          <button className="btn btn-primary" onClick={onCreateOrder}>
            <i className="fas fa-plus"></i> Новая заявка
          </button>
          <button className="btn" onClick={fetchOrders}>
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
      
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <i className="fas fa-spinner fa-spin fa-2x"></i>
          <p>Загрузка заявок...</p>
        </div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <i className="fas fa-inbox fa-3x" style={{ color: '#6c757d', marginBottom: '1rem' }}></i>
          <h3>У вас пока нет заявок</h3>
          <p>Оформите первую заявку на уборку</p>
          <button className="btn btn-primary" onClick={onCreateOrder}>
            <i className="fas fa-plus"></i> Создать заявку
          </button>
        </div>
      ) : (
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>№</th>
                <th>Услуга</th>
                <th>Адрес</th>
                <th>Дата</th>
                <th>Время</th>
                <th>Оплата</th>
                <th>Статус</th>
                <th>Дата создания</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>
                    {order.service_type}
                    {order.custom_service && (
                      <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>
                        {order.custom_service}
                      </div>
                    )}
                  </td>
                  <td>{order.address}</td>
                  <td>{formatDate(order.preferred_date)}</td>
                  <td>{formatTime(order.preferred_time)}</td>
                  <td>{order.payment_type}</td>
                  <td>{getStatusBadge(order.status)}</td>
                  <td>{formatDate(order.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Orders;