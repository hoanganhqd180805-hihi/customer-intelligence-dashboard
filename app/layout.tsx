import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Customer Intelligence",
  description: "Customer Intelligence analytics dashboard prototype",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
