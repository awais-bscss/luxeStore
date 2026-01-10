"use client";

// IMPORTS
import React, { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/hooks/useRedux";
import dynamic from "next/dynamic";
import { RootState } from "@/store/store";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartSidebar } from "@/components/cart/CartSidebar";
import { Mail, Phone, MapPin, Clock, Send, CheckCircle, AlertCircle } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { apiClient } from "@/lib/api/client";

// Dynamic import for map component (client-side only)
const LocationMap = dynamic(
  () => import("../../components/map/LocationMap").then((mod) => mod.LocationMap),
  { ssr: false, loading: () => <div className="w-full h-96 bg-gray-200 rounded-3xl flex items-center justify-center"><p className="text-gray-500">Loading map...</p></div> }
);



// COMPONENT
export default function ContactPage() {
  const { isDarkMode } = useTheme();
  const [cartOpen, setCartOpen] = useState(false);
  const dispatch = useAppDispatch();
  const state = useAppSelector((state: RootState) => state);
  const { isAuthenticated, user } = state.auth;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Pre-fill form if user is logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
      }));
    }
  }, [isAuthenticated, user]);

  // Auto-scroll to message box on page load
  useEffect(() => {
    const messageBox = document.getElementById('message');
    if (messageBox) {
      setTimeout(() => {
        messageBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
        messageBox.focus();
      }, 500);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const data = await apiClient('/contact', {
        method: 'POST',
        body: JSON.stringify(formData),
      }, dispatch, state);

      if (data.success) {
        setSubmitStatus('success');
        // Reset form but keep name/email if logged in
        setFormData({
          name: isAuthenticated && user ? user.name || '' : '',
          email: isAuthenticated && user ? user.email || '' : '',
          subject: '',
          message: '',
        });

        // Hide success message after 5 seconds
        setTimeout(() => setSubmitStatus('idle'), 5000);
      }
    } catch (error: any) {
      console.error('Contact form error:', error);
      setSubmitStatus('error');
      setErrorMessage(error.message || 'An error occurred. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email Us",
      details: "support@luxestore.com",
      subtext: "We'll respond within 24 hours"
    },
    {
      icon: Phone,
      title: "Call Us",
      details: "+92 308 9389774",
      subtext: "Mon-Fri, 10AM-8PM PKT"
    },
    {
      icon: MapPin,
      title: "Visit Us",
      details: "Ghanta Ghur",
      subtext: "Faisalabad, Punjab, Pakistan"
    },
    {
      icon: Clock,
      title: "Business Hours",
      details: "Mon-Sat: 10AM-10PM",
      subtext: "Sunday: 12PM-8PM"
    }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800' : 'bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50'}`}>
      {/* Navbar */}
      <Navbar onCartOpen={() => setCartOpen(true)} />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Get In Touch</h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
            Have a question? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>
      </div>

      {/* Contact Info Cards */}
      <div className="max-w-7xl mx-auto px-6 -mt-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {contactInfo.map((info, index) => {
            const Icon = info.icon;
            return (
              <div key={index} className={`rounded-2xl shadow-xl p-6 text-center hover:shadow-2xl transition-all duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{info.title}</h3>
                <p className={`font-semibold mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{info.details}</p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>{info.subtext}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Contact Form & Map */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className={`rounded-3xl shadow-xl p-8 md:p-12 transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-3xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Send Us a Message</h2>

            {/* Success Message */}
            {submitStatus === 'success' && (
              <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-green-800 dark:text-green-300">Message Sent!</h4>
                  <p className="text-sm text-green-700 dark:text-green-400">Thank you for contacting us. We'll get back to you within 24-48 hours.</p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {submitStatus === 'error' && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-red-800 dark:text-red-300">Error</h4>
                  <p className="text-sm text-red-700 dark:text-red-400">{errorMessage}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Your Name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  disabled={isSubmitting}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-blue-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500'}`}
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label htmlFor="email" className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={isSubmitting}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-blue-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500'}`}
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label htmlFor="subject" className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Subject *
                </label>
                <input
                  type="text"
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                  disabled={isSubmitting}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-blue-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500'}`}
                  placeholder="How can we help?"
                />
              </div>

              <div>
                <label htmlFor="message" className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Message *
                </label>
                <textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  disabled={isSubmitting}
                  rows={6}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors resize-none disabled:opacity-50 disabled:cursor-not-allowed ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-blue-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500'}`}
                  placeholder="Tell us more about your inquiry..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>

          {/* FAQ Section */}
          <div>
            <h2 className={`text-3xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                {
                  q: "What are your shipping options?",
                  a: "We offer free standard shipping on orders over $50. Express shipping is available for an additional fee."
                },
                {
                  q: "What is your return policy?",
                  a: "We accept returns within 30 days of purchase. Items must be unused and in original packaging."
                },
                {
                  q: "Do you ship internationally?",
                  a: "Yes! We ship to over 50 countries worldwide. Shipping costs vary by location."
                },
                {
                  q: "How can I track my order?",
                  a: "Once your order ships, you'll receive a tracking number via email to monitor your delivery."
                },
                {
                  q: "Are your products authentic?",
                  a: "Absolutely! We work directly with authorized distributors and guarantee 100% authentic products."
                }
              ].map((faq, index) => (
                <div key={index} className={`rounded-2xl shadow-md p-6 hover:shadow-lg transition-all duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{faq.q}</h3>
                  <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className={`py-20 transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-6">
          <h2 className={`text-3xl font-bold mb-8 text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Visit Our Store</h2>
          <LocationMap />
        </div>
      </div>

      <Footer />
      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}

