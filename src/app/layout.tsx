import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme";
import { AuthProvider } from "@/features/auth/state/AuthProvider";
import { TaskProvider } from "@/features/tasks/state/TaskProvider";
import { CategoryProvider } from "@/features/categories/state/CategoryProvider";
import { PriorityProvider } from "@/features/priorities/state/PriorityProvider";

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
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {/*
           * All three feature providers are nested inside AuthProvider so they
           * can read useAuth().status for auth-gated initial fetches (Pitfall 4).
           * CategoryProvider and PriorityProvider wrap TaskProvider so all pages
           * can access category and priority data without prop drilling (ARCH-01).
           */}
          <AuthProvider>
            <CategoryProvider>
              <PriorityProvider>
                <TaskProvider>{children}</TaskProvider>
              </PriorityProvider>
            </CategoryProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
