"use client";

// IMPORTS
import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";
import Link from "next/link";

// COMPONENT
export const HeroSection: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      title: "Premium Electronics",
      subtitle: "Latest Tech at Unbeatable Prices",
      description: "Discover cutting-edge gadgets and electronics",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&h=600&fit=crop",
      cta: "Shop Electronics",
      gradient: "from-blue-600 to-purple-600"
    },
    {
      id: 2,
      title: "Fashion Forward",
      subtitle: "Style Meets Comfort",
      description: "Trending fashion for every occasion",
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=600&fit=crop",
      cta: "Explore Fashion",
      gradient: "from-pink-600 to-orange-600"
    },
    {
      id: 3,
      title: "Smart Living",
      subtitle: "Transform Your Home",
      description: "Innovative products for modern living",
      image: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&h=600&fit=crop",
      cta: "Shop Home",
      gradient: "from-green-600 to-teal-600"
    },
    {
      id: 4,
      title: "Fitness & Wellness",
      subtitle: "Your Health, Your Priority",
      description: "Premium gear for your fitness journey",
      image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1200&h=600&fit=crop",
      cta: "Start Training",
      gradient: "from-red-600 to-yellow-600"
    }
  ];

  // Auto-advance slides every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <div className="relative w-full h-[280px] sm:h-[360px] lg:h-[460px] overflow-hidden bg-gray-900">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-all duration-1000 ease-in-out ${index === currentSlide
            ? "opacity-100 translate-x-0"
            : index < currentSlide
              ? "opacity-0 -translate-x-full"
              : "opacity-0 translate-x-full"
            }`}
        >
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
          </div>

          {/* Content */}
          <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 flex items-center">
            <div className="max-w-2xl px-6 py-8 rounded-3xl backdrop-blur-[2px] bg-black/10">
              <div className={`inline-block bg-gradient-to-r ${slide.gradient} px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-3 sm:mb-4 shadow-lg`}>
                Special Offer
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-2 sm:mb-4 tracking-tight drop-shadow-md text-white animate-in fade-in slide-in-from-left duration-700">
                {slide.title}
              </h1>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold mb-2 sm:mb-4 text-blue-300 drop-shadow-sm animate-in fade-in slide-in-from-left duration-700 delay-100">
                {slide.subtitle}
              </p>
              <p className="text-xs sm:text-sm md:text-base lg:text-lg mb-6 sm:mb-8 text-gray-200 line-clamp-2 max-w-xl animate-in fade-in slide-in-from-left duration-700 delay-200">
                {slide.description}
              </p>

              <Link
                href="/products"
                className={`inline-flex items-center gap-2 bg-gradient-to-r ${slide.gradient} hover:brightness-110 text-white px-5 sm:px-7 py-2.5 sm:py-3.5 rounded-xl font-bold text-sm sm:text-base transition-all duration-300 transform hover:scale-105 shadow-xl animate-in fade-in slide-in-from-left duration-700 delay-300`}
              >
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                {slide.cta}
              </Link>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 border border-white/10 text-white p-2.5 sm:p-3.5 rounded-full backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-95 group z-10"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:-translate-x-0.5" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 border border-white/10 text-white p-2.5 sm:p-3.5 rounded-full backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-95 group z-10"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:translate-x-0.5" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 flex gap-2 sm:gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-300 rounded-full h-1.5 sm:h-2 ${index === currentSlide
              ? "bg-white w-6 sm:w-10"
              : "bg-white/30 hover:bg-white/50 w-1.5 sm:w-2"
              }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
