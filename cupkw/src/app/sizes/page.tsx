import type { Metadata } from "next";
import Sizes from "@/components/sections/Sizes";
import Thermal from "@/components/sections/Thermal";
import Technology from "@/components/sections/Technology";

export const metadata: Metadata = {
  title: "Sizes — CUP.KW",
  description: "450 ml, 750 ml and 1 litre. Same silhouette, same vacuum wall, drawn to scale.",
};

export default function SizesPage() {
  return (
    <div className="pt-16">
      <Sizes />
      <Thermal />
      <Technology />
    </div>
  );
}
