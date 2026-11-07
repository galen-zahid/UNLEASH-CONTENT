import {continueRender, delayRender, staticFile} from 'remotion';

const faces: [string, string, string, string][] = [
  ['Source Serif 4 UNL', 'fonts/SourceSerif4-BoldItalic.ttf', '700', 'italic'],
  ['Source Serif 4 UNL', 'fonts/SourceSerif4-SemiBoldItalic.ttf', '600', 'italic'],
  ['Instrument Sans UNL', 'fonts/InstrumentSans-400.ttf', '400', 'normal'],
  ['Instrument Sans UNL', 'fonts/InstrumentSans-500.ttf', '500', 'normal'],
  ['Instrument Sans UNL', 'fonts/InstrumentSans-600.ttf', '600', 'normal'],
  ['Instrument Sans UNL', 'fonts/InstrumentSans-700.ttf', '700', 'normal'],
];

let loaded = false;
export const loadFonts = () => {
  if (loaded || typeof document === 'undefined') return;
  loaded = true;
  const handle = delayRender('fonts');
  Promise.all(
    faces.map(([family, file, weight, style]) => {
      const f = new FontFace(family, `url(${staticFile(file)})`, {weight, style});
      return f.load().then((ff) => document.fonts.add(ff));
    }),
  )
    .then(() => continueRender(handle))
    .catch((e) => {
      // Fail loudly: no silent fallback font.
      throw e;
    });
};
