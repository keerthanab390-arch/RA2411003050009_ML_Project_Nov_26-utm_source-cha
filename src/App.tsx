import React from 'react';
import { useApp } from './context/AppContext';
import { HomeScreen } from './components/screens/HomeScreen';
import { StoreScreen } from './components/screens/StoreScreen';
import { FaceAnalysisScreen } from './components/screens/FaceAnalysisScreen';
import { PrefStyleScreen } from './components/screens/PrefStyleScreen';
import { PrefShapeScreen } from './components/screens/PrefShapeScreen';
import { PrefColorSizeScreen } from './components/screens/PrefColorSizeScreen';
import { PrefBudgetScreen } from './components/screens/PrefBudgetScreen';
import { PrefSavedScreen } from './components/screens/PrefSavedScreen';
import { SummaryScreen } from './components/screens/SummaryScreen';
import { ExploreFramesScreen } from './components/screens/ExploreFramesScreen';
import { CheckoutScreen } from './components/screens/CheckoutScreen';
import { OrderConfirmationScreen } from './components/screens/OrderConfirmationScreen';
import { CartDrawer } from './components/cart/CartDrawer';

export const AppContent: React.FC = () => {
  const { currentScreen } = useApp();

  const renderScreen = () => {
    switch (currentScreen) {
      case 'store':
      case 'explore-frames':
        return <StoreScreen />;

      case 'try-on':
      case 'face-analysis':
        return <FaceAnalysisScreen />;

      case 'find-frames':
      case 'pref-style':
        return <PrefStyleScreen />;

      case 'pref-shape':
        return <PrefShapeScreen />;

      case 'pref-color-size':
        return <PrefColorSizeScreen />;

      case 'pref-budget':
        return <PrefBudgetScreen />;

      case 'pref-saved':
        return <PrefSavedScreen />;

      case 'summary':
      case 'recommendations':
        return <SummaryScreen />;

      case 'favourites':
        return <ExploreFramesScreen />;

      case 'checkout':
      case 'cart':
        return <CheckoutScreen />;

      case 'order-confirmation':
        return <OrderConfirmationScreen />;

      case 'home':
      default:
        return <HomeScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-showroom-950 text-showroom-ivory flex flex-col font-sans selection:bg-showroom-cream selection:text-showroom-950">
      {/* Subtle showroom dark ambient vignette background */}
      <div className="fixed inset-0 pointer-events-none -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-showroom-900 via-showroom-950 to-showroom-950" />

      {renderScreen()}

      <CartDrawer />
    </div>
  );
};

export const App: React.FC = () => {
  return <AppContent />;
};

export default App;