import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NICTIA | Archive v1.0",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ArchiveV1Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
