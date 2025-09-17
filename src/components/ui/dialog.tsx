// @ts-nocheck
import React from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";

type DialogContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const DialogContext = React.createContext<DialogContextValue | null>(null);

function useDialogContext(component: string): DialogContextValue {
  const ctx = React.useContext(DialogContext);
  if (!ctx) {
    throw new Error(`${component} must be used within <Dialog>`);
  }
  return ctx;
}

type DialogProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
};

export function Dialog({ open, defaultOpen = false, onOpenChange, children }: DialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const isControlled = typeof open === "boolean";
  const resolvedOpen = isControlled ? (open as boolean) : internalOpen;

  const setOpen = React.useCallback(
    (value: boolean) => {
      if (!isControlled) {
        setInternalOpen(value);
      }
      onOpenChange?.(value);
    },
    [isControlled, onOpenChange]
  );

  const value = React.useMemo<DialogContextValue>(
    () => ({ open: resolvedOpen, setOpen }),
    [resolvedOpen, setOpen]
  );

  return <DialogContext.Provider value={value}>{children}</DialogContext.Provider>;
}

type DialogTriggerProps = {
  children: React.ReactElement;
  asChild?: boolean;
};

export function DialogTrigger({ children }: DialogTriggerProps) {
  const ctx = useDialogContext("DialogTrigger");
  const child = React.Children.only(children) as React.ReactElement<any>;

  const handleClick = (event: React.MouseEvent<any>) => {
    child.props?.onClick?.(event);
    ctx.setOpen(true);
  };

  return React.cloneElement(child, {
    onClick: handleClick,
    "aria-haspopup": "dialog",
    "aria-expanded": ctx.open,
  });
}

type DialogContentProps = {
  className?: string;
  children: React.ReactNode;
};

export function DialogContent({ className, children }: DialogContentProps) {
  const ctx = useDialogContext("DialogContent");

  React.useEffect(() => {
    if (!ctx.open) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [ctx.open]);

  React.useEffect(() => {
    if (!ctx.open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        ctx.setOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [ctx]);

  if (typeof document === "undefined") {
    return null;
  }

  if (!ctx.open) {
    return null;
  }

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      ctx.setOpen(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-slate-900/40"
        onClick={handleOverlayClick}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        className={clsx(
          "relative z-10 w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl",
          className
        )}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}

type DialogHeaderProps = {
  className?: string;
  children: React.ReactNode;
};

export function DialogHeader({ className, children }: DialogHeaderProps) {
  return <div className={clsx("mb-4 space-y-1", className)}>{children}</div>;
}

type DialogFooterProps = {
  className?: string;
  children: React.ReactNode;
};

export function DialogFooter({ className, children }: DialogFooterProps) {
  return (
    <div
      className={clsx(
        "mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
    >
      {children}
    </div>
  );
}

type DialogTitleProps = React.HTMLAttributes<HTMLHeadingElement>;

type DialogDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>;

export const DialogTitle = React.forwardRef<HTMLHeadingElement, DialogTitleProps>(
  ({ className, ...props }, ref) => (
    <h2
      ref={ref}
      className={clsx("text-lg font-semibold text-slate-900", className)}
      {...props}
    />
  )
);
DialogTitle.displayName = "DialogTitle";

export const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  DialogDescriptionProps
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={clsx("text-sm text-slate-600", className)}
    {...props}
  />
));
DialogDescription.displayName = "DialogDescription";
