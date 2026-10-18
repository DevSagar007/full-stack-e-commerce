import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn("my-10 flex w-full items-center justify-center", className)}
      {...props}
    />
  );
}

function PaginationContent({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex flex-row items-center gap-2", className)}
      {...props}
    />
  );
}

function PaginationItem({ className, ...props }: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" className={cn(className)} {...props} />;
}

type PaginationLinkProps = {
  isActive?: boolean;
  asChild?: boolean;
} & React.ComponentProps<"a">;

function PaginationLink({
  className,
  isActive,
  asChild = false,
  ...props
}: PaginationLinkProps) {
  const Comp = asChild ? Slot : "a";

  return (
    <Comp
      data-slot="pagination-link"
      aria-current={isActive ? "page" : undefined}
      className={cn(buttonVariants({ variant: isActive ? "outline" : "ghost", size: "icon" }), "inline-flex h-9 min-w-9 items-center justify-center rounded-md border border-(--line) bg-white px-2 text-sm font-medium hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40", isActive && "active border-(--teal) bg-(--teal) text-white hover:bg-[#009c80]", className)}
      {...props}
    />
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
};
