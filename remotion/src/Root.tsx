import React from 'react';
import {Composition} from 'remotion';
import {SB01} from './sb01/SB01';
import {SB01v03} from './sb01v03/SB01v03';
import {SB01v04} from './sb01v04/SB01v04';
import {SB01v05} from './sb01v05/SB01v05';
import {SB01v051} from './sb01v051/SB01v051';
import {FPS, H, SB01_FRAMES, W} from './lib/tokens';

export const RemotionRoot: React.FC = () => (
  <>
    {/* SB01 = ref larg8ak17f8d 0–10 s rebuilt on master IMG_6757 0–10 s.
        Version lives in the render filename; changes per version in qa/QA_REPORT.md. Current: v02. */}
    <Composition id="SB01" component={SB01} durationInFrames={SB01_FRAMES} fps={FPS} width={W} height={H} />
    {/* v03 hard rebuild (separate code in src/sb01v03; v01/v02 untouched) */}
    <Composition id="SB01-v03" component={SB01v03} durationInFrames={SB01_FRAMES} fps={FPS} width={W} height={H} />
    {/* v04.1 frame-accurate motion rebuild + WorkshopLearningDashboard (src/sb01v04; v03 untouched) */}
    <Composition id="SB01-v04" component={SB01v04} durationInFrames={SB01_FRAMES} fps={FPS} width={W} height={H} />
    {/* v05: user review fixes — UANG? tracking, opening stack spacing, redesigned (tidy) workshop dashboard */}
    <Composition id="SB01-v05" component={SB01v05} durationInFrames={SB01_FRAMES} fps={FPS} width={W} height={H} />
    {/* v05.1: WorkshopDashboardFragment (compact 2.5D), lighter GSM-style type treatment, cream → white */}
    <Composition id="SB01-v051" component={SB01v051} durationInFrames={SB01_FRAMES} fps={FPS} width={W} height={H} />
  </>
);
