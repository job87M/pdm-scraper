const links = [
  { route: 'scrape', label: 'Scraper', icon: '⌕' },
  { route: 'products', label: 'Products', icon: '▤' },
];

export default function Sidebar({ route }) {
  return (
    <aside className="sidebar" aria-label="Main navigation">
      <a className="brand" href="#scrape" aria-label="Amazon Product Tracker home">
        <span className="brand-mark" aria-hidden="true">A</span>
        <span>Product Tracker</span>
      </a>
      <nav className="navigation">
        {links.map((link) => (
          <a
            key={link.route}
            className="navigation-link"
            href={`#${link.route}`}
            aria-current={route === link.route ? 'page' : undefined}
          >
            <span aria-hidden="true">{link.icon}</span>
            {link.label}
          </a>
        ))}
      </nav>
      <div className="sidebar-caption">Track products. Spot deals.</div>
    </aside>
  );
}
