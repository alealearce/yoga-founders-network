import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create New Password",
  description: "Set a new password for your Yoga Founders Network account.",
  robots: { index: false },
};

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
