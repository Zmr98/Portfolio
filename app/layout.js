import './globals.css';

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://portfolio-rho-cyan-zt6fuhvx6f.vercel.app'),
  title: 'Mohamed Zameer — IT & Digital Officer / Video Editor',
  description: 'Portfolio of Mohamed Zameer — IT & Digital Officer, video editor and graphic designer based in Colombo, Sri Lanka.',
  openGraph: {
    title: 'Mohamed Zameer — IT & Digital Officer / Video Editor',
    description: 'IT infrastructure by day, video edits and design work by night. Based in Colombo, Sri Lanka.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mohamed Zameer — IT & Digital Officer / Video Editor',
    description: 'IT infrastructure by day, video edits and design work by night. Based in Colombo, Sri Lanka.',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
