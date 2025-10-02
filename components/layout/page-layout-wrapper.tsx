/**
 * Server-compatible Page Layout
 * Separates server and client boundaries properly
 */

import React from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AnnouncementBar } from "@/components/layout/announcement-bar";

interface ServerPageLayoutProps {
  children: React.ReactNode;
  showAnnouncement?: boolean;
  showHeader?: boolean;
  showFooter?: boolean;
  containerClassName?: string;
}

/**
 * Server-safe page layout - no client-side hooks or state
 */
export function ServerPageLayout({
  children,
  showAnnouncement = true,
  showHeader = true,
  showFooter = true,
  containerClassName = "",
}: ServerPageLayoutProps) {
  return (
    <>
      {showAnnouncement && <AnnouncementBar />}
      {showHeader && <Header />}
      <div className={containerClassName}>{children}</div>
      {showFooter && <Footer />}
    </>
  );
}
