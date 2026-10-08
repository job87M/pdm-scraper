const titles = {
  scrape: 'Product dashboard',
  products: 'Products',
};

export default function Topbar({ route }) {
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">AMAZON PRODUCT TRACKER</p>
        <h1 id="page-title">{titles[route]}</h1>
      </div>
      <a className="topbar-link" href="#scrape">
        Add a product <span aria-hidden="true">↗</span>
      </a>
    </header>
  );
}
