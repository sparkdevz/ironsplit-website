import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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

const TOTAL_DURATION = SCENE_DURATIONS.reduce((a, b) => a + b, 0); // 30 000 ms

export function IronSplitCommercial() {
  const [currentScene, setCurrentScene] = useState(0);

  // Recording state
  const [recording, setRecording] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentScene((prev) => (prev + 1) % SCENE_DURATIONS.length);
    }, SCENE_DURATIONS[currentScene]);
    return () => clearTimeout(timer);
  }, [currentScene]);

  const startRecording = async () => {
    try {
      setShowHint(true);
      const stream = await (navigator.mediaDevices as any).getDisplayMedia({
        video: { frameRate: 30, width: 1920, height: 1080 },
        audio: false,
        preferCurrentTab: true,
      } as any);
      setShowHint(false);

      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm';

      chunksRef.current = [];
      const recorder = new MediaRecorder(stream, { mimeType });
      recorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((t: MediaStreamTrack) => t.stop());
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ironsplit-commercial.webm';
        a.click();
        URL.revokeObjectURL(url);
        setRecording(false);
        setCountdown(0);
        if (countdownRef.current) clearInterval(countdownRef.current);
      };

      // Restart commercial from scene 0
      isFirst.current = true;
      setCurrentScene(0);

      recorder.start(500);
      setRecording(true);
      const secs = Math.ceil(TOTAL_DURATION / 1000);
      setCountdown(secs);

      countdownRef.current = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            if (countdownRef.current) clearInterval(countdownRef.current);
            return 0;
          }
          return c - 1;
        });
      }, 1000);

      setTimeout(() => {
        if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
      }, TOTAL_DURATION + 500);

    } catch (err) {
      setShowHint(false);
      setRecording(false);
      console.error('Recording cancelled or failed:', err);
    }
  };

  const stopRecording = () => {
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
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

      {/* Share-tab hint overlay */}
      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              position: 'absolute', inset: 0, zIndex: 100,
              background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(6px)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2vw',
            }}
          >
            <div style={{ fontSize: '5vw' }}>🎬</div>
            <p style={{ color: WHITE, fontFamily: "'Anton', sans-serif", fontSize: '2.5vw', textAlign: 'center', maxWidth: '50vw', lineHeight: 1.4 }}>
              In the dialog, choose <span style={{ color: AMBER }}>"This Tab"</span> then click <span style={{ color: AMBER }}>Share</span>
            </p>
            <p style={{ color: '#888', fontSize: '1.3vw' }}>
              The commercial will restart and record automatically for 30 seconds
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recording indicator + stop button */}
      {recording && (
        <div style={{
          position: 'absolute', top: '2vw', left: '50%', transform: 'translateX(-50%)',
          zIndex: 60, display: 'flex', alignItems: 'center', gap: '1vw',
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
          border: '1px solid #ef4444', borderRadius: '999px',
          padding: '0.6vw 1.6vw',
        }}>
          <span style={{ width: '0.8vw', height: '0.8vw', borderRadius: '50%', background: '#ef4444', display: 'inline-block', animation: 'pulse 1s infinite' }} />
          <span style={{ color: WHITE, fontFamily: "'Anton', sans-serif", fontSize: '1.3vw', letterSpacing: '0.1em' }}>
            REC {countdown}s
          </span>
          <button
            onClick={stopRecording}
            style={{
              marginLeft: '0.5vw', background: '#ef4444', border: 'none', color: WHITE,
              fontFamily: "'Anton', sans-serif", fontSize: '1vw', letterSpacing: '0.08em',
              padding: '0.3vw 0.9vw', borderRadius: '999px', cursor: 'pointer',
            }}
          >
            STOP
          </button>
        </div>
      )}

      {/* Download button */}
      {!recording && !showHint && (
        <button
          onClick={startRecording}
          style={{
            position: 'absolute', bottom: '3vw', left: '3vw', zIndex: 50,
            display: 'flex', alignItems: 'center', gap: '0.7vw',
            background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)',
            border: `1px solid ${AMBER}88`, color: AMBER,
            padding: '0.7vw 1.5vw', borderRadius: '999px',
            fontSize: '1.2vw', fontFamily: "'Anton', sans-serif",
            letterSpacing: '0.1em', cursor: 'pointer', transition: 'all 0.2s',
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" style={{ width: '1.5vw', height: '1.5vw' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          DOWNLOAD VIDEO
        </button>
      )}

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.2} }`}</style>
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

        <motion.a
          href="https://play.google.com/store/apps/details?id=com.ironsplit.app"
          target="_blank"
          rel="noopener noreferrer"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ delay: 1.0, duration: 0.5, ease: 'easeOut' }}
          style={{
            marginTop: '2vw',
            display: 'flex', alignItems: 'center', gap: '1.2vw',
            background: DARK, border: '0.15vw solid rgba(255,255,255,0.15)',
            padding: '1vw 2.2vw', borderRadius: '1.2vw',
            textDecoration: 'none', boxShadow: '0 0.5vw 2vw rgba(0,0,0,0.4)',
          }}
        >
          <svg style={{ width: '3vw', height: '3vw' }} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3.18 23.76c.34.18.74.18 1.1-.02l11.16-6.44-2.52-2.52-9.74 9z" fill="#EA4335"/>
            <path d="M21.54 10.27c-.36-.2-.83-.2-1.2 0l-2.9 1.67-2.76-2.76 2.76-2.76 2.9 1.67c.37.2.83.2 1.2 0 .37-.2.46-.56.46-.94s-.09-.74-.46-.94L5.3.27C4.94.08 4.52.08 4.18.27c-.34.19-.46.54-.46.92v21.62c0 .38.12.73.46.92.17.1.35.14.54.14.19 0 .38-.05.56-.15l14.74-8.51c.37-.2.46-.56.46-.94s-.09-.74-.46-.94z" fill="#FBBC04"/>
            <path d="M4.18.27C3.84.08 3.44.08 3.1.27c-.34.19-.46.54-.46.92v11.07l9.9-9.9L4.18.27z" fill="#4285F4"/>
            <path d="M12.54 12.26L3.1 23.68c.17.08.36.1.54.1.19 0 .38-.05.56-.15l9.9-5.72-1.56-1.65z" fill="#34A853"/>
          </svg>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
            <span style={{ fontSize: '1vw', color: 'rgba(255,255,255,0.7)', fontFamily: 'sans-serif', letterSpacing: '0.05em' }}>GET IT ON</span>
            <span style={{ fontSize: '2.2vw', color: WHITE, fontFamily: "'Anton', sans-serif", letterSpacing: '0.03em' }}>Google Play</span>
          </div>
        </motion.a>
      </div>
    </div>
  );
}
