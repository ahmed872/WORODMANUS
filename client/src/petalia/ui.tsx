import { useEffect, useRef, type ReactNode } from "react";
import Lenis from "lenis";
import { motion, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";

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
    lenis = new Lenis({ lerp: 0.14, smoothWheel: true, wheelMultiplier: 1, touchMultiplier: 1 });
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
