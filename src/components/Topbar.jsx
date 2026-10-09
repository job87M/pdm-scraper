const titles = {
  scrape: 'Product dashboard',
  products: 'Products',
  settings: 'Settings',
};

export default function Topbar({ route }) {
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">AMAZON PRODUCT TRACKER</p>
        <h1 id="page-title">{titles[route] ?? 'Amazon Product Tracker'}</h1>
      </div>
      {route !== 'scrape' && (
        <a className="topbar-link" href="#scrape">
          Add a product <span aria-hidden="true">↗</span>
        </a>
      )}
    </header>
  );
}
