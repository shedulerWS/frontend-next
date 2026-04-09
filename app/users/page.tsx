"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "../lib/api";
import Pagination from "../components/Pagination/Pagination";
import styles from "./users.module.scss";

interface User {
  id: number;
  name: string;
  username: string;
  telegram_chat_id: number | null;
  production: { id: number; name: string } | null;
  role: { id: number; name: string } | null;
  is_active: boolean;
}

interface Meta {
  current_page: number;
  last_page: number;
}

interface Links {
  prev: string | null;
  next: string | null;
}

export default function UsersPage() {
  return (
    <Suspense fallback={<p>Загрузка...</p>}>
      <Users />
    </Suspense>
  );
}

function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [links, setLinks] = useState<Links | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const page = Number(searchParams.get("page") || 1);

  useEffect(() => {
    let ignore = false;

    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/users?page=${page}`);
        if (!ignore) {
          setUsers(res.data.data);
          setMeta(res.data.meta);
          setLinks(res.data.links);
        }
      } catch (err: unknown) {
        if (!ignore) setError(err instanceof Error ? err.message : "Ошибка");
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    void fetchData();
    return () => { ignore = true; };
  }, [page]);

  const goToPage = (newPage: number) => {
    router.push(`/users?page=${newPage}`);
  };

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p>Ошибка: {error}</p>;

  return (
    <div className={styles.mainWrapper}>
      <h1>Пользователи</h1>

      <div className={styles.cardsUsers}>
        <div className={`${styles.gridRow} ${styles.headerRow}`}>
          <div>Имя</div>
          <div>Никнейм</div>
          <div>TG чат id</div>
          <div>Продакшен</div>
          <div>Роль</div>
          <div>Активен</div>
          <div></div>
        </div>

        {users.map((user) => (
          <div key={user.id} className={styles.gridRow}>
            <div>{user.name}</div>
            <div>{user.username}</div>
            <div>{user.telegram_chat_id}</div>
            <div>{user.production?.name ?? "—"}</div>
            <div>{user.role?.name ?? "—"}</div>
            <div>{user.is_active ? "✅" : "❌"}</div>
            <div className={styles.actionBtn}>
              <Link href={`/users/${user.id}`}>👁</Link>
              <Link href={`/users/${user.id}/edit`}>🖊</Link>
            </div>
          </div>
        ))}
      </div>

      <Pagination meta={meta} links={links} page={page} onPageChange={goToPage} />
    </div>
  );
}
