// SB01 v04 audio: independent <Audio> tracks. Every level lives in audioCues.json (group gains + per-cue gain)
// so VO / music / each SFX group can be adjusted without touching code.
import React from 'react';
import {Sequence, interpolate, staticFile} from 'remotion';
import {Audio} from '@remotion/media';
import cues from './cues.json';
import ac from './audioCues.json';

const A = (n: string) => staticFile(`audio_v04/${n}.wav`);
type Band = 'low' | 'mid' | 'air';

/** duck amount 0..1 from the speech windows (attack/release ramps) */
export const duckAt = (f: number) => {
  const m = ac.music;
  let d = 0;
  for (const [a, b] of cues.speech as [number, number][]) {
    const att = interpolate(f, [a - m.attackFrames, a], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    const rel = interpolate(f, [b, b + m.releaseFrames], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    d = Math.max(d, Math.min(att, rel));
  }
  return d;
};

export const bandGain = (band: Band, f: number) => {
  const b = ac.music[band];
  const fade = interpolate(f, [0, ac.music.fadeInFrames], [0, 1], {extrapolateRight: 'clamp'});
  return ac.groups.music * fade * (b.base + (b.duck - b.base) * duckAt(f));
};

export const AudioMix: React.FC = () => (
  <>
    <Audio src={A('vo_clean')} volume={ac.groups.vo} />
    {(['low', 'mid', 'air'] as Band[]).map((b) => (
      <Audio key={b} src={A(`music_${b}`)} volume={(f) => bandGain(b, f)} />
    ))}
    {Object.entries(ac.place).map(([name, [from, gain]]) => {
      const group = (ac.groupOf as Record<string, keyof typeof ac.groups>)[name];
      return (
        <Sequence key={name} from={from} layout="none" name={`${group}:${name}`}>
          <Audio src={A((ac.files as Record<string, string>)[name])} volume={gain * ac.groups[group]} />
        </Sequence>
      );
    })}
  </>
);
