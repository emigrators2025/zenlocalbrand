import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { LiveChatWidget } from "@/components/layout/live-chat";
import { getPublicSettings } from "@/lib/server-settings";
import "./globals.css";


export const metadata: Metadata = {
  title: "ZEN LOCAL BRAND",
  description: "Premium streetwear and fashion for those who dare to stand out.",
  keywords: ["streetwear", "fashion", "clothing", "premium", "style"],
};

const FONT_IMPORTS: Record<string, string> = {
  Inter: "Inter:wght@400;500;600;700",
  Poppins: "Poppins:wght@400;500;600;700",
  Roboto: "Roboto:wght@400;500;700",
  "Open Sans": "Open+Sans:wght@400;600;700",
  Montserrat: "Montserrat:wght@400;600;700",
  "Playfair Display": "Playfair+Display:wght@400;600;700",
  "Space Grotesk": "Space+Grotesk:wght@400;600;700",
  "DM Sans": "DM+Sans:wght@400;600;700",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getPublicSettings();
  const fontRequest = FONT_IMPORTS[settings.fontFamily];

  const cssVariables: Record<string, string> = {
    "--background": settings.backgroundColor,
    "--foreground": settings.textColor,
    "--primary-color": settings.primaryColor,
    "--accent-color": settings.accentColor,
    "--border-radius": settings.borderRadius,
    "--font-base": settings.fontFamily,
  };

  return (
    <html lang="en" className="dark" style={cssVariables}>
      <head>
        {fontRequest ? (
          <link
            rel="stylesheet"
            href={`https://fonts.googleapis.com/css2?family=${fontRequest}&display=swap`}
          />
        ) : null}
      </head>
      <body className="antialiased min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "#18181b",
              color: "var(--foreground)",
              border: "1px solid #27272a",
            },
            success: {
              iconTheme: {
                primary: settings.primaryColor,
                secondary: "#fff",
              },
            },
          }}
        />
        <Navbar settings={settings} />
        <main className="min-h-screen pt-20">{children}</main>
        <Footer settings={settings} />
        <LiveChatWidget />
      </body>
    </html>
  );
}
