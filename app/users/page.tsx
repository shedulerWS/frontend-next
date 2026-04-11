"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
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
  company: { id: number; name: string } | null;
  role: { id: number; name: string } | null;
  is_active: boolean;
}

interface Company {
  id: number;
  name: string;
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
  const searchParams = useSearchParams();
  const router = useRouter();

  const page = Number(searchParams.get("page") || 1);
  const urlSearch = searchParams.get("search") ?? "";
  const urlCompanyId = searchParams.get("company_id") ?? "";

  // Local input state is separate from the URL-backed query so typing feels
  // instant; it is pushed to the URL after a short debounce.
  const [searchInput, setSearchInput] = useState(urlSearch);

  const [users, setUsers] = useState<User[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [links, setLinks] = useState<Links | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Keep the local search input in sync when URL changes from outside
  // (pagination, back button, filter reset, etc.).
  useEffect(() => {
    setSearchInput(urlSearch);
  }, [urlSearch]);

  // Debounce pushing the search input to the URL (400ms).
  useEffect(() => {
    if (searchInput === urlSearch) return;
    const t = setTimeout(() => {
      updateUrl({ search: searchInput, page: 1 });
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  // Load companies once for the filter dropdown.
  useEffect(() => {
    let ignore = false;
    api
      .get("/api/companies")
      .then((res) => {
        if (!ignore) setCompanies(res.data.data ?? []);
      })
      .catch((err) => console.error("Ошибка загрузки компаний:", err));
    return () => {
      ignore = true;
    };
  }, []);

  // Fetch users whenever the URL query (page/search/company_id) changes.
  useEffect(() => {
    let ignore = false;

    const fetchData = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        params.set("page", String(page));
        if (urlSearch) params.set("search", urlSearch);
        if (urlCompanyId) params.set("company_id", urlCompanyId);

        const res = await api.get(`/api/users?${params.toString()}`);
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
    return () => {
      ignore = true;
    };
  }, [page, urlSearch, urlCompanyId]);

  const updateUrl = (patch: { search?: string; company_id?: string; page?: number }) => {
    const params = new URLSearchParams(searchParams.toString());

    if (patch.search !== undefined) {
      if (patch.search) params.set("search", patch.search);
      else params.delete("search");
    }
    if (patch.company_id !== undefined) {
      if (patch.company_id) params.set("company_id", patch.company_id);
      else params.delete("company_id");
    }
    if (patch.page !== undefined) {
      params.set("page", String(patch.page));
    }

    router.push(`/users?${params.toString()}`);
  };

  const goToPage = (newPage: number) => updateUrl({ page: newPage });

  const sortedCompanies = useMemo(
    () => [...companies].sort((a, b) => a.name.localeCompare(b.name, "ru")),
    [companies],
  );

  return (
    <div className={styles.mainWrapper}>
      <h1>Пользователи</h1>

      <div className={styles.filters}>
        <input
          type="text"
          placeholder="Поиск по нику или Telegram ID"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className={styles.searchInput}
        />

        <select
          value={urlCompanyId}
          onChange={(e) => updateUrl({ company_id: e.target.value, page: 1 })}
          className={styles.companySelect}
        >
          <option value="">Все компании</option>
          {sortedCompanies.map((company) => (
            <option key={company.id} value={company.id}>
              {company.name}
            </option>
          ))}
        </select>

        {(urlSearch || urlCompanyId) && (
          <button
            type="button"
            onClick={() => updateUrl({ search: "", company_id: "", page: 1 })}
            className={styles.resetBtn}
          >
            Сбросить
          </button>
        )}
      </div>

      {loading && <p>Загрузка...</p>}
      {error && <p>Ошибка: {error}</p>}

      {!loading && !error && (
        <>
          <div className={styles.cardsUsers}>
            <div className={`${styles.gridRow} ${styles.headerRow}`}>
              <div>Имя</div>
              <div>Никнейм</div>
              <div>TG чат id</div>
              <div>Компания</div>
              <div>Роль</div>
              <div>Активен</div>
              <div></div>
            </div>

            {users.length === 0 && (
              <p className={styles.empty}>Ничего не найдено</p>
            )}

            {users.map((user) => (
              <div key={user.id} className={styles.gridRow}>
                <div>{user.name}</div>
                <div>{user.username}</div>
                <div>{user.telegram_chat_id}</div>
                <div>{user.company?.name ?? "—"}</div>
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
        </>
      )}
    </div>
  );
}
