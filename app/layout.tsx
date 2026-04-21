import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "./components/Sidebar";

export const metadata: Metadata = {
  title: "ContextHub",
  description: "案件管理・意思決定共有ツール",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body style={{ margin: 0, padding: 0, backgroundColor: "#f8fafc" }}>
        <div style={{ display: "flex" }}>
          <Sidebar />
          <main style={{ marginLeft: 60, flex: 1, minHeight: "100vh" }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}