import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop — Scrolls to top of page on every route change.
 *
 * React Router doesn't do this automatically. Without this component,
 * navigating from a scrolled page to a new page keeps the scroll position,
 * causing users to land mid-page instead of at the top.
 *
 * Place this inside <BrowserRouter> but outside <Routes>.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
