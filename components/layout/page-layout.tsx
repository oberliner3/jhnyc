"use client";

import React from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AnnouncementBar } from "@/components/layout/announcement-bar";

interface PageLayoutProps {
  children: React.ReactNode;
  showAnnouncement?: boolean;
  showHeader?: boolean;
  showFooter?: boolean;
  containerClassName?: string;
  headerProps?: Record<string, unknown>;
  footerProps?: Record<string, unknown>;
}

/**
 * Standard page layout component with header, footer, and optional announcement bar
 * Provides consistent structure across pages for better DX
 */
export function PageLayout({
  children,
  showAnnouncement = true,
  showHeader = true,
  showFooter = true,
  containerClassName = "",
  headerProps = {},
  footerProps = {},
}: PageLayoutProps) {
  return (
    <>
      {showAnnouncement && <AnnouncementBar />}
      {showHeader && <Header {...headerProps} />}
      <div className={containerClassName}>
        {children}
      </div>
      {showFooter && <Footer {...footerProps} />}
    </>
  );
}