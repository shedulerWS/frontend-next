"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import api from "../../lib/api";

interface User {
  id: number;
  name: string;
  username: string;
  role: { id: number; name: string } | null;
  production: { id: number; name: string } | null;
  created_at: string;
  is_active: boolean;
}

interface Production {
  id: number;
  name: string;
}

interface Role {
  id: number;
  name: string;
}

export default function UserShow() {
  const params = useParams();
  const id = params.id;

  const [user, setUser] = useState<User | null>(null);
  const [productions, setProductions] = useState<Production[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedProduction, setSelectedProduction] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    const fetchUser = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/users/${id}`);
        if (!ignore) {
          setUser(res.data.data);
          setSelectedProduction(res.data.data.production?.id?.toString() || "");
          setSelectedRole(res.data.data.role?.id?.toString() || "");
          setIsActive(!!res.data.data.is_active);
        }
      } catch (err: unknown) {
        if (!ignore) setError(err instanceof Error ? err.message : "Ошибка");
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    const fetchProductions = async () => {
      try {
        const res = await api.get("/api/productions");
        if (!ignore) setProductions(res.data.data);
      } catch (err) {
        console.error("Ошибка загрузки продакшенов:", err);
      }
    };

    const fetchRoles = async () => {
      try {
        const res = await api.get("/api/roles");
        if (!ignore) setRoles(res.data.data);
      } catch (err) {
        console.error("Ошибка загрузки ролей:", err);
      }
    };

    void fetchUser();
    void fetchProductions();
    void fetchRoles();

    return () => { ignore = true; };
  }, [id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await api.patch(`/api/users/${id}`, {
        production_id: selectedProduction || null,
        role_id: selectedRole || null,
        is_active: isActive,
      });
      setUser(res.data.data);
      alert("✅ Пользователь обновлён");
    } catch (err: unknown) {
      alert("❌ Ошибка: " + (err instanceof Error ? err.message : ""));
    }
  };

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p>Ошибка: {error}</p>;
  if (!user) return <p>Пользователь не найден</p>;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>Username: {user.username}</p>
      <p>Роль: {user.role?.name || "—"}</p>
      {user.production && <p>Продакшн: {user.production.name}</p>}
      <p>Создан: {user.created_at}</p>

      <Link href={`/users/${user.id}/edit`}>Редактировать</Link>

      <hr />

      <form onSubmit={handleSave}>
        <label>Прикрепить к продакшену:</label>
        <select value={selectedProduction} onChange={(e) => setSelectedProduction(e.target.value)}>
          <option value="">-- Не выбран --</option>
          {productions.map((prod) => (
            <option key={prod.id} value={prod.id}>
              {prod.name}
            </option>
          ))}
        </select>

        <br /><br />

        <label>Роль:</label>
        <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
          <option value="">-- Не выбрана --</option>
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>

        <br /><br />

        <label>
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          Активен
        </label>

        <br /><br />

        <button type="submit">Сохранить</button>
      </form>
    </div>
  );
}
