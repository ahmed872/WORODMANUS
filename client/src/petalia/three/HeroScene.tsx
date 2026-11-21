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

function PhotoPanel({ src, width, height, position, rotation = [0, 0, 0], fade = 0.04, bend = 0.03, opacity = 1, delay = 0 }: { src: string; width: number; height: number; position: [number, number, number]; rotation?: [number, number, number]; fade?: number; bend?: number; opacity?: number; delay?: number }) {
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

function Composition({ still }: { still: boolean }) {
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
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, pointer.x * 0.9 * d, 0.05);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, pointer.y * 0.5 * d, 0.05);
    camera.lookAt(0, 0, -2);
  });

  const x0 = narrow ? 0 : -viewport.width * 0.2;
  return (
    <group ref={group}>
      {/* hero shot: real red roses, photographed on black, melted into the night */}
      <Float speed={still ? 0 : 1.1} rotationIntensity={0.08} floatIntensity={0.35}>
        <PhotoPanel src={IMG.redVase} width={narrow ? 3.4 : 3.9} height={narrow ? 5.1 : 5.85} position={[x0, narrow ? 1.1 : -0.15, 0]} fade={0.45} bend={0} delay={1.1} />
      </Float>
      {/* floating gallery of real arrangements at different depths */}
      <Float speed={still ? 0 : 1.6} rotationIntensity={0.2} floatIntensity={0.6}>
        <PhotoPanel src={IMG.redEditorial} width={1.9} height={1.9} position={[x0 - 3.1, 1.9, -2.6]} rotation={[0, 0.35, 0.03]} fade={0.06} delay={1.5} />
      </Float>
      <Float speed={still ? 0 : 1.3} rotationIntensity={0.2} floatIntensity={0.5}>
        <PhotoPanel src={IMG.peonyTall} width={1.6} height={2.8} position={[x0 + 2.4, -1.9, -3.4]} rotation={[0, -0.3, -0.04]} fade={0.06} opacity={0.85} delay={1.7} />
      </Float>
      <Float speed={still ? 0 : 1.5} rotationIntensity={0.2} floatIntensity={0.6}>
        <PhotoPanel src={IMG.redBouquet} width={1.7} height={2.1} position={[x0 - 3.4, -2.2, -1.8]} rotation={[0, 0.45, -0.05]} fade={0.06} delay={1.9} />
      </Float>
      <Float speed={still ? 0 : 1.2} rotationIntensity={0.15} floatIntensity={0.4}>
        <PhotoPanel src={IMG.roseBox} width={2.2} height={2.2} position={[x0 + 1.9, 2.6, -6]} rotation={[0, -0.2, 0.02]} fade={0.06} opacity={0.6} delay={2.1} />
      </Float>
      {!narrow && (
        <Float speed={still ? 0 : 1} rotationIntensity={0.15} floatIntensity={0.4}>
          <PhotoPanel src={IMG.white} width={2.4} height={2.4} position={[viewport.width * 0.32, -2.4, -8]} rotation={[0, -0.35, 0]} fade={0.08} opacity={0.35} delay={2.3} />
        </Float>
      )}
    </group>
  );
}

export default function HeroScene({ still = false }: { still?: boolean }) {
  usePointer();
  return (
    <>
      <color attach="background" args={["#12070b"]} />
      <Composition still={still} />
      <Sparkles count={80} scale={[12, 7, 6]} size={2.4} speed={still ? 0 : 0.35} color="#f2c47e" opacity={0.7} />
    </>
  );
}
