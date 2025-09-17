// @ts-nocheck
import React from "react";
import clsx from "clsx";

type DropdownContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.MutableRefObject<HTMLElement | null>;
  contentRef: React.MutableRefObject<HTMLDivElement | null>;
};

const DropdownContext = React.createContext<DropdownContextValue | null>(null);

function useDropdownContext(component: string): DropdownContextValue {
  const ctx = React.useContext(DropdownContext);
  if (!ctx) {
    throw new Error(`${component} must be used within <DropdownMenu>`);
  }
  return ctx;
}

type DropdownMenuProps = {
  children: React.ReactNode;
};

export function DropdownMenu({ children }: DropdownMenuProps) {
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLElement | null>(null);
  const contentRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        contentRef.current &&
        triggerRef.current &&
        !contentRef.current.contains(target) &&
        !triggerRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  const value = React.useMemo<DropdownContextValue>(
    () => ({ open, setOpen, triggerRef, contentRef }),
    [open]
  );

  return (
    <DropdownContext.Provider value={value}>
      <div className="relative inline-flex">{children}</div>
    </DropdownContext.Provider>
  );
}

type DropdownMenuTriggerProps = {
  children: React.ReactElement;
  asChild?: boolean;
};

export function DropdownMenuTrigger({ children }: DropdownMenuTriggerProps) {
  const ctx = useDropdownContext("DropdownMenuTrigger");
  const child = React.Children.only(children) as React.ReactElement<any>;

  const handleRef = (node: HTMLElement | null) => {
    ctx.triggerRef.current = node;
    const { ref } = child as { ref?: React.Ref<any> };
    if (!ref) return;
    if (typeof ref === "function") {
      ref(node);
    } else if (typeof ref === "object") {
      (ref as React.MutableRefObject<any>).current = node;
    }
  };

  const handleClick = (event: React.MouseEvent<any>) => {
    child.props?.onClick?.(event);
    ctx.setOpen(!ctx.open);
  };

  return React.cloneElement(child, {
    ref: handleRef,
    onClick: handleClick,
    "aria-haspopup": "menu",
    "aria-expanded": ctx.open,
  });
}

type DropdownMenuContentProps = {
  children: React.ReactNode;
  align?: "start" | "end";
  className?: string;
};

export function DropdownMenuContent({
  children,
  align = "start",
  className,
}: DropdownMenuContentProps) {
  const ctx = useDropdownContext("DropdownMenuContent");
  if (!ctx.open) return null;

  const setRef = (node: HTMLDivElement | null) => {
    ctx.contentRef.current = node;
  };

  return (
    <div
      ref={setRef}
      role="menu"
      className={clsx(
        "absolute z-50 mt-2 min-w-[10rem] rounded-xl border border-slate-200 bg-white p-1 shadow-xl",
        align === "end" ? "right-0" : "left-0",
        className
      )}
    >
      {children}
    </div>
  );
}

type DropdownMenuItemProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  inset?: boolean;
};

export function DropdownMenuItem({ className, inset, onClick, ...props }: DropdownMenuItemProps) {
  const ctx = useDropdownContext("DropdownMenuItem");

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    ctx.setOpen(false);
  };

  return (
    <button
      type="button"
      role="menuitem"
      className={clsx(
        "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100",
        inset && "pl-8",
        className
      )}
      onClick={handleClick}
      {...props}
    />
  );
}
