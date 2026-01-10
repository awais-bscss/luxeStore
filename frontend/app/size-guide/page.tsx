"use client";

import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { Navbar } from "@/components/layout/Navbar";
import { CartSidebar } from "@/components/cart/CartSidebar";
import { Ruler, Shirt, User, Footprints, Info } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export default function SizeGuidePage() {
  const { isDarkMode } = useTheme();
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("clothing");
  const { items } = useSelector((state: RootState) => state.cart);
  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const clothingSizes = [
    { size: "XS", chest: "30-32", waist: "24-26", hips: "33-35" },
    { size: "S", chest: "34-36", waist: "28-30", hips: "36-38" },
    { size: "M", chest: "38-40", waist: "32-34", hips: "39-41" },
    { size: "L", chest: "42-44", waist: "36-38", hips: "42-44" },
    { size: "XL", chest: "46-48", waist: "40-42", hips: "45-47" },
    { size: "XXL", chest: "50-52", waist: "44-46", hips: "48-50" }
  ];

  const shoeSizes = [
    { us: "6", uk: "5.5", eu: "39", cm: "24" },
    { us: "7", uk: "6.5", eu: "40", cm: "25" },
    { us: "8", uk: "7.5", eu: "41", cm: "26" },
    { us: "9", uk: "8.5", eu: "42", cm: "27" },
    { us: "10", uk: "9.5", eu: "43", cm: "28" },
    { us: "11", uk: "10.5", eu: "44", cm: "29" },
    { us: "12", uk: "11.5", eu: "45", cm: "30" }
  ];

  const measurementTips = [
    {
      icon: Ruler,
      title: "Use a Soft Tape Measure",
      description: "For the most accurate measurements, use a flexible measuring tape"
    },
    {
      icon: User,
      title: "Measure Over Undergarments",
      description: "Take measurements while wearing light undergarments for best fit"
    },
    {
      icon: Info,
      title: "Keep the Tape Snug",
      description: "The tape should be snug but not tight against your body"
    }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800' : 'bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50'}`}>
      <Navbar cartItemCount={cartItemCount} onCartOpen={() => setCartOpen(true)} />

      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6">
            <Ruler className="w-10 h-10" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Size Guide</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Find your perfect fit with our comprehensive size charts and measurement guides
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Category Tabs */}
        <div className="flex gap-4 mb-12 justify-center">
          <button
            onClick={() => setSelectedCategory("clothing")}
            className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${selectedCategory === "clothing"
              ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
              : isDarkMode ? "bg-gray-800 text-gray-300 hover:bg-gray-700" : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
          >
            <Shirt className="w-5 h-5 inline mr-2" />
            Clothing
          </button>
          <button
            onClick={() => setSelectedCategory("shoes")}
            className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${selectedCategory === "shoes"
              ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
              : isDarkMode ? "bg-gray-800 text-gray-300 hover:bg-gray-700" : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
          >
            <Footprints className="w-5 h-5 inline mr-2" />
            Shoes
          </button>
        </div>

        {/* Size Charts */}
        <div className={`rounded-2xl shadow-lg p-8 mb-12 transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className={`text-3xl font-bold mb-8 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {selectedCategory === "clothing" ? "Clothing Size Chart" : "Shoe Size Chart"}
          </h2>

          <div className="overflow-x-auto">
            {selectedCategory === "clothing" ? (
              <table className="w-full">
                <thead>
                  <tr className={`border-b-2 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <th className={`py-4 px-4 text-left font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Size</th>
                    <th className={`py-4 px-4 text-left font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Chest (inches)</th>
                    <th className={`py-4 px-4 text-left font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Waist (inches)</th>
                    <th className={`py-4 px-4 text-left font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Hips (inches)</th>
                  </tr>
                </thead>
                <tbody>
                  {clothingSizes.map((size, index) => (
                    <tr key={index} className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                      <td className={`py-4 px-4 font-semibold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>{size.size}</td>
                      <td className={`py-4 px-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{size.chest}</td>
                      <td className={`py-4 px-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{size.waist}</td>
                      <td className={`py-4 px-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{size.hips}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className={`border-b-2 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <th className={`py-4 px-4 text-left font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>US</th>
                    <th className={`py-4 px-4 text-left font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>UK</th>
                    <th className={`py-4 px-4 text-left font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>EU</th>
                    <th className={`py-4 px-4 text-left font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>CM</th>
                  </tr>
                </thead>
                <tbody>
                  {shoeSizes.map((size, index) => (
                    <tr key={index} className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                      <td className={`py-4 px-4 font-semibold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>{size.us}</td>
                      <td className={`py-4 px-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{size.uk}</td>
                      <td className={`py-4 px-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{size.eu}</td>
                      <td className={`py-4 px-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{size.cm}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Measurement Tips */}
        <div className={`rounded-2xl shadow-lg p-8 mb-12 transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className={`text-3xl font-bold mb-8 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Measurement Tips</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {measurementTips.map((tip, index) => (
              <div key={index} className="text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isDarkMode ? 'bg-blue-900/30' : 'bg-gradient-to-br from-blue-100 to-purple-100'}`}>
                  <tip.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className={`font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{tip.title}</h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{tip.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Help Section */}
        <div className={`rounded-2xl shadow-lg p-8 text-center transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <Info className={`w-12 h-12 mx-auto mb-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
          <h3 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Need Help Finding Your Size?
          </h3>
          <p className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Our customer service team can help you find the perfect fit.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Contact Support
          </a>
        </div>
      </div>

      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}

