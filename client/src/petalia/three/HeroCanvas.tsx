import { Suspense } from "react";
import SafeCanvas from "./SafeCanvas";
import HeroScene from "./HeroScene";

export default function HeroCanvas({ still, ready }: { still: boolean; ready: boolean }) {
  return (
    <SafeCanvas className="hero-canvas" camera={{ position: [0, 0, 6.2], fov: 38 }} fallback={<div className="hero-canvas-fallback" />}>
      <Suspense fallback={null}>
        <HeroScene still={still} ready={ready} />
      </Suspense>
    </SafeCanvas>
  );
}
