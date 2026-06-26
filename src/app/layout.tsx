import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbar";


export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "CompellingCore", template: "%s — CompellingCore" },
  description: "Role-gated community drops for CompellingCore members.",
  openGraph: {
    title: "CompellingCore",
    description: "Controlled releases. One compelling core.",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
    type: "website"
  },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
  icons: { icon: "/brand-mark.png", apple: "/brand-mark.png" }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="ambient ambient-one" />
        <div className="ambient ambient-two" />
        <Navbar />
        <main>{children}</main>
        <footer className="site-footer shell">
          <span>© {new Date().getFullYear()} compellingcore</span>
          <span>Built for authorized community releases.</span>
        </footer>
      </body>
    </html>
  );
}
