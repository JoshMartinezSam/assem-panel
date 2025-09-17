declare module "react" {
  export type ReactNode = any;
  export type ReactElement = any;
  export type JSXElementConstructor<P> = any;
  export type Ref<T> = any;
  export type MutableRefObject<T> = { current: T };

  export const Children: {
    only<T>(children: T): T;
  };

  export function createContext<T>(defaultValue: T): any;
  export function useContext<T>(context: any): T;
  export function useState<T>(
    initial: T | (() => T)
  ): [T, (value: T | ((prev: T) => T)) => void];
  export function useMemo<T>(factory: () => T, deps: unknown[]): T;
  export function useEffect(effect: () => void | (() => void), deps?: unknown[]): void;
  export function useRef<T>(initialValue: T | null): MutableRefObject<T | null>;
  export function useCallback<T extends (...args: any[]) => any>(fn: T, deps: unknown[]): T;
  export function forwardRef<T, P = {}>(render: (props: P, ref: Ref<T>) => ReactElement): any;
  export function cloneElement(element: any, props?: any): any;
  export const Fragment: unique symbol;

  export default any;
}

declare module "react-dom" {
  export function createPortal(children: any, container: Element | DocumentFragment): any;
}

declare module "react-dom/client" {
  export function createRoot(container: Element | DocumentFragment): {
    render(children: any): void;
  };
}

declare module "react/jsx-runtime" {
  export const jsx: any;
  export const jsxs: any;
  export const Fragment: any;
}

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}
