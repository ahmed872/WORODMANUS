import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import Lenis from "lenis";
import { motion, useMotionValue, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";

/* ------------------------------------------------------------------ */
/* Smooth scrolling                                                    */
/* ------------------------------------------------------------------ */
let lenis: Lenis | null = null;
export const scrollLock = (lock: boolean) => {
  if (lock) lenis?.stop();
  else lenis?.start();
  document.documentElement.style.overflow = lock ? "hidden" : "";
};

export function useSmoothScroll(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    lenis = new Lenis({ duration: 1.15, smoothWheel: true, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    let raf = 0;
    const loop = (time: number) => {
      lenis?.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest?.('a[href^="#"]') as HTMLAnchorElement | null;
      if (!a) return;
      const id = a.getAttribute("href")!;
      const el = id === "#" ? null : document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      lenis?.scrollTo(el as HTMLElement, { offset: id === "#home" ? -200 : -70 });
    };
    document.addEventListener("click", onClick);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("click", onClick);
      lenis?.destroy();
      lenis = null;
    };
  }, [enabled]);
}

/* ------------------------------------------------------------------ */
/* Custom cursor (fine pointers only)                                  */
/* ------------------------------------------------------------------ */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState("");
  const [active, setActive] = useState(false);
  const [enabled] = useState(() => typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches);

  useEffect(() => {
    if (!enabled) return;
    document.documentElement.classList.add("has-cursor");
    let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y, raf = 0;
    const move = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      const target = (e.target as HTMLElement).closest?.("a,button,[data-cursor],textarea,input") as HTMLElement | null;
      setActive(!!target);
      setLabel(target?.dataset.cursor ?? "");
    };
    const tick = () => {
      rx += (x - rx) * 0.16;
      ry += (y - ry) * 0.16;
      if (dot.current) dot.current.style.transform = `translate3d(${x}px,${y}px,0)`;
      if (ring.current) ring.current.style.transform = `translate3d(${rx}px,${ry}px,0)`;
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("pointermove", move, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("pointermove", move);
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove("has-cursor");
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <>
      <div ref={ring} className={`cursor-ring ${active ? "is-active" : ""} ${label ? "has-label" : ""}`} aria-hidden>
        <span>{label}</span>
      </div>
      <div ref={dot} className="cursor-dot" aria-hidden />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Magnetic wrapper                                                    */
/* ------------------------------------------------------------------ */
export function Magnetic({ children, strength = 0.35, className }: { children: ReactNode; strength?: number; className?: string }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 15, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 15, mass: 0.4 });
  return (
    <motion.span
      className={`magnetic ${className ?? ""}`}
      style={{ x: sx, y: sy }}
      onPointerMove={e => {
        if (e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - r.left - r.width / 2) * strength);
        y.set((e.clientY - r.top - r.height / 2) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.span>
  );
}

/* ------------------------------------------------------------------ */
/* 3D tilt card with moving glare                                      */
/* ------------------------------------------------------------------ */
export function Tilt({ children, className, max = 10, style }: { children: ReactNode; className?: string; max?: number; style?: CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const rx = useSpring(0, { stiffness: 160, damping: 18 });
  const ry = useSpring(0, { stiffness: 160, damping: 18 });
  const gx = useMotionValue(50);
  const gy = useMotionValue(50);
  const glare = useTransform([gx, gy] as MotionValue<number>[], ([a, b]) => `radial-gradient(circle at ${a}% ${b}%, rgba(255,255,255,.38), rgba(255,255,255,0) 55%)`);
  return (
    <motion.div
      ref={ref}
      className={`tilt ${className ?? ""}`}
      style={{ ...style, rotateX: rx, rotateY: ry, transformPerspective: 900 }}
      onPointerMove={e => {
        if (e.pointerType !== "mouse") return;
        const r = ref.current!.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        ry.set((px - 0.5) * max * 2);
        rx.set(-(py - 0.5) * max * 2);
        gx.set(px * 100);
        gy.set(py * 100);
      }}
      onPointerLeave={() => {
        rx.set(0);
        ry.set(0);
      }}
    >
      {children}
      <motion.span className="tilt-glare" style={{ background: glare }} aria-hidden />
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Word-by-word reveal tied to scroll                                  */
/* ------------------------------------------------------------------ */
function Word({ children, progress, range }: { children: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  const y = useTransform(progress, range, [6, 0]);
  return (
    <motion.span className="sw" style={{ opacity, y }}>
      {children}{" "}
    </motion.span>
  );
}
export function ScrollWords({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "end 45%"] });
  const words = text.split(" ");
  return (
    <p ref={ref} className={className}>
      {words.map((w, i) => (
        <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>
          {w}
        </Word>
      ))}
    </p>
  );
}

/* ------------------------------------------------------------------ */
/* Line reveal (mask slide-up)                                         */
/* ------------------------------------------------------------------ */
export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <span className={`reveal-mask ${className ?? ""}`}>
      <motion.span className="reveal-inner" initial={{ y: "110%", rotate: 3 }} whileInView={{ y: "0%", rotate: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 1.05, ease: [0.16, 1, 0.3, 1], delay }}>
        {children}
      </motion.span>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Infinite marquee                                                    */
/* ------------------------------------------------------------------ */
export function Marquee({ items, reverse = false, className }: { items: ReactNode[]; reverse?: boolean; className?: string }) {
  const row = (
    <div className="marquee-row" aria-hidden>
      {items.map((it, i) => (
        <span key={i} className="marquee-item">
          {it}
          <i className="marquee-star">✦</i>
        </span>
      ))}
    </div>
  );
  return (
    <div className={`marquee ${reverse ? "reverse" : ""} ${className ?? ""}`}>
      <div className="marquee-track">
        {row}
        {row}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Scroll progress bar                                                 */
/* ------------------------------------------------------------------ */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });
  return <motion.div className="scroll-progress" style={{ scaleX }} />;
}

/* ------------------------------------------------------------------ */
/* Draggable 3D ring gallery                                           */
/* ------------------------------------------------------------------ */
export function RingGallery({ items, onOpen }: { items: { src: string; alt: string }[]; onOpen: (src: string) => void }) {
  const ring = useRef<HTMLDivElement>(null);
  const state = useRef({ angle: 0, vel: 0.08, dragging: false, lastX: 0, moved: 0 });
  const [radius, setRadius] = useState(520);

  useEffect(() => {
    const resize = () => setRadius(window.innerWidth < 760 ? 250 : window.innerWidth < 1100 ? 420 : 540);
    resize();
    window.addEventListener("resize", resize);
    let raf = 0;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tick = () => {
      const s = state.current;
      if (!s.dragging) {
        s.vel += ((reduce ? 0 : 0.06) - s.vel) * 0.02;
        s.angle += s.vel;
      }
      if (ring.current) ring.current.style.transform = `translateZ(${-radius}px) rotateY(${s.angle}deg)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [radius]);

  const step = 360 / items.length;
  return (
    <div
      className="ring-stage"
      data-cursor="اسحب"
      onPointerDown={e => {
        const s = state.current;
        s.dragging = true;
        s.lastX = e.clientX;
        s.moved = 0;
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      }}
      onPointerMove={e => {
        const s = state.current;
        if (!s.dragging) return;
        const dx = e.clientX - s.lastX;
        s.lastX = e.clientX;
        s.moved += Math.abs(dx);
        s.vel = dx * 0.18;
        s.angle += s.vel;
      }}
      onPointerUp={e => {
        const s = state.current;
        s.dragging = false;
        if (s.moved < 6) {
          const el = document.elementFromPoint(e.clientX, e.clientY)?.closest("[data-src]") as HTMLElement | null;
          if (el?.dataset.src) onOpen(el.dataset.src);
        }
      }}
      onPointerCancel={() => (state.current.dragging = false)}
    >
      <div className="ring" ref={ring}>
        {items.map((it, i) => (
          <figure key={it.src} className="ring-item" data-src={it.src} role="button" tabIndex={0} aria-label={`تكبير: ${it.alt}`} onKeyDown={e => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onOpen(it.src))} style={{ transform: `rotateY(${i * step}deg) translateZ(${radius}px)` }}>
            <img src={it.src} alt={it.alt} draggable={false} />
            <figcaption>{String(i + 1).padStart(2, "0")}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
