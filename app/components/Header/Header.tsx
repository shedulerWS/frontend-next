"use client";

import { useTheme } from "../../hooks/useTheme";
import styles from "./Header.module.scss";

export function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className={styles.mainHeader}>
      <button onClick={toggleTheme}>
        {theme === "light" ? "🌙 Тёмная" : "☀️ Светлая"}
      </button>
    </header>
  );
}
