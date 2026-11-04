import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

const LocationContext = createContext({ pathname: '/' });
const NavigateContext = createContext(() => {});
const OutletContext = createContext(null);

export function BrowserRouter({ children }) {
  const [location, setLocation] = useState(() => ({ pathname: window.location.pathname }));
  const navigate = useCallback((to, replace = false) => {
    window.history[replace ? 'replaceState' : 'pushState']({}, '', to);
    setLocation({ pathname: window.location.pathname });
  }, []);
  useEffect(() => { const onPop = () => setLocation({ pathname: window.location.pathname }); window.addEventListener('popstate', onPop); return () => window.removeEventListener('popstate', onPop); }, []);
  return <LocationContext.Provider value={location}><NavigateContext.Provider value={navigate}>{children}</NavigateContext.Provider></LocationContext.Provider>;
}
export function useLocation() { return useContext(LocationContext); }
export function useNavigate() { return useContext(NavigateContext); }
export function Route() { return null; }
export function Routes({ children }) {
  const { pathname } = useLocation();
  const list = React.Children.toArray(children);
  const match = (routes) => {
    let fallback = null;
    for (const route of routes) {
      const props = route.props;
      if (props.path === '*') { fallback = props.element; continue; }
      const target = props.index ? '/' : props.path?.startsWith('/') ? props.path : props.path ? `/${props.path}` : null;
      if (target && target !== pathname) continue;
      const nested = props.children ? match(React.Children.toArray(props.children)) : null;
      if (props.children && !nested) continue;
      const child = nested;
      return props.element ? <OutletContext.Provider value={child}>{props.element}</OutletContext.Provider> : child;
    }
    return fallback;
  };
  return match(list) || null;
}
export function Outlet() { return useContext(OutletContext); }
export function Navigate({ to, replace = false }) { const navigate = useNavigate(); useEffect(() => navigate(to, replace), [to, replace, navigate]); return null; }
function Anchor({ to, children, className, onClick, end, ...props }) {
  const { pathname } = useLocation();
  const active = pathname === to || (!end && to !== '/' && pathname.startsWith(`${to}/`));
  const classes = typeof className === 'function' ? className({ isActive: active }) : className;
  const navigate = useNavigate();
  return <a href={to} className={classes} {...props} onClick={(event) => { onClick?.(event); if (!event.defaultPrevented && event.button === 0 && !event.metaKey && !event.ctrlKey) { event.preventDefault(); navigate(to); } }}>{children}</a>;
}
export function Link(props) { return <Anchor {...props}/>; }
export function NavLink(props) { return <Anchor {...props}/>; }
