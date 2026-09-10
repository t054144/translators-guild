import CinematicHero from "@/components/sections/CinematicHero";
import VoucherBox from "@/components/sections/VoucherBox";
import Marquee from "@/components/sections/Marquee";
import Anatomy from "@/components/sections/Anatomy";
import Thermal from "@/components/sections/Thermal";
import Sizes from "@/components/sections/Sizes";
import CustomizeTeaser from "@/components/sections/CustomizeTeaser";
import CollabBox from "@/components/sections/CollabBox";
import Technology from "@/components/sections/Technology";
import Community from "@/components/sections/Community";

export default function Home() {
  return (
    <>
      <CinematicHero />
      <VoucherBox />
      <Marquee />
      <Anatomy />
      <Thermal />
      <CustomizeTeaser />
      <Sizes />
      <CollabBox />
      <Technology />
      <Community />
    </>
  );
}
