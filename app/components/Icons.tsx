"use client";

import React from "react";

type IconProps = {
  width?: number;
  height?: number;
  style?: React.CSSProperties;
  className?: string;
};

export const LayoutDashboard = (props: IconProps) => (
  <svg width={props.width ?? 18} height={props.height ?? 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={props.style} className={props.className}>
    <rect x="3" y="3" width="7" height="7"></rect>
    <rect x="14" y="3" width="7" height="7"></rect>
    <rect x="14" y="14" width="7" height="7"></rect>
    <rect x="3" y="14" width="7" height="7"></rect>
  </svg>
);

export const Package = (props: IconProps) => (
  <svg width={props.width ?? 18} height={props.height ?? 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={props.style} className={props.className}>
    <line x1="16.5" y1="9.4" x2="7.5" y2="4.2"></line>
    <path d="M21 16V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2z"></path>
    <polyline points="3 2 7 6 21 6"></polyline>
  </svg>
);

export const ShoppingBasket = (props: IconProps) => (
  <svg width={props.width ?? 18} height={props.height ?? 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={props.style} className={props.className}>
    <circle cx="8" cy="21" r="1"></circle>
    <circle cx="19" cy="21" r="1"></circle>
    <path d="M21 4H4l2 15h14l2-15z"></path>
    <path d="M17 10v7a1 1 0 0 0-1 1H8a1 1 0 0 0-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1z"></path>
  </svg>
);

export const Users = (props: IconProps) => (
  <svg width={props.width ?? 18} height={props.height ?? 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={props.style} className={props.className}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.47"></path>
  </svg>
);

export const User = Users;

export const Menu = (props: IconProps) => (
  <svg width={props.width ?? 18} height={props.height ?? 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={props.style} className={props.className}>
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
);

export const X = (props: IconProps) => (
  <svg width={props.width ?? 18} height={props.height ?? 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={props.style} className={props.className}>
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

export const LogOut = (props: IconProps) => (
  <svg width={props.width ?? 18} height={props.height ?? 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={props.style} className={props.className}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
    <polyline points="16 17 21 12 16 7"></polyline>
    <line x1="21" y1="12" x2="9" y2="12"></line>
  </svg>
);

export const Plus = (props: IconProps) => (
  <svg width={props.width ?? 18} height={props.height ?? 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={props.style} className={props.className}>
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

export const Minus = (props: IconProps) => (
  <svg width={props.width ?? 18} height={props.height ?? 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={props.style} className={props.className}>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

export const Edit3 = (props: IconProps) => (
  <svg width={props.width ?? 18} height={props.height ?? 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={props.style} className={props.className}>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4L9.5 2.5a2.121 2.121 0 0 1 3-3Z"></path>
  </svg>
);

export const Save = (props: IconProps) => (
  <svg width={props.width ?? 18} height={props.height ?? 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={props.style} className={props.className}>
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11.5a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2z"></path>
    <polyline points="17 21 17 13 7 13 7 21"></polyline>
    <polyline points="7 3 7 8 15 8"></polyline>
  </svg>
);

export const Trash2 = (props: IconProps) => (
  <svg width={props.width ?? 18} height={props.height ?? 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={props.style} className={props.className}>
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 0-2 2H7a2 2 0 0 0-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);

export const RefreshCw = (props: IconProps) => (
  <svg width={props.width ?? 18} height={props.height ?? 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={props.style} className={props.className}>
    <path d="M1 4v16a3 3 0 0 0 3 3h16"></path>
    <polyline points="13 2 3 14 13 22"></polyline>
    <path d="M23 20v-16a3 3 0 0 0-3-3H1"></path>
    <polyline points="11 2 21 12 11 22"></polyline>
  </svg>
);

export const Image = (props: IconProps) => (
  <svg width={props.width ?? 18} height={props.height ?? 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={props.style} className={props.className}>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <circle cx="8.5" cy="8.5" r="1.5"></circle>
    <polyline points="21 15 16 10 5 21"></polyline>
  </svg>
);

export const Clock = (props: IconProps) => (
  <svg width={props.width ?? 18} height={props.height ?? 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={props.style} className={props.className}>
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

export const PackageCheck = (props: IconProps) => (
  <svg width={props.width ?? 18} height={props.height ?? 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={props.style} className={props.className}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <polyline points="18 11 12 15 8 15"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  </svg>
);

export const PackageMinus = (props: IconProps) => (
  <svg width={props.width ?? 18} height={props.height ?? 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={props.style} className={props.className}>
    <path d="M14 2H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="15 14 2 6 9 3 16 8"></polyline>
    <line x1="10" y1="9" x2="1" y2="9"></line>
    <line x1="10" y1="15" x2="3" y2="15"></line>
  </svg>
);

export const Truck = (props: IconProps) => (
  <svg width={props.width ?? 18} height={props.height ?? 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={props.style} className={props.className}>
    <path d="M4 7h15l-1 4H4z"></path>
    <circle cx="5.5" cy="17.5" r="1.5"></circle>
    <circle cx="18.5" cy="17.5" r="1.5"></circle>
  </svg>
);

export const HelpCircle = (props: IconProps) => (
  <svg width={props.width ?? 18} height={props.height ?? 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={props.style} className={props.className}>
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M12 1a10 10 0 0 0 9 1.9"></path>
    <path d="M12 19a10 10 0 0 0-9-1.9"></path>
  </svg>
);

export const Mail = (props: IconProps) => (
  <svg width={props.width ?? 18} height={props.height ?? 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={props.style} className={props.className}>
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2z"></path>
    <polyline points="22 6 12 13 2 6"></polyline>
  </svg>
);

export const Phone = (props: IconProps) => (
  <svg width={props.width ?? 18} height={props.height ?? 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={props.style} className={props.className}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
  </svg>
);

export const MapPin = (props: IconProps) => (
  <svg width={props.width ?? 18} height={props.height ?? 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={props.style} className={props.className}>
    <path d="M21 10c0 7-3 9-3 9s-3-2-3-9-3-9-3 2-3 9"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
);
