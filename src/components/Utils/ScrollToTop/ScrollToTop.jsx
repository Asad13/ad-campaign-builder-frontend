import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function ScrollToTop(initiator) {
  const location = useLocation();
  useEffect(() => window.scrollTo(0, 0), [location.pathname,initiator]);

  return null;
}

export default ScrollToTop;