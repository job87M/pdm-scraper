import { useCallback, useMemo, useReducer, useRef } from 'react';
import { buildProductView } from '../lib/productView.js';

const initialState = {
  products: [],
  search: '',
  sortBy: 'newest',
  deleteError: '',
  deleting: [],
};

function reducer(state, action) {
  switch (action.type) {
    case 'products/added':
      return {
        ...state,
        products: [
          ...action.products,
          ...state.products.filter((p) => !action.products.some((added) => added.id === p.id)),
        ],
      };
    case 'products/set':
      return { ...state, products: action.products };
    case 'search':
      return { ...state, search: action.value };
    case 'sort':
      return { ...state, sortBy: action.value };
    case 'delete/start':
      return {
        ...state,
        deleteError: '',
        deleting: [...state.deleting, action.id],
        products: state.products.filter((p) => p.id !== action.id),
      };
    case 'delete/end':
      return { ...state, deleting: state.deleting.filter((id) => id !== action.id) };
    default:
      return state;
  }
}

export function useProducts() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const productsRef = useRef(state.products);
  productsRef.current = state.products;

  const remove = useCallback((id) => {
    dispatch({ type: 'delete/start', id });
    // Instant local delete — no backend
    dispatch({ type: 'delete/end', id });
  }, []);

  const view = useMemo(
    () => buildProductView(state.products, state.search, state.sortBy),
    [state.products, state.search, state.sortBy],
  );

  return {
    ...view,
    loading: false,
    error: '',
    deleteError: state.deleteError,
    deleting: state.deleting,
    reload: () => {}, // no-op
    remove,
    addProducts: (products) => dispatch({ type: 'products/added', products }),
    setSearch: (value) => dispatch({ type: 'search', value }),
    setSortBy: (value) => dispatch({ type: 'sort', value }),
    clearAll: () => dispatch({ type: 'products/set', products: [] }),
  };
}
