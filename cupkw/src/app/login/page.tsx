import type { Metadata } from "next";
import AuthForm from "@/components/AuthForm";

export const metadata: Metadata = {
  title: "Log in — CUP.KW",
  description: "Your builds and your bag are where you left them.",
};

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
