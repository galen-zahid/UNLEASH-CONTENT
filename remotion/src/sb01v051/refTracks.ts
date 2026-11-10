// Measured reference tracks (larg8ak17f8d AFTER crop, 30 fps). Source: tools/ref_motion_analysis.py →
// audit/v04/REF_MOTION.json (grid-line edges, ORB camera scale). Values = fraction of panel width/height.
// Output frame == reference frame for the opening unless noted in audit/v04/FRAME_MAP.md.

export type Samples = [number, number][];

/** Monotone cubic Hermite (Fritsch–Carlson): C1-continuous, no overshoot, valid for fractional frames. */
export const mono = (s: Samples) => {
  const n = s.length;
  const x = s.map((p) => p[0]);
  const y = s.map((p) => p[1]);
  const d: number[] = [];
  for (let i = 0; i < n - 1; i++) d.push((y[i + 1] - y[i]) / (x[i + 1] - x[i]));
  const m: number[] = new Array(n);
  m[0] = d[0];
  m[n - 1] = d[n - 2];
  for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) {
      m[i] = 0;
      m[i + 1] = 0;
      continue;
    }
    const a = m[i] / d[i];
    const b = m[i + 1] / d[i];
    const h = a * a + b * b;
    if (h > 9) {
      const t = 3 / Math.sqrt(h);
      m[i] = t * a * d[i];
      m[i + 1] = t * b * d[i];
    }
  }
  return (t: number) => {
    if (t <= x[0]) return y[0];
    if (t >= x[n - 1]) return y[n - 1];
    let i = 0;
    while (t > x[i + 1]) i++;
    const h = x[i + 1] - x[i];
    const u = (t - x[i]) / h;
    const h00 = 2 * u ** 3 - 3 * u ** 2 + 1;
    const h10 = u ** 3 - 2 * u ** 2 + u;
    const h01 = -2 * u ** 3 + 3 * u ** 2;
    const h11 = u ** 3 - u ** 2;
    return h00 * y[i] + h10 * h * m[i] + h01 * y[i + 1] + h11 * h * m[i + 1];
  };
};

// ---- Aperture edges (measured grid lines). f1–f19 & f68–f72 measured; f73–f74 from sharp-region box.
// Deviation: the reference stops dead between f20 and f21 (velocity 0.014/frame → 0). v04 spreads that stop
// over f19–f23 so the edge decelerates instead of snapping (brief: no velocity discontinuity).
const L: Samples = [[0, 0.498], [1, 0.464], [2, 0.435], [3, 0.414], [4, 0.401], [5, 0.39], [6, 0.38], [7, 0.367], [8, 0.357], [9, 0.344], [10, 0.331], [11, 0.316], [12, 0.304], [13, 0.289], [14, 0.274], [15, 0.259], [16, 0.245], [17, 0.23], [18, 0.214], [19, 0.2], [20, 0.19], [21, 0.186], [23, 0.184], [67, 0.184], [68, 0.181], [69, 0.177], [70, 0.171], [71, 0.165], [72, 0.156], [73, 0.089], [74, 0.036], [75, 0]];
const R: Samples = [[0, 0.502], [1, 0.532], [2, 0.561], [3, 0.584], [4, 0.595], [5, 0.605], [6, 0.616], [7, 0.629], [8, 0.641], [9, 0.654], [10, 0.667], [11, 0.679], [12, 0.692], [13, 0.707], [14, 0.722], [15, 0.736], [16, 0.751], [17, 0.767], [18, 0.782], [19, 0.795], [20, 0.806], [21, 0.811], [23, 0.814], [67, 0.814], [68, 0.814], [69, 0.819], [70, 0.825], [71, 0.833], [72, 0.842], [73, 0.916], [74, 0.968], [75, 1]];
// f1–f3 heights not measurable (grid rows hidden at panel border) → extrapolated from f4–f8 slope.
const T: Samples = [[0, 0.455], [1, 0.444], [2, 0.425], [3, 0.405], [4, 0.387], [5, 0.385], [6, 0.38], [7, 0.374], [8, 0.367], [9, 0.359], [10, 0.351], [11, 0.342], [12, 0.333], [13, 0.322], [14, 0.313], [15, 0.302], [16, 0.291], [17, 0.281], [18, 0.27], [19, 0.261], [20, 0.254], [21, 0.25], [23, 0.248], [67, 0.248], [68, 0.246], [69, 0.243], [70, 0.238], [71, 0.232], [72, 0.226], [73, 0.12], [74, 0.04], [75, 0]];
const B: Samples = [[0, 0.457], [1, 0.468], [2, 0.484], [3, 0.502], [4, 0.518], [5, 0.53], [6, 0.539], [7, 0.549], [8, 0.558], [9, 0.566], [10, 0.576], [11, 0.584], [12, 0.594], [13, 0.603], [14, 0.611], [15, 0.621], [16, 0.63], [17, 0.641], [18, 0.65], [19, 0.659], [20, 0.665], [21, 0.668], [23, 0.669], [67, 0.669], [68, 0.671], [69, 0.673], [70, 0.675], [71, 0.68], [72, 0.685], [73, 0.8], [74, 0.95], [75, 1]];
export const APERTURE = {L: mono(L), R: mono(R), T: mono(T), B: mono(B)};

// ---- Camera inside the aperture (ORB similarity, cumulative). Reference pulls OUT ≈13 % f5–f11
// (frame ratios .985 .972 .965 .961 .994 .992), then pushes IN ≈7.5 % f68–f79 into the full-frame expand.
export const CAM_OPEN = mono([[0, 1.147], [5, 1.147], [6, 1.13], [7, 1.099], [8, 1.061], [9, 1.019], [10, 1.013], [11, 1.005], [16, 1.0], [68, 1.0], [69, 1.005], [70, 1.009], [71, 1.016], [72, 1.024], [73, 1.049], [74, 1.053], [76, 1.057], [77, 1.062], [78, 1.069], [79, 1.075], [96, 1.075]]);

// ---- Circle wipe (reference f115–f119 area coverage 5/21/51/79/98 %), shifted −13 f to cover master cut f107.
export const WIPE_R = mono([[101, 0], [102, 175], [103, 384], [104, 630], [105, 1000], [106, 1430]]);

// ---- Beat C/E camera: reference push f221–222 then pull-out ≈9 % f224–234.
export const CAM_E = mono([[224, 1.0], [230, 1.0], [232, 1.1], [236, 1.05], [242, 1.0], [286, 1.0], [289, 1.03], [294, 1.12]]);
