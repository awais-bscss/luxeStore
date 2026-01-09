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
    <div className="relative w-full h-[260px] sm:h-[340px] lg:h-[440px] overflow-hidden bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-all duration-1000 ease-in-out ${index === currentSlide
            ? "opacity-100"
            : "opacity-0 invisible"
            }`}
        >
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            {/* Soft Overlay for text legibility */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent"></div>
          </div>

          {/* Content */}
          <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-8 flex items-center">
            <div className="max-w-xl text-white">
              <div className={`inline-block bg-white/20 backdrop-blur-md border border-white/30 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-4`}>
                {slide.subtitle || "Premium Collection"}
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 leading-[1.1] animate-in fade-in slide-in-from-left-4 duration-700">
                {slide.title}
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-7 text-gray-100 max-w-lg animate-in fade-in slide-in-from-left-4 duration-700 delay-100">
                {slide.description}
              </p>

              <Link
                href="/products"
                className={`inline-flex items-center gap-2.5 bg-white text-gray-900 hover:bg-gray-50 px-6 sm:px-8 py-3 sm:py-3.5 rounded-full font-bold text-sm sm:text-base transition-all duration-300 transform hover:scale-105 shadow-lg animate-in fade-in slide-in-from-left-4 duration-700 delay-200`}
              >
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                {slide.cta}
              </Link>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows - Reduced Size and Cleaned Up */}
      <button
        onClick={prevSlide}
        className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 border border-white/20 text-white p-2.5 rounded-full backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-95 group z-10"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 sm:left-auto right-4 sm:right-6 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 border border-white/20 text-white p-2.5 rounded-full backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-95 group z-10"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
      </button>

      {/* Minimalist Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-300 rounded-full h-1 my-auto ${index === currentSlide
              ? "bg-white w-8"
              : "bg-white/40 hover:bg-white/60 w-2"
              }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
