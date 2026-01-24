import Image from "next/image";

export default function SpotonautLogo() {
  return (
    <>
      <span
        className="text-xl font-bold"
        style={{ color: "rgb(164, 59, 254)" }}
      >
        Spot
      </span>
      <Image
        src="/spotonaut_logo.png"
        alt="SpotOnaut"
        width={32}
        height={32}
        className="inline-block mx-0.5"
        priority
        unoptimized
      />
      <span className="text-xl font-bold" style={{ color: "rgb(47, 61, 214)" }}>
        naut
      </span>
    </>
  );
}
