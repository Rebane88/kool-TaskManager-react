import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/features/auth/state/AuthProvider";

export const metadata: Metadata = {
  title: "TaskManager",
  description: "Personal task management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
