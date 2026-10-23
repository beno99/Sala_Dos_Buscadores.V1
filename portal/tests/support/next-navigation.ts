import { vi } from "vitest";

/**
 * Substituto de `next/navigation` para testes de componente. Ajuste a rota
 * atual com `navigationMock.setPath("/salas/nag-hammadi?tema=morte")` e
 * confira navegações com `navigationMock.router.push`.
 */
let url = new URL("http://localhost/");

const router = {
  push: vi.fn((href: string) => {
    url = new URL(href, url);
  }),
  replace: vi.fn((href: string) => {
    url = new URL(href, url);
  }),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  prefetch: vi.fn(),
};

export const navigationMock = {
  router,
  useRouter: () => router,
  usePathname: () => url.pathname,
  useSearchParams: () => new URLSearchParams(url.search),
  useParams: () => ({}),
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
  redirect: (href: string) => {
    throw new Error(`NEXT_REDIRECT ${href}`);
  },
  permanentRedirect: (href: string) => {
    throw new Error(`NEXT_REDIRECT 308 ${href}`);
  },
  setPath(href: string) {
    url = new URL(href, "http://localhost");
  },
  reset() {
    url = new URL("http://localhost/");
    for (const fn of Object.values(router)) fn.mockClear();
  },
};
