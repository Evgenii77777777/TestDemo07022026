import React, { useState, useEffect } from 'react';

const Slider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    { id: 1, text: 'Профессиональная уборка квартир' },
    { id: 2, text: 'Генеральная уборка домов и офисов' },
    { id: 3, text: 'Послестроительная уборка' },
    { id: 4, text: 'Химчистка мебели и ковров' },
    { id: 5, text: 'Экологичные моющие средства' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className="slider-container">
      <div 
        className="slider" 
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div key={slide.id} className="slide">
            <div>{slide.text}</div>
          </div>
        ))}
      </div>
      
      <div className="slider-controls">
        <button onClick={prevSlide}>
          <i className="fas fa-chevron-left"></i>
        </button>
        <button onClick={nextSlide}>
          <i className="fas fa-chevron-right"></i>
        </button>
      </div>
      
      <div className="slider-dots">
        {slides.map((_, index) => (
          <div
            key={index}
            className={`dot ${index === currentSlide ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default Slider;