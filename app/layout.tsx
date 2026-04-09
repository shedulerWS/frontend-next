import type { Metadata } from "next";
import "./globals.scss";
import styles from "./app.module.scss";
import { ThemeProvider } from "./context/ThemeContext";
import { Header } from "./components/Header/Header";
import { Sidebar } from "./components/Sidebar/Sidebar";

export const metadata: Metadata = {
  title: "SchedulerWS",
  description: "Scheduler Workspace",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>
        <ThemeProvider>
          <div className={styles.app}>
            <Header />
            <main>
              <Sidebar />
              <div className={styles.mainContent}>{children}</div>
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
