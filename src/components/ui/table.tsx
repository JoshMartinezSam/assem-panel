// @ts-nocheck
import React from "react";
import clsx from "clsx";

type TableProps = React.TableHTMLAttributes<HTMLTableElement>;

export const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, ...props }, ref) => (
    <table
      ref={ref}
      className={clsx("w-full border-collapse text-left", className)}
      {...props}
    />
  )
);
Table.displayName = "Table";

type TableSectionProps = React.HTMLAttributes<HTMLTableSectionElement>;

export const TableHeader = React.forwardRef<HTMLTableSectionElement, TableSectionProps>(
  ({ className, ...props }, ref) => (
    <thead ref={ref} className={clsx("bg-slate-50", className)} {...props} />
  )
);
TableHeader.displayName = "TableHeader";

export const TableBody = React.forwardRef<HTMLTableSectionElement, TableSectionProps>(
  ({ className, ...props }, ref) => (
    <tbody ref={ref} className={clsx("divide-y divide-slate-100", className)} {...props} />
  )
);
TableBody.displayName = "TableBody";

type TableRowProps = React.HTMLAttributes<HTMLTableRowElement>;

export const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, ...props }, ref) => (
    <tr ref={ref} className={clsx("border-b border-slate-100", className)} {...props} />
  )
);
TableRow.displayName = "TableRow";

type TableHeadCellProps = React.ThHTMLAttributes<HTMLTableHeaderCellElement>;

export const TableHead = React.forwardRef<HTMLTableHeaderCellElement, TableHeadCellProps>(
  ({ className, ...props }, ref) => (
    <th
      ref={ref}
      className={clsx("px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500", className)}
      {...props}
    />
  )
);
TableHead.displayName = "TableHead";

type TableCellProps = React.TdHTMLAttributes<HTMLTableCellElement>;

export const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, ...props }, ref) => (
    <td ref={ref} className={clsx("px-4 py-3 align-middle", className)} {...props} />
  )
);
TableCell.displayName = "TableCell";
