import type { Metadata } from "next";
import Customizer from "@/components/sections/Customizer";

export const metadata: Metadata = {
  title: "Customise your tumbler — CUP.KW",
  description: "Twenty shell colours, five dot patterns, three finishes, three sizes, and Pedazl crystals on your name, initials or any image.",
};

export default function CustomizePage() {
  return <Customizer />;
}
