import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { IMG } from "./data";

const EASE = [0.76, 0, 0.24, 1] as const;
const SOFT = [0.16, 1, 0.3, 1] as const;
const PANELS = 6;
const PRELOAD = [IMG.redVase, IMG.redEditorial, IMG.peonyTall, IMG.redBouquet, IMG.roseBox];
const MIN_MS = 2600;
const MAX_MS = 6000;
const PHRASES = ["نختار الزهرة...", "ننسّق الحكاية...", "نُحضّر لكم الجمال"];

const shell: Variants = { exit: { transition: { when: "afterChildren" } } };
const panel: Variants = {
  exit: (i: number) => ({ y: "-101%", transition: { duration: 1, ease: EASE, delay: 0.12 + Math.abs(i - (PANELS - 1) / 2) * 0.07 } }),
};
const content: Variants = { exit: { opacity: 0, scale: 1.06, filter: "blur(8px)", transition: { duration: 0.45, ease: SOFT } } };

/** Real progress: images actually loading, never faster than MIN_MS, never stuck past MAX_MS. */
function useProgress(onDone: () => void, fast: boolean) {
  const [p, setP] = useState(0);
  const loaded = useRef(0);
  useEffect(() => {
    PRELOAD.forEach(src => {
      const img = new Image();
      img.onload = img.onerror = () => (loaded.current += 1);
      img.src = src;
    });
    const start = performance.now();
    const min = fast ? 300 : MIN_MS;
    let raf = 0;
    let shown = 0;
    let finished = false;
    let last = start;
    const tick = (t: number) => {
      const elapsed = t - start;
      const dt = Math.min(0.1, (t - last) / 1000);
      last = t;
      const timeK = Math.min(1, elapsed / min);
      const loadK = loaded.current / PRELOAD.length;
      const eased = 1 - Math.pow(1 - timeK, 2.2);
      // hold at 92% until the real photos have arrived
      const target = elapsed > MAX_MS ? 1 : Math.min(eased, loadK < 1 ? 0.92 : 1);
      shown += (Math.max(shown, target) - shown) * (1 - Math.exp(-dt * 9));
      if (target >= 1 && shown > 0.985) shown = 1;
      setP(shown);
      if (shown >= 1 && !finished) {
        finished = true;
        setTimeout(onDone, fast ? 0 : 450);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onDone, fast]);
  return p;
}

export default function Loader({ onDone }: { onDone: () => void }) {
  const reduce = !!useReducedMotion();
  const p = useProgress(onDone, reduce);
  const pct = Math.round(p * 100);
  const phrase = PHRASES[Math.min(PHRASES.length - 1, Math.floor(p * PHRASES.length))];

  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, []);

  return (
    <motion.div className="ld" variants={shell} exit="exit" role="status" aria-live="polite" aria-label={`جارٍ التحميل ${pct}%`}>
      <div className="ld-panels" aria-hidden>
        {Array.from({ length: PANELS }, (_, i) => (
          <motion.i key={i} custom={i} variants={panel} />
        ))}
      </div>

      <motion.div className="ld-content" variants={content}>
        <div className="ld-grain" aria-hidden />
        <div className="ld-top">
          <motion.span initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }}>
            PETALIA — FLORAL STUDIO
          </motion.span>
          <motion.span initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8 }}>
            الرياض · مجموعة ٢٠٢٦
          </motion.span>
        </div>

        <div className="ld-center">
          {/* real rose photograph, developing like a print: grey & blurred → full colour */}
          <motion.div className="ld-window" initial={{ scale: 0.6, opacity: 0, rotate: -6 }} animate={{ scale: 1, opacity: 1, rotate: 0 }} transition={{ duration: 1.4, ease: SOFT }}>
            <div
              className="ld-photo"
              style={{
                clipPath: `inset(${(1 - p) * 50}% 0 0 0 round 999px 999px 18px 18px)`,
                filter: `grayscale(${1 - p}) blur(${(1 - p) * 6}px) brightness(${0.55 + p * 0.45})`,
                transform: `scale(${1.35 - p * 0.35})`,
              }}
            >
              <img src={IMG.redVase} alt="" />
            </div>
            <div className="ld-arch" aria-hidden />
            <svg className="ld-ring" viewBox="0 0 300 300" aria-hidden>
              <defs>
                <path id="ld-c" d="M150,150 m-132,0 a132,132 0 1,1 264,0 a132,132 0 1,1 -264,0" />
              </defs>
              <text>
                <textPath href="#ld-c">EVERY FLOWER TELLS A STORY · كل زهرة تحكي حكاية · EVERY FLOWER TELLS A STORY · كل زهرة تحكي حكاية ·</textPath>
              </text>
            </svg>
          </motion.div>

          <h1 className="ld-word" aria-label="PETALIA">
            {"PETALIA".split("").map((c, i) => (
              <span className="ld-mask" key={i}>
                <motion.span initial={{ y: "115%", rotate: 12, filter: "blur(10px)" }} animate={{ y: "0%", rotate: 0, filter: "blur(0px)" }} transition={{ delay: 0.45 + i * 0.07, duration: 1.1, ease: SOFT }}>
                  {c}
                </motion.span>
              </span>
            ))}
          </h1>
          <motion.p className="ld-ar" initial={{ opacity: 0, letterSpacing: "0.6em" }} animate={{ opacity: 1, letterSpacing: "0.04em" }} transition={{ delay: 1, duration: 1.4, ease: SOFT }}>
            بيتـاليا للزهور
          </motion.p>
        </div>

        <div className="ld-bottom">
          <div className="ld-count" aria-hidden>
            {String(pct).padStart(3, "0")
              .split("")
              .map((d, i) => (
                <span className="ld-digit" key={i}>
                  <span style={{ transform: `translateY(-${Number(d) * 10}%)` }}>
                    {"0123456789".split("").map(n => (
                      <b key={n}>{n}</b>
                    ))}
                  </span>
                </span>
              ))}
            <small>%</small>
          </div>
          <div className="ld-phrase">
            <motion.span key={phrase} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: SOFT }}>
              {phrase}
            </motion.span>
          </div>
        </div>
        <div className="ld-bar" aria-hidden>
          <i style={{ transform: `scaleX(${p})` }} />
        </div>
      </motion.div>
    </motion.div>
  );
}
