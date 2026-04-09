"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import api from "../../../lib/api";

interface User {
  id: number;
  name: string;
}

export default function UserEdit() {
  const params = useParams();
  const id = params.id;

  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    const fetchUser = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/users/${id}`);
        if (!ignore) {
          setUser(res.data.data);
          setName(res.data.data.name);
        }
      } catch (err: unknown) {
        if (!ignore) setError(err instanceof Error ? err.message : "Ошибка");
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    void fetchUser();
    return () => { ignore = true; };
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const res = await api.patch(`/api/users/${id}`, {
        name: name.trim(),
      });
      setUser(res.data.data);
      setSuccess("✅ Пользователь обновлён");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || err.message);
      } else {
        setError(err instanceof Error ? err.message : "Ошибка");
      }
    }
  };

  if (loading) return <p>Загрузка...</p>;
  if (error && !user) return <p>Ошибка: {error}</p>;
  if (!user) return <p>Пользователь не найден</p>;

  return (
    <div>
      <h1>Редактирование: {user.name}</h1>

      <form onSubmit={handleSubmit}>
        <label>Название</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <button type="submit">Сохранить</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
    </div>
  );
}
