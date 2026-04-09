"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./Sidebar.module.scss";

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""}`}>
      <div className={styles.collapsedWrapper}>
        <button onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? "➡️" : "⬅️"}
        </button>
      </div>
      {!collapsed && (
        <div className={styles.menuList}>
          <Link href="/">Главная</Link>
          <Link href="/productions">Продакшены</Link>
          <Link href="/users">Пользователи</Link>
        </div>
      )}
    </aside>
  );
}
