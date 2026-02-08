import React, { useState, useEffect } from 'react';

// Компонент слайдера

const ImageSlider = () => {
  const images = ['/images/clean1.jpg', '/images/clean2.jpg', '/images/clean3.jpg', '/images/clean4.jpg', '/images/clean5.jpg'];
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <div className="slider">
      <button className="slider-btn prev" onClick={() => setCurrent(prev => (prev - 1 + images.length) % images.length)}>‹</button>
      <img src={images[current]} alt={`Уборка ${current + 1}`} />
      <button className="slider-btn next" onClick={() => setCurrent(prev => (prev + 1) % images.length)}>›</button>
      <div className="slider-dots">
        {images.map((_, i) => (
          <span key={i} className={`dot ${i === current ? 'active' : ''}`} onClick={() => setCurrent(i)}></span>
        ))}
      </div>
    </div>
  );
};

export default ImageSlider;