import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {useLocation} from 'react-router';

type AsideType = 'search' | 'cart' | 'mobile' | 'closed';
type AsideContextValue = {
  type: AsideType;
  open: (mode: AsideType) => void;
  close: () => void;
};

/**
 * A side bar component with Overlay
 * @example
 * ```jsx
 * <Aside type="search" heading="SEARCH">
 *  <input type="search" />
 *  ...
 * </Aside>
 * ```
 */
export function Aside({
  children,
  heading,
  type,
  deferContent = false,
}: {
  children?: React.ReactNode;
  type: AsideType;
  heading: React.ReactNode;
  /**
   * Don't render the (hidden) drawer contents during the first page load.
   * They mount once the browser is idle after load, or as soon as the
   * drawer opens, whichever comes first. The closed drawer is invisible, so
   * nothing changes on screen; its JavaScript just stops competing with the
   * first paint.
   */
  deferContent?: boolean;
}) {
  const {type: activeType, close} = useAside();
  const expanded = type === activeType;
  const [contentReady, setContentReady] = useState(!deferContent);

  useEffect(() => {
    if (contentReady) return;
    if (expanded) {
      setContentReady(true);
      return;
    }
    return whenIdleAfterLoad(() => setContentReady(true));
  }, [contentReady, expanded]);

  useEffect(() => {
    const abortController = new AbortController();

    if (expanded) {
      document.addEventListener(
        'keydown',
        function handler(event: KeyboardEvent) {
          if (event.key === 'Escape') {
            close();
          }
        },
        {signal: abortController.signal},
      );
    }
    return () => abortController.abort();
  }, [close, expanded]);

  return (
    <div
      aria-modal
      className={`overlay ${expanded ? 'expanded' : ''}`}
      role="dialog"
    >
      <button className="close-outside" onClick={close} />
      <aside>
        <header>
          <h3>{heading}</h3>
          <button className="close reset" onClick={close} aria-label="Close">
            &times;
          </button>
        </header>
        <main>{contentReady || expanded ? children : null}</main>
      </aside>
    </div>
  );
}

/** Runs `callback` once the page has loaded and the main thread is idle. */
function whenIdleAfterLoad(callback: () => void) {
  let idleId: number | undefined;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const schedule = () => {
    if ('requestIdleCallback' in window) {
      idleId = window.requestIdleCallback(callback, {timeout: 3000});
    } else {
      timeoutId = setTimeout(callback, 1);
    }
  };
  if (document.readyState === 'complete') schedule();
  else window.addEventListener('load', schedule, {once: true});
  return () => {
    window.removeEventListener('load', schedule);
    if (idleId !== undefined) window.cancelIdleCallback(idleId);
    if (timeoutId !== undefined) clearTimeout(timeoutId);
  };
}

const AsideContext = createContext<AsideContextValue | null>(null);

Aside.Provider = function AsideProvider({children}: {children: ReactNode}) {
  const [type, setType] = useState<AsideType>('closed');
  const close = useCallback(() => setType('closed'), []);
  const location = useLocation();

  // Close any open drawer (menu, cart, search) on every navigation,
  // including the browser's Back / Forward buttons. Otherwise the drawer
  // stayed open over the previous page with page scrolling locked, which
  // made the site look frozen.
  useEffect(() => {
    setType('closed');
  }, [location.key]);

  const value = useMemo(() => ({type, open: setType, close}), [type, close]);

  return (
    <AsideContext.Provider value={value}>{children}</AsideContext.Provider>
  );
};

export function useAside() {
  const aside = useContext(AsideContext);
  if (!aside) {
    throw new Error('useAside must be used within an AsideProvider');
  }
  return aside;
}
