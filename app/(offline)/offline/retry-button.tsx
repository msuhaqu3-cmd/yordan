"use client";

export default function RetryButton() {
  return (
    <button type="button" onClick={() => (window.location.href = "/")}>
      Try again
    </button>
  );
}
