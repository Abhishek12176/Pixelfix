import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';

export const metadata: Metadata = {
  title: 'PixelFix — Free AI Object Removal in Browser',
  description:
    'Remove unwanted objects, people, and watermarks from photos 100% free directly in your browser. No server uploads, zero cost, completely private.',
  keywords: ['object remover', 'ai inpainting', 'lama onnx', 'free photo editor', 'remove watermark'],
  authors: [{ name: 'Abhishek', url: 'https://abhishek-portfolio-pi-lyart.vercel.app/' }],
  openGraph: {
    title: 'PixelFix — Free AI Object Removal in Browser',
    description: 'Remove unwanted objects from photos directly in your browser without servers or signups.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%237C5CFC'><path d='M7 17L14 10M14 10L17 13M14 10L12 8M17 13L15 15'/><circle cx='8' cy='8' r='1'/></svg>"
        />
        {/* Load official onnxruntime-web 1.19.2 distribution */}
        <Script
          src="https://cdn.jsdelivr.net/npm/onnxruntime-web@1.19.2/dist/ort.all.min.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className="bg-[#0A0A0B] text-[#EDEDED] antialiased selection:bg-primary selection:text-white">
        {children}
      </body>
    </html>
  );
}
