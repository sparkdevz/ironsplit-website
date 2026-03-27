import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function useTransitionSound() {
  const ctxRef = useRef<AudioContext | null>(null);

  const initCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }, []);

  const play = useCallback(() => {
    try { initCtx(); } catch (_) {}
    const ctx = ctxRef.current;
    if (!ctx) return;
    const t = ctx.currentTime;

    // Heavy low thud
    const thud = ctx.createOscillator();
    const thudG = ctx.createGain();
    thud.frequency.setValueAtTime(110, t);
    thud.frequency.exponentialRampToValueAtTime(22, t + 0.22);
    thudG.gain.setValueAtTime(0.85, t);
    thudG.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
    thud.connect(thudG); thudG.connect(ctx.destination);
    thud.start(t); thud.stop(t + 0.3);

    // Metallic high-freq ring
    const ring = ctx.createOscillator();
    const ringG = ctx.createGain();
    ring.type = 'sine'; ring.frequency.value = 1400;
    ringG.gain.setValueAtTime(0.12, t);
    ringG.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
    ring.connect(ringG); ringG.connect(ctx.destination);
    ring.start(t); ring.stop(t + 0.3);

    // Noise burst (clank texture)
    const bufLen = Math.floor(ctx.sampleRate * 0.12);
    const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) d[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource(); noise.buffer = buf;
    const flt = ctx.createBiquadFilter(); flt.type = 'bandpass'; flt.frequency.value = 3000; flt.Q.value = 0.6;
    const noiseG = ctx.createGain();
    noiseG.gain.setValueAtTime(0.28, t);
    noiseG.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    noise.connect(flt); flt.connect(noiseG); noiseG.connect(ctx.destination);
    noise.start(t); noise.stop(t + 0.15);
  }, [initCtx]);

  useEffect(() => {
    const go = () => initCtx();
    document.addEventListener('click', go, { once: true });
    document.addEventListener('keydown', go, { once: true });
    try { initCtx(); } catch (_) {}
    return () => {
      document.removeEventListener('click', go);
      document.removeEventListener('keydown', go);
      ctxRef.current?.close();
      ctxRef.current = null;
    };
  }, [initCtx]);

  return { play };
}

const AMBER = '#f59e0b';
const DARK = '#1a1a1a';
const WHITE = '#ffffff';

const SCENE_DURATIONS = [
  4000,
  5000,
  5000,
  5000,
  5000,
  6000,
];

const IMG_HOME    = '/__mockup/images/ios-01-home.png';
const IMG_LOGGING = '/__mockup/images/ios-02-logging.png';
const IMG_TIMER   = '/__mockup/images/ios-03-timer.png';
const IMG_WEEKS   = '/__mockup/images/ios-04-weeks.png';
const IMG_ICON    = '/__mockup/images/icon.png';
const BG_VIDEO    = '/__mockup/bg-gym.mp4';

export function IronSplitCommercial() {
  const [currentScene, setCurrentScene] = useState(0);
  const { play } = useTransitionSound();
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
    } else {
      play();
    }
    const timer = setTimeout(() => {
      setCurrentScene((prev) => (prev + 1) % SCENE_DURATIONS.length);
    }, SCENE_DURATIONS[currentScene]);
    return () => clearTimeout(timer);
  }, [currentScene]);

  return (
    <div
      className="relative w-screen h-screen overflow-hidden flex items-center justify-center"
      style={{ background: DARK, fontFamily: "'Inter', sans-serif" }}
    >
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay loop muted playsInline
          className="w-full h-full object-cover"
          style={{ opacity: 0.28, mixBlendMode: 'luminosity' }}
        >
          <source src={BG_VIDEO} type="video/mp4" />
        </video>
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(to top, ${DARK} 0%, ${DARK}cc 40%, transparent 100%)` }}
        />
      </div>

      {/* Animated radial glow */}
      <motion.div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{ background: `radial-gradient(circle at 50% 50%, ${AMBER}22, transparent 70%)` }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.4, 0.7, 0.4],
          x: currentScene % 2 === 0 ? '5vw' : '-5vw',
        }}
        transition={{ duration: 8, ease: 'easeInOut', repeat: Infinity }}
      />

      {/* Progress bar */}
      <motion.div
        className="absolute top-0 left-0 z-50"
        style={{ height: '3px', background: AMBER }}
        animate={{ width: `${((currentScene + 1) / SCENE_DURATIONS.length) * 100}%` }}
        transition={{ duration: 0.8, ease: 'circOut' }}
      />

      <AnimatePresence mode="wait">
        {currentScene === 0 && <SceneIntro key="s0" icon={IMG_ICON} />}
        {currentScene === 1 && <SceneSplit key="s1" imgHome={IMG_HOME} />}
        {currentScene === 2 && <SceneLogging key="s2" imgLogging={IMG_LOGGING} />}
        {currentScene === 3 && <SceneTimer key="s3" imgTimer={IMG_TIMER} />}
        {currentScene === 4 && <SceneProgram key="s4" imgWeeks={IMG_WEEKS} />}
        {currentScene === 5 && <SceneOutro key="s5" icon={IMG_ICON} />}
      </AnimatePresence>

    </div>
  );
}

function PhoneMockup({ src, delay = 0, className = '' }: { src: string; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ y: '15vw', opacity: 0, rotateX: 25, rotateY: -10 }}
      animate={{ y: 0, opacity: 1, rotateX: 0, rotateY: 0 }}
      exit={{ y: '-15vw', opacity: 0, rotateX: -25, rotateY: 10, scale: 0.8 }}
      transition={{ delay, duration: 1.2, type: 'spring', stiffness: 100, damping: 20 }}
      className={`relative overflow-hidden shadow-2xl ${className}`}
      style={{
        borderRadius: '2.5vw',
        border: '0.4vw solid #3f3f3f',
        background: '#000',
        transformStyle: 'preserve-3d',
        boxShadow: `0 0 4vw ${AMBER}26`,
      }}
    >
      <div
        className="absolute z-20"
        style={{
          top: '2vw', left: '50%', transform: 'translateX(-50%)',
          width: '6vw', height: '1.5vw', background: '#000', borderRadius: '9999px',
        }}
      />
      <img src={src} className="w-full h-full object-cover" style={{ borderRadius: '2vw' }} alt="App screen" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ borderRadius: '2vw', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.1)' }}
      />
    </motion.div>
  );
}

function Tag({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ delay, duration: 0.4, type: 'spring', stiffness: 200 }}
      className="inline-block px-[1.5vw] py-[0.5vw] rounded-full text-[1.4vw] font-semibold uppercase tracking-widest"
      style={{ background: `${AMBER}22`, color: AMBER, border: `1px solid ${AMBER}55` }}
    >
      {children}
    </motion.span>
  );
}

function SceneIntro({ icon }: { icon: string }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
      <motion.img
        src={icon}
        alt="IronSplit"
        initial={{ scale: 0, opacity: 0, rotate: -20 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        exit={{ scale: 3, opacity: 0 }}
        transition={{ duration: 0.8, type: 'spring', stiffness: 180, damping: 20 }}
        style={{ width: '14vw', height: '14vw', borderRadius: '2.5vw', boxShadow: `0 0 4vw ${AMBER}55` }}
        className="mb-[2vw]"
      />
      <motion.div className="overflow-hidden mb-[0.5vw]">
        <motion.h1
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '-100%', opacity: 0 }}
          transition={{ delay: 0.3, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{ fontFamily: "'Anton', sans-serif", fontSize: '10vw', color: WHITE, letterSpacing: '-0.02em', lineHeight: 1 }}
        >
          IRONSPLIT
        </motion.h1>
      </motion.div>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        style={{ color: AMBER, fontSize: '1.8vw', letterSpacing: '0.3em', textTransform: 'uppercase', fontWeight: 600 }}
      >
        Your Strength. Your Program.
      </motion.p>
    </div>
  );
}

function SceneSplit({ imgHome }: { imgHome: string }) {
  return (
    <div className="absolute inset-0 flex items-center z-10 px-[8vw]">
      <div className="flex-1 pr-[4vw]">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.6 }}
          className="mb-[2vw]"
        >
          <Tag>4-Day Split</Tag>
        </motion.div>
        <motion.div className="overflow-hidden mb-[1.5vw]">
          <motion.h2
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={{ delay: 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            style={{ fontFamily: "'Anton', sans-serif", fontSize: '7vw', color: WHITE, lineHeight: 0.9, letterSpacing: '-0.01em' }}
          >
            PUSH.<br />PULL.<br />QUAD.<br />
            <span style={{ color: AMBER }}>HINGE.</span>
          </motion.h2>
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          style={{ color: '#aaa', fontSize: '1.6vw', lineHeight: 1.6, maxWidth: '28vw' }}
        >
          A structured 4-day program built for lifters who take it seriously.
        </motion.p>
      </div>
      <div style={{ width: '24vw' }}>
        <PhoneMockup src={imgHome} delay={0.1} className="w-full" style={{ height: '42vw' }} />
      </div>
    </div>
  );
}

function SceneLogging({ imgLogging }: { imgLogging: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center z-10 px-[8vw] gap-[4vw]">
      <div style={{ width: '22vw' }}>
        <PhoneMockup src={imgLogging} delay={0} className="w-full" style={{ height: '40vw' }} />
      </div>
      <div className="flex-1">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-[2vw]"
        >
          <Tag>Set Logging</Tag>
        </motion.div>
        <motion.div className="overflow-hidden mb-[1.5vw]">
          <motion.h2
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={{ delay: 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            style={{ fontFamily: "'Anton', sans-serif", fontSize: '6.5vw', color: WHITE, lineHeight: 0.9 }}
          >
            TRACK<br />EVERY<br /><span style={{ color: AMBER }}>REP.</span>
          </motion.h2>
        </motion.div>
        {['Sets & Reps', 'Weight in kg or lbs', 'Exercise tips & cues'].map((item, i) => (
          <motion.div
            key={item}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.5 + i * 0.15, duration: 0.4 }}
            className="flex items-center gap-[1vw] mb-[0.8vw]"
          >
            <div style={{ width: '0.6vw', height: '0.6vw', borderRadius: '50%', background: AMBER, flexShrink: 0 }} />
            <span style={{ color: '#ccc', fontSize: '1.5vw' }}>{item}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function SceneTimer({ imgTimer }: { imgTimer: string }) {
  return (
    <div className="absolute inset-0 flex items-center z-10 px-[8vw]">
      <div className="flex-1 pr-[4vw]">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-[2vw]"
        >
          <Tag>Rest Timer</Tag>
        </motion.div>
        <motion.div className="overflow-hidden mb-[1.5vw]">
          <motion.h2
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={{ delay: 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            style={{ fontFamily: "'Anton', sans-serif", fontSize: '6.5vw', color: WHITE, lineHeight: 0.9 }}
          >
            REST<br />SMART.<br /><span style={{ color: AMBER }}>LIFT MORE.</span>
          </motion.h2>
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          style={{ color: '#aaa', fontSize: '1.6vw', lineHeight: 1.6, maxWidth: '28vw' }}
        >
          Built-in rest timer with audio cues so you stay in the zone.
        </motion.p>
      </div>
      <div style={{ width: '24vw' }}>
        <PhoneMockup src={imgTimer} delay={0.1} className="w-full" style={{ height: '42vw' }} />
      </div>
    </div>
  );
}

function SceneProgram({ imgWeeks }: { imgWeeks: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center z-10 px-[8vw] gap-[4vw]">
      <div style={{ width: '22vw' }}>
        <PhoneMockup src={imgWeeks} delay={0} className="w-full" style={{ height: '40vw' }} />
      </div>
      <div className="flex-1">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-[2vw]"
        >
          <Tag>12-Week Program</Tag>
        </motion.div>
        <motion.div className="overflow-hidden mb-[1.5vw]">
          <motion.h2
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={{ delay: 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            style={{ fontFamily: "'Anton', sans-serif", fontSize: '6.5vw', color: WHITE, lineHeight: 0.9 }}
          >
            12 WEEKS<br />TO YOUR<br /><span style={{ color: AMBER }}>BEST LIFT.</span>
          </motion.h2>
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          style={{ color: '#aaa', fontSize: '1.6vw', lineHeight: 1.6, maxWidth: '28vw' }}
        >
          A complete progressive program. Every week builds on the last.
        </motion.p>
      </div>
    </div>
  );
}

function SceneOutro({ icon }: { icon: string }) {
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center z-20"
      style={{ background: AMBER }}
    >
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.2), transparent 70%)' }}
        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      <div className="flex flex-col items-center relative z-10">
        <motion.div className="overflow-hidden">
          <motion.h2
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{ fontFamily: "'Anton', sans-serif", fontSize: '12vw', color: DARK, lineHeight: 0.85, letterSpacing: '-0.01em', textAlign: 'center' }}
          >
            TRACK. LIFT.
          </motion.h2>
        </motion.div>
        <motion.div className="overflow-hidden mb-[4vw]">
          <motion.h2
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            transition={{ delay: 0.2, duration: 0.6, ease: 'easeOut' }}
            style={{ fontFamily: "'Anton', sans-serif", fontSize: '12vw', color: WHITE, lineHeight: 0.85, letterSpacing: '-0.01em', textAlign: 'center', textShadow: `0 0.5vw 1vw rgba(0,0,0,0.3)` }}
          >
            DOMINATE.
          </motion.h2>
        </motion.div>
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ delay: 0.6, type: 'spring', stiffness: 200, damping: 20 }}
          className="flex items-center gap-[2vw] px-[3vw] py-[1.5vw] rounded-full shadow-2xl"
          style={{ background: DARK }}
        >
          <img src={icon} style={{ width: '4vw', height: '4vw', borderRadius: '0.8vw' }} alt="IronSplit" />
          <span style={{ fontFamily: "'Anton', sans-serif", fontSize: '3.5vw', color: WHITE, letterSpacing: '0.05em' }}>IronSplit</span>
        </motion.div>
      </div>
    </div>
  );
}
