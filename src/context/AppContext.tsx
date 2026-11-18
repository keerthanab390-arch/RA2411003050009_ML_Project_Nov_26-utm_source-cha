import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  KioskScreen,
  FaceAnalysisData,
  UserPreferencesState,
  FaceShape,
  RawFacialMeasurements,
  FacialProportions,
  GlassesFitData,
  FrameItem,
  CartItem,
  OrderDetails
} from '../types';

interface AppContextType {
  currentScreen: KioskScreen;
  goToScreen: (screen: KioskScreen) => void;
  goBack: () => void;
  analysisData: FaceAnalysisData;
  setAnalysisData: React.Dispatch<React.SetStateAction<FaceAnalysisData>>;
  capturedPhoto: string | null;
  setCapturedPhoto: (photo: string | null) => void;
  glassesFit: GlassesFitData | null;
  setGlassesFit: (fit: GlassesFitData | null) => void;
  saveCalculatedAnalysis: (
    shape?: FaceShape,
    measurements?: RawFacialMeasurements | null,
    proportions?: FacialProportions | null
  ) => void;
  preferences: UserPreferencesState;
  updatePreferences: (updates: Partial<UserPreferencesState>) => void;
  selectedFrameId: string | null;
  setSelectedFrameId: (id: string | null) => void;
  favourites: string[];
  toggleFavourite: (frameId: string) => void;
  isFavourite: (frameId: string) => boolean;
  // Shopping Cart
  cartItems: CartItem[];
  addToCart: (frame: FrameItem, quantity?: number) => void;
  removeFromCart: (frameId: string) => void;
  updateQuantity: (frameId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  buyNow: (frame: FrameItem) => void;
  // Checkout & Orders
  lastOrder: OrderDetails | null;
  setLastOrder: (order: OrderDetails | null) => void;
  placeOrder: (customer: {
    customerName: string;
    email: string;
    address: string;
    city: string;
    postalCode: string;
  }) => OrderDetails;
  resetAll: () => void;
}

const defaultAnalysis: FaceAnalysisData = {
  faceShape: 'Oval',
  measurements: {
    faceWidth: '—',
    faceHeight: '—',
    faceRatio: '—',
    foreheadWidth: '—',
    cheekboneWidth: '—',
    jawWidth: '—',
    eyeDistance: '—'
  },
  isComplete: false,
  capturedPhoto: null
};

const defaultPreferences: UserPreferencesState = {
  style: 'Classic',
  shape: 'Rectangle',
  color: 'Black',
  size: 'Medium',
  budget: 'Any Budget'
};

const VALID_SCREENS: KioskScreen[] = [
  'home',
  'store',
  'explore-frames',
  'try-on',
  'face-analysis',
  'find-frames',
  'pref-style',
  'pref-shape',
  'pref-color-size',
  'pref-budget',
  'pref-saved',
  'summary',
  'recommendations',
  'favourites',
  'checkout',
  'cart',
  'order-confirmation'
];

const getInitialScreen = (): KioskScreen => {
  try {
    const hash = window.location.hash.replace(/^#\/?/, '') as KioskScreen;
    if (VALID_SCREENS.includes(hash)) {
      return hash;
    }
    const saved = sessionStorage.getItem('optitry_current_screen') as KioskScreen;
    if (saved && VALID_SCREENS.includes(saved)) {
      return saved;
    }
  } catch {
    // fallback
  }
  return 'home';
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentScreen, setCurrentScreen] = useState<KioskScreen>(getInitialScreen);
  const [history, setHistory] = useState<KioskScreen[]>([getInitialScreen()]);
  const [analysisData, setAnalysisData] = useState<FaceAnalysisData>(defaultAnalysis);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem('optitry_captured_photo');
    } catch {
      return null;
    }
  });
  const [glassesFit, setGlassesFit] = useState<GlassesFitData | null>(() => {
    try {
      const saved = sessionStorage.getItem('optitry_glasses_fit');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [selectedFrameId, setSelectedFrameId] = useState<string | null>('frame-1');
  const [preferences, setPreferences] = useState<UserPreferencesState>(defaultPreferences);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [lastOrder, setLastOrder] = useState<OrderDetails | null>(() => {
    try {
      const saved = localStorage.getItem('optitry_last_order');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [favourites, setFavourites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('optitry_favourites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('optitry_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('optitry_favourites', JSON.stringify(favourites));
    } catch (e) {
      console.warn('Unable to persist favourites to localStorage', e);
    }
  }, [favourites]);

  useEffect(() => {
    try {
      localStorage.setItem('optitry_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.warn('Unable to persist cart to localStorage', e);
    }
  }, [cartItems]);

  useEffect(() => {
    try {
      if (lastOrder) {
        localStorage.setItem('optitry_last_order', JSON.stringify(lastOrder));
      }
    } catch (e) {
      console.warn('Unable to persist order to localStorage', e);
    }
  }, [lastOrder]);

  useEffect(() => {
    try {
      sessionStorage.setItem('optitry_current_screen', currentScreen);
    } catch (e) {
      console.warn('Unable to persist currentScreen to sessionStorage', e);
    }
  }, [currentScreen]);

  useEffect(() => {
    try {
      if (capturedPhoto) {
        sessionStorage.setItem('optitry_captured_photo', capturedPhoto);
      } else {
        sessionStorage.removeItem('optitry_captured_photo');
      }
    } catch (e) {
      console.warn('Unable to persist capturedPhoto to sessionStorage', e);
    }
  }, [capturedPhoto]);

  useEffect(() => {
    try {
      if (glassesFit) {
        sessionStorage.setItem('optitry_glasses_fit', JSON.stringify(glassesFit));
      } else {
        sessionStorage.removeItem('optitry_glasses_fit');
      }
    } catch (e) {
      console.warn('Unable to persist glassesFit to sessionStorage', e);
    }
  }, [glassesFit]);

  const toggleFavourite = (frameId: string) => {
    setFavourites(prev => 
      prev.includes(frameId) ? prev.filter(id => id !== frameId) : [...prev, frameId]
    );
  };

  const isFavourite = (frameId: string) => favourites.includes(frameId);

  // Cart Management
  const addToCart = (frame: FrameItem, quantity: number = 1) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.frame.id === frame.id);
      if (existing) {
        return prev.map(item =>
          item.frame.id === frame.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { frame, quantity }];
    });
  };

  const removeFromCart = (frameId: string) => {
    setCartItems(prev => prev.filter(item => item.frame.id !== frameId));
  };

  const updateQuantity = (frameId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(frameId);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.frame.id === frameId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.quantity, 0);
  }, [cartItems]);

  const cartSubtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + (item.frame.price * item.quantity), 0);
  }, [cartItems]);

  const buyNow = (frame: FrameItem) => {
    setSelectedFrameId(frame.id);
    addToCart(frame, 1);
    goToScreen('checkout');
  };

  const placeOrder = (customer: {
    customerName: string;
    email: string;
    address: string;
    city: string;
    postalCode: string;
  }): OrderDetails => {
    const orderRef = `OPT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const order: OrderDetails = {
      orderId: orderRef,
      items: [...cartItems],
      subtotal: cartSubtotal,
      shipping: 0,
      total: cartSubtotal,
      customerName: customer.customerName,
      email: customer.email,
      address: customer.address,
      city: customer.city,
      postalCode: customer.postalCode,
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
    setLastOrder(order);
    setCartItems([]);
    goToScreen('order-confirmation');
    return order;
  };

  const goToScreen = (screen: KioskScreen) => {
    setHistory(prev => [...prev, screen]);
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    if (history.length > 1) {
      const newHistory = [...history];
      newHistory.pop(); // Remove current
      const prevScreen = newHistory[newHistory.length - 1];
      setHistory(newHistory);
      setCurrentScreen(prevScreen);
    } else {
      setCurrentScreen('home');
      setHistory(['home']);
    }
  };

  const saveCalculatedAnalysis = (
    shape: FaceShape = 'Oval',
    raw?: RawFacialMeasurements | null,
    proportions?: FacialProportions | null
  ) => {
    setAnalysisData({
      faceShape: shape,
      measurements: raw ? {
        faceWidth: raw.faceWidth.toFixed(3),
        faceHeight: raw.faceHeight.toFixed(3),
        faceRatio: raw.faceRatio.toFixed(3),
        foreheadWidth: raw.foreheadWidth.toFixed(3),
        cheekboneWidth: raw.cheekboneWidth.toFixed(3),
        jawWidth: raw.jawWidth.toFixed(3),
        eyeDistance: raw.eyeDistance.toFixed(3)
      } : defaultAnalysis.measurements,
      proportions: proportions || undefined,
      isComplete: true,
      capturedPhoto
    });
  };

  const updatePreferences = (updates: Partial<UserPreferencesState>) => {
    setPreferences(prev => ({ ...prev, ...updates }));
  };

  const resetAll = () => {
    setAnalysisData(defaultAnalysis);
    setCapturedPhoto(null);
    setGlassesFit(null);
    setPreferences(defaultPreferences);
    setHistory(['home']);
    setCurrentScreen('home');
    try {
      sessionStorage.removeItem('optitry_current_screen');
      sessionStorage.removeItem('optitry_captured_photo');
      sessionStorage.removeItem('optitry_glasses_fit');
    } catch {
      // ignore
    }
  };

  // Sync with browser hash if user presses browser back
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace(/^#\/?/, '') as KioskScreen;
      if (hash && VALID_SCREENS.includes(hash) && hash !== currentScreen) {
        setCurrentScreen(hash);
      }
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [currentScreen]);

  useEffect(() => {
    if (window.location.hash.replace(/^#\/?/, '') !== currentScreen) {
      window.location.hash = currentScreen;
    }
  }, [currentScreen]);

  useEffect(() => {
    (window as any).__OPTITRY_APP__ = {
      setCapturedPhoto,
      setGlassesFit,
      setSelectedFrameId,
      goToScreen
    };
  }, [setCapturedPhoto, setGlassesFit, setSelectedFrameId, goToScreen]);

  return (
    <AppContext.Provider
      value={{
        currentScreen,
        goToScreen,
        goBack,
        analysisData,
        setAnalysisData,
        capturedPhoto,
        setCapturedPhoto,
        glassesFit,
        setGlassesFit,
        saveCalculatedAnalysis,
        preferences,
        updatePreferences,
        selectedFrameId,
        setSelectedFrameId,
        favourites,
        toggleFavourite,
        isFavourite,
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartSubtotal,
        isCartOpen,
        setIsCartOpen,
        buyNow,
        lastOrder,
        setLastOrder,
        placeOrder,
        resetAll
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
