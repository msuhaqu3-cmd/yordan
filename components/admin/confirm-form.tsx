"use client";

import type { ReactNode } from "react";

/** A form that asks for confirmation before running a destructive server action. */
export default function ConfirmForm({ action, message, children }: { action: (fd: FormData) => Promise<void>; message: string; children: ReactNode }) {
  return (
    <form action={action} onSubmit={(e) => { if (!window.confirm(message)) e.preventDefault(); }}>
      {children}
    </form>
  );
}
