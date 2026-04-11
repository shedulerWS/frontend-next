"use client";

import { useState } from "react";
import axios from "axios";
import api from "../../lib/api";

export default function CompanyCreate() {
  const [name, setName] = useState("");
  const [googleUrl, setGoogleUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      await api.post("/api/companies", {
        name,
        google_apps_script_url: googleUrl || null,
      });
      setSuccess("Компания успешно создана!");
      setName("");
      setGoogleUrl("");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Ошибка при создании");
      } else {
        setError("Ошибка при создании");
      }
    }
  };

  return (
    <div>
      <h1>Добавить компанию</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Название</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Google Apps Script URL</label>
          <input
            type="url"
            value={googleUrl}
            onChange={(e) => setGoogleUrl(e.target.value)}
            placeholder="https://script.google.com/..."
          />
        </div>

        <button type="submit">Создать</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
    </div>
  );
}
