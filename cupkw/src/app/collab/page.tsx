import type { Metadata } from "next";
import CollabBox from "@/components/sections/CollabBox";
import Community from "@/components/sections/Community";

export const metadata: Metadata = {
  title: "CODED × Moudhi Collection Box — CUP.KW",
  description: "The fixed blue colourway, boxed with vouchers from Pick, Anna's, Good Day, Saysaco and Matcha Matcha. 8.500 KD, four days only.",
};

export default function CollabPage() {
  return (
    <div className="pt-16">
      <CollabBox />
      <Community compact />
    </div>
  );
}
