import { formatRemaining, msRemaining } from '../lib/countdown.js';
import { formatPrice } from '../lib/format.js';

export default function ProductCard({ product, removing, onRemove, now }) {
  const remaining = msRemaining(product.deal_ends_at, now);
  return (
    <article className="product-card">
      {product.image_url && <img className="product-image" src={product.image_url} alt="" />}
      <div className="product-details">
        <h3>
          <a href={product.source_url} target="_blank" rel="noreferrer">{product.title}</a>
        </h3>
        <p className="product-price">{formatPrice(product.price)}</p>
        {Number.isFinite(product.deal_percentage) && (
          <p className="product-savings">{product.deal_percentage}% savings</p>
        )}
        {remaining !== null && (
          <p className={`product-countdown${remaining <= 0 ? ' ended' : ''}`}>
            {remaining <= 0 ? 'Deal ended' : <>Ends in <time dateTime={product.deal_ends_at}>{formatRemaining(remaining)}</time></>}
          </p>
        )}
        {product.description && <p>{product.description}</p>}
        <button
          type="button"
          className="button button-secondary"
          disabled={removing}
          aria-label={`Remove ${product.title}`}
          onClick={() => onRemove(product.id)}
        >
          {removing ? 'Removing…' : 'Remove'}
        </button>
      </div>
    </article>
  );
}
