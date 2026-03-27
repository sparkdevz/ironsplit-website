import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function useTransitionSound() {
  const ctxRef = useRef(null);

  const initCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
  }, []);

  const play = useCallback(() => {
    try { initCtx(); } catch (_) {}
    const ctx = ctxRef.current;
    if (!ctx) return;
    const t = ctx.currentTime;

    const thud = ctx.createOscillator();
    const thudG = ctx.createGain();
    thud.frequency.setValueAtTime(110, t);
    thud.frequency.exponentialRampToValueAtTime(22, t + 0.22);
    thudG.gain.setValueAtTime(0.85, t);
    thudG.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
    thud.connect(thudG); thudG.connect(ctx.destination);
    thud.start(t); thud.stop(t + 0.3);

    const ring = ctx.createOscillator();
    const ringG = ctx.createGain();
    ring.type = 'sine'; ring.frequency.value = 1400;
    ringG.gain.setValueAtTime(0.12, t);
    ringG.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
    ring.connect(ringG); ringG.connect(ctx.destination);
    ring.start(t); ring.stop(t + 0.3);

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

// Importing assets
import imgHome from '../../store-assets/screenshots/ios-01-home.png';
import imgLogging from '../../store-assets/screenshots/ios-02-logging.png';
import imgTimer from '../../store-assets/screenshots/ios-03-timer.png';
import imgWeeks from '../../store-assets/screenshots/ios-04-weeks.png';
import iconApp from '../../assets/icon.png';

const SCENE_DURATIONS = [
  4000, // 0: Intro (IronSplit Logo pulse)
  5000, // 1: 4-Day Split concept
  5000, // 2: Logging
  5000, // 3: Rest Timer
  5000, // 4: 12-Week Program
  6000, // 5: Outro (TRACK. LIFT. DOMINATE.)
];
const TOTAL_DURATION = SCENE_DURATIONS.reduce((a, b) => a + b, 0);

export default function App() {
  const [currentScene, setCurrentScene] = useState(0);
  const { play } = useTransitionSound();
  const isFirst = useRef(true);

  const [recording, setRecording] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const countdownRef = useRef(null);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
    } else {
      play();
    }
    let timer = setTimeout(() => {
      setCurrentScene((prev) => (prev + 1) % SCENE_DURATIONS.length);
    }, SCENE_DURATIONS[currentScene]);
    return () => clearTimeout(timer);
  }, [currentScene]);

  const startRecording = async () => {
    try {
      setShowHint(true);
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 30, width: 1920, height: 1080 },
        audio: false,
        preferCurrentTab: true,
      });
      setShowHint(false);

      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9' : 'video/webm';
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream, { mimeType });
      recorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'ironsplit-commercial.webm'; a.click();
        URL.revokeObjectURL(url);
        setRecording(false); setCountdown(0);
        if (countdownRef.current) clearInterval(countdownRef.current);
      };

      isFirst.current = true;
      setCurrentScene(0);
      recorder.start(500);
      setRecording(true);
      const secs = Math.ceil(TOTAL_DURATION / 1000);
      setCountdown(secs);
      countdownRef.current = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) { clearInterval(countdownRef.current); return 0; }
          return c - 1;
        });
      }, 1000);
      setTimeout(() => {
        if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
      }, TOTAL_DURATION + 500);
    } catch (err) {
      setShowHint(false); setRecording(false);
    }
  };

  const stopRecording = () => {
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-brand-dark flex items-center justify-center font-body">
      {/* Background Video Layer */}
      <div className="absolute inset-0 z-0">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="w-full h-full object-cover opacity-30 mix-blend-luminosity"
        >
          <source src="/bg-gym.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/80 to-transparent" />
      </div>

      {/* Persistent Animated Gradient */}
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(245,158,11,0.15),transparent_70%)] z-0"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
          x: currentScene % 2 === 0 ? '5vw' : '-5vw',
        }}
        transition={{ duration: 8, ease: "easeInOut", repeat: Infinity }}
      />
      <div className="absolute inset-0 opacity-[0.05] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay z-0" />

      {/* Global Accent Line */}
      <motion.div 
        className="absolute top-0 left-0 h-[0.5vw] bg-brand-amber z-50"
        animate={{ 
          width: `${((currentScene + 1) / SCENE_DURATIONS.length) * 100}%` 
        }}
        transition={{ duration: 0.8, ease: "circOut" }}
      />

      <AnimatePresence mode="wait">
        {currentScene === 0 && <SceneIntro key="scene-0" />}
        {currentScene === 1 && <SceneSplit key="scene-1" />}
        {currentScene === 2 && <SceneLogging key="scene-2" />}
        {currentScene === 3 && <SceneTimer key="scene-3" />}
        {currentScene === 4 && <SceneProgram key="scene-4" />}
        {currentScene === 5 && <SceneOutro key="scene-5" />}
      </AnimatePresence>

      {/* Share-tab hint overlay */}
      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] flex flex-col items-center justify-center gap-[2vw]"
            style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)' }}
          >
            <div className="text-[5vw]">🎬</div>
            <p className="font-display text-[2.2vw] text-center max-w-[50vw] leading-relaxed text-white">
              In the dialog, choose <span className="text-brand-amber">"This Tab"</span> then click <span className="text-brand-amber">Share</span>
            </p>
            <p className="text-zinc-500 text-[1.2vw]">The commercial will restart and record automatically for 30 seconds</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recording indicator */}
      {recording && (
        <div className="absolute top-[2vw] left-1/2 -translate-x-1/2 z-[60] flex items-center gap-[1vw] px-[1.6vw] py-[0.6vw] rounded-full"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', border: '1px solid #ef4444' }}>
          <span className="w-[0.8vw] h-[0.8vw] rounded-full bg-red-500 inline-block animate-pulse" />
          <span className="font-display text-[1.3vw] tracking-widest text-white">REC {countdown}s</span>
          <button onClick={stopRecording}
            className="ml-[0.5vw] bg-red-500 text-white font-display text-[1vw] tracking-wider px-[0.9vw] py-[0.3vw] rounded-full cursor-pointer border-none">
            STOP
          </button>
        </div>
      )}

      {/* Download button */}
      {!recording && !showHint && (
        <button onClick={startRecording}
          className="absolute bottom-[3vw] left-[3vw] z-50 flex items-center gap-[0.7vw] font-display text-[1.2vw] tracking-widest uppercase cursor-pointer transition-all"
          style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', border: '1px solid rgba(245,158,11,0.5)', color: '#f59e0b', padding: '0.7vw 1.5vw', borderRadius: '999px' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" style={{ width: '1.5vw', height: '1.5vw' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Download Video
        </button>
      )}
    </div>
  );
}

const PhoneMockup = ({ src, delay = 0, className = "" }) => (
  <motion.div
    initial={{ y: "15vw", opacity: 0, rotateX: 25, rotateY: -10 }}
    animate={{ y: 0, opacity: 1, rotateX: 0, rotateY: 0 }}
    exit={{ y: "-15vw", opacity: 0, rotateX: -25, rotateY: 10, scale: 0.8 }}
    transition={{ delay, duration: 1.2, type: "spring", stiffness: 100, damping: 20 }}
    className={`relative rounded-[2.5vw] border-[0.4vw] border-zinc-800 bg-black overflow-hidden shadow-[0_0_4vw_rgba(245,158,11,0.15)] ${className}`}
    style={{ transformStyle: 'preserve-3d' }}
  >
    <div className="absolute top-[2vw] left-1/2 -translate-x-1/2 w-[6vw] h-[1.5vw] bg-black rounded-full z-20" /> {/* Dynamic Island mockup */}
    <img src={src} className="w-full h-full object-cover rounded-[2vw]" alt="App screen" />
    <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-[2vw] pointer-events-none" />
  </motion.div>
);

function SceneIntro() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
      <motion.img
        src={iconApp}
        alt="IronSplit Logo"
        initial={{ scale: 0, opacity: 0, rotate: -20, filter: "blur(20px)" }}
        animate={{ scale: 1, opacity: 1, rotate: 0, filter: "blur(0px)" }}
        exit={{ scale: 3, opacity: 0, filter: "blur(30px)" }}
        transition={{ type: "spring", stiffness: 150, damping: 20 }}
        className="w-[18vw] h-[18vw] rounded-[4vw] shadow-[0_0_8vw_rgba(245,158,11,0.4)] mb-[4vw]"
      />
      <motion.h1
        initial={{ y: "4vw", opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: "-4vw", opacity: 0, scale: 1.1 }}
        transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
        className="font-display text-[10vw] text-brand-white uppercase tracking-tight leading-none"
      >
        Iron<span className="text-brand-amber">Split</span>
      </motion.h1>
      <motion.div
        initial={{ opacity: 0, width: 0 }}
        animate={{ opacity: 1, width: "15vw" }}
        exit={{ opacity: 0, width: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="h-[0.4vw] bg-brand-amber mt-[2vw]"
      />
    </div>
  );
}

function SceneSplit() {
  return (
    <div className="absolute inset-0 flex items-center px-[12vw] z-10">
      <div className="flex-1 max-w-[45vw]">
        <motion.div 
          initial={{ x: "-5vw", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "5vw", opacity: 0 }}
          className="overflow-hidden"
        >
          <motion.h2
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-[7.5vw] leading-[0.9] text-white uppercase tracking-tight"
          >
            THE ULTIMATE
          </motion.h2>
        </motion.div>
        
        <motion.div 
          initial={{ x: "-5vw", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "5vw", opacity: 0 }}
          className="overflow-hidden mb-[3vw]"
        >
          <motion.h2
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-[7.5vw] leading-[0.9] text-brand-amber uppercase tracking-tight"
          >
            4-DAY SPLIT
          </motion.h2>
        </motion.div>

        <div className="flex flex-col gap-[1vw]">
          {['PUSH', 'PULL', 'QUAD', 'HINGE'].map((day, i) => (
            <motion.div
              key={day}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: 0.6 + (i * 0.1) }}
              className="flex items-center gap-[1vw]"
            >
              <div className="w-[1vw] h-[1vw] bg-brand-amber rounded-full" />
              <span className="font-display text-[2.5vw] text-zinc-300 tracking-wider">{day}</span>
            </motion.div>
          ))}
        </div>
      </div>
      
      <div className="flex-1 flex justify-end items-center relative h-full">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 1.2, opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute right-0 w-[40vw] h-[40vw] bg-brand-amber/5 rounded-full blur-[8vw]"
        />
        <PhoneMockup src={imgHome} delay={0.4} className="w-[24vw] h-[52vw] rotate-[-8deg] z-10" />
        <PhoneMockup src={imgWeeks} delay={0.6} className="absolute right-[15vw] top-[15vw] w-[20vw] h-[43vw] rotate-[5deg] opacity-60 blur-sm z-0" />
      </div>
    </div>
  );
}

function SceneLogging() {
  return (
    <div className="absolute inset-0 flex flex-row-reverse items-center px-[12vw] z-10">
      <div className="flex-1 text-right max-w-[45vw]">
        <motion.div 
          initial={{ x: "5vw", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "-5vw", opacity: 0 }}
          className="overflow-hidden"
        >
          <motion.h2
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-[7.5vw] leading-[0.9] text-white uppercase tracking-tight"
          >
            LOG WITH
          </motion.h2>
        </motion.div>

        <motion.div 
          initial={{ x: "5vw", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "-5vw", opacity: 0 }}
          className="overflow-hidden mb-[3vw]"
        >
          <motion.h2
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-[7.5vw] leading-[0.9] text-brand-amber uppercase tracking-tight"
          >
            PRECISION
          </motion.h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: "2vw" }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: "-2vw" }}
          transition={{ delay: 0.6 }}
          className="inline-flex gap-[2vw] border border-zinc-800 bg-black/50 backdrop-blur-md px-[2vw] py-[1vw] rounded-full"
        >
          <span className="font-display text-[2vw] text-zinc-300">SETS</span>
          <span className="text-brand-amber font-bold">•</span>
          <span className="font-display text-[2vw] text-zinc-300">REPS</span>
          <span className="text-brand-amber font-bold">•</span>
          <span className="font-display text-[2vw] text-zinc-300">WEIGHT</span>
        </motion.div>
      </div>

      <div className="flex-1 flex justify-start items-center relative h-full">
        <PhoneMockup src={imgLogging} delay={0.4} className="w-[24vw] h-[52vw] rotate-[6deg] z-10" />
        
        {/* Floating UI Elements matching the screenshot aesthetic */}
        <motion.div
          initial={{ scale: 0, opacity: 0, x: "-10vw" }}
          animate={{ scale: 1, opacity: 1, x: 0 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ delay: 1, type: "spring" }}
          className="absolute left-[20vw] top-[30vw] z-20 bg-zinc-900 border border-brand-amber/30 p-[1.5vw] rounded-[1vw] shadow-xl"
        >
          <div className="font-display text-[3vw] text-brand-amber leading-none mb-[0.5vw]">100 KG</div>
          <div className="font-body text-[1vw] text-zinc-400 font-bold tracking-widest">NEW PR</div>
        </motion.div>
      </div>
    </div>
  );
}

function SceneTimer() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
      {/* Expanding rings for timer effect */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute w-[30vw] h-[30vw] rounded-full border border-brand-amber/40"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ 
            scale: [1, 3], 
            opacity: [0.8, 0] 
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity, 
            delay: i * 1,
            ease: "easeOut"
          }}
        />
      ))}

      <motion.div
        initial={{ y: "10vw", opacity: 0 }}
        animate={{ y: "-5vw", opacity: 1 }}
        exit={{ y: "-20vw", opacity: 0, scale: 0.8 }}
        transition={{ duration: 1, type: "spring", bounce: 0.2 }}
        className="z-20 relative"
      >
        <PhoneMockup src={imgTimer} className="w-[20vw] h-[43vw]" />
        
        <motion.div 
          className="absolute -right-[8vw] top-[15vw] bg-brand-amber text-black font-display text-[4vw] px-[1.5vw] py-[0.5vw] rounded-lg -rotate-6 shadow-xl"
          initial={{ scale: 0, rotate: 0 }}
          animate={{ scale: 1, rotate: -6 }}
          transition={{ delay: 0.8, type: "spring" }}
        >
          02:00
        </motion.div>
      </motion.div>

      <div className="absolute bottom-[10vw] text-center z-20 w-full overflow-hidden">
        <motion.h2
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
          className="font-display text-[8vw] text-white tracking-widest uppercase"
        >
          REST. <span className="text-brand-amber">RECOVER.</span>
        </motion.h2>
      </div>
    </div>
  );
}

function SceneProgram() {
  return (
    <div className="absolute inset-0 flex items-center px-[12vw] z-10">
      <div className="flex-1 max-w-[45vw]">
        <motion.div 
          initial={{ x: "-5vw", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "5vw", opacity: 0 }}
          className="overflow-hidden mb-[1vw]"
        >
          <motion.h2
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="font-display text-[7.5vw] leading-[0.9] text-white uppercase tracking-tight"
          >
            TRACK
          </motion.h2>
        </motion.div>
        
        <motion.div 
          initial={{ x: "-5vw", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "5vw", opacity: 0 }}
          className="overflow-hidden mb-[3vw]"
        >
          <motion.h2
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="font-display text-[7.5vw] leading-[0.9] text-brand-amber uppercase tracking-tight"
          >
            12 WEEKS
          </motion.h2>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ delay: 0.5 }}
          className="font-body text-[2vw] text-zinc-400 font-medium"
        >
          Visualize your progress.<br/>
          Stick to the plan.
        </motion.p>
      </div>
      
      <div className="flex-1 flex justify-center items-center relative h-full">
        {/* Animated grid background */}
        <motion.div 
          className="absolute inset-0 z-0 opacity-20"
          style={{
            backgroundImage: `linear-gradient(rgba(245,158,11,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,0.5) 1px, transparent 1px)`,
            backgroundSize: '4vw 4vw'
          }}
          initial={{ y: "10vw", opacity: 0 }}
          animate={{ y: 0, opacity: 0.2 }}
          transition={{ duration: 1 }}
        />
        <PhoneMockup src={imgWeeks} delay={0.4} className="w-[24vw] h-[52vw] z-10" />
      </div>
    </div>
  );
}

function SceneOutro() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-brand-amber z-20">
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent_70%)]"
        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      
      <motion.div className="flex flex-col items-center relative z-10">
        <motion.div className="overflow-hidden">
          <motion.h2
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="font-display text-[12vw] text-brand-dark leading-[0.85] text-center uppercase tracking-tighter"
          >
            TRACK. LIFT.
          </motion.h2>
        </motion.div>
        
        <motion.div className="overflow-hidden mb-[4vw]">
          <motion.h2
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
            className="font-display text-[12vw] text-white leading-[0.85] text-center uppercase tracking-tighter"
            style={{ textShadow: '0 0.5vw 1vw rgba(0,0,0,0.3)' }}
          >
            DOMINATE.
          </motion.h2>
        </motion.div>

        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ delay: 0.6, type: "spring", stiffness: 200, damping: 20 }}
          className="flex items-center gap-[2vw] bg-brand-dark px-[3vw] py-[1.5vw] rounded-full shadow-2xl"
        >
          <img src={iconApp} className="w-[4vw] h-[4vw] rounded-[0.8vw]" alt="IronSplit" />
          <span className="font-display text-[3.5vw] text-white tracking-wide uppercase">IronSplit</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
