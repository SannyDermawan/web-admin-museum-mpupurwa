"use client";

import { useEffect, useId } from "react";
import type { ReactNode } from "react";
import { CloseIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** Buttons row at the bottom (the design's `.modal-foot`) */
  footer?: ReactNode;
  /** 460px by default, 600px when `wide` (forms with two columns) */
  wide?: boolean;
};

/** Dialog styled like the design's popups. Closes on Escape and on overlay click. */
export function Modal({ open, onClose, title, children, footer, wide = false }: ModalProps) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(31,26,15,.4)] p-6"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "max-h-[88vh] w-full overflow-y-auto rounded-[14px] bg-white shadow-[0_30px_60px_rgba(0,0,0,.25)]",
          wide ? "max-w-[600px]" : "max-w-[460px]",
        )}
      >
        <div className="flex items-center justify-between border-b border-stone-line px-6 py-5">
          <h3 id={titleId} className="text-[17px]">
            {title}
          </h3>
          <button
            type="button"
            aria-label="Tutup"
            onClick={onClose}
            className="flex size-[30px] items-center justify-center rounded-lg text-ink-soft hover:bg-offwhite"
          >
            <CloseIcon className="size-4" />
          </button>
        </div>
        <div className="px-6 py-[22px]">{children}</div>
        {footer && <div className="flex gap-2.5 px-6 pt-[18px] pb-[22px]">{footer}</div>}
      </div>
    </div>
  );
}
