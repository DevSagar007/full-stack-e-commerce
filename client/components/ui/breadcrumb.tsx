import Link from "next/link";

type BreadcrumbItem = { label: string; href?: string };

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mx-auto mt-3 mb-6 w-full max-w-7xl ">
      <ol className="m-0 flex min-w-0 list-none items-center space-x-2 overflow-hidden p-0 text-sm leading-5">
        {items.map((item, index) => (
          <li className="flex min-w-0 items-center space-x-2" key={`${item.label}-${index}`}>
            {index > 0 && <span aria-hidden="true" className="shrink-0 text-[#94a3b8]">›</span>}
            {item.href ? (
              <Link href={item.href} className="whitespace-nowrap">
                {item.label}
              </Link>
            ) : (
              <span className="truncate text-[#475569]" aria-current="page">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
