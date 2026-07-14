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
  companies: { id: number; name: string }[];
  created_at: string;
  is_active: boolean;
  last_notified_at: string | null;
}

interface Company {
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
  const [companies, setCompanies] = useState<Company[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<number[]>([]);
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
          setSelectedCompanyIds(
            (res.data.data.companies ?? []).map((c: Company) => c.id),
          );
          setSelectedRole(res.data.data.role?.id?.toString() || "");
          setIsActive(!!res.data.data.is_active);
        }
      } catch (err: unknown) {
        if (!ignore) setError(err instanceof Error ? err.message : "Ошибка");
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    const fetchCompanies = async () => {
      try {
        const res = await api.get("/api/companies");
        if (!ignore) setCompanies(res.data.data);
      } catch (err) {
        console.error("Ошибка загрузки компаний:", err);
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
    void fetchCompanies();
    void fetchRoles();

    return () => { ignore = true; };
  }, [id]);

  const toggleCompany = (companyId: number) => {
    setSelectedCompanyIds((prev) =>
      prev.includes(companyId)
        ? prev.filter((c) => c !== companyId)
        : [...prev, companyId],
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await api.patch(`/api/users/${id}`, {
        company_ids: selectedCompanyIds,
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
      <p>
        Компании:{" "}
        {user.companies.length > 0
          ? user.companies.map((c) => c.name).join(", ")
          : "—"}
      </p>
      <p>Создан: {user.created_at}</p>
      <p>Последнее уведомление: {user.last_notified_at ?? "— (ни разу)"}</p>

      <Link href={`/users/${user.id}/edit`}>Редактировать</Link>

      <hr />

      <form onSubmit={handleSave}>
        <label>Прикрепить к компаниям:</label>
        <div>
          {companies.map((company) => (
            <label key={company.id} style={{ display: "block" }}>
              <input
                type="checkbox"
                checked={selectedCompanyIds.includes(company.id)}
                onChange={() => toggleCompany(company.id)}
              />
              {company.name}
            </label>
          ))}
        </div>

        <br />

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
