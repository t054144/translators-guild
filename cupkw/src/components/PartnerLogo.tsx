"use client";

import React, { useState } from "react";

/**
 * Shows a partner's real logo from /public/partners once the file is there,
 * and a clean brand-coloured stand-in until then — so the layout is final
 * either way and a missing asset never leaves a hole.
 */
export default function PartnerLogo({
  src,
  name,
  brand = "#2A2E38",
  ink = "#FFFFFF",
  className = "",
}: {
  src: string;
  name: string;
  brand?: string;
  ink?: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    const words = name.split(" ");
    return (
      <span
        className={["grid place-items-center rounded-full text-center leading-[1.05]", className].join(" ")}
        style={{ background: brand, color: ink, width: "100%", height: "100%" }}
        title={name}
      >
        <span
          className="font-display px-1"
          style={{ fontSize: words.length > 1 ? "0.5rem" : name.length > 6 ? "0.55rem" : "0.68rem", letterSpacing: "0.01em" }}
        >
          {words.map((w, i) => (
            <span key={i} className="block">
              {w}
            </span>
          ))}
        </span>
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={name}
      onError={() => setFailed(true)}
      className={["object-contain", className].join(" ")}
      loading="lazy"
    />
  );
}
