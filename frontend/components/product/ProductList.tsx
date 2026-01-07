"use client";

// IMPORTS
import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { RootState, AppDispatch } from "../../store/store";
import { fetchProducts } from "../../store/slices/productsSlice";
import { ProductCard } from "./ProductCard";
import { Product } from "../../data/products";
import { useTheme } from "../../contexts/ThemeContext";
import { ProductGridSkeleton } from "../ui/Skeleton";

// COMPONENT
export const ProductList: React.FC = () => {
  const { isDarkMode } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const { filteredProducts, isLoading } = useSelector(
    (state: RootState) => state.products
  );

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const [currentPage, setCurrentPage] = useState(1);
  const [jumpDropdownOpen, setJumpDropdownOpen] = useState(false);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const productsPerPage = 9;

  // Calculate pagination
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setJumpDropdownOpen(false);

    // Scroll to products section after state update
    setTimeout(() => {
      const productsSection = document.getElementById('products-section');
      if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 100);
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  const handleDropdownEnter = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setJumpDropdownOpen(true);
  };

  const handleDropdownLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setJumpDropdownOpen(false);
    }, 150);
  };

  // Generate page numbers
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is less than max
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show limited pages with ellipsis
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div>
      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        {isLoading ? (
          <ProductGridSkeleton count={9} />
        ) : filteredProducts.length === 0 ? (
          <div className="col-span-full text-center py-20">
            <p className="text-2xl text-gray-400 font-medium">
              No products found
            </p>
          </div>
        ) : (
          currentProducts.map((product: Product) => (
            <ProductCard key={product._id || product.id} product={product} />
          ))
        )}
      </div>

      {/* Pagination */}
      {filteredProducts.length > 0 && totalPages > 1 && (
        <div className="mt-6 sm:mt-8 flex flex-col items-center gap-3 sm:gap-4">
          {/* Page Info */}
          <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Showing <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{startIndex + 1}</span> to{" "}
            <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {Math.min(endIndex, filteredProducts.length)}
            </span>{" "}
            of <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{filteredProducts.length}</span> products
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center gap-1">
            {/* Previous Button */}
            <button
              onClick={handlePrevious}
              disabled={currentPage === 1}
              className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 border rounded-lg font-medium text-xs sm:text-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-300 hover:border-blue-500 hover:text-blue-400 disabled:hover:border-gray-700 disabled:hover:text-gray-300' : 'bg-white border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-600 disabled:hover:border-gray-300 disabled:hover:text-gray-700'}`}
            >
              <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Prev</span>
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {getPageNumbers().map((page, index) => (
                <React.Fragment key={index}>
                  {page === "..." ? (
                    <span className={`px-2 py-1.5 text-xs ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>...</span>
                  ) : (
                    <button
                      onClick={() => handlePageChange(page as number)}
                      className={`min-w-[32px] sm:min-w-[36px] h-8 sm:h-9 px-2 sm:px-3 rounded-lg font-semibold text-xs sm:text-sm transition-all duration-200 ${currentPage === page
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                        : isDarkMode
                          ? "bg-gray-800 border border-gray-700 text-gray-300 hover:border-blue-500 hover:text-blue-400"
                          : "bg-white border border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-600"
                        }`}
                    >
                      {page}
                    </button>
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Next Button */}
            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 border rounded-lg font-medium text-xs sm:text-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-300 hover:border-blue-500 hover:text-blue-400 disabled:hover:border-gray-700 disabled:hover:text-gray-300' : 'bg-white border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-600 disabled:hover:border-gray-300 disabled:hover:text-gray-700'}`}
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>

          {/* Quick Jump Dropdown */}
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Jump to:</span>
            <div
              className="relative"
              onMouseEnter={handleDropdownEnter}
              onMouseLeave={handleDropdownLeave}
            >
              <button className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all duration-200 border text-xs ${isDarkMode ? 'text-gray-300 hover:text-blue-400 hover:bg-gray-800 border-gray-700' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50 border-gray-300'}`}>
                Page {currentPage}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${jumpDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Dropdown Menu */}
              {jumpDropdownOpen && (
                <div className="absolute top-full left-0 pt-1 w-full min-w-[100px] z-10">
                  <div className={`rounded-lg shadow-xl border py-1 animate-in fade-in slide-in-from-top-2 duration-200 max-h-[250px] overflow-y-auto ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`block w-full text-left px-3 py-2 transition-colors duration-150 text-xs ${currentPage === page
                          ? isDarkMode
                            ? 'bg-purple-900 text-purple-300 font-semibold'
                            : 'bg-purple-50 text-purple-600 font-semibold'
                          : isDarkMode
                            ? 'text-gray-300 hover:bg-gray-700 hover:text-blue-400'
                            : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                          }`}
                      >
                        Page {page}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
