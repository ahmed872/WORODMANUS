import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Float, Sparkles, useTexture } from "@react-three/drei";
import { IMG } from "../data";

/* Window-level pointer so the text overlay never blocks the parallax. */
const pointer = { x: 0, y: 0 };
function usePointer() {
  useEffect(() => {
    const move = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, []);
}

/**
 * A real photograph on a gently curved panel. `fade` melts the edges into the
 * night background (used for the hero shot, which is photographed on black).
 */
const vert = /* glsl */ `
  uniform float uBend;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec3 p = position;
    p.z -= uBend * p.x * p.x;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;
const frag = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uFade;
  uniform float uOpacity;
  uniform float uImgAspect;
  uniform float uPlaneAspect;
  uniform float uReveal;
  varying vec2 vUv;
  void main() {
    // object-fit: cover
    vec2 uv = vUv;
    float r = uPlaneAspect / uImgAspect;
    if (r < 1.0) uv.x = (uv.x - 0.5) * r + 0.5; else uv.y = (uv.y - 0.5) / r + 0.5;
    vec4 c = texture2D(uMap, uv);
    vec2 d = abs(vUv - 0.5) * 2.0;
    float edge = 1.0 - smoothstep(1.0 - uFade, 1.0, max(d.x, d.y));
    float radial = 1.0 - smoothstep(0.55, 1.15, length(d) * (uFade > 0.3 ? 1.0 : 0.0));
    float reveal = smoothstep(uReveal - 0.15, uReveal, 1.0 - vUv.y + 0.001);
    gl_FragColor = vec4(c.rgb, edge * radial * uOpacity * (1.0 - reveal));
    #include <colorspace_fragment>
  }
`;

function PhotoPanel({ ready, src, width, height, position, rotation = [0, 0, 0], fade = 0.04, bend = 0.03, opacity = 1, delay = 0 }: { ready: boolean; src: string; width: number; height: number; position: [number, number, number]; rotation?: [number, number, number]; fade?: number; bend?: number; opacity?: number; delay?: number }) {
  const tex = useTexture(src);
  const mat = useRef<THREE.ShaderMaterial>(null);
  const born = useRef<number | null>(null);
  const uniforms = useMemo(() => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    const img = tex.image as HTMLImageElement;
    return {
      uMap: { value: tex },
      uFade: { value: fade },
      uOpacity: { value: opacity },
      uBend: { value: bend },
      uImgAspect: { value: img.width / img.height },
      uPlaneAspect: { value: width / height },
      uReveal: { value: 0 },
    };
  }, [tex, fade, opacity, bend, width, height]);

  useFrame(({ clock }) => {
    if (!mat.current) return;
    if (!ready) return;
    if (born.current === null) born.current = clock.elapsedTime;
    const k = THREE.MathUtils.clamp((clock.elapsedTime - born.current - delay) / 1.6, 0, 1);
    // curtain-style reveal from the top, eased
    mat.current.uniforms.uReveal.value = 1.15 * (1 - Math.pow(1 - k, 3));
  });

  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[width, height, 48, 1]} />
      <shaderMaterial ref={mat} vertexShader={vert} fragmentShader={frag} uniforms={uniforms} transparent depthWrite={false} />
    </mesh>
  );
}

function Composition({ still, ready }: { still: boolean; ready: boolean }) {
  const { viewport, camera } = useThree();
  const group = useRef<THREE.Group>(null);
  const narrow = viewport.aspect < 0.95;
  const d = still ? 0 : 1;

  useFrame(() => {
    const s = Math.min(1, window.scrollY / window.innerHeight);
    if (group.current) {
      // scroll flies the camera through the photographs
      group.current.position.z = s * 3.2;
      group.current.position.y = s * 0.8;
    }
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, pointer.x * 0.4 * d, 0.03);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, pointer.y * 0.2 * d, 0.03);
    camera.lookAt(0, 0, -2);
  });

  // calm composition: a single hero photograph, kept clear of the copy
  const x0 = narrow ? 0 : -viewport.width * 0.23;
  const float = { speed: still ? 0 : 0.7, rotationIntensity: 0.03, floatIntensity: 0.15 };
  return (
    <group ref={group}>
      <Float {...float}>
        <PhotoPanel ready={ready} src={IMG.redVase} width={narrow ? 3.2 : 3.9} height={narrow ? 4.8 : 5.85} position={[x0, narrow ? 1.05 : -0.1, 0]} fade={0.45} bend={0} delay={0.25} />
      </Float>
    </group>
  );
}

export default function HeroScene({ still = false, ready = true }: { still?: boolean; ready?: boolean }) {
  usePointer();
  return (
    <>
      <color attach="background" args={["#12070b"]} />
      <Composition still={still} ready={ready} />
      <Sparkles count={30} scale={[12, 7, 6]} size={1.8} speed={still ? 0 : 0.12} color="#f2c47e" opacity={0.45} />
    </>
  );
}
