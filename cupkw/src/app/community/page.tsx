import type { Metadata } from "next";
import Community from "@/components/sections/Community";

export const metadata: Metadata = {
  title: "Join the community — CUP.KW",
  description: "Early access to drops, a members-only colour every season, and first pick on collabs.",
};

export default function CommunityPage() {
  return (
    <div className="pt-16">
      <Community />
    </div>
  );
}
