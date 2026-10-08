function compareValues(left, right) {
  if (left == null && right == null) return 0;
  if (left == null) return 1;
  if (right == null) return -1;
  return left < right ? -1 : left > right ? 1 : 0;
}

export function sortProducts(products, sortBy) {
  const sorted = [...products];

  switch (sortBy) {
    case 'oldest':
      return sorted.sort((a, b) => compareValues(a.created_at, b.created_at));
    case 'price-asc':
      return sorted.sort((a, b) => compareValues(a.price, b.price));
    case 'price-desc':
      return sorted.sort((a, b) => compareValues(b.price, a.price));
    case 'savings-desc':
      return sorted.sort((a, b) => compareValues(b.deal_percentage, a.deal_percentage));
    case 'title-asc':
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    default:
      return sorted.sort((a, b) => compareValues(b.created_at, a.created_at));
  }
}

export function buildProductView(products, search, sortBy) {
  const normalizedSearch = search.trim().toLocaleLowerCase();
  const matchingProducts = products.filter((product) => (
    !normalizedSearch
    || [product.title, product.description, product.source_url]
      .some((value) => value?.toLocaleLowerCase().includes(normalizedSearch))
  ));
  const pricedProducts = products.filter((product) => Number.isFinite(product.price));
  const savings = products.filter((product) => Number.isFinite(product.deal_percentage));

  return {
    products,
    search,
    sortBy,
    visibleProducts: sortProducts(matchingProducts, sortBy),
    statistics: {
      total: products.length,
      withPrice: pricedProducts.length,
      averagePrice: pricedProducts.length
        ? pricedProducts.reduce((total, product) => total + product.price, 0) / pricedProducts.length
        : null,
      averageSavings: savings.length
        ? savings.reduce((total, product) => total + product.deal_percentage, 0) / savings.length
        : null,
    },
  };
}
