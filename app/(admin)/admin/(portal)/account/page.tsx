import { requireUser } from "@/lib/auth";
import { fmtDateTime } from "@/lib/time";
import ActionForm from "@/components/admin/action-form";
import PasswordInput from "@/components/admin/password-input";
import { changePasswordAction } from "../../actions";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const me = await requireUser({ allowMustChange: true });
  return (
    <>
      <h1>My account</h1>
      <p className="sub">{me.name} · {me.email} · {me.role === "admin" ? "Administrator" : "Team member"}{me.last_login_at ? ` · last sign-in ${fmtDateTime(me.last_login_at)}` : ""}</p>
      {me.must_change_password && (
        <div className="notice bad"><b>Please choose a new password.</b> You are using a temporary password. You can use the rest of the portal after changing it.</div>
      )}
      <div className="card" style={{ maxWidth: 520 }}>
        <h2>Change password</h2>
        <ActionForm action={changePasswordAction} submit="Update password" resetOnSuccess>
          <PasswordInput name="current" label="Current password" autoComplete="current-password" minLength={1} />
          <PasswordInput name="next" label="New password" />
          <PasswordInput name="again" label="Repeat new password" />
          <p style={{ color: "var(--muted)", fontSize: 13, margin: "0 0 12px" }}>At least 10 characters with letters and numbers. Changing it signs out your other devices.</p>
        </ActionForm>
      </div>
    </>
  );
}
