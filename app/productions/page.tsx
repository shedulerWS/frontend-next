"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "../lib/api";
import Pagination from "../components/Pagination/Pagination";
import styles from "./productions.module.scss";

interface Production {
  id: number;
  name: string;
  google_apps_script_url: string | null;
  reminder_minutes: number | null;
}

interface Meta {
  current_page: number;
  last_page: number;
}

interface Links {
  prev: string | null;
  next: string | null;
}

export default function ProductionsPage() {
  return (
    <Suspense fallback={<p>Загрузка...</p>}>
      <Productions />
    </Suspense>
  );
}

function Productions() {
  const [productions, setProductions] = useState<Production[]>([]);
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
        const res = await api.get(`/api/productions?page=${page}`);
        if (!ignore) {
          setProductions(res.data.data);
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
    router.push(`/productions?page=${newPage}`);
  };

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p>Ошибка: {error}</p>;

  return (
    <div className={styles.mainWrapper}>
      <h1>Продакшены</h1>

      <Link href="/productions/create" className={styles.addProductionBtn}>
        Добавить
      </Link>

      <div>
        <div className={`${styles.gridRow} ${styles.headerRow}`}>
          <div>id</div>
          <div>Название</div>
          <div>Script URL</div>
          <div>Минуты</div>
          <div></div>
        </div>

        {productions.map((production) => (
          <div key={production.id} className={styles.gridRow}>
            <div>{production.id}</div>
            <div>{production.name}</div>
            <div>{production.google_apps_script_url ? "✅" : "❌"}</div>
            <div>{production.reminder_minutes ?? "-"}</div>
            <div className={styles.actionBtn}>
              <Link href={`/productions/${production.id}`}>👁</Link>
              <Link href={`/productions/${production.id}/edit`}>🖊</Link>
            </div>
          </div>
        ))}
      </div>

      <Pagination meta={meta} links={links} page={page} onPageChange={goToPage} />
    </div>
  );
}
