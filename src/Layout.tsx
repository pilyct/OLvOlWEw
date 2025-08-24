import type { PropsWithChildren } from "react";

type LayoutProps = PropsWithChildren<{
  title?: string;
  description?: string;
}>;

function Layout({ title, description, children }: LayoutProps) {
  return (
    <main className="container-page">
      <h1>{title}</h1>
      {description && (
        <p className="border border-[var(--color-background)] border-b-[var(--color-brand-black)]">
          {description}
        </p>
      )}
      <main className="w-full">{children}</main>
    </main>
  );
}

export default Layout;
