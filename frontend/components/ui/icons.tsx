// Inline SVG icons copied from the design. All use currentColor, so colour them
// with Tailwind text-* classes. Size them with size-* classes.

import type { ReactNode, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function Icon({ children, strokeWidth = 1.6, ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export const MuseumIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M12 3l7 4v3H5V7l7-4z" />
    <path d="M5 21V11M19 21V11M9 21v-7M15 21v-7" />
  </Icon>
);

export const DashboardIcon = (props: IconProps) => (
  <Icon {...props}>
    <rect x="3" y="3" width="7" height="9" rx="1" />
    <rect x="14" y="3" width="7" height="5" rx="1" />
    <rect x="14" y="12" width="7" height="9" rx="1" />
    <rect x="3" y="16" width="7" height="5" rx="1" />
  </Icon>
);

export const UserIcon = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-3.5 3.5-6 8-6s8 2.5 8 6" />
  </Icon>
);

export const CalendarIcon = (props: IconProps) => (
  <Icon {...props}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 10h18M8 3v4M16 3v4" />
  </Icon>
);

export const AccountsIcon = (props: IconProps) => (
  <Icon {...props}>
    <rect x="3" y="3" width="18" height="18" rx="3" />
    <path d="M3 9h18M9 21V9" />
  </Icon>
);

export const CollectionIcon = (props: IconProps) => (
  <Icon {...props}>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </Icon>
);

export const LogoutIcon = (props: IconProps) => (
  <Icon strokeWidth={1.7} {...props}>
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
    <path d="M16 17l5-5-5-5" />
    <path d="M21 12H9" />
  </Icon>
);

export const SearchIcon = (props: IconProps) => (
  <Icon strokeWidth={1.7} {...props}>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.3-4.3" />
  </Icon>
);

export const BellIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.7 21a2 2 0 01-3.4 0" />
  </Icon>
);

export const CloseIcon = (props: IconProps) => (
  <Icon strokeWidth={1.8} {...props}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Icon>
);

export const MenuIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Icon>
);
