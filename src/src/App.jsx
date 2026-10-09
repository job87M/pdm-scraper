import { useEffect } from 'react';
import ProductsView from './components/ProductsView.jsx';
import ScrapeForm from './components/ScrapeForm.jsx';
import Sidebar from './components/Sidebar.jsx';
import Topbar from './components/Topbar.jsx';
import { useHashRoute } from './hooks/useHashRoute.js';
import { useProducts } from './hooks/useProducts.js';

export default function App() {
  const route = useHashRoute();
  const products = useProducts();

  useEffect(() => {
    document.title =
      route === 'products' ? 'Products · Pricedrop Product Tracker' : 'Pricedrop Product Tracker';
  }, [route]);

  return (
    <div className="app-shell">
      <Sidebar route={route} />
      <div className="app-column">
        <Topbar route={route} />
        <main id="app" className="app-content">
          {route === 'products' ? (
            <ProductsView {...products} />
          ) : (
            <ScrapeForm onSaved={products.addProducts} />
          )}
        </main>
      </div>
    </div>
  );
}
