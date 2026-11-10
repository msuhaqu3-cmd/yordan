"use client";

import { startTransition, useActionState, useRef, type FormEvent, type ReactNode } from "react";
import type { ActionState } from "@/app/(admin)/admin/actions";

/**
 * <form> wired to a server action with inline success / error feedback.
 * Submitted manually (not via the `action` prop) so React does not wipe what the user typed after each submit;
 * pass resetOnSuccess to clear the fields once the action succeeds (e.g. password forms).
 */
export default function ActionForm({
  action, children, submit = "Save", className = "", danger = false, resetOnSuccess = false,
}: {
  action: (s: ActionState, fd: FormData) => Promise<ActionState>;
  children: ReactNode; submit?: string; className?: string; danger?: boolean; resetOnSuccess?: boolean;
}) {
  const [state, run, pending] = useActionState(action, {} as ActionState);
  const ref = useRef<HTMLFormElement>(null);
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      run(fd);
    });
  }
  // Clear sensitive fields after success.
  const done = Boolean(state.ok);
  if (resetOnSuccess && done && ref.current && ref.current.dataset.cleared !== state.ok) {
    ref.current.dataset.cleared = state.ok;
    queueMicrotask(() => ref.current?.reset());
  }
  return (
    <form ref={ref} onSubmit={onSubmit} className={className} autoComplete="off">
      {children}
      <div className="row-actions">
        <button className={danger ? "btn danger" : "btn"} disabled={pending}>{pending ? "Please wait…" : submit}</button>
        {state.ok && <span className="msg ok" role="status">{state.ok}</span>}
        {state.error && <span className="msg err" role="alert">{state.error}</span>}
      </div>
    </form>
  );
}
