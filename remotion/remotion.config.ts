import {Config} from '@remotion/cli/config';

// Container: Playwright's preinstalled headless shell. On another machine,
// remove this line and Remotion will use its own downloaded browser.
if (process.env.REMOTION_BROWSER) {
  Config.setBrowserExecutable(process.env.REMOTION_BROWSER);
}
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(92);
