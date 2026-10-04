"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { BellIcon } from "@/components/ui/icons";
import { useApiData } from "@/hooks/use-api-data";
import { markNotificationRead, markNotificationsRead, useReadNotificationIds } from "@/lib/notification-storage";
import { buildNotifications } from "@/lib/notifications";
import { cn, formatRelativeTime } from "@/lib/utils";
import type { DashboardData, VisitorAccountsData } from "@/types";

/**
 * Bell in the top bar. The notifications are made from data the project already has
 * (bookings waiting for approval and new visitor accounts), see lib/notifications.ts.
 * Clicking one marks it as read and opens the related page.
 */
export function NotificationBell() {
  const panelId = useId();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  // The moment the list was last shown; "5 menit yang lalu" is counted from it.
  const [now, setNow] = useState(() => Date.now());

  const dashboard = useApiData<DashboardData>("/api/dashboard");
  const accounts = useApiData<VisitorAccountsData>("/api/accounts/visitors");
  const readIds = useReadNotificationIds();

  const notifications = useMemo(
    () => buildNotifications(dashboard.data?.pendingBookings ?? [], accounts.data?.visitors ?? [], now),
    [dashboard.data, accounts.data, now],
  );
  const unreadCount = notifications.filter((notification) => !readIds.has(notification.id)).length;
  const loadFailed = Boolean(dashboard.error || accounts.error);
  const stillLoading = !dashboard.data && !accounts.data && !loadFailed;

  // Close on a click outside the bell/panel and on Escape.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function toggle() {
    if (!open) {
      // Opening: take fresh data and restart the "x minutes ago" clock.
      setNow(Date.now());
      dashboard.reload();
      accounts.reload();
    }
    setOpen((current) => !current);
  }

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        aria-label={unreadCount > 0 ? `Notifikasi, ${unreadCount} belum dibaca` : "Notifikasi"}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={toggle}
        className={cn(
          "relative flex size-[38px] items-center justify-center rounded-[9px] border border-stone-line transition-colors hover:bg-offwhite",
          open && "border-gold bg-offwhite",
        )}
      >
        <BellIcon className="size-[17px] text-ink" />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-white bg-danger px-1 text-[10px] leading-none font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          id={panelId}
          role="dialog"
          aria-label="Notifikasi"
          // Right edge lines up with the bell; the width never exceeds the screen minus the side gutters.
          className="absolute top-[calc(100%+10px)] right-0 z-30 w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-stone-line bg-white shadow-[0_16px_40px_rgba(36,26,15,.14)]"
        >
          <div className="flex items-center justify-between gap-3 border-b border-stone-line px-4 py-3.5">
            <h2 className="text-[15px]">Notifikasi</h2>
            {unreadCount > 0 && (
              <span className="flex items-center gap-1.5 text-xs font-bold text-pending-ink">
                <span className="size-1.5 rounded-full bg-danger" />
                {unreadCount} belum dibaca
              </span>
            )}
          </div>

          <div className="max-h-[min(420px,calc(100vh-130px))] overflow-y-auto">
            {stillLoading ? (
              <p className="px-4 py-10 text-center text-[13px] text-ink-soft">Memuat notifikasi…</p>
            ) : notifications.length === 0 ? (
              <p className="px-4 py-10 text-center text-[13px] text-ink-soft">
                {loadFailed ? "Notifikasi tidak dapat dimuat." : "Belum ada notifikasi"}
              </p>
            ) : (
              <ul>
                {notifications.map((notification) => {
                  const unread = !readIds.has(notification.id);
                  return (
                    <li key={notification.id} className="border-b border-stone-line last:border-b-0">
                      <Link
                        href={notification.href}
                        onClick={() => {
                          markNotificationRead(notification.id);
                          setOpen(false);
                        }}
                        className={cn(
                          "flex items-start gap-3 px-4 py-3 transition-colors hover:bg-offwhite",
                          unread && "bg-row-hover",
                        )}
                      >
                        <span
                          aria-hidden="true"
                          className={cn("mt-1.5 size-2 flex-none rounded-full", unread ? "bg-gold" : "bg-transparent")}
                        />
                        <span className="min-w-0 flex-1">
                          <span className={cn("block text-[13px]", unread ? "font-bold text-ink" : "font-semibold text-ink-soft")}>
                            {notification.title}
                          </span>
                          <span className="mt-0.5 block text-xs leading-snug text-ink-soft">{notification.message}</span>
                          <span className="mt-1 block text-[11.5px] text-ink-soft/70">
                            {formatRelativeTime(notification.time, now)}
                          </span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Outside the scrolling list, so it stays visible however long the list is. */}
          {unreadCount > 0 && (
            <div className="border-t border-stone-line px-4 py-2.5 text-right">
              <button
                type="button"
                onClick={() => markNotificationsRead(notifications.map((notification) => notification.id))}
                className="border-b-[1.5px] border-gold pb-px text-[12.5px] font-bold text-ink"
              >
                Tandai semua dibaca
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
