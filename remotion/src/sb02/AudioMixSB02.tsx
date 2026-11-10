// SB02 mix: VOICE (cleaned, "personal branding" muted → VO_REPLACEMENT_PENDING), MUSIC (v06b bands continued from
// global 10.0 s via trimBefore — no restart, no fade-in), TEXT / CARD / UI / TRANSITION SFX groups.
import React from 'react';
import {Sequence, interpolate, staticFile} from 'remotion';
import {Audio} from '@remotion/media';
import sd from './sound_sb02.json';

const V6 = (n: string) => staticFile(`audio_v06/${n}.wav`);
const S2 = (n: string) => staticFile(`audio_sb02/${n}.wav`);
export const GROUP_GAIN: Record<string, number> = {vo: 1, music: 1, text: 1, card: 1, ui: 1, transition: 1};
// speech windows (local frames, measured word onsets/offsets; f271–299 muted so the music opens up there)
export const SPEECH: [number, number][] = [[-3, 26], [88, 188], [200, 270]];
const K = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const speechAt = (f: number) => Math.max(0, ...SPEECH.map(([a, b]) => Math.min(interpolate(f, [a - 3, a], [0, 1], K), interpolate(f, [b, b + 8], [1, 0], K))));
type Band = keyof typeof sd.music.gain;
export const bandGain = (b: Band, f: number) => GROUP_GAIN.music * sd.music.gain[b] * (1 - (1 - sd.music.duck[b]) * speechAt(f));

export const AudioMixSB02: React.FC = () => (
  <>
    <Audio src={S2('vo_clean_sb02')} volume={GROUP_GAIN.vo} />
    {(sd.music.bands as Band[]).map((b) => (
      <Audio key={b} src={V6(b)} trimBefore={300} volume={(f) => bandGain(b, f)} />
    ))}
    {/* SB01 bomb-in impact (v06 sfx placed at global 9.60 s) rings on across the boundary: play its tail */}
    <Audio src={V6('sfx_bomb_impact')} trimBefore={12} volume={0.231 * GROUP_GAIN.transition} />
    {(sd.place as [string, string, number, number][]).map(([group, name, t, gain], i) => (
      <Sequence key={i} from={Math.round(t * 30)} layout="none">
        <Audio src={S2(`sfx_${name}`)} volume={gain * (GROUP_GAIN[group] ?? 1)} />
      </Sequence>
    ))}
  </>
);
