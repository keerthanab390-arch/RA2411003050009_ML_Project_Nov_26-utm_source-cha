import React from 'react';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';
import {
  CheckCircle2,
  Package,
  ShoppingBag,
  Camera,
  MapPin,
  Mail,
  User,
  Sparkles
} from 'lucide-react';

export const OrderConfirmationScreen: React.FC = () => {
  const { lastOrder, goToScreen } = useApp();

  if (!lastOrder) {
    return (
      <div className="flex-1 flex flex-col min-h-screen bg-showroom-950 text-showroom-ivory">
        <Header title="ORDER STATUS" showBack={true} />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto my-auto">
          <Package className="w-16 h-16 text-showroom-muted mb-4 opacity-50" />
          <h2 className="font-display font-bold text-2xl text-white mb-2">
            No Recent Demo Order
          </h2>
          <p className="text-xs text-showroom-muted mb-6 leading-relaxed">
            You don't have any placed demo orders yet. Explore our frames catalogue or try on spectacles in our studio.
          </p>
          <button
            onClick={() => goToScreen('store')}
            className="py-3 px-8 rounded-full bg-showroom-cream text-showroom-950 font-semibold text-xs uppercase tracking-wider shadow-sm"
          >
            Go to Store
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-showroom-950 text-showroom-ivory">
      <Header
        title="ORDER CONFIRMED"
        subtitle="Thank you for trying OptiTry! Your demonstration order has been successfully recorded."
        showBack={false}
      />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        
        {/* Success Card Header */}
        <div className="p-8 rounded-3xl bg-showroom-900 border border-showroom-750 shadow-2xl flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 mb-5 shadow-[0_0_30px_rgba(52,211,153,0.25)]">
            <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
          </div>

          <span className="text-[11px] font-bold uppercase tracking-widest text-showroom-cream mb-1">
            DEMONSTRATION ORDER PLACED
          </span>

          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight mb-2">
            Reference #{lastOrder.orderId}
          </h1>

          <p className="text-xs sm:text-sm text-showroom-muted max-w-md mb-6 leading-relaxed">
            A confirmation receipt has been simulated for <strong className="text-white">{lastOrder.email}</strong>. No real payment was collected.
          </p>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-showroom-950/80 border border-showroom-750 text-xs text-showroom-cream">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Order Date: {lastOrder.createdAt}</span>
          </div>
        </div>

        {/* Order Details & Summary Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-showroom-900 border border-showroom-750 shadow-xl space-y-6">
          <div className="border-b border-showroom-800 pb-4">
            <h2 className="font-display font-bold text-xl text-white">
              Order Details & Delivery Summary
            </h2>
          </div>

          {/* Customer & Address Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-showroom-950/70 border border-showroom-800 space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-showroom-muted block tracking-wider">
                Recipient
              </span>
              <div className="flex items-center gap-2 text-white font-medium">
                <User className="w-3.5 h-3.5 text-showroom-cream shrink-0" />
                <span>{lastOrder.customerName}</span>
              </div>
              <div className="flex items-center gap-2 text-showroom-muted">
                <Mail className="w-3.5 h-3.5 text-showroom-cream shrink-0" />
                <span className="truncate">{lastOrder.email}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-showroom-950/70 border border-showroom-800 space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-showroom-muted block tracking-wider">
                Delivery Address (Demo)
              </span>
              <div className="flex items-start gap-2 text-white font-medium">
                <MapPin className="w-3.5 h-3.5 text-showroom-cream shrink-0 mt-0.5" />
                <span>{lastOrder.address}, {lastOrder.city} {lastOrder.postalCode}</span>
              </div>
              <span className="text-[10px] text-emerald-400 block pl-5.5">
                Standard Free Demo Shipping (Simulated)
              </span>
            </div>
          </div>

          {/* Purchased Items List */}
          <div>
            <span className="text-[10px] uppercase font-bold text-showroom-muted block tracking-wider mb-3">
              Items in This Order ({lastOrder.items.reduce((acc, i) => acc + i.quantity, 0)})
            </span>

            <div className="space-y-3">
              {lastOrder.items.map((item) => (
                <div
                  key={item.frame.id}
                  className="p-3 rounded-2xl bg-showroom-950/50 border border-showroom-800 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-12 rounded-xl bg-showroom-900 border border-showroom-750 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                      <img src={item.frame.image} alt={item.frame.name} className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <span className="font-display font-semibold text-xs text-white block">
                        {item.frame.name}
                      </span>
                      <span className="text-[10px] text-showroom-muted">
                        {item.frame.style} • {item.frame.shape} • {item.frame.color}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-semibold text-showroom-cream block">
                      ${item.frame.price * item.quantity} (Demo)
                    </span>
                    <span className="text-[10px] text-showroom-muted">
                      Qty: {item.quantity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="p-4 rounded-2xl bg-showroom-950/80 border border-showroom-800 space-y-2 text-xs">
            <div className="flex justify-between text-showroom-muted">
              <span>Subtotal</span>
              <span className="text-white">${lastOrder.subtotal}</span>
            </div>
            <div className="flex justify-between text-showroom-muted">
              <span>Shipping</span>
              <span className="text-emerald-400">Free ($0.00)</span>
            </div>
            <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-showroom-800">
              <span>Total Paid (Simulated)</span>
              <span className="text-showroom-cream">${lastOrder.total}</span>
            </div>
          </div>

        </div>

        {/* Action Buttons to Continue Journeys */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-4">
          <button
            onClick={() => goToScreen('store')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 py-3.5 px-8 rounded-full bg-showroom-cream hover:bg-showroom-creamHover text-showroom-950 font-bold text-xs uppercase tracking-wider shadow-kiosk-button transition-all touch-btn"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Continue Shopping</span>
          </button>

          <button
            onClick={() => goToScreen('try-on')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 py-3.5 px-7 rounded-full bg-showroom-900 hover:bg-showroom-850 border border-showroom-750 text-showroom-cream font-semibold text-xs uppercase tracking-wider transition-colors touch-btn"
          >
            <Camera className="w-4 h-4" />
            <span>Virtual Try-On Studio</span>
          </button>

          <button
            onClick={() => goToScreen('home')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 py-3.5 px-6 rounded-full bg-showroom-950 hover:bg-showroom-900 border border-showroom-800 text-showroom-muted hover:text-white text-xs font-semibold uppercase tracking-wider transition-colors touch-btn"
          >
            <span>Back to Home</span>
          </button>
        </div>

      </main>
    </div>
  );
};
