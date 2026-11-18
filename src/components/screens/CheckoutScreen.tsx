import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';
import {
  ShieldAlert,
  ShoppingBag,
  ArrowLeft,
  AlertCircle,
  Truck,
  Sparkles,
  Lock
} from 'lucide-react';

const formatINR = (amount: number): string =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);

export const CheckoutScreen: React.FC = () => {
  const {
    cartItems,
    cartSubtotal,
    cartCount,
    placeOrder,
    goToScreen
  } = useApp();

  // Form Fields
  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  // Validation Errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Email format validation helper
  const isValidEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!customerName.trim()) {
      errs.customerName = 'Please enter your full name.';
    }
    if (!email.trim()) {
      errs.email = 'Please enter your email address.';
    } else if (!isValidEmail(email)) {
      errs.email = 'Please enter a valid email address (e.g. name@example.com).';
    }
    if (!address.trim()) {
      errs.address = 'Please enter your street delivery address.';
    }
    if (!city.trim()) {
      errs.city = 'Please enter your city.';
    }
    if (!postalCode.trim()) {
      errs.postalCode = 'Please enter your postal or ZIP code.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;
    if (!validate()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      placeOrder({
        customerName: customerName.trim(),
        email: email.trim(),
        address: address.trim(),
        city: city.trim(),
        postalCode: postalCode.trim()
      });
      setIsSubmitting(false);
    }, 400);
  };

  // Prevent empty checkout
  if (cartItems.length === 0) {
    return (
      <div className="flex-1 flex flex-col min-h-screen bg-showroom-950 text-showroom-ivory">
        <Header title="DEMO CHECKOUT" showBack={true} />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto my-auto">
          <div className="w-16 h-16 rounded-full bg-showroom-900 border border-showroom-750 flex items-center justify-center text-showroom-muted mb-4">
            <ShoppingBag className="w-8 h-8 opacity-60" />
          </div>
          <h2 className="font-display font-bold text-2xl text-white mb-2">
            Your bag is empty
          </h2>
          <p className="text-xs text-showroom-muted mb-6 leading-relaxed">
            There are no frames ready for checkout. Please select a frame from the store or try-on studio to proceed.
          </p>
          <button
            onClick={() => goToScreen('store')}
            className="py-3 px-8 rounded-full bg-showroom-cream text-showroom-950 font-semibold text-xs uppercase tracking-wider shadow-sm touch-btn"
          >
            Browse Eyewear Store
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-showroom-950 text-showroom-ivory">
      <Header
        title="DEMONSTRATION CHECKOUT"
        subtitle="Complete your simulated purchase. No real payments are processed or payment details required."
        showBack={true}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">

        {/* Prominent Demo Notice Banner (Requirement 6) */}
        <div className="mb-8 p-4 rounded-2xl bg-amber-950/60 border border-amber-600/60 flex items-start sm:items-center gap-3.5 text-xs text-amber-200">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
          <div>
            <strong className="font-semibold text-amber-300 block sm:inline mr-2">
              Demonstration Checkout Notice:
            </strong>
            <span>
              This is a prototype web application. No credit card or payment gateway is used. No financial transactions take place, and no real physical orders will be delivered.
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column: Customer & Delivery Details Form */}
          <div className="lg:col-span-7">
            <form onSubmit={handleSubmitOrder} className="p-6 sm:p-8 rounded-3xl bg-showroom-900 border border-showroom-750 shadow-xl space-y-6">

              <div className="border-b border-showroom-800 pb-4">
                <span className="text-[10px] uppercase font-bold tracking-wider text-showroom-cream block mb-1">
                  STEP 1 OF 2
                </span>
                <h2 className="font-display font-bold text-xl text-white">
                  Customer & Delivery Information
                </h2>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-showroom-ivory mb-1.5 uppercase tracking-wider">
                  Full Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(e.target.value);
                    if (errors.customerName) setErrors(prev => ({ ...prev, customerName: '' }));
                  }}
                  placeholder="e.g. Ananya Sharma"
                  className={`w-full bg-showroom-950/80 border rounded-2xl py-3 px-4 text-xs text-showroom-ivory placeholder-showroom-muted focus:outline-none transition-colors ${errors.customerName ? 'border-rose-500 ring-1 ring-rose-500' : 'border-showroom-750 focus:border-showroom-cream'
                    }`}
                />
                {errors.customerName && (
                  <span className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.customerName}
                  </span>
                )}
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-showroom-ivory mb-1.5 uppercase tracking-wider">
                  Email Address <span className="text-rose-400">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                  }}
                  placeholder="e.g. ananya@example.com"
                  className={`w-full bg-showroom-950/80 border rounded-2xl py-3 px-4 text-xs text-showroom-ivory placeholder-showroom-muted focus:outline-none transition-colors ${errors.email ? 'border-rose-500 ring-1 ring-rose-500' : 'border-showroom-750 focus:border-showroom-cream'
                    }`}
                />
                {errors.email && (
                  <span className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.email}
                  </span>
                )}
              </div>

              {/* Delivery Address */}
              <div>
                <label className="block text-xs font-semibold text-showroom-ivory mb-1.5 uppercase tracking-wider">
                  Street Address <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    if (errors.address) setErrors(prev => ({ ...prev, address: '' }));
                  }}
                  placeholder="e.g. 12, MG Road, Apartment 4B"
                  className={`w-full bg-showroom-950/80 border rounded-2xl py-3 px-4 text-xs text-showroom-ivory placeholder-showroom-muted focus:outline-none transition-colors ${errors.address ? 'border-rose-500 ring-1 ring-rose-500' : 'border-showroom-750 focus:border-showroom-cream'
                    }`}
                />
                {errors.address && (
                  <span className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.address}
                  </span>
                )}
              </div>

              {/* City and Postal Code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-showroom-ivory mb-1.5 uppercase tracking-wider">
                    City <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => {
                      setCity(e.target.value);
                      if (errors.city) setErrors(prev => ({ ...prev, city: '' }));
                    }}
                    placeholder="e.g. Chennai"
                    className={`w-full bg-showroom-950/80 border rounded-2xl py-3 px-4 text-xs text-showroom-ivory placeholder-showroom-muted focus:outline-none transition-colors ${errors.city ? 'border-rose-500 ring-1 ring-rose-500' : 'border-showroom-750 focus:border-showroom-cream'
                      }`}
                  />
                  {errors.city && (
                    <span className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.city}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-showroom-ivory mb-1.5 uppercase tracking-wider">
                    Postal / ZIP Code <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => {
                      setPostalCode(e.target.value);
                      if (errors.postalCode) setErrors(prev => ({ ...prev, postalCode: '' }));
                    }}
                    placeholder="e.g. 600001"
                    className={`w-full bg-showroom-950/80 border rounded-2xl py-3 px-4 text-xs text-showroom-ivory placeholder-showroom-muted focus:outline-none transition-colors ${errors.postalCode ? 'border-rose-500 ring-1 ring-rose-500' : 'border-showroom-750 focus:border-showroom-cream'
                      }`}
                  />
                  {errors.postalCode && (
                    <span className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.postalCode}
                    </span>
                  )}
                </div>
              </div>

              {/* Optional Phone & Order Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-showroom-muted mb-1.5 uppercase tracking-wider">
                    Contact Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full bg-showroom-950/80 border border-showroom-750 rounded-2xl py-3 px-4 text-xs text-showroom-ivory placeholder-showroom-muted focus:outline-none focus:border-showroom-cream transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-showroom-muted mb-1.5 uppercase tracking-wider">
                    Order Note (Optional)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Leave package by front door"
                    className="w-full bg-showroom-950/80 border border-showroom-750 rounded-2xl py-3 px-4 text-xs text-showroom-ivory placeholder-showroom-muted focus:outline-none focus:border-showroom-cream transition-colors"
                  />
                </div>
              </div>

              {/* Submit CTA Button */}
              <div className="pt-4 border-t border-showroom-800">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  id="checkout-place-order-btn"
                  className="w-full flex items-center justify-center gap-2.5 py-4 px-8 rounded-full bg-showroom-cream hover:bg-showroom-creamHover text-showroom-950 font-bold text-sm uppercase tracking-wider shadow-kiosk-button transition-all touch-btn disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Lock className="w-4 h-4 stroke-[2.5]" />
                  <span>{isSubmitting ? 'RECORDING DEMO ORDER...' : 'PLACE DEMO ORDER'}</span>
                </button>
                <p className="text-[11px] text-showroom-muted text-center mt-2.5">
                  Clicking will generate a unique demo reference order without charging any card.
                </p>
              </div>

            </form>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-showroom-900 border border-showroom-750 shadow-xl space-y-5">

              <div className="border-b border-showroom-800 pb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-showroom-cream" />
                  <h3 className="font-display font-bold text-lg text-white">
                    Order Summary
                  </h3>
                </div>
                <span className="text-xs text-showroom-muted font-medium">
                  {cartCount} {cartCount === 1 ? 'item' : 'items'}
                </span>
              </div>

              {/* Items List */}
              <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1">
                {cartItems.map((item) => (
                  <div key={item.frame.id} className="flex items-center gap-3 py-2 border-b border-showroom-850">
                    <div className="w-14 h-12 rounded-xl bg-showroom-950 p-1 flex items-center justify-center border border-showroom-800 shrink-0 overflow-hidden">
                      <img src={item.frame.image} alt={item.frame.name} className="w-full h-full object-contain" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <span className="font-display font-semibold text-xs text-white block truncate">
                        {item.frame.name}
                      </span>
                      <span className="text-[10px] text-showroom-muted block">
                        Qty: {item.quantity} • {formatINR(item.frame.price)} each
                      </span>
                    </div>

                    <span className="font-display font-bold text-xs text-showroom-cream shrink-0">
                      {formatINR(item.frame.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Calculations */}
              <div className="space-y-2 pt-2 text-xs border-t border-showroom-800">
                <div className="flex justify-between text-showroom-muted">
                  <span>Subtotal</span>
                  <span className="text-white font-medium">{formatINR(cartSubtotal)}</span>
                </div>
                <div className="flex justify-between text-showroom-muted">
                  <span className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Shipping</span>
                  </span>
                  <span className="text-emerald-400 font-semibold">Free Demo Delivery</span>
                </div>
                <div className="flex justify-between text-showroom-muted">
                  <span>Sales Tax (Demo)</span>
                  <span className="text-white font-medium">₹0</span>
                </div>

                <div className="flex justify-between text-base font-bold text-white pt-3 border-t border-showroom-800">
                  <span>Total (Demo)</span>
                  <span className="text-showroom-cream">{formatINR(cartSubtotal)}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-showroom-950/70 border border-showroom-800 text-[11px] text-showroom-muted leading-relaxed">
                <Sparkles className="w-3.5 h-3.5 text-showroom-cream inline mr-1" />
                Frames are packaged with our signature OptiTry protective hardshell case and microfiber cleaning cloth (simulated order).
              </div>

            </div>

            {/* Back Button */}
            <button
              onClick={() => goToScreen('store')}
              className="flex items-center justify-center gap-2 py-3 px-6 rounded-full bg-showroom-900 hover:bg-showroom-850 border border-showroom-750 text-showroom-muted hover:text-white text-xs font-semibold uppercase tracking-wider transition-colors touch-btn"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Store</span>
            </button>
          </div>

        </div>

      </main>
    </div>
  );
};
