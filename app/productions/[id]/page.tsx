"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "../../lib/api";

interface Production {
  id: number;
  name: string;
  google_apps_script_url: string | null;
}

export default function ProductionShow() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;

  const [production, setProduction] = useState<Production | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    const fetchProduction = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/productions/${id}`);
        if (!ignore) setProduction(res.data.data);
      } catch (err: unknown) {
        if (!ignore) setError(err instanceof Error ? err.message : "Ошибка");
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    void fetchProduction();
    return () => { ignore = true; };
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("Перенести продакшен в архив?")) return;

    try {
      await api.delete(`/api/productions/${id}`);
      router.push("/productions");
    } catch (err: unknown) {
      alert("Ошибка удаления: " + (err instanceof Error ? err.message : ""));
    }
  };

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p>Ошибка: {error}</p>;
  if (!production) return <p>Продакшен не найден</p>;

  return (
    <div>
      <h1>{production.name}</h1>
      <span>Script URL: {production.google_apps_script_url ? "✅" : "❌"}</span>
      <br />

      <Link href={`/productions/${production.id}/edit`}>Редактировать</Link>

      <button onClick={handleDelete} style={{ marginLeft: "10px", color: "red" }}>
        В архив
      </button>
    </div>
  );
}
