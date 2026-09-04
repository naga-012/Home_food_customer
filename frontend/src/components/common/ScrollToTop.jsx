import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component scrolls the window to the top (0, 0)
 * whenever the user navigates to any page or route.
 */
const ScrollToTop = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant',
    });
    // Ensure document and body scroll positions are also reset
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname, search]);

  useEffect(() => {
    // Also handle clicking on links that point to the current page
    const handleLinkClick = (e) => {
      const link = e.target.closest('a');
      if (link && link.href) {
        try {
          const url = new URL(link.href, window.location.origin);
          if (url.origin === window.location.origin && url.pathname === window.location.pathname) {
            window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
          }
        } catch (err) {
          // ignore invalid URLs
        }
      }
    };

    document.addEventListener('click', handleLinkClick);
    return () => document.removeEventListener('click', handleLinkClick);
  }, []);

  return null;
};

export default ScrollToTop;
