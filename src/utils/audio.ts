// Web Audio synthesizer and PCM 24kHz player for Gemini TTS

let audioCtx: AudioContext | null = null;
let currentSource: AudioBufferSourceNode | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Convert base64 PCM 24kHz 16-bit mono into AudioBuffer
export async function playPcmAudio(
  base64Data: string,
  sampleRate = 24000,
  onEnd?: () => void
): Promise<{ stop: () => void }> {
  const ctx = getAudioContext();

  // Stop any currently playing TTS
  if (currentSource) {
    try {
      currentSource.stop();
    } catch {}
    currentSource = null;
  }

  const binaryString = window.atob(base64Data);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // 16-bit PCM little endian
  const int16Array = new Int16Array(bytes.buffer);
  const numChannels = 1;
  const audioBuffer = ctx.createBuffer(numChannels, int16Array.length, sampleRate);
  const channelData = audioBuffer.getChannelData(0);

  for (let i = 0; i < int16Array.length; i++) {
    channelData[i] = int16Array[i] / 32768.0;
  }

  const source = ctx.createBufferSource();
  source.buffer = audioBuffer;

  // Gentle lowpass filter for smooth, warm vocal warmth
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowshelf';
  filter.frequency.value = 300;
  filter.gain.value = 2;

  source.connect(filter);
  filter.connect(ctx.destination);

  currentSource = source;

  source.onended = () => {
    if (currentSource === source) {
      currentSource = null;
    }
    if (onEnd) onEnd();
  };

  source.start(0);

  return {
    stop: () => {
      try {
        source.stop();
      } catch {}
      if (currentSource === source) {
        currentSource = null;
      }
    },
  };
}

export function stopCurrentAudio() {
  if (currentSource) {
    try {
      currentSource.stop();
    } catch {}
    currentSource = null;
  }
}

// Synthesized Sound FX (No external asset lag)
export function playSoundEffect(type: 'draw' | 'flip' | 'accept' | 'celebrate' | 'tap' | 'spark') {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    if (type === 'draw') {
      // Pleasant whoosh swoop
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(580, now + 0.18);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.23);
    } else if (type === 'flip') {
      // Crisp card turn click
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.11);
    } else if (type === 'accept') {
      // Warm chord chime (Major triad C5 - E5 - G5)
      [523.25, 659.25, 783.99].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.04);
        gain.gain.setValueAtTime(0.1, now + i * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6 + i * 0.04);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.04);
        osc.stop(now + 0.7 + i * 0.04);
      });
    } else if (type === 'celebrate') {
      // Sparkling victory fanfare
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        const start = now + idx * 0.08;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.12, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.55);
      });
    } else if (type === 'spark') {
      // Magic sparkle ping
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1760, now + 0.15);
      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.26);
    } else {
      // Subtle tap tick
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    }
  } catch {
    // Audio contexts might be blocked until first user interaction
  }
}
