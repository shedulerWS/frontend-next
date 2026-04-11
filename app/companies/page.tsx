"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "../lib/api";
import Pagination from "../components/Pagination/Pagination";
import styles from "./companies.module.scss";

interface Company {
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

export default function CompaniesPage() {
  return (
    <Suspense fallback={<p>Загрузка...</p>}>
      <Companies />
    </Suspense>
  );
}

function Companies() {
  const [companies, setCompanies] = useState<Company[]>([]);
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
        const res = await api.get(`/api/companies?page=${page}`);
        if (!ignore) {
          setCompanies(res.data.data);
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
    router.push(`/companies?page=${newPage}`);
  };

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p>Ошибка: {error}</p>;

  return (
    <div className={styles.mainWrapper}>
      <h1>Компании</h1>

      <Link href="/companies/create" className={styles.addCompanyBtn}>
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

        {companies.map((company) => (
          <div key={company.id} className={styles.gridRow}>
            <div>{company.id}</div>
            <div>{company.name}</div>
            <div>{company.google_apps_script_url ? "✅" : "❌"}</div>
            <div>{company.reminder_minutes ?? "-"}</div>
            <div className={styles.actionBtn}>
              <Link href={`/companies/${company.id}`}>👁</Link>
              <Link href={`/companies/${company.id}/edit`}>🖊</Link>
            </div>
          </div>
        ))}
      </div>

      <Pagination meta={meta} links={links} page={page} onPageChange={goToPage} />
    </div>
  );
}
