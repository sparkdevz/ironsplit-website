import { useEffect, useRef, useCallback } from 'react';

const BPM = 128;
const BEAT = 60 / BPM;
const BAR = BEAT * 4;

function createKick(ctx, time, volume = 0.9) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.frequency.setValueAtTime(160, time);
  osc.frequency.exponentialRampToValueAtTime(35, time + 0.18);

  gain.gain.setValueAtTime(volume, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.35);

  osc.start(time);
  osc.stop(time + 0.4);
}

function createSnare(ctx, time, volume = 0.45) {
  const noiseLen = 0.18;
  const buffer = ctx.createBuffer(1, ctx.sampleRate * noiseLen, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(volume, time);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, time + noiseLen);

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 2000;
  filter.Q.value = 0.8;

  noise.connect(filter);
  filter.connect(noiseGain);
  noiseGain.connect(ctx.destination);

  const osc = ctx.createOscillator();
  const oscGain = ctx.createGain();
  osc.frequency.value = 200;
  oscGain.gain.setValueAtTime(volume * 0.6, time);
  oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);
  osc.connect(oscGain);
  oscGain.connect(ctx.destination);

  noise.start(time);
  osc.start(time);
  osc.stop(time + 0.1);
  noise.stop(time + noiseLen);
}

function createHihat(ctx, time, volume = 0.2, open = false) {
  const noiseLen = open ? 0.3 : 0.07;
  const buffer = ctx.createBuffer(1, ctx.sampleRate * noiseLen, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 9000;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(volume, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + noiseLen);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  noise.start(time);
  noise.stop(time + noiseLen);
}

function createBass(ctx, time, freq = 60, volume = 0.55, dur = BEAT * 0.6) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, time);
  gain.gain.setValueAtTime(volume, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(time);
  osc.stop(time + dur + 0.01);
}

function createSynth(ctx, time, freq, volume = 0.12, dur = BEAT * 0.45) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.value = freq;

  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 800;
  lp.Q.value = 2;

  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(volume, time + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

  osc.connect(lp);
  lp.connect(gain);
  gain.connect(ctx.destination);
  osc.start(time);
  osc.stop(time + dur + 0.05);
}

// Riff melody notes (A minor pentatonic): A2=110, C3=130.8, D3=146.8, E3=164.8, G3=196
const RIFF = [110, 146.8, 164.8, 196, 146.8, 110, 130.8, 164.8];
const RIFF_TIMING = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5].map(b => b * BEAT);

function scheduleBar(ctx, barStart) {
  // Kick: beats 1 & 3
  createKick(ctx, barStart);
  createKick(ctx, barStart + BEAT * 2);

  // Snare: beats 2 & 4
  createSnare(ctx, barStart + BEAT);
  createSnare(ctx, barStart + BEAT * 3);

  // Hi-hats: 8th notes, open on offbeats occasionally
  for (let i = 0; i < 8; i++) {
    const isOpen = i % 4 === 2;
    createHihat(ctx, barStart + i * (BEAT / 2), isOpen ? 0.25 : 0.18, isOpen);
  }

  // Bass on each beat
  createBass(ctx, barStart, 55);
  createBass(ctx, barStart + BEAT, 55);
  createBass(ctx, barStart + BEAT * 2, 73.4);
  createBass(ctx, barStart + BEAT * 3, 55);

  // Synth riff over 2 bars
  RIFF.forEach((freq, i) => {
    createSynth(ctx, barStart + RIFF_TIMING[i], freq, 0.1);
  });
}

export function useAudioEngine() {
  const ctxRef = useRef(null);
  const schedulerRef = useRef(null);
  const barRef = useRef(0);
  const mutedRef = useRef(false);
  const masterGainRef = useRef(null);

  const stop = useCallback(() => {
    if (schedulerRef.current) clearInterval(schedulerRef.current);
    if (ctxRef.current) {
      ctxRef.current.close();
      ctxRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    if (ctxRef.current) return;

    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    ctxRef.current = ctx;

    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.85;
    masterGain.connect(ctx.destination);
    masterGainRef.current = masterGain;

    let nextBarTime = ctx.currentTime + 0.05;

    const schedule = () => {
      const lookahead = 0.25;
      while (nextBarTime < ctx.currentTime + lookahead) {
        if (!mutedRef.current) {
          scheduleBar(ctx, nextBarTime);
        }
        nextBarTime += BAR;
        barRef.current += 1;
      }
    };

    schedule();
    schedulerRef.current = setInterval(schedule, 100);
  }, []);

  const setMuted = useCallback((muted) => {
    mutedRef.current = muted;
    if (masterGainRef.current) {
      const ctx = ctxRef.current;
      if (!ctx) return;
      masterGainRef.current.gain.cancelScheduledValues(ctx.currentTime);
      masterGainRef.current.gain.linearRampToValueAtTime(muted ? 0 : 0.85, ctx.currentTime + 0.15);
    }
  }, []);

  useEffect(() => {
    const handler = () => {
      if (!ctxRef.current) start();
    };
    document.addEventListener('click', handler, { once: true });
    document.addEventListener('keydown', handler, { once: true });
    const timer = setTimeout(() => start(), 300);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handler);
      document.removeEventListener('keydown', handler);
      stop();
    };
  }, [start, stop]);

  return { setMuted };
}
