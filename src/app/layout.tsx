import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/features/auth/state/AuthProvider";
import { TaskProvider } from "@/features/tasks/state/TaskProvider";

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
        {/* TaskProvider is nested inside AuthProvider so it can read useAuth().status */}
        <AuthProvider>
          <TaskProvider>{children}</TaskProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
