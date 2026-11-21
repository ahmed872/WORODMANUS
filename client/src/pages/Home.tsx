import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowLeft, ArrowUpLeft, Check, Flower2, Heart, Menu, MousePointer2, Plus, Sparkles, X, ArrowRight } from "lucide-react";
import { categories, colorOptions, previewImage, flowerOptions, gallery, IMG, occasions, productFilters, products, sizeOptions, waLink, wrapOptions, type Category, type FlowerKind, type Product } from "@/petalia/data";
import Loader from "@/petalia/Loader";
import { Cursor, Magnetic, Marquee, Reveal, RingGallery, ScrollProgress, ScrollWords, scrollLock, Tilt, useSmoothScroll } from "@/petalia/ui";

const HeroCanvas = lazy(() => import("@/petalia/three/HeroCanvas"));

const EASE = [0.16, 1, 0.3, 1] as const;
const nav = [
  { text: "الرئيسية", href: "#home" },
  { text: "المجموعات", href: "#collections" },
  { text: "تنسيقاتنا", href: "#products" },
  { text: "مناسباتكم", href: "#occasions" },
  { text: "صمّم باقتك", href: "#custom" },
  { text: "قصتنا", href: "#story" },
];

function useEscape(active: boolean, close: () => void) {
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    scrollLock(true);
    return () => {
      window.removeEventListener("keydown", onKey);
      scrollLock(false);
    };
  }, [active, close]);
}

/* ------------------------------------------------------------------ */
/* ------------------------------------------------------------------ */
function SectionHead({ kicker, title, en, light }: { kicker: string; title: React.ReactNode; en?: string; light?: boolean }) {
  return (
    <div className={`shead ${light ? "light" : ""}`}>
      <span className="kicker">
        <i /> {kicker}
      </span>
      <h2>{title}</h2>
      {en && <span className="shead-en">{en}</span>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
function Occasions() {
  const track = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [edges, setEdges] = useState({ start: true, end: false });
  const drag = useRef({ down: false, x: 0, left: 0, moved: 0 });

  const update = useCallback(() => {
    const el = track.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const pos = Math.abs(el.scrollLeft); // RTL scrollLeft is negative in modern browsers
    setProgress(max > 0 ? pos / max : 0);
    setEdges({ start: pos < 4, end: pos > max - 4 });
  }, []);
  useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [update]);

  const step = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(".occ-card");
    const w = (card?.offsetWidth ?? 360) + 26;
    // in RTL "next" moves toward negative scrollLeft
    el.scrollBy({ left: -dir * w, behavior: "smooth" });
  };

  return (
    <section id="occasions" className="occasions">
      <div className="occ-head">
        <SectionHead kicker="لحظات تستحق / 03" title={<>لكل مناسبة... <em>حكاية من الورد</em></>} en="Flowers for your moments" />
        <div className="occ-nav">
          <p>هدية صغيرة، ذكرى تبقى طويلًا.</p>
          <div>
            <button onClick={() => step(-1)} disabled={edges.start} aria-label="السابق">
              <ArrowRight size={18} />
            </button>
            <button onClick={() => step(1)} disabled={edges.end} aria-label="التالي">
              <ArrowLeft size={18} />
            </button>
          </div>
        </div>
      </div>
      <div
        className="occ-track"
        ref={track}
        onScroll={update}
        data-cursor="اسحب"
        onPointerDown={e => {
          if (e.pointerType !== "mouse") return;
          drag.current = { down: true, x: e.clientX, left: track.current!.scrollLeft, moved: 0 };
        }}
        onPointerMove={e => {
          const d = drag.current;
          if (!d.down) return;
          const dx = e.clientX - d.x;
          d.moved = Math.max(d.moved, Math.abs(dx));
          if (d.moved > 4) track.current!.classList.add("dragging");
          track.current!.scrollLeft = d.left - dx;
        }}
        onPointerUp={() => {
          drag.current.down = false;
          track.current?.classList.remove("dragging");
        }}
        onPointerLeave={() => {
          drag.current.down = false;
          track.current?.classList.remove("dragging");
        }}
        onClickCapture={e => {
          if (drag.current.moved > 6) {
            e.preventDefault();
            e.stopPropagation();
          }
          drag.current.moved = 0;
        }}
      >
        {occasions.map((o, i) => (
          <a className="occ-card" href="#custom" key={o.title} draggable={false}>
            <div className="occ-img">
              <img src={o.image} alt={o.title} loading="lazy" draggable={false} />
            </div>
            <span className="occ-num">{String(i + 1).padStart(2, "0")}</span>
            <div className="occ-copy">
              <small>{o.en}</small>
              <h3>{o.title}</h3>
              <p>{o.line}</p>
              <span className="occ-cta">
                اصنعوا باقتها <ArrowUpLeft size={15} />
              </span>
            </div>
          </a>
        ))}
      </div>
      <div className="occ-progress">
        <i style={{ transform: `scaleX(${Math.max(0.08, progress)})` }} />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
function Campaign() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const clip = useTransform(scrollYProgress, [0, 0.45], ["inset(18% 14% 18% 14% round 220px)", "inset(0% 0% 0% 0% round 0px)"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.25, 1]);
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  return (
    <section className="campaign" ref={ref}>
      <motion.div className="campaign-media" style={{ clipPath: clip }}>
        <motion.img src={IMG.roseBox} alt="ورود وفاوانيا وردية في صندوق فاخر" loading="lazy" style={{ scale, y }} />
        <div className="campaign-shade" />
        <div className="campaign-copy">
          <span className="kicker light">
            <i /> تنسيق، بإحساس مختلف
          </span>
          <h2>
            <Reveal>الجمال يكمن</Reveal>
            <Reveal delay={0.1}>
              <em>في التفاصيل</em>
            </Reveal>
          </h2>
          <p>من أول بتلة نختارها، إلى آخر لمسة على بطاقة الإهداء. نؤمن أن أجمل الهدايا هي التي تُشبه من نهديها.</p>
          <a className="link light" href="#story">
            تعرّف على أسلوبنا <ArrowLeft size={16} />
          </a>
        </div>
        <span className="campaign-vertical">THE ART OF GIVING — MMXXVI</span>
      </motion.div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
const BLOOMS: [number, number][][] = [
  [[23, 26], [37, 26], [30, 16]],
  [[17, 28], [43, 28], [30, 28], [23, 17], [37, 17]],
  [[12, 30], [48, 30], [24, 30], [36, 30], [18, 19], [42, 19], [30, 12]],
];

function Builder() {
  const [flower, setFlower] = useState<FlowerKind>("rose");
  const [color, setColor] = useState(0);
  const [size, setSize] = useState(1);
  const [wrap, setWrap] = useState(0);
  const [card, setCard] = useState("");
  const preview = previewImage(flower, colorOptions[color].key);
  const flowerOpt = flowerOptions.find(f => f.key === flower)!;
  const sz = sizeOptions[size];
  const price = sizeOptions[size].price + (flower === "peony" ? 90 : flower === "mixed" ? 45 : 0) + (wrap === 3 ? 35 : 0);
  const message = `مرحبًا بيتـاليا، أود تصميم باقة خاصة:\nالزهور: ${flowerOptions.find(f => f.key === flower)!.label}\nالألوان: ${colorOptions[color].label}\nالحجم: ${sizeOptions[size].label} (${sizeOptions[size].count} زهرة تقريبًا)\nالتغليف: ${wrapOptions[wrap].label}\nبطاقة الإهداء: ${card || "بدون نص محدد"}\nالتكلفة التقديرية الظاهرة: ${price} ر.س (توضيحية)`;

  return (
    <section id="custom" className="builder">
      <div className="builder-stage">
        <div className="stage-glow" />
        <div className="stage-scene">
          <div className="stage-frame">
          {/* height ruler: the photo grows with the chosen size */}
          <div className="stage-ruler" aria-hidden>
            {sizeOptions.map((o, i) => (
              <span key={o.key} className={i === size ? "on" : ""} style={{ bottom: `${(o.height / 60) * 100}%` }}>
                {o.height} سم
              </span>
            ))}
            <motion.i className="ruler-fill" animate={{ height: `${(sz.height / 60) * 100}%` }} transition={{ duration: 0.8, ease: EASE }} />
          </div>
          <motion.div className="stage-size" animate={{ scale: sz.height / 60 }} transition={{ duration: 0.8, ease: EASE }}>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div key={preview} className="stage-photo-wrap" initial={{ opacity: 0, rotateY: -30, x: 60 }} animate={{ opacity: 1, rotateY: 0, x: 0 }} exit={{ opacity: 0, rotateY: 30, x: -60 }} transition={{ duration: 0.75, ease: EASE }}>
                <Tilt className="stage-photo" max={7} style={{ ["--wrap" as string]: wrapOptions[wrap].color }}>
                  <img src={preview} alt={`مثال حقيقي: ${flowerOpt.label}`} />
                </Tilt>
              </motion.div>
            </AnimatePresence>
          </motion.div>
          </div>
          <div className="stage-shadow" />
        </div>
        <div className="stage-summary">
          <div>
            <small>النوع</small>
            <strong>{flowerOpt.label}</strong>
          </div>
          <div>
            <small>الألوان</small>
            <span className="swatches">
              {colorOptions[color].swatch.slice(0, 3).map(c => (
                <i key={c} style={{ background: c }} />
              ))}
            </span>
          </div>
          <div>
            <small>الحجم</small>
            <strong>
              {sz.count} زهرة · {sz.height} سم
            </strong>
          </div>
          <div>
            <small>التغليف</small>
            <span className="swatches">
              <i style={{ background: wrapOptions[wrap].color }} />
            </span>
          </div>
        </div>
        <p className="stage-note">الصورة مثال حقيقي من تنسيقاتنا لنفس نوع الزهور، وتُنسَّق باقتكم بالألوان والحجم الذي اخترتموه.</p>
        {card && (
          <motion.div className="stage-card" initial={{ opacity: 0, y: 12, rotate: -4 }} animate={{ opacity: 1, y: 0, rotate: -3 }}>
            <small>بطاقة الإهداء</small>
            <p>{card}</p>
          </motion.div>
        )}
      </div>
      <div className="builder-panel">
        <SectionHead kicker="مساحتك الإبداعية / 04" title={<>اصنع باقتك <em>الخاصة</em></>} en="Made just for you" />
        <p className="builder-intro">اختاروا التفاصيل، وشاهدوا مثالًا حقيقيًا من تنسيقاتنا يقترب من ذوقكم — ثم أرسلوا اختياراتكم لننسّقها بأيدينا.</p>

        <div className="opt">
          <label>
            <b>01</b> نوع الزهور
          </label>
          <div className="flower-cards">
            {flowerOptions.map(f => (
              <button key={f.key} className={flower === f.key ? "on" : ""} onClick={() => setFlower(f.key)} aria-pressed={flower === f.key}>
                <span className="fc-img">
                  <img src={f.thumb} alt="" loading="lazy" />
                  {flower === f.key && (
                    <motion.span className="fc-check" layoutId="fc-check">
                      <Check size={14} />
                    </motion.span>
                  )}
                </span>
                <strong>{f.label}</strong>
                <small>{f.note}</small>
              </button>
            ))}
          </div>
        </div>
        <div className="opt">
          <label>
            <b>02</b> الألوان
          </label>
          <div className="opt-row">
            {colorOptions.map((c, i) => (
              <button key={c.key} className={color === i ? "on" : ""} onClick={() => setColor(i)} aria-pressed={color === i}>
                <span className="swatches">
                  {c.swatch.slice(0, 3).map(s => (
                    <i key={s} style={{ background: s }} />
                  ))}
                </span>
                {c.label}
              </button>
            ))}
          </div>
        </div>
        <div className="opt">
          <label>
            <b>03</b> حجم الباقة
          </label>
          <div className="size-cards">
            {sizeOptions.map((o, i) => (
              <button key={o.key} className={size === i ? "on" : ""} onClick={() => setSize(i)} aria-pressed={size === i}>
                <svg viewBox="0 0 60 80" aria-hidden style={{ height: `${44 + i * 16}px` }}>
                  {BLOOMS[i].map(([cx, cy], k) => (
                    <circle key={k} cx={cx} cy={cy} r={7.5} />
                  ))}
                  <path d="M18 34 L30 76 L42 34 Z" />
                </svg>
                <strong>{o.label}</strong>
                <small>
                  {o.count} زهرة · ≈{o.height} سم
                </small>
                <em>{o.note}</em>
              </button>
            ))}
          </div>
        </div>
        <div className="opt">
          <label>
            <b>04</b> نوع التغليف
          </label>
          <div className="opt-row">
            {wrapOptions.map((w, i) => (
              <button key={w.key} className={wrap === i ? "on" : ""} onClick={() => setWrap(i)} aria-pressed={wrap === i}>
                <span className="swatches">
                  <i style={{ background: w.color }} />
                </span>
                {w.label}
              </button>
            ))}
          </div>
        </div>
        <div className="opt">
          <label htmlFor="gift-card">
            <b>05</b> بطاقة الإهداء
          </label>
          <textarea id="gift-card" value={card} maxLength={120} onChange={e => setCard(e.target.value)} placeholder="اكتبوا كلماتكم هنا... وستظهر على البطاقة بجانب الباقة" />
          <span className="counter">{card.length}/120</span>
        </div>
        <div className="builder-total">
          <div>
            <small>التكلفة التقديرية</small>
            <strong>
              <motion.span key={price} initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                {price}
              </motion.span>{" "}
              <em>ر.س</em>
            </strong>
            <span className="demo">سعر توضيحي — يُحدَّد نهائيًا عند التواصل</span>
          </div>
          <Magnetic>
            <a className="btn btn-primary" href={waLink(message)} target="_blank" rel="noreferrer">
              أرسل اختياراتك عبر واتساب <ArrowUpLeft size={17} />
            </a>
          </Magnetic>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
function ProductModal({ product, onClose }: { product: Product | null; onClose: () => void }) {
  useEscape(!!product, onClose);
  return (
    <AnimatePresence>
      {product && (
        <motion.div className="modal-back" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div className="modal" role="dialog" aria-modal="true" aria-label={`تفاصيل ${product.name}`} initial={{ opacity: 0, y: 40, rotateX: 8 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} exit={{ opacity: 0, y: 20 }} transition={{ duration: 0.6, ease: EASE }} onClick={e => e.stopPropagation()}>
            <button className="modal-x" onClick={onClose} aria-label="إغلاق" autoFocus>
              <X size={18} />
            </button>
            <div className="modal-img">
              <motion.img layoutId={`img-${product.name}`} src={product.image} alt={product.name} />
            </div>
            <div className="modal-copy">
              <span className="modal-en">{product.en}</span>
              <h2>{product.name}</h2>
              <p>{product.description}</p>
              <ul>
                {product.notes.map(n => (
                  <li key={n}>
                    <Check size={15} /> {n}
                  </li>
                ))}
              </ul>
              <div className="modal-price">
                {product.price} <small>ر.س — سعر توضيحي</small>
              </div>
              <a className="btn btn-primary wide" href={waLink(`مرحبًا بيتـاليا، أود الاستفسار عن ${product.name} — السعر الظاهر ${product.price} ر.س توضيحي.`)} target="_blank" rel="noreferrer">
                اطلبوا عبر واتساب <ArrowUpLeft size={17} />
              </a>
              <small className="fine">السعر المعروض تجريبي للتوضيح فقط، ولا يمثّل مخزونًا فعليًا.</small>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Lightbox({ src, onClose }: { src: string | null; onClose: () => void }) {
  useEscape(!!src, onClose);
  return (
    <AnimatePresence>
      {src && (
        <motion.div className="lightbox" role="dialog" aria-modal="true" aria-label="عرض الصورة" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <button className="modal-x fixed" aria-label="إغلاق" onClick={onClose} autoFocus>
            <X size={18} />
          </button>
          <motion.img src={src} alt="تنسيق زهري من PETALIA" initial={{ scale: 0.9, rotateY: -12 }} animate={{ scale: 1, rotateY: 0 }} transition={{ duration: 0.6, ease: EASE }} onClick={e => e.stopPropagation()} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ================================================================== */
export default function Home() {
  const reduce = !!useReducedMotion();
  const [loading, setLoading] = useState(true);
  const [onDark, setOnDark] = useState(true);
  const [hidden, setHidden] = useState(false);
  const [menu, setMenu] = useState(false);
  const [filter, setFilter] = useState<Category | "all">("all");
  const [product, setProduct] = useState<Product | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const done = useCallback(() => setLoading(false), []);
  const closeProduct = useCallback(() => setProduct(null), []);
  const closeLightbox = useCallback(() => setLightbox(null), []);
  const closeMenu = useCallback(() => setMenu(false), []);
  useEscape(menu, closeMenu);
  useSmoothScroll(!reduce && !loading);
  const ready = !loading;

  useEffect(() => {
    let last = 0;
    const onScroll = () => {
      const y = window.scrollY;
      const darkZones = Array.from(document.querySelectorAll<HTMLElement>("[data-dark]"));
      setOnDark(darkZones.some(el => {
        const r = el.getBoundingClientRect();
        return r.top <= 40 && r.bottom >= 40;
      }));
      setHidden(y > 600 && y > last + 4);
      if (y < last - 4) setHidden(false);
      last = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const hero = useRef<HTMLElement>(null);
  const { scrollYProgress: heroP } = useScroll({ target: hero, offset: ["start start", "end start"] });
  const heroCopyY = useTransform(heroP, [0, 1], ["0%", "35%"]);
  const heroCopyO = useTransform(heroP, [0, 0.7], [1, 0]);

  const story = useRef<HTMLElement>(null);
  const { scrollYProgress: storyP } = useScroll({ target: story, offset: ["start end", "end start"] });
  const storyImgY = useTransform(storyP, [0, 1], ["-12%", "12%"]);
  const storyBadgeR = useTransform(storyP, [0, 1], [0, 220]);

  const shown = useMemo(() => (filter === "all" ? products : products.filter(p => p.category === filter)), [filter]);
  const toggleFav = (name: string) => setFavorites(f => (f.includes(name) ? f.filter(x => x !== name) : [...f, name]));

  return (
    <div className="petalia" dir="rtl">
      <AnimatePresence>{loading && <Loader onDone={done} />}</AnimatePresence>
      <Cursor />
      <ScrollProgress />

      {/* ---------------- NAV ---------------- */}
      <header className={`nav ${onDark ? "on-dark" : "on-light"} ${hidden && !menu ? "is-hidden" : ""} ${menu ? "menu-open" : ""}`}>
        <a className="brand" href="#home" onClick={closeMenu} aria-label="PETALIA — الرئيسية">
          <span className="brand-mark">
            <Flower2 size={18} strokeWidth={1.3} />
          </span>
          <span className="brand-word">
            PETALIA<small>بيتـاليا للزهور</small>
          </span>
        </a>
        <nav className="nav-links" aria-label="القائمة الرئيسية">
          {nav.map(n => (
            <a key={n.href} href={n.href}>
              <span data-text={n.text}>{n.text}</span>
            </a>
          ))}
        </nav>
        <div className="nav-end">
          <Magnetic>
            <a className="nav-cta" href={waLink("مرحبًا بيتـاليا، أود الاستفسار عن تنسيقاتكم.")} target="_blank" rel="noreferrer">
              <span>لنتحدث عن الورد</span>
              <ArrowUpLeft size={16} />
            </a>
          </Magnetic>
          <button className="burger" aria-label={menu ? "إغلاق القائمة" : "فتح القائمة"} aria-expanded={menu} onClick={() => setMenu(m => !m)}>
            {menu ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>
      <AnimatePresence>
        {menu && (
          <motion.div className="mobile-menu" initial={{ clipPath: "circle(0% at 8% 4%)" }} animate={{ clipPath: "circle(150% at 8% 4%)" }} exit={{ clipPath: "circle(0% at 8% 4%)" }} transition={{ duration: 0.7, ease: EASE }}>
            <nav aria-label="قائمة الهاتف">
              {nav.map((n, i) => (
                <motion.a key={n.href} href={n.href} onClick={closeMenu} initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 + i * 0.06, duration: 0.7, ease: EASE }}>
                  <small>0{i + 1}</small>
                  {n.text}
                </motion.a>
              ))}
            </nav>
            <a className="btn btn-light" href={waLink("مرحبًا بيتـاليا، أود الاستفسار عن تنسيقاتكم.")} target="_blank" rel="noreferrer">
              تواصلوا عبر واتساب <ArrowUpLeft size={16} />
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      <main>
        {/* ---------------- HERO ---------------- */}
        <section id="home" className="hero" ref={hero} data-dark>
          <Suspense fallback={<div className="hero-canvas hero-canvas-fallback" />}>
            <HeroCanvas still={reduce} ready={ready} />
          </Suspense>
          <div className="hero-vignette" />
          <motion.div className="hero-copy" style={{ y: heroCopyY, opacity: heroCopyO }}>
            <motion.span className="kicker light" initial={{ opacity: 0, y: 10 }} animate={ready ? { opacity: 1, y: 0 } : undefined} transition={{ delay: 0.55, duration: 0.8 }}>
              <i /> استوديو زهور فاخر · الرياض
            </motion.span>
            <h1>
              <span className="line">
                <motion.span initial={{ y: "110%" }} animate={ready ? { y: 0 } : undefined} transition={{ delay: 0.6, duration: 1.2, ease: EASE }}>
                  بعض المشاعر...
                </motion.span>
              </span>
              <span className="line">
                <motion.em initial={{ y: "110%" }} animate={ready ? { y: 0 } : undefined} transition={{ delay: 0.72, duration: 1.2, ease: EASE }}>
                  لا تُقال بالكلمات
                </motion.em>
              </span>
            </h1>
            <motion.p initial={{ opacity: 0, y: 16 }} animate={ready ? { opacity: 1, y: 0 } : undefined} transition={{ delay: 0.95, duration: 0.9 }}>
              نختار أجمل الزهور وننسّقها بعناية، لتصل مشاعركم بأجمل صورة.
            </motion.p>
            <motion.div className="hero-actions" initial={{ opacity: 0, y: 16 }} animate={ready ? { opacity: 1, y: 0 } : undefined} transition={{ delay: 1.1, duration: 0.9 }}>
              <Magnetic>
                <a className="btn btn-light" href="#products">
                  اكتشف مجموعتنا <ArrowLeft size={17} />
                </a>
              </Magnetic>
              <Magnetic>
                <a className="btn btn-ghost" href="#custom">
                  <Sparkles size={16} /> صمّم باقتك الخاصة
                </a>
              </Magnetic>
            </motion.div>
            <motion.div className="hero-stats" initial={{ opacity: 0 }} animate={ready ? { opacity: 1 } : undefined} transition={{ delay: 1.3, duration: 1 }}>
              <div>
                <strong>100%</strong>
                <span>زهور طبيعية طازجة</span>
              </div>
              <div>
                <strong>يدوي</strong>
                <span>كل تنسيق بلمسة فنان</span>
              </div>
              <div>
                <strong>نفس اليوم</strong>
                <span>توصيل داخل الرياض*</span>
              </div>
            </motion.div>
          </motion.div>
          <div className="hero-side">
            <span>PETALIA FLORAL STUDIO</span>
            <span>EST. WITH LOVE</span>
          </div>
          <div className="hero-hint">
            <MousePointer2 size={14} /> حرّكوا المؤشر لاستكشاف المشهد
          </div>
          <a className="hero-scroll" href="#collections" aria-label="انتقل إلى المجموعات">
            <span>مرّر</span>
            <i />
          </a>
        </section>

        <Marquee className="marquee-main" items={[<em key="a">Flowers, thoughtfully told</em>, "كل زهرة تحكي حكاية", <em key="b">Made with feeling</em>, "تنسيق يدوي من القلب", <em key="c">Since the first petal</em>, "هدايا تبقى في الذاكرة"]} />

        {/* ---------------- COLLECTIONS ---------------- */}
        <section id="collections" className="collections pad">
          <div className="coll-intro">
            <SectionHead kicker="مجموعاتنا / 01" title={<>اختيرت بحب...<br /><em>وصُممت لتُهدى</em></>} en="A collection made to be remembered" />
            <p>لكل لحظة لونها، ولكل شعور زهرة تشبهه. اكتشفوا مجموعاتنا المختارة بعناية — وحرّكوا المؤشر فوق البطاقات.</p>
            <a href="#products" className="link">
              تصفّح كل الباقات <ArrowLeft size={16} />
            </a>
          </div>
          <div className="coll-grid">
            {categories.map((c, i) => (
              <motion.a href="#products" key={c.title} className={`coll-tile t${i + 1}`} initial={{ opacity: 0, y: 60 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 1, ease: EASE, delay: (i % 3) * 0.08 }} data-cursor="اكتشف">
                <Tilt className="coll-tilt" max={8}>
                  <img src={c.image} alt={c.title} loading="lazy" />
                  <span className="coll-idx">{String(i + 1).padStart(2, "0")}</span>
                  <div className="coll-label">
                    <small>{c.en}</small>
                    <strong>{c.title}</strong>
                  </div>
                  <span className="coll-arrow">
                    <ArrowUpLeft size={18} />
                  </span>
                </Tilt>
              </motion.a>
            ))}
          </div>
        </section>

        {/* ---------------- PRODUCTS ---------------- */}
        <section id="products" className="products pad">
          <div className="products-head">
            <SectionHead kicker="تشكيلة PETALIA / 02" title={<>وردٌ يليق <em>بالحكاية</em></>} en="The flower edit" />
            <div className="filters" role="tablist" aria-label="تصفية التشكيلة">
              {productFilters.map(f => (
                <button key={f.key} role="tab" aria-selected={filter === f.key} className={filter === f.key ? "on" : ""} onClick={() => setFilter(f.key)}>
                  {filter === f.key && <motion.i layoutId="filter-pill" className="pill" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
                  <span>{f.label}</span>
                </button>
              ))}
            </div>
          </div>
          <motion.div className="product-grid" layout>
            <AnimatePresence mode="popLayout">
              {shown.map((p, i) => (
                <motion.article layout key={p.name} className="pcard" initial={{ opacity: 0, y: 40, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.92 }} transition={{ duration: 0.7, ease: EASE, delay: i * 0.04 }}>
                  <Tilt className="pcard-media" max={7}>
                    <button className="pcard-open" onClick={() => setProduct(p)} aria-label={`تفاصيل ${p.name}`} data-cursor="عرض">
                      <motion.img layoutId={`img-${p.name}`} src={p.image} alt={p.name} loading="lazy" />
                    </button>
                    <span className="pcard-tag">{p.tag}</span>
                    <button className={`fav ${favorites.includes(p.name) ? "on" : ""}`} aria-label={favorites.includes(p.name) ? "إزالة من المفضلة" : "إضافة إلى المفضلة"} aria-pressed={favorites.includes(p.name)} onClick={() => toggleFav(p.name)}>
                      <Heart size={17} fill={favorites.includes(p.name) ? "currentColor" : "none"} />
                    </button>
                  </Tilt>
                  <div className="pcard-info">
                    <span className="pcard-en">{p.en}</span>
                    <div className="pcard-row">
                      <h3>{p.name}</h3>
                      <span className="price">
                        {p.price} <small>ر.س</small>
                      </span>
                    </div>
                    <p>{p.description}</p>
                    <div className="pcard-actions">
                      <button onClick={() => setProduct(p)}>
                        التفاصيل <Plus size={14} />
                      </button>
                      <a href={waLink(`مرحبًا بيتـاليا، أود طلب ${p.name} — السعر الظاهر ${p.price} ر.س توضيحي.`)} target="_blank" rel="noreferrer">
                        اطلب عبر واتساب <ArrowUpLeft size={14} />
                      </a>
                    </div>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </motion.div>
          <p className="footnote">جميع الأسعار المعروضة تجريبية للتوضيح، وتُحدَّد التفاصيل عند التواصل.</p>
        </section>

        <Campaign />

        <Occasions />

        <Builder />

        {/* ---------------- STORY ---------------- */}
        <section id="story" className="story pad" ref={story}>
          <div className="story-media">
            <div className="story-frame">
              <motion.img src={IMG.peonyPink} alt="فاوانيا وردية في مزهرية زجاجية" loading="lazy" style={{ y: storyImgY }} />
            </div>
            <motion.svg className="story-badge" viewBox="0 0 200 200" style={{ rotate: storyBadgeR }} aria-hidden>
              <defs>
                <path id="circ" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
              </defs>
              <text>
                <textPath href="#circ">FLOWERS · THOUGHTFULLY · TOLD · PETALIA · STUDIO ·</textPath>
              </text>
            </motion.svg>
            <span className="story-flower">
              <Flower2 size={34} strokeWidth={1} />
            </span>
          </div>
          <div className="story-copy">
            <SectionHead kicker="حكايتنا / 05" title={<>نؤمن أن لكل <em>زهرة لغة</em></>} en="Floral notes · Vol. 01" />
            <ScrollWords className="story-big" text="بعض الكلمات لا تحتاج إلى صوت. نختار الزهور كما تُختار الكلمات الجميلة؛ بقلبٍ حاضر، واهتمام بالتفاصيل، ورغبة في أن تصل مشاعركم كما هي." />
            <p className="story-small">في PETALIA، كل تنسيق مساحة صغيرة للتعبير، وكل باقة بداية لحكاية تُهدى.</p>
            <div className="story-pillars">
              {[
                ["اختيار", "زهور موسمية منتقاة كل صباح"],
                ["تنسيق", "أيدٍ تعرف لغة الألوان"],
                ["إهداء", "تغليف وبطاقة بعناية كاملة"],
              ].map(([t, d], i) => (
                <motion.div key={t} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12, duration: 0.9, ease: EASE }}>
                  <b>0{i + 1}</b>
                  <strong>{t}</strong>
                  <span>{d}</span>
                </motion.div>
              ))}
            </div>
            <span className="sign">
              بكل حب، PETALIA <Flower2 size={18} />
            </span>
          </div>
        </section>

        {/* ---------------- GALLERY ---------------- */}
        <section className="gallery" data-dark>
          <div className="gallery-head pad-x">
            <SectionHead light kicker="من عالم PETALIA / 06" title={<>تفاصيل <em>تزهر</em></>} en="A little world in bloom" />
            <p>اسحبوا الحلقة لتدويرها، واضغطوا على أي صورة لتكبيرها.</p>
          </div>
          <RingGallery items={gallery} onOpen={setLightbox} />
          <div className="gallery-foot pad-x">
            <span>@PETALIA.FLOWERS</span>
            <span>لحظاتكم، كما ترونها</span>
          </div>
        </section>

        {/* ---------------- TESTIMONIALS ---------------- */}
        <section className="testimonials pad">
          <SectionHead kicker="كلمات دافئة / 07" title={<>أثرٌ <em>يبقى</em></>} en="A note from the heart" />
          <div className="reviews">
            {[
              "وصلت الباقة أجمل مما تخيلت... كل تفصيلة فيها كانت تشبه المناسبة.",
              "ألوان هادئة وتنسيق بذوق رفيع. كانت هدية مثالية لشخص عزيز.",
              "فكرة تخصيص الباقة جعلت الهدية شخصية ومختلفة جدًا.",
            ].map((r, i) => (
              <motion.article key={i} initial={{ opacity: 0, y: 50, rotate: i === 1 ? 0 : i === 0 ? 2 : -2 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12, duration: 1, ease: EASE }}>
                <span className="q">“</span>
                <p>{r}</p>
                <div className="stars" aria-label="تقييم توضيحي">
                  ★★★★★
                </div>
                <small>مراجعة تجريبية — مثال توضيحي</small>
              </motion.article>
            ))}
          </div>
          <p className="footnote">النصوص أعلاه تجريبية وليست تقييمات حقيقية من عملاء.</p>
        </section>

        {/* ---------------- CONTACT ---------------- */}
        <section id="contact" className="contact" data-dark>
          <Marquee reverse className="marquee-ghost" items={["دعوا الورد يتكلم", <em key="x">Let the flowers speak</em>, "دعوا الورد يتكلم", <em key="y">Let the flowers speak</em>]} />
          <div className="contact-inner">
            <span className="kicker light">
              <i /> لديكم حكاية؟
            </span>
            <h2>
              <Reveal>دعوا الورد يقول</Reveal>
              <Reveal delay={0.1}>
                <em>ما تعجز عنه الكلمات.</em>
              </Reveal>
            </h2>
            <p>نحن هنا لنختار معكم باقة تليق بكل ما تريدون قوله.</p>
            <Magnetic strength={0.5}>
              <a className="orb" href={waLink("مرحبًا بيتـاليا، أود الاستفسار عن تنسيق باقة لمناسبة خاصة.")} target="_blank" rel="noreferrer">
                <span>ابدأوا حكايتكم</span>
                <ArrowUpLeft size={22} />
              </a>
            </Magnetic>
          </div>
        </section>
      </main>

      {/* ---------------- FOOTER ---------------- */}
      <footer className="footer" data-dark>
        <div className="footer-main">
          <div className="footer-brand">
            <a className="brand" href="#home">
              <span className="brand-mark">
                <Flower2 size={18} strokeWidth={1.3} />
              </span>
              <span className="brand-word">
                PETALIA<small>بيتـاليا للزهور</small>
              </span>
            </a>
            <p>كل زهرة تحكي حكاية</p>
            <span className="footer-en">Flowers, thoughtfully told.</span>
          </div>
          <div className="footer-col">
            <h3>اكتشفوا</h3>
            {nav.slice(0, 4).map(n => (
              <a key={n.href} href={n.href}>
                {n.text}
              </a>
            ))}
          </div>
          <div className="footer-col">
            <h3>اختاروا حسب الشعور</h3>
            <a href="#products">الورود الحمراء</a>
            <a href="#products">تنسيقات التوليب</a>
            <a href="#products">بوكسات الورد</a>
            <a href="#custom">صمّموا باقتكم</a>
          </div>
          <div className="footer-col">
            <h3>يسعدنا تواصلكم</h3>
            <span>الرياض، المملكة العربية السعودية</span>
            <span>رقم التواصل: placeholder قابل للتعديل</span>
            <a className="footer-wa" href={waLink("مرحبًا بيتـاليا، أود التواصل معكم.")} target="_blank" rel="noreferrer">
              تواصلوا عبر واتساب <ArrowUpLeft size={15} />
            </a>
            <div className="socials">
              <a href="#contact" aria-label="انستغرام (رابط تجريبي)">Instagram ↗</a>
              <a href="#contact" aria-label="بنترست (رابط تجريبي)">Pinterest ↗</a>
            </div>
          </div>
        </div>
        <div className="footer-giant" aria-hidden>
          PETALIA
        </div>
        <div className="footer-bottom">
          <span>© PETALIA — بيتـاليا للزهور</span>
          <span>صُنع بعناية، ليُهدى بحب</span>
          <a href="#home">
            العودة إلى الأعلى <ArrowUpLeft size={13} />
          </a>
        </div>
      </footer>

      <a className="wa-float" href={waLink("مرحبًا بيتـاليا، أود الاستفسار عن باقات الورد.")} target="_blank" rel="noreferrer" aria-label="تواصل عبر واتساب">
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
          <path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2l-.4-.2Z" />
        </svg>
        <span>نحن هنا</span>
      </a>

      <ProductModal product={product} onClose={closeProduct} />
      <Lightbox src={lightbox} onClose={closeLightbox} />
      <span className="sr-only" aria-live="polite">
        {favorites.length ? `في المفضلة: ${favorites.length}` : ""}
      </span>
    </div>
  );
}
