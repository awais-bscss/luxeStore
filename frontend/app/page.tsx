"use client";

// IMPORTS
import React, { useState, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../hooks/useRedux";
import { Search, X, Filter, ChevronDown } from "lucide-react";
import { RootState } from "../store/store";
import { setSearchQuery, setCategory } from "../store/slices/productsSlice";
import { Navbar } from "../components/layout/Navbar";
import { HeroSection } from "../components/layout/HeroSection";
import { ProductList } from "../components/product/ProductList";
import { CartSidebar } from "../components/cart/CartSidebar";
import { Footer } from "../components/layout/Footer";
import { WhatsAppButton } from "../components/ui/WhatsAppButton";
import { CustomCursor } from "../components/ui/CustomCursor";
import { useTheme } from "../contexts/ThemeContext";

// MAIN COMPONENT WITH THEME
export default function HomePage() {
  const [cartOpen, setCartOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dispatch = useAppDispatch();
  const { searchQuery, selectedCategory, filteredProducts } = useAppSelector(
    (state: RootState) => state.products
  );
  const { isDarkMode } = useTheme();

  const categories = ["All", "Electronics", "Fashion", "Wearables", "Home"];

  const handleDropdownEnter = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setCategoryDropdownOpen(true);
  };

  const handleDropdownLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setCategoryDropdownOpen(false);
    }, 150);
  };

  const handleCategorySelect = (category: string) => {
    dispatch(setCategory(category));
    setCategoryDropdownOpen(false);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode
      ? 'bg-gray-900'
      : 'bg-white'
      }`}>
      {/* Navbar */}
      <Navbar onCartOpen={() => setCartOpen(true)} />

      {/* Hero Section */}
      <HeroSection />

      {/* Filters */}
      <div id="products-section" className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Responsive Search & Filter Bar */}
        <div className={`p-4 sm:p-5 rounded-2xl border mb-6 sm:mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 transition-all shadow-sm ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
          }`}>
          {/* Search Bar - Full width on mobile, 50% on tablet, 40% on desktop */}
          <div className="w-full md:w-1/2 lg:w-2/5 relative group">
            <Search className={`absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 transition-colors ${isDarkMode ? 'text-gray-400 group-focus-within:text-blue-400' : 'text-gray-400 group-focus-within:text-blue-600'}`} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => dispatch(setSearchQuery(e.target.value))}
              className={`w-full pl-10 sm:pl-12 pr-10 py-2.5 sm:py-3 border rounded-xl focus:ring-2 focus:outline-none transition-all text-sm sm:text-base shadow-sm ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-900' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-100'}`}
            />
            {searchQuery && (
              <button
                onClick={() => dispatch(setSearchQuery(""))}
                className={`absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full transition-colors ${isDarkMode
                  ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                  }`}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Right Side - Filter Dropdown & Results */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Category Dropdown */}
            <div
              className="relative"
              onMouseEnter={handleDropdownEnter}
              onMouseLeave={handleDropdownLeave}
            >
              <button className={`flex items-center gap-2 min-w-[180px] sm:min-w-[200px] pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 border rounded-xl focus:ring-2 focus:outline-none transition-all text-sm sm:text-base font-semibold shadow-sm cursor-pointer hover:shadow-md ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-200 hover:border-gray-600 focus:border-gray-600 focus:ring-gray-700' : 'bg-white border-gray-200 text-gray-900 hover:border-gray-300 focus:border-gray-300 focus:ring-gray-100'}`}>
                <Filter className={`absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                <span className="flex-1 text-left">
                  {selectedCategory === "All" ? "All Categories" : selectedCategory}
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${categoryDropdownOpen ? "rotate-180" : ""} ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
              </button>

              {/* Dropdown Menu */}
              {categoryDropdownOpen && (
                <div className="absolute top-full left-0 pt-1 w-full min-w-[200px] z-1000">
                  <div className={`rounded-xl shadow-xl border py-2 animate-in fade-in slide-in-from-top-2 duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => handleCategorySelect(category)}
                        className={`block w-full text-left px-4 py-3 transition-colors duration-200 ${selectedCategory === category
                          ? isDarkMode
                            ? 'bg-purple-900 text-purple-300 font-semibold'
                            : 'bg-purple-50 text-purple-600 font-semibold'
                          : isDarkMode
                            ? 'text-gray-300 hover:bg-gray-700 hover:text-blue-400'
                            : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                          }`}
                      >
                        {category === "All" ? "All Categories" : category}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Results Count */}
            <div className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border whitespace-nowrap transition-all shadow-sm ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <span className={`font-bold text-base sm:text-lg ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>{filteredProducts?.length || 0}</span>
              <span className={`text-xs sm:text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Results</span>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <ProductList />
      </div>

      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      <Footer />
      <WhatsAppButton />
      <CustomCursor />
    </div>
  );
}
