"use client";

import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

type Status = "idle" | "saving" | "success" | "error";

interface SuccessProgressProps {
  status: Status;
  message?: string;
  title?: string;
  onDismiss?: () => void;
  autoDismissMs?: number;
}

/**
 * SuccessProgress — a progress bar component that shows:
 * - Loading state with animated progress bar
 * - Success state with checkmark and green bar
 * - Error state with alert icon and amber bar
 *
 * Usage:
 * <SuccessProgress
 *   status={saveStatus}
 *   title="Creating account..."
 *   message={saveMessage}
 *   autoDismissMs={5000}
 * />
 */
export default function SuccessProgress({
  status,
  message = "",
  title = "",
  onDismiss,
  autoDismissMs = 5000,
}: SuccessProgressProps) {
  const [visible, setVisible] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (status !== "idle") {
      setVisible(true);
      setIsComplete(false);
      if (status === "success" || status === "error") {
        setIsComplete(true);
        if (autoDismissMs && autoDismissMs > 0) {
          const timer = setTimeout(() => {
            setVisible(false);
            onDismiss?.();
          }, autoDismissMs);
          return () => clearTimeout(timer);
        }
      }
    } else {
      setVisible(false);
    }
  }, [status, autoDismissMs, onDismiss]);

  if (!visible) return null;

  const isSuccess = status === "success";
  const isError = status === "error";
  const isSaving = status === "saving";

  const bgColor = isSuccess
    ? "bg-emerald-500/10 border-emerald-500/30"
    : isError
      ? "bg-amber-500/10 border-amber-500/30"
      : "bg-[var(--tint5)] border-[var(--line)]";

  const progressColor = isSuccess ? "bg-emerald-500" : isError ? "bg-amber-500" : "bg-[var(--prussian)]";

  const progressWidth = isSuccess || isError ? "100%" : isSaving ? "65%" : "0%";

  const titleColor = isSuccess
    ? "text-emerald-600 dark:text-emerald-400"
    : isError
      ? "text-amber-600 dark:text-amber-400"
      : "text-[var(--text)]";

  const statusLabel = isSuccess ? "Success" : isError ? "Warning" : "In progress";

  return (
    <div className={`animate-in fade-in slide-in-from-top-2 rounded-2xl border p-4 shadow-sm transition-all duration-300 ${bgColor}`}>
      {/* Header */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="flex-shrink-0 pt-0.5">
            {isSuccess && (
              <div className="animate-bounce">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </div>
            )}
            {isError && <AlertCircle className="h-5 w-5 text-amber-500" />}
            {isSaving && <Loader2 className="h-5 w-5 animate-spin text-[var(--prussian)]" />}
          </div>

          {/* Title and status */}
          <div>
            <p className={`text-sm font-semibold ${titleColor}`}>
              {title ||
                (isSuccess
                  ? "Success"
                  : isError
                    ? "Action required"
                    : "Processing")}
            </p>
            <p className="text-xs text-[var(--muted)]">{statusLabel}</p>
          </div>
        </div>

        {/* Dismiss button */}
        {isComplete && onDismiss && (
          <button
            onClick={() => {
              setVisible(false);
              onDismiss();
            }}
            className="flex-shrink-0 text-[var(--faint)] hover:text-[var(--muted)] transition"
            aria-label="Dismiss"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div className="mb-2 h-2.5 overflow-hidden rounded-full bg-[var(--tint10)]">
        <div
          className={`h-full rounded-full transition-all duration-700 ${progressColor}`}
          style={{ width: progressWidth }}
        />
      </div>

      {/* Message */}
      {message && (
        <p className="text-sm text-[var(--muted)]">
          {message}
        </p>
      )}
    </div>
  );
}
