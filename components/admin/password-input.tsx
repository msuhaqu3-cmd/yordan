"use client";

import { useRef, useState } from "react";

function generate() {
  const chars = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const a = new Uint32Array(14);
  crypto.getRandomValues(a);
  const s = Array.from(a, (x) => chars[x % chars.length]).join("");
  return `${s.slice(0, 5)}-${s.slice(5, 10)}-${s.slice(10)}7`;
}

export default function PasswordInput({ name, label, autoComplete = "new-password", withGenerate = false, minLength = 10 }: {
  name: string; label: string; autoComplete?: string; withGenerate?: boolean; minLength?: number;
}) {
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  return (
    <label className="field">
      <span>{label}</span>
      <div className="pw">
        <input ref={ref} name={name} type={show ? "text" : "password"} required minLength={minLength} maxLength={128} autoComplete={autoComplete} />
        <button type="button" className="mini" onClick={() => setShow((s) => !s)}>{show ? "Hide" : "Show"}</button>
        {withGenerate && (
          <button type="button" className="mini" onClick={() => { if (ref.current) { ref.current.value = generate(); setShow(true); } }}>Generate</button>
        )}
      </div>
    </label>
  );
}
