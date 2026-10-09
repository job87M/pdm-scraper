import { useEffect, useState } from 'react';

export const ROUTES = ['scrape', 'products'];

function readRoute() {
  const hash = window.location.hash.replace(/^#/, '');
  return ROUTES.includes(hash) ? hash : 'scrape';
}

export function useHashRoute() {
  const [route, setRoute] = useState(readRoute);

  useEffect(() => {
    const onHashChange = () => setRoute(readRoute());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  return route;
}
