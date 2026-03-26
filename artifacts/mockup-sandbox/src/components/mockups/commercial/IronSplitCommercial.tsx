import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Audio Engine ──────────────────────────────────────────────────────────────
const BPM = 128;
const BEAT = 60 / BPM;
const BAR = BEAT * 4;

function createKick(ctx: AudioContext, t: number) {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.connect(g); g.connect(ctx.destination);
  osc.frequency.setValueAtTime(160, t);
  osc.frequency.exponentialRampToValueAtTime(35, t + 0.18);
  g.gain.setValueAtTime(0.9, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
  osc.start(t); osc.stop(t + 0.4);
}

function createSnare(ctx: AudioContext, t: number) {
  const len = 0.18;
  const buf = ctx.createBuffer(1, ctx.sampleRate * len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const noise = ctx.createBufferSource(); noise.buffer = buf;
  const ng = ctx.createGain();
  ng.gain.setValueAtTime(0.45, t); ng.gain.exponentialRampToValueAtTime(0.001, t + len);
  const flt = ctx.createBiquadFilter(); flt.type = 'bandpass'; flt.frequency.value = 2000; flt.Q.value = 0.8;
  noise.connect(flt); flt.connect(ng); ng.connect(ctx.destination);
  const osc = ctx.createOscillator(); const og = ctx.createGain();
  osc.frequency.value = 200; og.gain.setValueAtTime(0.28, t); og.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
  osc.connect(og); og.connect(ctx.destination);
  noise.start(t); osc.start(t); osc.stop(t + 0.1); noise.stop(t + len);
}

function createHihat(ctx: AudioContext, t: number, open = false) {
  const len = open ? 0.3 : 0.07;
  const buf = ctx.createBuffer(1, ctx.sampleRate * len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const noise = ctx.createBufferSource(); noise.buffer = buf;
  const flt = ctx.createBiquadFilter(); flt.type = 'highpass'; flt.frequency.value = 9000;
  const g = ctx.createGain();
  g.gain.setValueAtTime(open ? 0.25 : 0.18, t); g.gain.exponentialRampToValueAtTime(0.001, t + len);
  noise.connect(flt); flt.connect(g); g.connect(ctx.destination);
  noise.start(t); noise.stop(t + len);
}

function createBass(ctx: AudioContext, t: number, freq = 55) {
  const osc = ctx.createOscillator(); const g = ctx.createGain();
  osc.type = 'sine'; osc.frequency.value = freq;
  g.gain.setValueAtTime(0.55, t); g.gain.exponentialRampToValueAtTime(0.001, t + BEAT * 0.6);
  osc.connect(g); g.connect(ctx.destination);
  osc.start(t); osc.stop(t + BEAT * 0.65);
}

function createSynth(ctx: AudioContext, t: number, freq: number) {
  const osc = ctx.createOscillator(); const g = ctx.createGain();
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 800; lp.Q.value = 2;
  osc.type = 'sawtooth'; osc.frequency.value = freq;
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.1, t + 0.02); g.gain.exponentialRampToValueAtTime(0.001, t + BEAT * 0.45);
  osc.connect(lp); lp.connect(g); g.connect(ctx.destination);
  osc.start(t); osc.stop(t + BEAT * 0.5);
}

const RIFF = [110, 146.8, 164.8, 196, 146.8, 110, 130.8, 164.8];
const RIFF_T = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5].map(b => b * BEAT);

function scheduleBar(ctx: AudioContext, s: number) {
  createKick(ctx, s); createKick(ctx, s + BEAT * 2);
  createSnare(ctx, s + BEAT); createSnare(ctx, s + BEAT * 3);
  for (let i = 0; i < 8; i++) createHihat(ctx, s + i * (BEAT / 2), i % 4 === 2);
  createBass(ctx, s, 55); createBass(ctx, s + BEAT, 55);
  createBass(ctx, s + BEAT * 2, 73.4); createBass(ctx, s + BEAT * 3, 55);
  RIFF.forEach((freq, i) => createSynth(ctx, s + RIFF_T[i], freq));
}

function useAudioEngine() {
  const ctxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mutedRef = useRef(false);
  const nextBarRef = useRef(0);

  const start = useCallback(() => {
    if (ctxRef.current) return;
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    ctxRef.current = ctx;
    nextBarRef.current = ctx.currentTime + 0.05;
    const schedule = () => {
      const lookahead = 0.25;
      while (nextBarRef.current < ctx.currentTime + lookahead) {
        if (!mutedRef.current) scheduleBar(ctx, nextBarRef.current);
        nextBarRef.current += BAR;
      }
    };
    schedule();
    timerRef.current = setInterval(schedule, 100);
  }, []);

  const setMuted = useCallback((m: boolean) => { mutedRef.current = m; }, []);

  useEffect(() => {
    const go = () => { if (!ctxRef.current) start(); };
    document.addEventListener('click', go, { once: true });
    document.addEventListener('keydown', go, { once: true });
    const t = setTimeout(() => start(), 300);
    return () => {
      clearTimeout(t);
      document.removeEventListener('click', go);
      document.removeEventListener('keydown', go);
      if (timerRef.current) clearInterval(timerRef.current);
      ctxRef.current?.close();
      ctxRef.current = null;
    };
  }, [start]);

  return { setMuted };
}
// ──────────────────────────────────────────────────────────────────────────────

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
  const [muted, setMuted] = useState(false);
  const { setMuted: setAudioMuted } = useAudioEngine();

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentScene((prev) => (prev + 1) % SCENE_DURATIONS.length);
    }, SCENE_DURATIONS[currentScene]);
    return () => clearTimeout(timer);
  }, [currentScene]);

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    setAudioMuted(next);
  };

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

      {/* Mute button */}
      <button
        onClick={toggleMute}
        style={{
          position: 'absolute', bottom: '3vw', right: '3vw', zIndex: 50,
          display: 'flex', alignItems: 'center', gap: '0.7vw',
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
          border: `1px solid ${muted ? '#555' : AMBER + '88'}`,
          color: muted ? '#888' : AMBER,
          padding: '0.7vw 1.4vw', borderRadius: '999px',
          fontSize: '1.2vw', fontFamily: "'Anton', sans-serif",
          letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
          transition: 'all 0.2s',
        }}
      >
        {muted ? (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" style={{ width: '1.6vw', height: '1.6vw' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" />
            </svg>
            Muted
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" style={{ width: '1.6vw', height: '1.6vw' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            </svg>
            Sound On
          </>
        )}
      </button>
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
