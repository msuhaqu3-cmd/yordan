import { redirect } from "next/navigation";
import { authConfigured, currentUser } from "@/lib/auth";
import ActionForm from "@/components/admin/action-form";
import PasswordInput from "@/components/admin/password-input";
import { loginAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (!authConfigured()) {
    return (
      <div className="login"><div className="card">
        <div className="brand-l">YORDAN</div>
        <h1>Admin portal</h1>
        <p className="sub">Not set up yet.</p>
        <p style={{ fontSize: 14 }}>The site owner needs to add <code>DATABASE_URL</code>, <code>AUTH_SECRET</code>, <code>ADMIN_EMAIL</code> and <code>ADMIN_PASSWORD</code> in the hosting settings. See README.</p>
      </div></div>
    );
  }
  const u = await currentUser();
  if (u) redirect(u.must_change_password ? "/admin/account?force=1" : "/admin");
  return (
    <div className="login"><div className="card">
      <div className="brand-l">YORDAN</div>
      <h1>Sign in</h1>
      <p className="sub">Admin portal</p>
      <ActionForm action={loginAction} submit="Sign in">
        <label className="field"><span>Email</span><input name="email" type="email" required autoComplete="username" maxLength={120} /></label>
        <PasswordInput name="password" label="Password" autoComplete="current-password" minLength={1} />
      </ActionForm>
    </div></div>
  );
}
