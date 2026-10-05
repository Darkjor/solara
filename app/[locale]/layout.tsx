import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import Script from "next/script";
import { Assistant, Federo } from "next/font/google";
import "../globals.css";
import { routing } from "@/i18n/routing";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { RevealObserver } from "@/components/RevealObserver";
import { ExitIntent } from "@/components/ExitIntent";
import { ALLOW_INDEXING, SITE_URL } from "@/lib/seo";
import { site } from "@/lib/site";

const federo = Federo({ subsets: ["latin"], weight: "400", variable: "--font-federo", display: "swap" });
const assistant = Assistant({ subsets: ["latin", "latin-ext"], variable: "--font-assistant", display: "swap" });

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    metadataBase: new URL(SITE_URL),
    title: t("title"),
    description: t("description"),
    applicationName: site.name,
    alternates: { canonical: locale === "en" ? "/en" : "/", languages: { es: "/", en: "/en" } },
    openGraph: {
      type: "website",
      locale: locale === "en" ? "en_US" : "es_MX",
      siteName: site.name,
      title: t("ogTitle"),
      description: t("ogDescription"),
      images: [{ url: "/og.jpg", width: 1200, height: 630, alt: site.name }],
    },
    twitter: { card: "summary_large_image", title: t("ogTitle"), description: t("ogDescription"), images: ["/og.jpg"] },
    robots: ALLOW_INDEXING ? { index: true, follow: true } : { index: false, follow: false },
  };
}

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#f5f3ef" };

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  // Al navegador solo viajan los textos de los componentes cliente. Si un
  // componente cliente nuevo usa otro namespace, agregarlo aqui.
  const all = await getMessages();
  const messages = {
    a11y: all.a11y,
    nav: all.nav,
    quote: all.quote,
    brokers: all.brokers,
    exit: all.exit,
    whatsapp: all.whatsapp,
    mobileBar: all.mobileBar,
    lots: all.lots,
    availability: all.availability,
    location: all.location,
  };

  return (
    <html lang={locale} suppressHydrationWarning className={`${federo.variable} ${assistant.variable} antialiased`}>
      <head>
        {/* Activa las animaciones de entrada ANTES del primer render. Si el JS
            de la app no marca los elementos en 3 s, se muestran todos. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){var c=document.documentElement.classList;c.add('reveal-ready');try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&!sessionStorage.getItem('solara-intro')){sessionStorage.setItem('solara-intro','1');c.add('hero-intro')}}catch(e){}setTimeout(function(){if(!window.__solaraReveal){document.querySelectorAll('.reveal').forEach(function(e){e.classList.add('is-visible')})}},3000)})();",
          }}
        />
      </head>
      <body className="flex min-h-dvh flex-col">
        {GTM_ID && (
          <Script id="gtm" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`}
          </Script>
        )}
        <NextIntlClientProvider messages={messages}>
          <Header />
          <main id="contenido" className="flex-1">
            {children}
          </main>
          <Footer />
          <WhatsAppFloat />
          <RevealObserver />
          <ExitIntent />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
