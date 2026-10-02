// Arayüz Next sayfası değil: "/" → public/index.html (next.config.ts).
// Bu kök layout yalnız Next'in zorunlu iskeleti için var.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
