"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "../../lib/api";

interface Company {
  id: number;
  name: string;
  google_apps_script_url: string | null;
}

export default function CompanyShow() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;

  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    const fetchCompany = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/companies/${id}`);
        if (!ignore) setCompany(res.data.data);
      } catch (err: unknown) {
        if (!ignore) setError(err instanceof Error ? err.message : "Ошибка");
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    void fetchCompany();
    return () => { ignore = true; };
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("Перенести компанию в архив?")) return;

    try {
      await api.delete(`/api/companies/${id}`);
      router.push("/companies");
    } catch (err: unknown) {
      alert("Ошибка удаления: " + (err instanceof Error ? err.message : ""));
    }
  };

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p>Ошибка: {error}</p>;
  if (!company) return <p>Компания не найдена</p>;

  return (
    <div>
      <h1>{company.name}</h1>
      <span>Script URL: {company.google_apps_script_url ? "✅" : "❌"}</span>
      <br />

      <Link href={`/companies/${company.id}/edit`}>Редактировать</Link>

      <button onClick={handleDelete} style={{ marginLeft: "10px", color: "red" }}>
        В архив
      </button>
    </div>
  );
}
