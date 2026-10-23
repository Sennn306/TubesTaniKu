'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export type Tautan = {
  href: string;
  label: string;
};

interface TautanNavProps {
  tautan: Tautan[];
}

export default function TautanNav({ tautan }: TautanNavProps) {
  const pathname = usePathname();

  return (
    <ul className="flex flex-col gap-2 sm:flex-row sm:gap-6">
      {tautan.map((t) => {
        const aktif =
          t.href === '/'
            ? pathname === '/'
            : pathname.startsWith(t.href);

        return (
          <li key={t.href}>
            <Link
              href={t.href}
              aria-current={aktif ? 'page' : undefined}
              className={`text-sm font-medium transition-colors ${
                aktif
                  ? 'text-emerald-600 font-semibold underline underline-offset-4'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}