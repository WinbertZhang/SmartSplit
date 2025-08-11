"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0);
  const [visibleSections, setVisibleSections] = useState<Set<number>>(new Set());

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const sectionId = parseInt(entry.target.getAttribute('data-section') || '0');
          if (entry.isIntersecting) {
            setVisibleSections(prev => {
              const newSet = new Set(prev);
              newSet.add(sectionId);
              return newSet;
            });
          }
        });
      },
      { threshold: 0.3 }
    );

    document.querySelectorAll('[data-section]').forEach((section) => {
      observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  // Animated pie chart component
  const AnimatedPieChart = ({ visible }: { visible: boolean }) => {
    return (
      <div className="relative w-48 h-48 mx-auto">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="8"
          />
          {/* Alex's slice - 57% */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="#10B981"
            strokeWidth="8"
            strokeDasharray={`${visible ? 143 : 0} 251`}
            strokeDashoffset="0"
            className="transition-all duration-2000 ease-out"
            style={{ animationDelay: '500ms' }}
          />
          {/* Blake's slice - 43% */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="#3B82F6"
            strokeWidth="8"
            strokeDasharray={`${visible ? 108 : 0} 251`}
            strokeDashoffset={visible ? -143 : 0}
            className="transition-all duration-2000 ease-out"
            style={{ animationDelay: '1000ms' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-white font-bold text-lg">$37.00</div>
            <div className="text-gray-300 text-sm">Total</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-900 relative">

      {/* Hero Section */}
      <main className="relative z-10">
        <div className="container mx-auto px-4 py-20 md:py-32 lg:py-40">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
              
              <div className="space-y-6 lg:space-y-8 animate-fadeInUp">
                <div className="space-y-2">
                  <div className="inline-block px-3 sm:px-4 py-2 bg-gradient-to-r from-green-400/20 to-blue-400/20 rounded-full border border-green-400/30 backdrop-blur-sm">
                    <span className="text-green-300 text-xs sm:text-sm font-medium">🚀 Split Bills Like a Pro</span>
                  </div>
                  
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight animate-textGlow">
                    Welcome to{" "}
                    <span className="bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent animate-gradientText">
                      Smart Split
                    </span>
                  </h1>
                </div>

                <p className="text-gray-300 text-base sm:text-lg md:text-xl leading-relaxed opacity-90">
                  Upload your receipt, and let Smart Split fairly divide the bill with your friends and roommates. 
                  <span className="text-green-300 font-medium"> No more headaches</span> over who owes what.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Link 
                    href="/upload-receipt" 
                    className="group relative inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 text-white font-medium rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-green-400/25"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 opacity-90 group-hover:opacity-100 transition-opacity"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 blur group-hover:blur-sm transition-all"></div>
                    <span className="relative flex items-center gap-2 text-sm sm:text-base">
                      📄 Upload Receipt
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </Link>
                  
                  <Link 
                    href="/about" 
                    className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 border border-white/20 text-white font-medium rounded-xl backdrop-blur-sm hover:bg-white/10 transition-all duration-300 hover:border-white/40 text-sm sm:text-base"
                  >
                    Learn More
                  </Link>
                </div>

                {/* Stats or features */}
                <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-6 lg:pt-8 opacity-80">
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-green-400">⚡</div>
                    <div className="text-xs sm:text-sm text-gray-400">Instant</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-blue-400">🎯</div>
                    <div className="text-xs sm:text-sm text-gray-400">Accurate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-purple-400">🤝</div>
                    <div className="text-xs sm:text-sm text-gray-400">Fair</div>
                  </div>
                </div>
              </div>

              <div className="hidden lg:block animate-fadeInRight">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-blue-400/20 rounded-3xl blur-2xl transform rotate-6"></div>
                  <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                    <Image
                      src="/receipt.svg"
                      alt="Receipt illustration"
                      width={400}
                      height={400}
                      className="w-full h-auto max-w-md mx-auto drop-shadow-2xl animate-float"
                      priority
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <section className="relative z-10 py-12 sm:py-20 bg-slate-800/50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              
              {/* Section Header */}
              <div 
                data-section="0"
                className={`text-center mb-12 sm:mb-16 transition-all duration-1000 ${
                  visibleSections.has(0) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
              >
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
                  How <span className="text-green-400">Smart Split</span> Works
                </h2>
                <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto">
                  See how easy it is to split bills fairly with your friends
                </p>
              </div>

              {/* Step 1: Upload */}
              <div 
                data-section="1"
                className={`grid md:grid-cols-2 gap-8 sm:gap-12 items-center mb-12 sm:mb-20 transition-all duration-1000 delay-200 ${
                  visibleSections.has(1) ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
                }`}
              >
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 sm:w-10 h-8 sm:h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base">1</div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white">Upload Your Receipt</h3>
                  </div>
                  <p className="text-gray-300 text-base sm:text-lg">
                    Simply take a photo or upload an image of your receipt. Our AI will automatically read and extract all the items and prices.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 sm:px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-xs sm:text-sm">AI Powered</span>
                    <span className="px-2 sm:px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs sm:text-sm">Instant Processing</span>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20">
                  <div className="bg-white rounded-lg p-3 sm:p-4 shadow-lg">
                    <div className="text-center space-y-2">
                      <div className="text-2xl sm:text-4xl">📄</div>
                      <div className="text-xs sm:text-sm text-gray-600 font-medium">Restaurant Bill</div>
                      <div className="border-t pt-2 space-y-1 text-xs text-gray-500">
                        <div className="flex justify-between"><span>Pizza Margherita</span><span>$18.50</span></div>
                        <div className="flex justify-between"><span>Caesar Salad</span><span>$12.00</span></div>
                        <div className="flex justify-between"><span>Garlic Bread</span><span>$6.50</span></div>
                        <div className="border-t pt-1 flex justify-between font-medium"><span>Total</span><span>$37.00</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2: Review & Edit */}
              <div 
                data-section="2"
                className={`grid md:grid-cols-2 gap-8 sm:gap-12 items-center mb-12 sm:mb-20 transition-all duration-1000 delay-400 ${
                  visibleSections.has(2) ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
                }`}
              >
                <div className="order-2 md:order-1 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20">
                  <div className="space-y-3">
                    <h4 className="text-white font-medium mb-4 text-sm sm:text-base">Review & Edit Items</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 sm:p-3 bg-white/10 rounded-lg">
                        <span className="text-white text-sm sm:text-base">Pizza Margherita</span>
                        <div className="flex gap-2">
                          <span className="text-green-300 text-sm">$18.50</span>
                          <button className="text-red-400 hover:text-red-300 text-xs">✕</button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-2 sm:p-3 bg-white/10 rounded-lg">
                        <span className="text-white text-sm sm:text-base">Caesar Salad</span>
                        <div className="flex gap-2">
                          <span className="text-green-300 text-sm">$12.00</span>
                          <button className="text-yellow-400 hover:text-yellow-300 text-xs">✎</button>
                        </div>
                      </div>
                      <div className="p-2 sm:p-3 bg-green-500/20 rounded-lg border border-green-500/30">
                        <div className="flex items-center gap-2">
                          <span className="text-green-300 text-xs sm:text-sm">+ Add Item</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="order-1 md:order-2 space-y-4 sm:space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 sm:w-10 h-8 sm:h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base">2</div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white">Review & Edit</h3>
                  </div>
                  <p className="text-gray-300 text-base sm:text-lg">
                    Review the extracted items and make any necessary corrections. Add missing items or remove incorrect ones to ensure accuracy.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 sm:px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs sm:text-sm">Edit Items</span>
                    <span className="px-2 sm:px-3 py-1 bg-pink-500/20 text-pink-300 rounded-full text-xs sm:text-sm">Add/Remove</span>
                  </div>
                </div>
              </div>

              {/* Step 3: Add People & Assign */}
              <div 
                data-section="3"
                className={`grid md:grid-cols-2 gap-8 sm:gap-12 items-center mb-12 sm:mb-20 transition-all duration-1000 delay-600 ${
                  visibleSections.has(3) ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
                }`}
              >
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 sm:w-10 h-8 sm:h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base">3</div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white">Add People & Assign</h3>
                  </div>
                  <p className="text-gray-300 text-base sm:text-lg">
                    Add your friends to the split, then use checkboxes to assign which items each person should pay for. Multiple people can share items.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 sm:px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-xs sm:text-sm">Checkboxes</span>
                    <span className="px-2 sm:px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs sm:text-sm">Multi-select</span>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-white font-medium text-sm sm:text-base">Split Items</h4>
                      <div className="flex gap-2">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-400 rounded-full flex items-center justify-center text-xs text-white font-bold">A</div>
                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-400 rounded-full flex items-center justify-center text-xs text-white font-bold">B</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 sm:p-3 bg-white/10 rounded-lg">
                        <span className="text-white text-sm sm:text-base">Pizza Margherita</span>
                        <div className="flex gap-2">
                          <input type="checkbox" checked className="w-4 h-4 text-green-400" />
                          <input type="checkbox" checked className="w-4 h-4 text-blue-400" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-2 sm:p-3 bg-white/10 rounded-lg">
                        <span className="text-white text-sm sm:text-base">Caesar Salad</span>
                        <div className="flex gap-2">
                          <input type="checkbox" checked className="w-4 h-4 text-green-400" />
                          <input type="checkbox" className="w-4 h-4 text-blue-400" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-2 sm:p-3 bg-white/10 rounded-lg">
                        <span className="text-white text-sm sm:text-base">Garlic Bread</span>
                        <div className="flex gap-2">
                          <input type="checkbox" className="w-4 h-4 text-green-400" />
                          <input type="checkbox" checked className="w-4 h-4 text-blue-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 4: View Results with Pie Chart */}
              <div 
                data-section="4"
                className={`grid md:grid-cols-2 gap-8 sm:gap-12 items-center mb-12 sm:mb-20 transition-all duration-1000 delay-800 ${
                  visibleSections.has(4) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
              >
                <div className="order-2 md:order-1 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20">
                  <div className="space-y-4">
                    <h4 className="text-white font-medium text-sm sm:text-base">Visual Split Breakdown</h4>
                    
                    <AnimatedPieChart visible={visibleSections.has(4)} />
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 sm:p-4 bg-green-500/20 rounded-lg border border-green-500/30">
                        <div className="flex items-center gap-3">
                          <div className="w-6 sm:w-8 h-6 sm:h-8 bg-green-400 rounded-full flex items-center justify-center text-xs sm:text-sm text-white font-bold">A</div>
                          <span className="text-white text-sm sm:text-base">Alex</span>
                        </div>
                        <span className="text-green-300 font-bold text-sm sm:text-base">$21.25</span>
                      </div>
                      <div className="flex items-center justify-between p-3 sm:p-4 bg-blue-500/20 rounded-lg border border-blue-500/30">
                        <div className="flex items-center gap-3">
                          <div className="w-6 sm:w-8 h-6 sm:h-8 bg-blue-400 rounded-full flex items-center justify-center text-xs sm:text-sm text-white font-bold">B</div>
                          <span className="text-white text-sm sm:text-base">Blake</span>
                        </div>
                        <span className="text-blue-300 font-bold text-sm sm:text-base">$15.75</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="order-1 md:order-2 space-y-4 sm:space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 sm:w-10 h-8 sm:h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base">4</div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white">Get Fair Totals</h3>
                  </div>
                  <p className="text-gray-300 text-base sm:text-lg">
                    Smart Split automatically calculates each person's share including tax and tip proportionally. View beautiful charts and get exact amounts.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 sm:px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs sm:text-sm">Auto Tax</span>
                    <span className="px-2 sm:px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-xs sm:text-sm">Visual Charts</span>
                  </div>
                </div>
              </div>

              {/* Step 5: Manage Past Splits */}
              <div 
                data-section="5"
                className={`grid md:grid-cols-2 gap-8 sm:gap-12 items-center transition-all duration-1000 delay-1000 ${
                  visibleSections.has(5) ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
                }`}
              >
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 sm:w-10 h-8 sm:h-10 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base">5</div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white">Manage Past Splits</h3>
                  </div>
                  <p className="text-gray-300 text-base sm:text-lg">
                    Keep track of all your previous splits and receipts. Easily access past calculations and share them with friends when needed.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 sm:px-3 py-1 bg-rose-500/20 text-rose-300 rounded-full text-xs sm:text-sm">History</span>
                    <span className="px-2 sm:px-3 py-1 bg-orange-500/20 text-orange-300 rounded-full text-xs sm:text-sm">Share Links</span>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20">
                  <div className="space-y-3">
                    <h4 className="text-white font-medium mb-4 text-sm sm:text-base">Recent Splits</h4>
                    <div className="space-y-2">
                      <div className="p-2 sm:p-3 bg-white/10 rounded-lg border-l-4 border-green-400">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-white text-sm sm:text-base font-medium">Restaurant Dinner</span>
                            <div className="text-gray-400 text-xs sm:text-sm">2 days ago • $37.00</div>
                          </div>
                          <button className="text-green-400 hover:text-green-300 text-xs sm:text-sm">View</button>
                        </div>
                      </div>
                      <div className="p-2 sm:p-3 bg-white/10 rounded-lg border-l-4 border-blue-400">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-white text-sm sm:text-base font-medium">Grocery Trip</span>
                            <div className="text-gray-400 text-xs sm:text-sm">1 week ago • $85.40</div>
                          </div>
                          <button className="text-blue-400 hover:text-blue-300 text-xs sm:text-sm">View</button>
                        </div>
                      </div>
                      <div className="p-2 sm:p-3 bg-white/10 rounded-lg border-l-4 border-purple-400">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-white text-sm sm:text-base font-medium">Coffee Shop</span>
                            <div className="text-gray-400 text-xs sm:text-sm">2 weeks ago • $24.75</div>
                          </div>
                          <button className="text-purple-400 hover:text-purple-300 text-xs sm:text-sm">View</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
