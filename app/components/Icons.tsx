"use client";

import React from "react";

export const LayoutDashboardIcon = (props: { width?: number; height?: number }) => (
  <svg width={props.width ?? 18} height={props.height ?? 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"></rect>
    <rect x="14" y="3" width="7" height="7"></rect>
    <rect x="14" y="14" width="7" height="7"></rect>
    <rect x="3" y="14" width="7" height="7"></rect>
  </svg>
);

export const PackageIcon = (props: { width?: number; height?: number }) => (
  <svg width={props.width ?? 18} height={props.height ?? 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="16.5" y1="9.4" x2="7.5" y2="4.2"></line>
    <path d="M21 16V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2z"></path>
    <polyline points="3 2 7 6 21 6"></polyline>
  </svg>
);

export const ShoppingBasketIcon = (props: { width?: number; height?: number }) => (
  <svg width={props.width ?? 18} height={props.height ?? 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="21" r="1"></circle>
    <circle cx="19" y1="21" r="1"></circle>
    <path d="M21 4H4l2 15h14l2-15z"></path>
    <path d="M17 10v7a1 1 0 0 0-1 1H8a1 1 0 0 0-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1z"></path>
  </svg>
);

export const UsersIcon = (props: { width?: number; height?: number }) => (
  <svg width={props.width ?? 18} height={props.height ?? 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.47"></path>
  </svg>
);

export const MenuIcon = (props: { width?: number; height?: number }) => (
  <svg width={props.width ?? 18} height={props.height ?? 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
);

export const XIcon = (props: { width?: number; height?: number }) => (
  <svg width={props.width ?? 18} height={props.height ?? 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

export const LogOutIcon = (props: { width?: number; height?: number }) => (
  <svg width={props.width ?? 18} height={props.height ?? 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
    <polyline points="16 17 21 12 16 7"></polyline>
    <line x1="21" y1="12" x2="9" y2="12"></line>
  </svg>
);

export const PlusIcon = (props: { width?: number; height?: number }) => (
  <svg width={props.width ?? 18} height={props.height ?? 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

export const Trash2Icon = (props: { width?: number; height?: number }) => (
  <svg width={props.width ?? 18} height={props.height ?? 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);

export const Edit3Icon = (props: { width?: number; height?: number }) => (
  <svg width={props.width ?? 18} height={props.height ?? 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4L9.5 2.5a2.121 2.121 0 0 1 3-3Z"></path>
  </svg>
);

export const SaveIcon = (props: { width?: number; height?: number }) => (
  <svg width={props.width ?? 18} height={props.height ?? 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11.5a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2z"></path>
    <polyline points="17 21 17 13 7 13 7 21"></polyline>
    <polyline points="7 3 7 8 15 8"></polyline>
  </svg>
);

export const RefreshCwIcon = (props: { width?: number; height?: number }) => (
  <svg width={props.width ?? 18} height={props.height ?? 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 4v16a3 3 0 0 0 3 3h16"></path>
    <polyline points="13 2 3 14 13 22"></polyline>
    <path d="M23 20v-16a3 3 0 0 0-3-3H1"></path>
    <polyline points="11 2 21 12 11 22"></polyline>
  </svg>
);
