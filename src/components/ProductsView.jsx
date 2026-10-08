import { formatPrice } from '../lib/format.js';
import { useNow } from '../hooks/useNow.js';
import ExportPanel from './ExportPanel.jsx';
import ProductCard from './ProductCard.jsx';

const sortOptions = [
  ['newest', 'Newest'],
  ['oldest', 'Oldest'],
  ['price-asc', 'Price: low to high'],
  ['price-desc', 'Price: high to low'],
  ['savings-desc', 'Highest savings'],
  ['title-asc', 'Title'],
];

function Statistics({ statistics }) {
  return (
    <div className="product-statistics">
      <div><span>Total products</span><strong>{statistics.total}</strong></div>
      <div><span>Average price</span><strong>{formatPrice(statistics.averagePrice)}</strong></div>
      <div>
        <span>Average savings</span>
        <strong>
          {Number.isFinite(statistics.averageSavings) ? `${statistics.averageSavings.toFixed(1)}%` : '—'}
        </strong>
      </div>
    </div>
  );
}

export default function ProductsView({
  products,
  visibleProducts,
  statistics,
  search,
  sortBy,
  loading,
  error,
  deleteError,
  deleting,
  reload,
  remove,
  setSearch,
  setSortBy,
}) {
  const now = useNow(products.some((product) => product.deal_ends_at));
  let list;
  if (loading) {
    list = <div className="empty-state"><p>Loading saved products…</p></div>;
  } else if (error) {
    list = (
      <div className="empty-state">
        <p role="alert">{error}</p>
        <button type="button" className="button" onClick={reload}>Try again</button>
      </div>
    );
  } else if (visibleProducts.length) {
    list = visibleProducts.map((product) => (
      <ProductCard
        key={product.id}
        product={product}
        removing={deleting.includes(product.id)}
        onRemove={remove}
        now={now}
      />
    ));
  } else {
    list = (
      <div className="empty-state">
        <h3>{products.length ? 'No matching products' : 'No products yet'}</h3>
        <p>{products.length ? 'Try changing your search.' : 'Scrape a product card on the Scraper page to get started. Data is kept only in this browser session.'}</p>
      </div>
    );
  }

  return (
    <section id="products" className="panel" aria-labelledby="products-title">
      <div className="section-heading">
        <div>
          <h2 id="products-title">Products</h2>
          <p>{statistics.total} · {statistics.withPrice} with a price</p>
        </div>
        <div className="product-controls">
          <label className="visually-hidden" htmlFor="product-search">Search products</label>
          <input
            id="product-search"
            type="search"
            value={search}
            placeholder="Search products"
            disabled={loading}
            onChange={(event) => setSearch(event.target.value)}
          />
          <label className="visually-hidden" htmlFor="product-sort">Sort products</label>
          <select
            id="product-sort"
            value={sortBy}
            disabled={loading}
            onChange={(event) => setSortBy(event.target.value)}
          >
            {sortOptions.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>
      {products.length > 0 && <ExportPanel products={visibleProducts} />}
      {deleteError && <p className="form-status error" role="alert">{deleteError}</p>}
      {products.length > 0 && <Statistics statistics={statistics} />}
      <div className="product-list">{list}</div>
    </section>
  );
}
