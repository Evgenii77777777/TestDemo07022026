// Создание заявки пользователя
const OrdersPage = () => {
  const [user] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  });
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [newOrder, setNewOrder] = useState({
    address: '', 
    contactPhone: '', 
    serviceDate: '', 
    serviceTime: '10:00',
    serviceType: 'общий клининг', 
    customService: '', 
    paymentType: 'наличные',
    specialRequests: ''
  });

  const serviceOptions = [
    { value: 'общий клининг', label: '🧹 Общий клининг', description: 'Ежедневная уборка помещений' },
    { value: 'генеральная уборка', label: '✨ Генеральная уборка', description: 'Полная комплексная уборка' },
    { value: 'послестроительная уборка', label: '🏗️ Послестроительная уборка', description: 'Уборка после ремонта' },
    { value: 'химчистка ковров и мебели', label: '🧼 Химчистка ковров и мебели', description: 'Профессиональная чистка' },
    { value: 'мойка окон', label: '🪟 Мойка окон', description: 'Чистка окон и витрин' },
    { value: 'другое', label: '🎯 Другая услуга', description: 'Специальные услуги' }
  ];

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', 
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  useEffect(() => {
    if (user && user.id) {
      setLoading(true);
      api.getUserOrders(user.id)
        .then(setOrders)
        .finally(() => setLoading(false));
    }
  }, [user]);

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    const result = await api.createOrder({ userId: user.id, ...newOrder });
    if (result.success) {
      // Показать уведомление об успехе
      showToast('✅ Заявка успешно создана!');
      setShowForm(false);
      setFormStep(1);
      setLoading(true);
      api.getUserOrders(user.id).then(setOrders).finally(() => setLoading(false));
      
      // Сброс формы
      setNewOrder({
        address: '', 
        contactPhone: '', 
        serviceDate: '', 
        serviceTime: '10:00',
        serviceType: 'общий клининг', 
        customService: '', 
        paymentType: 'наличные',
        specialRequests: ''
      });
    } else {
      showToast('❌ Ошибка при создании заявки', 'error');
    }
  };

  const showToast = (message, type = 'success') => {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 3000);
  };

  const nextStep = () => {
    if (formStep === 1) {
      if (!newOrder.address || !newOrder.contactPhone || !newOrder.serviceDate) {
        showToast('Заполните все обязательные поля', 'error');
        return;
      }
    }
    if (formStep === 2 && newOrder.serviceType === 'другое' && !newOrder.customService) {
      showToast('Опишите услугу', 'error');
      return;
    }
    setFormStep(formStep + 1);
  };

  const prevStep = () => {
    setFormStep(formStep - 1);
  };

  const calculateEstimatedPrice = () => {
    const prices = {
      'общий клининг': 'от 2 000 ₽',
      'генеральная уборка': 'от 4 500 ₽',
      'послестроительная уборка': 'от 6 000 ₽',
      'химчистка ковров и мебели': 'от 3 500 ₽',
      'мойка окон': 'от 2 500 ₽',
      'другое': 'по договорённости'
    };
    return prices[newOrder.serviceType] || 'по договорённости';
  };

  if (!user) return <Navigate to="/login" />;

  return (
    <div className="orders-page">
      <div className="page-header">
        <h2>Мои заявки</h2>
        <p className="page-subtitle">Управляйте своими заявками на уборку</p>
      </div>
      
      <button 
        className="btn-create-order" 
        onClick={() => setShowForm(true)}
      >
        <span className="btn-icon">+</span>
        Создать новую заявку
      </button>
      
      {/* Модальное окно создания заявки */}
      {showForm && (
        <div className="modal">
          <div className="modal-content order-form-modal">
            <div className="modal-header">
              <h3>Новая заявка на уборку</h3>
              <button className="close-btn" onClick={() => { setShowForm(false); setFormStep(1); }}>×</button>
            </div>
            
            <div className="form-progress">
              <div className="progress-bar" style={{ width: `${(formStep / 3) * 100}%` }}></div>
              <div className="progress-steps">
                <div className={`step ${formStep >= 1 ? 'active' : ''}`}>
                  <span className="step-number">1</span>
                  <span className="step-label">Данные</span>
                </div>
                <div className={`step ${formStep >= 2 ? 'active' : ''}`}>
                  <span className="step-number">2</span>
                  <span className="step-label">Услуга</span>
                </div>
                <div className={`step ${formStep >= 3 ? 'active' : ''}`}>
                  <span className="step-number">3</span>
                  <span className="step-label">Подтверждение</span>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleCreateOrder} className="order-form">
              {formStep === 1 && (
                <div className="form-step active">
                  <div className="step-header">
                    <h4>Контактная информация</h4>
                    <p>Укажите данные для связи и адрес уборки</p>
                  </div>
                  
                  <div className="form-group">
                    <label>
                      <span className="label-icon">📍</span>
                      Адрес уборки *
                    </label>
                    <input 
                      type="text" 
                      placeholder="Введите полный адрес" 
                      required
                      value={newOrder.address} 
                      onChange={e => setNewOrder({...newOrder, address: e.target.value})} 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>
                      <span className="label-icon">📱</span>
                      Контактный телефон *
                    </label>
                    <input 
                      type="tel" 
                      placeholder="+7(XXX)-XXX-XX-XX" 
                      required
                      value={newOrder.contactPhone} 
                      onChange={e => setNewOrder({...newOrder, contactPhone: e.target.value})} 
                    />
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>
                        <span className="label-icon">📅</span>
                        Дата уборки *
                      </label>
                      <input 
                        type="date" 
                        required 
                        min={new Date().toISOString().split('T')[0]}
                        value={newOrder.serviceDate}
                        onChange={e => setNewOrder({...newOrder, serviceDate: e.target.value})} 
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>
                        <span className="label-icon">⏰</span>
                        Время
                      </label>
                      <select 
                        value={newOrder.serviceTime}
                        onChange={e => setNewOrder({...newOrder, serviceTime: e.target.value})}
                      >
                        {timeSlots.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="form-actions">
                    <button type="button" className="btn-next" onClick={nextStep}>
                      Далее
                      <span className="arrow">→</span>
                    </button>
                  </div>
                </div>
              )}
              
              {formStep === 2 && (
                <div className="form-step active">
                  <div className="step-header">
                    <h4>Выбор услуги</h4>
                    <p>Выберите тип уборки и дополнительные опции</p>
                  </div>
                  
                  <div className="form-group">
                    <label>
                      <span className="label-icon">✨</span>
                      Тип услуги *
                    </label>
                    <div className="service-options">
                      {serviceOptions.map(service => (
                        <div 
                          key={service.value}
                          className={`service-option ${newOrder.serviceType === service.value ? 'selected' : ''}`}
                          onClick={() => setNewOrder({...newOrder, serviceType: service.value})}
                        >
                          <div className="service-icon">{service.label.split(' ')[0]}</div>
                          <div className="service-info">
                            <h5>{service.label.split(' ').slice(1).join(' ')}</h5>
                            <p>{service.description}</p>
                          </div>
                          <div className="service-check">
                            <div className="checkmark"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {newOrder.serviceType === 'другое' && (
                    <div className="form-group">
                      <label>
                        <span className="label-icon">📝</span>
                        Опишите услугу *
                      </label>
                      <textarea 
                        placeholder="Подробно опишите, какая услуга вам требуется..." 
                        rows="4"
                        required
                        value={newOrder.customService}
                        onChange={e => setNewOrder({...newOrder, customService: e.target.value})} 
                      />
                    </div>
                  )}
                  
                  <div className="form-group">
                    <label>
                      <span className="label-icon">💬</span>
                      Особые пожелания
                    </label>
                    <textarea 
                      placeholder="Дополнительные инструкции, особенности помещения, аллергии..." 
                      rows="3"
                      value={newOrder.specialRequests}
                      onChange={e => setNewOrder({...newOrder, specialRequests: e.target.value})} 
                    />
                  </div>
                  
                  <div className="form-actions">
                    <button type="button" className="btn-prev" onClick={prevStep}>
                      <span className="arrow">←</span>
                      Назад
                    </button>
                    <button type="button" className="btn-next" onClick={nextStep}>
                      Далее
                      <span className="arrow">→</span>
                    </button>
                  </div>
                </div>
              )}
              
              {formStep === 3 && (
                <div className="form-step active">
                  <div className="step-header">
                    <h4>Подтверждение заявки</h4>
                    <p>Проверьте данные перед отправкой</p>
                  </div>
                  
                  <div className="order-summary">
                    <div className="summary-card">
                      <div className="summary-header">
                        <h5>Сводка заявки</h5>
                        <span className="price-estimate">{calculateEstimatedPrice()}</span>
                      </div>
                      
                      <div className="summary-details">
                        <div className="detail-item">
                          <span className="detail-label">📍 Адрес:</span>
                          <span className="detail-value">{newOrder.address}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">📱 Телефон:</span>
                          <span className="detail-value">{newOrder.contactPhone}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">📅 Дата и время:</span>
                          <span className="detail-value">{newOrder.serviceDate} в {newOrder.serviceTime}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">✨ Услуга:</span>
                          <span className="detail-value">{serviceOptions.find(s => s.value === newOrder.serviceType)?.label.split(' ').slice(1).join(' ')}</span>
                        </div>
                        {newOrder.customService && (
                          <div className="detail-item">
                            <span className="detail-label">📝 Описание:</span>
                            <span className="detail-value">{newOrder.customService}</span>
                          </div>
                        )}
                        <div className="detail-item">
                          <span className="detail-label">💳 Оплата:</span>
                          <div className="payment-options">
                            <label className={`payment-option ${newOrder.paymentType === 'наличные' ? 'selected' : ''}`}>
                              <input 
                                type="radio" 
                                name="paymentType"
                                value="наличные"
                                checked={newOrder.paymentType === 'наличные'}
                                onChange={e => setNewOrder({...newOrder, paymentType: e.target.value})}
                              />
                              <span>Наличные</span>
                            </label>
                            <label className={`payment-option ${newOrder.paymentType === 'карта' ? 'selected' : ''}`}>
                              <input 
                                type="radio" 
                                name="paymentType"
                                value="карта"
                                checked={newOrder.paymentType === 'карта'}
                                onChange={e => setNewOrder({...newOrder, paymentType: e.target.value})}
                              />
                              <span>Банковская карта</span>
                            </label>
                          </div>
                        </div>
                      </div>
                      
                      <div className="summary-footer">
                        <p className="disclaimer">
                          🎯 После отправки заявки наш менеджер свяжется с вами в течение 30 минут для уточнения деталей.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="form-actions">
                    <button type="button" className="btn-prev" onClick={prevStep}>
                      <span className="arrow">←</span>
                      Назад
                    </button>
                    <button type="submit" className="btn-submit">
                      <span className="submit-icon">🚀</span>
                      Отправить заявку
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
      
      {/* Список заявок */}
      <div className="orders-container">
        <div className="orders-header">
          <h3>История заявок</h3>
          <span className="orders-count">{orders.length} заявок</span>
        </div>
        
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Загружаем ваши заявки...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="empty-orders">
            <div className="empty-icon">📄</div>
            <h4>У вас пока нет заявок</h4>
            <p>Создайте свою первую заявку на уборку</p>
          </div>
        ) : (
          <div className="orders-grid">
            {orders.map(order => (
              <div key={order.id} className="order-card">
                <div className="order-card-header">
                  <div>
                    <h4>Заявка #{order.id}</h4>
                    <p className="order-date">
                      📅 {new Date(order.created_at).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <span className={`order-status status-${order.status}`}>
                    {order.status}
                  </span>
                </div>
                
                <div className="order-card-body">
                  <div className="order-info">
                    <p><span className="info-label">📍 Адрес:</span> {order.address}</p>
                    <p><span className="info-label">✨ Услуга:</span> {order.service_type}</p>
                    <p><span className="info-label">📅 Дата:</span> {order.service_date} в {order.service_time}</p>
                    <p><span className="info-label">💳 Оплата:</span> {order.payment_type}</p>
                  </div>
                  
                  {order.custom_service && (
                    <div className="custom-service">
                      <p className="custom-label">📝 Особые пожелания:</p>
                      <p>{order.custom_service}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};