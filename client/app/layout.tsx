import type { Metadata } from "next";
import { CartSync } from "@/components/cart/cart-sync";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import "@/components/styles/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Falcon — Everyday things, better chosen",
    template: "%s | Falcon",
  },
  description:
    "Falcon is a modern storefront for useful, beautiful products. Browse 500+ items across electronics, audio, lifestyle and accessories.",
  applicationName: SITE_NAME,
  openGraph: {
    title: "Falcon — Everyday things, better chosen",
    description:
      "Browse 500+ products across electronics, audio, lifestyle and accessories.",
    siteName: SITE_NAME,
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>
        {children}
        <CartSync />
      </body>
    </html>
  );
}
