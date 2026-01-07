"use client";

import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { Navbar } from "../../components/layout/Navbar";
import { Footer } from "../../components/layout/Footer";
import { CartSidebar } from "../../components/cart/CartSidebar";
import {
  HelpCircle,
  Search,
  ShoppingBag,
  CreditCard,
  Truck,
  RotateCcw,
  Shield,
  MessageCircle,
  ChevronRight,
  ChevronDown,
  Mail,
  Phone,
  Clock
} from "lucide-react";
import Link from "next/link";
import { useTheme } from "../../contexts/ThemeContext";

export default function HelpCenterPage() {
  const { isDarkMode } = useTheme();
  const [cartOpen, setCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const { items } = useSelector((state: RootState) => state.cart);
  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const categories = [
    {
      icon: ShoppingBag,
      title: "Orders & Shopping",
      description: "Track orders, manage your cart, and shopping tips",
      articles: 4,
      href: "#orders"
    },
    {
      icon: CreditCard,
      title: "Payment & Billing",
      description: "Payment methods, invoices, and billing questions",
      articles: 5,
      href: "#payment"
    },
    {
      icon: Truck,
      title: "Shipping & Delivery",
      description: "Shipping options, tracking, and delivery times",
      articles: 4,
      href: "#shipping"
    },
    {
      icon: RotateCcw,
      title: "Returns & Refunds",
      description: "Return policy, refund process, and exchanges",
      articles: 4,
      href: "#returns"
    },
    {
      icon: Shield,
      title: "Account & Security",
      description: "Account settings, privacy, and security",
      articles: 5,
      href: "#account"
    },
    {
      icon: MessageCircle,
      title: "Contact Support",
      description: "Get in touch with our customer service team",
      articles: 3,
      href: "/contact"
    }
  ];

  const faqs = [
    {
      category: "Orders & Shopping",
      id: "orders",
      questions: [
        {
          q: "How do I track my order?",
          a: "You can track your order by visiting the Track Order page and entering your order number and email address. You'll receive a tracking link in your order confirmation email as well."
        },
        {
          q: "Can I cancel or modify my order?",
          a: "You can cancel your order within 1 hour of placing it. Go to your Orders page, find the order, and click 'Cancel Order'. After 1 hour, please contact our support team for assistance."
        },
        {
          q: "How do I view my order history?",
          a: "Sign in to your account and go to 'My Orders' to view all your past and current orders. You can also download invoices and track shipments from there."
        },
        {
          q: "What should I do if I receive a damaged item?",
          a: "Contact our support team immediately with photos of the damaged item and packaging. We'll arrange a replacement or refund within 24 hours."
        }
      ]
    },
    {
      category: "Payment & Billing",
      id: "payment",
      questions: [
        {
          q: "What payment methods do you accept?",
          a: "We accept all major credit cards (Visa, Mastercard, American Express), debit cards, and Cash on Delivery (COD) for eligible orders."
        },
        {
          q: "Is my payment information secure?",
          a: "Yes! We use Stripe for payment processing, which is PCI-DSS compliant and uses industry-standard encryption to protect your payment information."
        },
        {
          q: "When will I be charged for my order?",
          a: "For card payments, you'll be charged immediately when you place your order. For COD orders, payment is collected upon delivery."
        },
        {
          q: "Can I get an invoice for my purchase?",
          a: "Yes! An invoice is automatically generated for every order. You can download it from your Orders page or request it via email."
        },
        {
          q: "What if my payment fails?",
          a: "If your payment fails, please check your card details and try again. If the issue persists, contact your bank or try a different payment method."
        }
      ]
    },
    {
      category: "Shipping & Delivery",
      id: "shipping",
      questions: [
        {
          q: "How long does shipping take?",
          a: "Standard shipping takes 5-7 business days. Express shipping takes 2-3 business days. Delivery times may vary based on your location."
        },
        {
          q: "Do you offer free shipping?",
          a: "Yes! We offer free standard shipping on orders over Rs 5,000. Express shipping has an additional charge."
        },
        {
          q: "Do you ship internationally?",
          a: "Currently, we only ship within Pakistan. International shipping will be available soon."
        },
        {
          q: "Can I change my shipping address after placing an order?",
          a: "You can change your shipping address within 1 hour of placing your order. Contact our support team immediately for assistance."
        }
      ]
    },
    {
      category: "Returns & Refunds",
      id: "returns",
      questions: [
        {
          q: "What is your return policy?",
          a: "We offer a 30-day return policy for most items. Products must be unused, in original packaging, and with all tags attached."
        },
        {
          q: "How do I initiate a return?",
          a: "Go to your Orders page, select the order, and click 'Return Item'. Follow the instructions to print a return label and ship the item back."
        },
        {
          q: "When will I receive my refund?",
          a: "Refunds are processed within 5-7 business days after we receive your returned item. The amount will be credited to your original payment method."
        },
        {
          q: "Are there any items that cannot be returned?",
          a: "Yes, certain items like intimate apparel, personalized products, and perishable goods cannot be returned for hygiene and safety reasons."
        }
      ]
    },
    {
      category: "Account & Security",
      id: "account",
      questions: [
        {
          q: "How do I create an account?",
          a: "Click the 'Sign In' button in the top navigation, then select 'Sign Up'. Enter your name, email, and create a password to get started."
        },
        {
          q: "I forgot my password. How do I reset it?",
          a: "Click 'Forgot Password' on the login page. Enter your email address and we'll send you a link to reset your password."
        },
        {
          q: "How do I update my account information?",
          a: "Sign in to your account and go to 'Account Settings'. You can update your name, email, phone number, and addresses there."
        },
        {
          q: "Is my personal information safe?",
          a: "Absolutely! We use industry-standard encryption and security measures to protect your personal information. We never share your data with third parties without your consent."
        },
        {
          q: "How do I enable two-factor authentication?",
          a: "Go to Account Settings > Security and click 'Enable 2FA'. Follow the instructions to set up authentication using your preferred authenticator app."
        }
      ]
    }
  ];

  const filteredFaqs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(
      faq =>
        faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      // Find first matching FAQ
      if (filteredFaqs.length > 0 && filteredFaqs[0].questions.length > 0) {
        const firstCategoryIndex = 0;
        const firstQuestionIndex = 0;
        const globalIndex = firstCategoryIndex * 100 + firstQuestionIndex;

        // Expand the first result
        setExpandedFaq(globalIndex);

        // Scroll to the FAQ section
        setTimeout(() => {
          const faqSection = document.getElementById(filteredFaqs[0].id);
          if (faqSection) {
            faqSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      }
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800' : 'bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50'}`}>
      <Navbar cartItemCount={cartItemCount} onCartOpen={() => setCartOpen(true)} />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6">
            <HelpCircle className="w-10 h-10" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">Help Center</h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto mb-8">
            Find answers to your questions and get the help you need
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
              <input
                type="text"
                placeholder="Search for help articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
                className={`w-full pl-14 pr-4 py-4 rounded-xl text-lg focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all ${isDarkMode ? 'bg-gray-800 text-white placeholder-gray-500' : 'bg-white text-gray-900 placeholder-gray-400'}`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        {/* Categories */}
        <div className="mb-16">
          <h2 className={`text-2xl md:text-3xl font-bold mb-8 text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Browse by Category
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => (
              <a
                key={index}
                href={category.href}
                className={`rounded-2xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl hover:scale-105 ${isDarkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-gray-50'}`}
              >
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${isDarkMode ? 'bg-blue-900/30' : 'bg-gradient-to-br from-blue-100 to-purple-100'}`}>
                  <category.icon className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {category.title}
                </h3>
                <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {category.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-semibold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                    {category.articles} articles
                  </span>
                  <ChevronRight className={`w-5 h-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-16">
          <h2 className={`text-2xl md:text-3xl font-bold mb-8 text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Frequently Asked Questions
          </h2>

          {filteredFaqs.length > 0 ? (
            <div className="space-y-8">
              {filteredFaqs.map((category, catIndex) => (
                <div key={catIndex} id={category.id}>
                  <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                    {category.category}
                  </h3>
                  <div className="space-y-3">
                    {category.questions.map((faq, faqIndex) => {
                      const globalIndex = catIndex * 100 + faqIndex;
                      const isExpanded = expandedFaq === globalIndex;

                      return (
                        <div
                          key={faqIndex}
                          className={`rounded-xl shadow-sm border transition-all duration-200 ${isDarkMode
                            ? 'bg-gray-800 border-gray-700 hover:border-gray-600'
                            : 'bg-white border-gray-200 hover:border-gray-300'
                            }`}
                        >
                          <button
                            onClick={() => toggleFaq(globalIndex)}
                            className="w-full px-6 py-4 flex items-center justify-between text-left"
                          >
                            <span className={`font-semibold pr-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {faq.q}
                            </span>
                            <ChevronDown
                              className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${isExpanded ? 'transform rotate-180' : ''
                                } ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                            />
                          </button>
                          {isExpanded && (
                            <div className={`px-6 pb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              {faq.a}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <Search className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No results found for "{searchQuery}"</p>
              <p className="text-sm mt-2">Try different keywords or browse by category</p>
            </div>
          )}
        </div>

        {/* Contact Support */}
        <div className={`rounded-2xl shadow-lg p-8 text-center transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <MessageCircle className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
          <h3 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Still Need Help?
          </h3>
          <p className={`mb-6 max-w-2xl mx-auto ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Can't find what you're looking for? Our support team is here to help you.
          </p>

          {/* Contact Options */}
          <div className="grid sm:grid-cols-3 gap-4 mb-6 max-w-3xl mx-auto">
            <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <Mail className={`w-6 h-6 mx-auto mb-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              <p className={`text-sm font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Email</p>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>awais@luxestore.com</p>
            </div>
            <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <Phone className={`w-6 h-6 mx-auto mb-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              <p className={`text-sm font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Phone</p>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>+92 308 9389774</p>
            </div>
            <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <Clock className={`w-6 h-6 mx-auto mb-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              <p className={`text-sm font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Hours</p>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>24/7 Support</p>
            </div>
          </div>

          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <MessageCircle className="w-5 h-5" />
            Contact Support
          </Link>
        </div>
      </div>

      <Footer />
      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
