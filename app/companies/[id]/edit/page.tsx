"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import api from "../../../lib/api";

interface Company {
  id: number;
  name: string;
  google_apps_script_url: string | null;
  reminder_minutes: number;
}

export default function CompanyEdit() {
  const params = useParams();
  const id = params.id;

  const [company, setCompany] = useState<Company | null>(null);
  const [name, setName] = useState("");
  const [googleUrl, setGoogleUrl] = useState("");
  const [reminderMinutes, setReminderMinutes] = useState(5);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    const fetchCompany = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/companies/${id}`);
        if (!ignore) {
          const data = res.data.data;
          setCompany(data);
          setName(data.name || "");
          setGoogleUrl(data.google_apps_script_url || "");
          setReminderMinutes(data.reminder_minutes ?? 5);
        }
      } catch (err: unknown) {
        if (!ignore) setError(err instanceof Error ? err.message : "Ошибка");
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    void fetchCompany();
    return () => { ignore = true; };
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const res = await api.patch(`/api/companies/${id}`, {
        name: name.trim(),
        google_apps_script_url: googleUrl || null,
        reminder_minutes: Number(reminderMinutes),
      });
      setCompany(res.data.data);
      setSuccess("✅ Компания обновлена");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || err.message);
      } else {
        setError(err instanceof Error ? err.message : "Ошибка");
      }
    }
  };

  if (loading) return <p>Загрузка...</p>;
  if (error && !company) return <p>Ошибка: {error}</p>;
  if (!company) return <p>Компания не найдена</p>;

  return (
    <div>
      <h1>Редактирование: {company.name}</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Название</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div>
          <label>Google Apps Script URL</label>
          <input type="text" value={googleUrl} onChange={(e) => setGoogleUrl(e.target.value)} />
        </div>

        <div>
          <label>За сколько минут уведомлять о смене</label>
          <input
            type="number"
            min="1"
            max="120"
            value={reminderMinutes}
            onChange={(e) => setReminderMinutes(Number(e.target.value))}
          />
        </div>

        <button type="submit">Сохранить</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
    </div>
  );
}
