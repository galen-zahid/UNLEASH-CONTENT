import React from 'react';
import {Composition} from 'remotion';
import {SB01} from './sb01/SB01';
import {SB01v03} from './sb01v03/SB01v03';
import {FPS, H, SB01_FRAMES, W} from './lib/tokens';

export const RemotionRoot: React.FC = () => (
  <>
    {/* SB01 = ref larg8ak17f8d 0–10 s rebuilt on master IMG_6757 0–10 s.
        Version lives in the render filename; changes per version in qa/QA_REPORT.md. Current: v02. */}
    <Composition id="SB01" component={SB01} durationInFrames={SB01_FRAMES} fps={FPS} width={W} height={H} />
    {/* v03 hard rebuild (separate code in src/sb01v03; v01/v02 untouched) */}
    <Composition id="SB01-v03" component={SB01v03} durationInFrames={SB01_FRAMES} fps={FPS} width={W} height={H} />
  </>
);
