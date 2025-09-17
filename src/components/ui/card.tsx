// @ts-nocheck
import React from "react";
import clsx from "clsx";

type DivProps = React.HTMLAttributes<HTMLDivElement>;

type CardProps = DivProps;

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={clsx("rounded-2xl border border-slate-200 bg-white shadow-sm", className)}
      {...props}
    />
  )
);
Card.displayName = "Card";

export const CardHeader = React.forwardRef<HTMLDivElement, DivProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={clsx("px-6 py-4", className)} {...props} />
  )
);
CardHeader.displayName = "CardHeader";

export const CardContent = React.forwardRef<HTMLDivElement, DivProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={clsx("px-6 pb-6", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

export const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h2 ref={ref} className={clsx("text-lg font-semibold", className)} {...props} />
  )
);
CardTitle.displayName = "CardTitle";
