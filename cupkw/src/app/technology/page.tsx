import type { Metadata } from "next";
import Technology from "@/components/sections/Technology";
import Anatomy from "@/components/sections/Anatomy";
import Thermal from "@/components/sections/Thermal";

export const metadata: Metadata = {
  title: "Technology & recycling — CUP.KW",
  description: "A vacuum, not insulation: 32 hours cold, 14 hours hot. And a tumbler that comes apart by hand into clean, single-material streams.",
};

export default function TechnologyPage() {
  return (
    <div className="pt-16">
      <Technology />
      <Anatomy />
      <Thermal />
    </div>
  );
}
