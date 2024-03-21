import { Links, Meta, Scripts, Outlet, LiveReload, ScrollRestoration } from "@remix-run/react";
import { NextUIProvider } from "@nextui-org/react";
import { Providers } from  './providers';

export default function Root() {
  return (
    <html lang="en" className="dark">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Providers> {/* Wrapping the app content with Providers */}
          <NextUIProvider>
            <main className="dark text-foreground bg-background">
              <Outlet />
              <ScrollRestoration />
              <Scripts />
              <LiveReload />
            </main>
          </NextUIProvider>
        </Providers>
      </body>
    </html>
  );
}
