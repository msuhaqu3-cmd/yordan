import { requireAdmin } from "@/lib/auth";
import { q } from "@/lib/db";
import { fmtDateTime } from "@/lib/time";
import ActionForm from "@/components/admin/action-form";
import ConfirmForm from "@/components/admin/confirm-form";
import PasswordInput from "@/components/admin/password-input";
import { createUserAction, deleteUserAction, resetUserPasswordAction, setUserActiveAction } from "../../actions";

export const dynamic = "force-dynamic";

type Row = { id: string; email: string; name: string; role: "admin" | "staff"; active: boolean; must_change_password: boolean; last_login_at: string | null };

export default async function UsersPage() {
  await requireAdmin();
  const users = await q<Row>("select id,email,name,role,active,must_change_password,last_login_at from users order by role, created_at");
  return (
    <>
      <h1>Users</h1>
      <p className="sub">Team members can manage enquiries, media and company info. Only the administrator can add, disable, delete or reset team accounts. Nobody can change the administrator account except its owner (from My account).</p>
      <div className="card">
        <h2>Add a team member</h2>
        <ActionForm action={createUserAction} submit="Create account" resetOnSuccess>
          <div className="cols">
            <label className="field"><span>Name</span><input name="name" required maxLength={80} /></label>
            <label className="field"><span>Email (their login)</span><input name="email" type="email" required maxLength={120} /></label>
          </div>
          <PasswordInput name="password" label="Temporary password (they must change it at first login)" withGenerate />
        </ActionForm>
      </div>
      <div className="card">
        <h2>Accounts</h2>
        <div className="tw"><table>
          <thead><tr><th>Name</th><th>Status</th><th>Last sign-in</th><th>Manage</th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td><b>{u.name || "—"}</b><br /><small style={{ color: "var(--muted)" }}>{u.email}</small></td>
                <td>{u.role === "admin" ? <span className="badge b-admin">Administrator</span> : u.active ? <span className="badge b-completed">Active</span> : <span className="badge b-off">Disabled</span>}
                  {u.must_change_password && <><br /><small style={{ color: "var(--warn)" }}>temporary password</small></>}</td>
                <td>{u.last_login_at ? fmtDateTime(u.last_login_at) : "Never"}</td>
                <td style={{ minWidth: 260 }}>
                  {u.role === "admin" ? <small style={{ color: "var(--muted)" }}>Protected</small> : (
                    <div style={{ display: "grid", gap: 8 }}>
                      <details><summary style={{ cursor: "pointer", fontSize: 13 }}>Reset password</summary>
                        <ActionForm action={resetUserPasswordAction} submit="Reset" resetOnSuccess>
                          <input type="hidden" name="id" value={u.id} />
                          <PasswordInput name="password" label="New temporary password" withGenerate />
                        </ActionForm>
                      </details>
                      <div className="row-actions" style={{ margin: 0 }}>
                        <form action={setUserActiveAction}><input type="hidden" name="id" value={u.id} /><input type="hidden" name="active" value={u.active ? "0" : "1"} />
                          <button className="btn small ghost">{u.active ? "Disable" : "Enable"}</button></form>
                        <ConfirmForm action={deleteUserAction} message={`Delete ${u.email}? This cannot be undone.`}>
                          <input type="hidden" name="id" value={u.id} /><button className="btn link">Delete</button></ConfirmForm>
                      </div>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table></div>
      </div>
    </>
  );
}
