// Independent audio tracks: cleaned VO, ducked music bed, named one-shot SFX at cue frames.
import React from 'react';
import {Sequence, interpolate, staticFile} from 'remotion';
import {Audio} from '@remotion/media';
import cues from './cues.json';
import mix from './mix.json';

const A = (n: string) => staticFile(`audio_v03/${n}.wav`);

/** Music gain per frame: base, ducked under cues.speech with attack/release ramps, fade-in. */
export const musicGain = (f: number) => {
  const m = mix.music;
  let duck = 0;
  for (const [a, b] of cues.speech as [number, number][]) {
    const att = interpolate(f, [a - m.attackFrames, a], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    const rel = interpolate(f, [b, b + m.releaseFrames], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    duck = Math.max(duck, Math.min(att, rel));
  }
  const fade = interpolate(f, [0, m.fadeInFrames], [0, 1], {extrapolateRight: 'clamp'});
  return fade * (m.base + (m.duck - m.base) * duck);
};

export const AudioMix: React.FC = () => (
  <>
    <Audio src={A('vo_clean')} volume={mix.vo} />
    <Audio src={A('music_bed')} volume={(f) => musicGain(f)} />
    {Object.entries(cues.sfx).map(([name, from]) => (
      <Sequence key={name} from={from} layout="none" name={`sfx_${name}`}>
        <Audio src={A(`sfx_${name}`)} volume={(mix.sfx as Record<string, number>)[name]} />
      </Sequence>
    ))}
  </>
);
