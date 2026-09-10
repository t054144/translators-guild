import type { Metadata } from "next";
import AuthForm from "@/components/AuthForm";

export const metadata: Metadata = {
  title: "Create an account — CUP.KW",
  description: "Save your builds, track orders, and get member-only drops.",
};

export default function SignupPage() {
  return <AuthForm mode="signup" />;
}
