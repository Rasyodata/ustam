"use client";

import { useEffect, useState } from "react";
import { adminLogin, apiGet, apiPatch } from "@/lib/api";

type Stats = {
  users: number;
  providers: number;
  listings: number;
  offers: number;
  openReports: number;
};
type User = { id: string; email: string; displayName: string; status: string; roles: { role: string }[] };

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState<"dash" | "users" | "audit">("dash");

  useEffect(() => {
    setAuthed(!!localStorage.getItem("admin_token"));
  }, []);

  if (!authed) return <Login onOk={() => setAuthed(true)} />;

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 border-r border-white/10 p-4 hidden sm:block">
        <div className="font-black text-xl mb-6 flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg grid place-items-center bg-brand text-black">🛠️</span> Ustam
        </div>
        <nav className="space-y-1 text-sm">
          <NavBtn active={tab === "dash"} onClick={() => setTab("dash")}>📊 Panel</NavBtn>
          <NavBtn active={tab === "users"} onClick={() => setTab("users")}>👥 Kullanıcılar</NavBtn>
          <NavBtn active={tab === "audit"} onClick={() => setTab("audit")}>🧾 Denetim Kaydı</NavBtn>
        </nav>
        <button
          onClick={() => {
            localStorage.removeItem("admin_token");
            setAuthed(false);
          }}
          className="mt-8 text-white/40 text-sm hover:text-white"
        >
          Çıkış
        </button>
      </aside>
      <main className="flex-1 p-6">
        {tab === "dash" && <Dashboard />}
        {tab === "users" && <Users />}
        {tab === "audit" && <Audit />}
      </main>
    </div>
  );
}

function NavBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-2 rounded-lg ${active ? "bg-brand text-black font-bold" : "hover:bg-white/5"}`}
    >
      {children}
    </button>
  );
}

function Login({ onOk }: { onOk: () => void }) {
  const [err, setErr] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    try {
      await adminLogin(String(f.get("email")), String(f.get("password")));
      onOk();
    } catch {
      setErr(true);
    }
  }
  return (
    <div className="min-h-screen grid place-items-center px-5">
      <form onSubmit={submit} className="card p-8 w-full max-w-sm space-y-4">
        <div className="font-black text-2xl text-center mb-2">Ustam Yönetim</div>
        <input name="email" type="email" placeholder="admin@ustam.app" className="input" defaultValue="admin@ustam.app" />
        <input name="password" type="password" placeholder="Şifre" className="input" defaultValue="Admin123!" />
        <button className="w-full font-bold py-3 rounded-xl bg-gradient-to-br from-brand to-brand-light text-black">
          Giriş yap
        </button>
        {err && <p className="text-red-400 text-sm text-center">Giriş başarısız.</p>}
        <p className="text-white/40 text-xs text-center">Seed: admin@ustam.app / Admin123!</p>
      </form>
    </div>
  );
}

function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [offline, setOffline] = useState(false);
  useEffect(() => {
    apiGet<Stats>("/admin/stats").then(setStats).catch(() => setOffline(true));
  }, []);
  if (offline)
    return <Offline />;
  if (!stats) return <p className="text-white/50">Yükleniyor…</p>;
  const cards = [
    ["Kullanıcı", stats.users, "👥"],
    ["Usta/Firma", stats.providers, "🛠️"],
    ["İlan", stats.listings, "📋"],
    ["Teklif", stats.offers, "💬"],
    ["Açık şikayet", stats.openReports, "🚩"],
  ] as const;
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Genel Bakış</h1>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {cards.map(([l, n, ic]) => (
          <div key={l} className="card p-5">
            <div className="text-2xl mb-2">{ic}</div>
            <div className="text-3xl font-black">{n}</div>
            <div className="text-white/50 text-sm">{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [offline, setOffline] = useState(false);
  const load = () => apiGet<User[]>("/admin/users").then(setUsers).catch(() => setOffline(true));
  useEffect(() => {
    load();
  }, []);
  async function setStatus(id: string, status: string) {
    await apiPatch(`/admin/users/${id}/status`, { status }).catch(() => {});
    load();
  }
  async function setRating(id: string, rating: number) {
    if (isNaN(rating)) return;
    await apiPatch(`/admin/providers/${id}/rating`, { rating }).catch(() => {});
  }
  if (offline) return <Offline />;
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Kullanıcılar</h1>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-white/60">
            <tr>
              <th className="text-left p-3">Ad</th>
              <th className="text-left p-3">E-posta</th>
              <th className="text-left p-3">Roller</th>
              <th className="text-left p-3">Durum</th>
              <th className="text-left p-3">Puan (override)</th>
              <th className="text-left p-3">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-white/5">
                <td className="p-3">{u.displayName}</td>
                <td className="p-3 text-white/60">{u.email}</td>
                <td className="p-3">{u.roles.map((r) => r.role).join(", ")}</td>
                <td className="p-3">{u.status}</td>
                <td className="p-3">
                  {u.roles.some((r) => r.role === "PROVIDER" || r.role === "COMPANY") ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min={0}
                        max={5}
                        step={0.1}
                        defaultValue={5}
                        className="input"
                        style={{ width: 70, padding: "6px 8px" }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") setRating(u.id, parseFloat((e.target as HTMLInputElement).value));
                        }}
                        id={`rt-${u.id}`}
                      />
                      <button
                        onClick={() => setRating(u.id, parseFloat((document.getElementById(`rt-${u.id}`) as HTMLInputElement).value))}
                        className="text-brand-light font-bold"
                      >
                        ⭐ Ver
                      </button>
                    </div>
                  ) : (
                    <span className="text-white/30">—</span>
                  )}
                </td>
                <td className="p-3 space-x-2">
                  <button onClick={() => setStatus(u.id, "SUSPENDED")} className="text-yellow-400">Askıya al</button>
                  <button onClick={() => setStatus(u.id, "ACTIVE")} className="text-green-400">Aktif et</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Audit() {
  const [logs, setLogs] = useState<{ id: string; action: string; target: string; createdAt: string }[]>([]);
  const [offline, setOffline] = useState(false);
  useEffect(() => {
    apiGet<any[]>("/admin/audit").then(setLogs).catch(() => setOffline(true));
  }, []);
  if (offline) return <Offline />;
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Denetim Kaydı</h1>
      <div className="card divide-y divide-white/5">
        {logs.map((l) => (
          <div key={l.id} className="p-3 text-sm flex justify-between">
            <span><b className="text-brand-light">{l.action}</b> → {l.target}</span>
            <span className="text-white/40">{new Date(l.createdAt).toLocaleString()}</span>
          </div>
        ))}
        {logs.length === 0 && <p className="p-4 text-white/50">Kayıt yok.</p>}
      </div>
    </div>
  );
}

function Offline() {
  return (
    <div className="card p-6 text-brand-light border-dashed border-brand">
      ⚙️ Backend çalışmıyor. Başlat: <code>docker compose up -d</code> →{" "}
      <code>pnpm --filter @ustam/api prisma:migrate && pnpm --filter @ustam/api prisma:seed</code> →{" "}
      <code>pnpm dev</code>
    </div>
  );
}
