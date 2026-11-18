import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, Sparkles } from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cartItems,
    updateQuantity,
    removeFromCart,
    clearCart,
    cartSubtotal,
    cartCount,
    goToScreen
  } = useApp();

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    setIsCartOpen(false);
    goToScreen('checkout');
  };

  const handleContinueShopping = () => {
    setIsCartOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-showroom-950 border-l border-showroom-800 shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-6 border-b border-showroom-800/80 bg-showroom-900/60 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-showroom-850 border border-showroom-700 flex items-center justify-center text-showroom-cream">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-lg text-white tracking-tight">
                    SHOPPING BAG
                  </h2>
                  <span className="text-[11px] text-showroom-muted">
                    {cartCount} {cartCount === 1 ? 'item' : 'items'} in your cart
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 rounded-full bg-showroom-900 hover:bg-showroom-850 border border-showroom-750 text-showroom-muted hover:text-white transition-colors"
                aria-label="Close cart"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Demo Notice Banner */}
            <div className="mt-3 px-3 py-1.5 rounded-xl bg-showroom-950/80 border border-showroom-cream/20 text-[11px] text-showroom-cream flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 shrink-0" />
              <span>Demonstration Store: Prices and checkout are for evaluation.</span>
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cartItems.length > 0 ? (
              cartItems.map((item) => (
                <div
                  key={item.frame.id}
                  className="p-4 rounded-2xl bg-showroom-900/70 border border-showroom-800 flex gap-4 items-center justify-between transition-all"
                >
                  {/* Thumbnail */}
                  <div className="w-20 h-16 rounded-xl bg-showroom-950/80 p-1 flex items-center justify-center shrink-0 border border-showroom-850 overflow-hidden">
                    <img
                      src={item.frame.image}
                      alt={item.frame.name}
                      className="w-full h-full object-contain filter contrast-105"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between mb-0.5">
                      <h4 className="font-display font-bold text-sm text-white truncate">
                        {item.frame.name}
                      </h4>
                      <span className="font-display font-semibold text-xs text-showroom-cream ml-2">
                        ${item.frame.price * item.quantity}
                      </span>
                    </div>

                    <p className="text-[10px] text-showroom-muted truncate mb-2">
                      {item.frame.style} • {item.frame.shape} • {item.frame.color}
                    </p>

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center rounded-lg border border-showroom-750 bg-showroom-950">
                        <button
                          onClick={() => updateQuantity(item.frame.id, item.quantity - 1)}
                          className="p-1 px-2 text-showroom-muted hover:text-white transition-colors"
                          title="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-semibold text-showroom-ivory">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.frame.id, item.quantity + 1)}
                          className="p-1 px-2 text-showroom-muted hover:text-white transition-colors"
                          title="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.frame.id)}
                        className="p-1 text-showroom-muted hover:text-rose-400 transition-colors ml-auto"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 rounded-full bg-showroom-900 border border-showroom-750 flex items-center justify-center text-showroom-muted mb-4">
                  <ShoppingBag className="w-8 h-8 opacity-60" />
                </div>
                <h3 className="font-display font-bold text-lg text-white mb-1">
                  Your bag is empty
                </h3>
                <p className="text-xs text-showroom-muted max-w-xs mb-6">
                  Browse our collection of 40 designer frames or try on your favourite styles.
                </p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    goToScreen('store');
                  }}
                  className="px-6 py-2.5 rounded-full bg-showroom-cream text-showroom-950 font-semibold text-xs uppercase tracking-wider shadow-sm touch-btn"
                >
                  Explore Store
                </button>
              </div>
            )}
          </div>

          {/* Footer & Totals */}
          {cartItems.length > 0 && (
            <div className="p-6 border-t border-showroom-800 bg-showroom-900/80 backdrop-blur-md">
              <div className="space-y-2 mb-4 text-xs">
                <div className="flex justify-between text-showroom-muted">
                  <span>Subtotal</span>
                  <span className="text-white font-medium">${cartSubtotal} (Demo)</span>
                </div>
                <div className="flex justify-between text-showroom-muted">
                  <span>Estimated Shipping</span>
                  <span className="text-emerald-400 font-medium">Free Demo Delivery</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-showroom-800">
                  <span>Total</span>
                  <span className="text-showroom-cream">${cartSubtotal}</span>
                </div>
              </div>

              <div className="space-y-2.5">
                <button
                  onClick={handleCheckout}
                  id="cart-proceed-checkout-btn"
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-full bg-showroom-cream hover:bg-showroom-creamHover text-showroom-950 font-semibold text-xs uppercase tracking-wider shadow-kiosk-button transition-all touch-btn"
                >
                  <span>PROCEED TO CHECKOUT</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={clearCart}
                    className="text-[11px] text-showroom-muted hover:text-rose-400 transition-colors"
                  >
                    Clear Bag
                  </button>

                  <button
                    onClick={handleContinueShopping}
                    className="text-[11px] text-showroom-cream hover:underline"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
