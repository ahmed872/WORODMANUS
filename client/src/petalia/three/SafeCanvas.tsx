import { Component, useEffect, useRef, useState, type ReactNode } from "react";
import { Canvas, type CanvasProps } from "@react-three/fiber";

let webglSupport: boolean | null = null;
function hasWebGL() {
  if (webglSupport !== null) return webglSupport;
  try {
    const c = document.createElement("canvas");
    const gl = (c.getContext("webgl2") || c.getContext("webgl")) as WebGLRenderingContext | null;
    webglSupport = !!gl;
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    webglSupport = false;
  }
  return webglSupport;
}

class GLBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/**
 * Canvas that: falls back gracefully without WebGL, and stops rendering
 * entirely while scrolled out of view (saves battery on phones).
 */
export default function SafeCanvas({ fallback, className, ...props }: CanvasProps & { fallback: ReactNode; className?: string }) {
  const host = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [ok] = useState(() => typeof window !== "undefined" && hasWebGL());

  useEffect(() => {
    if (!host.current) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "120px" });
    io.observe(host.current);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={host} className={className}>
      {ok ? (
        <GLBoundary fallback={fallback}>
          <Canvas frameloop={visible ? "always" : "never"} dpr={[1, 1.75]} gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }} {...props} />
        </GLBoundary>
      ) : (
        fallback
      )}
    </div>
  );
}
