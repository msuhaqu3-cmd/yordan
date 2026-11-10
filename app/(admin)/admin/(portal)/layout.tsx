import type { ReactNode } from "react";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { q } from "@/lib/db";
import Nav from "@/components/admin/nav";
import { logoutAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function Portal({ children }: { children: ReactNode }) {
  // Pages decide whether a forced password change blocks them; the account page must stay reachable.
  const me = await requireUser({ allowMustChange: true });
  let items = [{ href: "/admin/account", label: "Account" }];
  if (!me.must_change_password) {
    const [{ n }] = await q<{ n: number }>("select count(*)::int as n from enquiries where status='new'");
    items = [
      { href: "/admin", label: "Dashboard" },
      { href: "/admin/enquiries", label: "Enquiries", badge: n } as never,
      { href: "/admin/media", label: "Media" },
      { href: "/admin/settings", label: "Company info" },
      ...(me.role === "admin" ? [{ href: "/admin/users", label: "Users" }] : []),
      { href: "/admin/account", label: "Account" },
    ];
  }
  return (
    <div className="shell">
      <header className="top"><div className="top-in">
        <Link href="/admin" className="brand">YORDAN<small>Admin portal</small></Link>
        <Nav items={items} />
        <div className="who">
          <span>{me.name || me.email}{me.role === "admin" ? " · Admin" : ""}</span>
          <form action={logoutAction}><button>Sign out</button></form>
        </div>
      </div></header>
      <main className="main">{children}</main>
    </div>
  );
}
