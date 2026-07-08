import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create a Yoga Founders Network account to submit and manage your studio, teacher, school, retreat, or product listing.",
  robots: { index: false },
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
