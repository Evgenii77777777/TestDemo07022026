import React, { useState } from 'react';

const CreateOrder = ({ user, onBack, apiBase }) => {
  const [formData, setFormData] = useState({
    address: '',
    contactPhone: user?.phone || '',
    serviceType: 'общий клининг',
    customService: '',
    preferredDate: '',
    preferredTime: '',
    paymentType: 'наличные',
    otherService: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const serviceTypes = [
    'общий клининг',
    'генеральная уборка',
    'послестроительная уборка',
    'химчистка ковров и мебели'
  ];

  const paymentTypes = ['наличные', 'карта'];

  const validate = () => {
    const newErrors = {};
    
    if (!formData.address.trim()) {
      newErrors.address = 'Введите адрес';
    }
    
    const phoneRegex = /^\+7\(\d{3}\)-\d{3}-\d{2}-\d{2}$/;
    if (!formData.contactPhone) {
      newErrors.contactPhone = 'Введите контактный телефон';
    } else if (!phoneRegex.test(formData.contactPhone)) {
      newErrors.contactPhone = 'Телефон должен быть в формате +7(XXX)-XXX-XX-XX';
    }
    
    if (!formData.serviceType) {
      newErrors.serviceType = 'Выберите тип услуги';
    }
    
    if (formData.otherService && !formData.customService.trim()) {
      newErrors.customService = 'Опишите требуемую услугу';
    }
    
    if (!formData.preferredDate) {
      newErrors.preferredDate = 'Выберите дату';
    } else {
      const selectedDate = new Date(formData.preferredDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.preferredDate = 'Дата не может быть в прошлом';
      }
    }
    
    if (!formData.preferredTime) {
      newErrors.preferredTime = 'Выберите время';
    }
    
    if (!formData.paymentType) {
      newErrors.paymentType = 'Выберите тип оплаты';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setIsLoading(true);
    setErrors({});
    
    try {
      const orderData = {
        userId: user.id,
        address: formData.address,
        contactPhone: formData.contactPhone,
        serviceType: formData.otherService ? 'иная услуга' : formData.serviceType,
        customService: formData.customService,
        preferredDate: formData.preferredDate,
        preferredTime: formData.preferredTime,
        paymentType: formData.paymentType
      };
      
      const response = await fetch(`${apiBase}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          onBack();
        }, 2000);
      } else {
        setErrors({ general: 'Ошибка создания заявки' });
      }
    } catch (error) {
      setErrors({ general: 'Ошибка соединения с сервером' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    setErrors(prev => ({
      ...prev,
      [name]: ''
    }));
  };

  const formatPhone = (value) => {
    const numbers = value.replace(/\D/g, '');
    let formatted = '+7(';
    
    if (numbers.length > 1) {
      formatted += numbers.substring(1, 4);
    }
    if (numbers.length >= 4) {
      formatted += ')-' + numbers.substring(4, 7);
    }
    if (numbers.length >= 7) {
      formatted += '-' + numbers.substring(7, 9);
    }
    if (numbers.length >= 9) {
      formatted += '-' + numbers.substring(9, 11);
    }
    
    return formatted;
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhone(e.target.value);
    setFormData(prev => ({
      ...prev,
      contactPhone: formatted
    }));
    setErrors(prev => ({
      ...prev,
      contactPhone: ''
    }));
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <h2>Новая заявка на уборку</h2>
        <p>Заполните форму для оформления заявки</p>
      </div>
      
      {success && (
        <div className="success-message">
          <i className="fas fa-check-circle"></i>
          Заявка успешно создана! Перенаправление на страницу заявок...
        </div>
      )}
      
      {errors.general && (
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i>
          {errors.general}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="address">Адрес уборки:*</label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="form-control"
            placeholder="ул. Ленина, д. 10, кв. 5"
          />
          {errors.address && (
            <div className="error-message">
              <i className="fas fa-exclamation-circle"></i>
              {errors.address}
            </div>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="contactPhone">Контактный телефон:*</label>
          <input
            type="text"
            id="contactPhone"
            name="contactPhone"
            value={formData.contactPhone}
            onChange={handlePhoneChange}
            className="form-control"
            placeholder="+7(XXX)-XXX-XX-XX"
          />
          {errors.contactPhone && (
            <div className="error-message">
              <i className="fas fa-exclamation-circle"></i>
              {errors.contactPhone}
            </div>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="serviceType">Вид услуги:*</label>
          <select
            id="serviceType"
            name="serviceType"
            value={formData.serviceType}
            onChange={handleChange}
            className="form-control"
            disabled={formData.otherService}
          >
            {serviceTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          {errors.serviceType && (
            <div className="error-message">
              <i className="fas fa-exclamation-circle"></i>
              {errors.serviceType}
            </div>
          )}
          
          <div className="checkbox-group" style={{ marginTop: '0.5rem' }}>
            <input
              type="checkbox"
              id="otherService"
              name="otherService"
              checked={formData.otherService}
              onChange={handleChange}
            />
            <label htmlFor="otherService" style={{ marginLeft: '0.5rem' }}>
              Иная услуга (отсутствует в списке)
            </label>
          </div>
        </div>
        
        {formData.otherService && (
          <div className="form-group">
            <label htmlFor="customService">Описание услуги:*</label>
            <textarea
              id="customService"
              name="customService"
              value={formData.customService}
              onChange={handleChange}
              className="form-control"
              placeholder="Подробно опишите, какая услуга вам необходима"
              rows="3"
            />
            {errors.customService && (
              <div className="error-message">
                <i className="fas fa-exclamation-circle"></i>
                {errors.customService}
              </div>
            )}
          </div>
        )}
        
        <div className="form-group">
          <label htmlFor="preferredDate">Желаемая дата:*</label>
          <input
            type="date"
            id="preferredDate"
            name="preferredDate"
            value={formData.preferredDate}
            onChange={handleChange}
            className="form-control"
            min={getTomorrowDate()}
          />
          {errors.preferredDate && (
            <div className="error-message">
              <i className="fas fa-exclamation-circle"></i>
              {errors.preferredDate}
            </div>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="preferredTime">Желаемое время:*</label>
          <select
            id="preferredTime"
            name="preferredTime"
            value={formData.preferredTime}
            onChange={handleChange}
            className="form-control"
          >
            <option value="">Выберите время</option>
            {Array.from({ length: 10 }, (_, i) => {
              const hour = 9 + i;
              return [`${hour}:00`, `${hour}:30`];
            }).flat().map(time => (
              <option key={time} value={time}>{time}</option>
            ))}
          </select>
          {errors.preferredTime && (
            <div className="error-message">
              <i className="fas fa-exclamation-circle"></i>
              {errors.preferredTime}
            </div>
          )}
        </div>
        
        <div className="form-group">
          <label>Тип оплаты:*</label>
          <div className="radio-group" style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            {paymentTypes.map(type => (
              <div key={type} className="radio-option">
                <input
                  type="radio"
                  id={`payment-${type}`}
                  name="paymentType"
                  value={type}
                  checked={formData.paymentType === type}
                  onChange={handleChange}
                />
                <label htmlFor={`payment-${type}`} style={{ marginLeft: '0.5rem' }}>
                  {type === 'наличные' ? 'Наличными' : 'Банковской картой'}
                </label>
              </div>
            ))}
          </div>
          {errors.paymentType && (
            <div className="error-message">
              <i className="fas fa-exclamation-circle"></i>
              {errors.paymentType}
            </div>
          )}
        </div>
        
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Отправка...
              </>
            ) : (
              <>
                <i className="fas fa-paper-plane"></i> Отправить заявку
              </>
            )}
          </button>
          <button type="button" className="btn" onClick={onBack}>
            <i className="fas fa-arrow-left"></i> Назад
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateOrder;