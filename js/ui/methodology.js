import { REFERENCES } from "../data/references.js";

export function mountMethodology(root) {
  root.innerHTML = `
    <section class="methodology" id="how-it-works">
      <h2>About this calculator</h2>

      <p class="explain-lead">
        This calculator was created to answer a practical question about monitors/televisions: for a given screen size and viewing distance, what screen resolutions can you actually tell apart?
      </p>

      <p>
        Imagine standing in a room with a television or monitor. If you walk close enough, you'll eventually
        see individual pixels. If you walk far away, at some point even a low-resolution display will be indistinguishable from a perfect (infinite resolution) display. This app estimates where that line is for real-world setups, using
        peer-reviewed vision science and equations.
      </p>

      <h3>What is PPD?</h3>
      <p>
        <strong>Pixels per degree (PPD)</strong> is a measurement that combines screen size, resolution, and
        viewing distance into a single number, representing how much detail is reaching your eye. A higher PPD means the image will look sharper, while a lower PPD means the image will look jagged or pixelated.
      </p>
      <p>
        50% of people max out at 95 PPD or below. Increasing the PPD beyond that will provide them no benefit <em>(with one exception - hyperacuity, see below)</em>.
      </p>
      <p>
        The green line under "Visual Acuity" shows where 90% of people will have their max PPD (80 PPD - 113 PPD). The absolute human limit is about 125 PPD.
      </p>

      <p class="explain-callout">
        <strong>Hyperacuity</strong> is a separate, finer limit: even when it's impossible to distinguish individual pixels, jagged (non-antialiased) lines can still look “off” until you move farther back. This limit is significantly higher, but also tends to be much less important, because real life photos/videos rarely have sharp high-contrast edges, and on computers, text and video games are <a href="https://en.wikipedia.org/wiki/Spatial_anti-aliasing">anti-aliased</a> to avoid this issue.
      </p>
      
      <h3>But why does 4K on Netflix/YouTube look noticably better?</h3>
      <p>
        The main difference between HD and 4K Netflix/YouTube streams is <strong>the <a href="https://en.wikipedia.org/wiki/Bit_rate#Multimedia">bitrate</a></strong>, not the resolution.
      </p>
      
      <p>
        For example, Netflix HD streams are 2-5 Mbps, whereas their 4k streams are 15-25 Mbps. This means that their 4k streams send 5-10x as much information! This results in their 4k video looking noticably better, even on 1080p televisions.
      </p>

      <details class="methodology-details">
        <summary>Technical details</summary>
        <div class="methodology-details-body">
      <p class="explain-muted">
        This section documents the math used by the code. It, like the code itself, was AI-written, so apologies if it's hard to parse
      </p>

      <h3>1. Geometry and PPD on a flat display <a href="#ref-2" class="cite">[2]</a></h3>
      <p>
        The calculator treats the panel as a flat rectangle viewed from a point on the central perpendicular
        (binocular foveal viewing along the screen normal). You specify diagonal size, aspect ratio, viewing
        distance, and pixel grid dimensions <math xmlns="http://www.w3.org/1998/Math/MathML"><msub><mi>N</mi><mi>x</mi></msub><mo>×</mo><msub><mi>N</mi><mi>y</mi></msub></math>.
      </p>
      <p>
        From diagonal <math xmlns="http://www.w3.org/1998/Math/MathML"><mi>D</mi></math> and aspect
        <math xmlns="http://www.w3.org/1998/Math/MathML"><mi>a</mi><mo>:</mo><mi>b</mi></math>, physical width and height are obtained by standard diagonal decomposition. Pixel pitch on each axis is
        pitch = screen extent / pixel count, so horizontal pitch
        <math xmlns="http://www.w3.org/1998/Math/MathML"><msub><mi>p</mi><mi>x</mi></msub><mo>=</mo><mi>W</mi><mo>/</mo><msub><mi>N</mi><mi>x</mi></msub></math>
        and similarly for vertical. Center-of-screen PPD on one axis at viewing distance
        <math xmlns="http://www.w3.org/1998/Math/MathML"><mi>d</mi></math> uses the Mantiuk / Cambridge form (equivalent to converting pitch to cycles per degree and back):
      </p>
      <math xmlns="http://www.w3.org/1998/Math/MathML" display="block">
        <mrow>
          <mi>PPD</mi><mo>=</mo>
          <mfrac><mi>&#x03C0;</mi><mrow><mn>360</mn><mo>&#x2062;</mo><mi>atan</mi><mo>&#x2061;</mo><mrow><mi>p</mi><mo>/</mo><mrow><mo>(</mo><mn>2</mn><mi>d</mi><mo>)</mo></mrow></mrow></mrow></mfrac>
        </mrow>
      </math>
      <p>
        The app computes <strong>PPD<sub>H</sub></strong> and <strong>PPD<sub>V</sub></strong> separately when pitch differs (non-square pixels from custom resolutions, or different horizontal and vertical counts). Field size enters later through the geometric field of view: horizontal and vertical visual angles from
        <math xmlns="http://www.w3.org/1998/Math/MathML"><mi>W</mi><mo>,</mo><mi>H</mi><mo>,</mo><mi>d</mi></math>,
        combined into
        <math xmlns="http://www.w3.org/1998/Math/MathML"><msub><mi>X</mi><mn>0</mn></msub><mo>=</mo><msqrt><mrow><msub><mi>&#x03B8;</mi><mi>H</mi></msub><msub><mi>&#x03B8;</mi><mi>V</mi></msub></mrow></msqrt></math>
        (degrees), which scales the contrast sensitivity function in Section 3.
      </p>
      <p>
        For population visibility and the acuity gauge, a single <strong>effective PPD</strong> is used:
        the minimum of layout-corrected horizontal and vertical values,
        <math xmlns="http://www.w3.org/1998/Math/MathML"><msub><mi>P</mi><mi>eff</mi></msub><mo>=</mo><mi>min</mi><mo>(</mo><msub><mi>k</mi><mi>H</mi></msub><msub><mi>PPD</mi><mi>H</mi></msub><mo>,</mo><msub><mi>k</mi><mi>V</mi></msub><msub><mi>PPD</mi><mi>V</mi></msub><mo>)</mo></math>,
        where the <math xmlns="http://www.w3.org/1998/Math/MathML"><mi>k</mi></math> factors (Section 4) map non-stripe subpixel layouts to an equivalent RGB-stripe PPD for the Ashraf population model, which was calibrated on stripe displays <a href="#ref-1" class="cite">[1]</a>.
      </p>

      <h3>2. Population resolution limit <a href="#ref-1" class="cite">[1]</a> <a href="#ref-2" class="cite">[2]</a> <a href="#ref-3" class="cite">[3]</a></h3>
      <p>
        Ashraf et al. measured how well observers could distinguish real displays from idealized perfect references across many PPDs. Their supplementary model expresses <strong>the fraction of people who can still see a difference</strong> as a function of effective PPD. Implementation follows the Cambridge display calculator and gfxdisp reference code <a href="#ref-2" class="cite">[2]</a> <a href="#ref-3" class="cite">[3]</a>.
      </p>
      <p>
        Working in <strong>cube-root cycles-per-degree space</strong> stabilizes the fit. Let
        <math xmlns="http://www.w3.org/1998/Math/MathML"><mi>P</mi></math> be effective PPD. Define
        <math xmlns="http://www.w3.org/1998/Math/MathML"><mi>c</mi><mo>=</mo><mroot><mrow><mi>P</mi><mo>/</mo><mn>2</mn></mrow><mn>3</mn></mroot></math>.
        Residual acuity in the population is modeled as normal in
        <math xmlns="http://www.w3.org/1998/Math/MathML"><mi>c</mi></math> with
        <math xmlns="http://www.w3.org/1998/Math/MathML"><mi>&#x03BC;</mi><mo>=</mo><mn>3.6263</mn></math> and
        <math xmlns="http://www.w3.org/1998/Math/MathML"><mi>&#x03C3;</mi><mo>=</mo><mn>0.1309</mn></math>.
        The visible fraction (reported floored to whole percent in the UI) is:
      </p>
      <math xmlns="http://www.w3.org/1998/Math/MathML" display="block">
        <mrow>
          <msub><mi>p</mi><mi>visible</mi></msub><mo>(</mo><mi>P</mi><mo>)</mo>
          <mo>=</mo>
          <mn>1</mn><mo>&#x2212;</mo><mi>&#x03A6;</mi><mo>&#x2061;</mo>
          <mrow><mo>(</mo><mfrac><mrow><mi>c</mi><mo>&#x2212;</mo><mi>&#x03BC;</mi></mrow><mi>&#x03C3;</mi></mfrac><mo>)</mo></mrow>
        </mrow>
      </math>
      <p>
        where <math xmlns="http://www.w3.org/1998/Math/MathML"><mi>&#x03A6;</mi></math> is the standard normal CDF (Abramowitz &amp; Stegun erf approximation in code <a href="#ref-17" class="cite">[17]</a>). Intuitively: at low PPD almost nobody can tell your display from perfect; as PPD rises, more people can still detect structure; at very high PPD only a small tail of the population retains useful sensitivity.
      </p>
      <p>
        Key percentiles used in the interface (from the inverse mapping
        <math xmlns="http://www.w3.org/1998/Math/MathML"><mi>P</mi><mo>(</mo><mi>z</mi><mo>)</mo><mo>=</mo><mn>2</mn><msup><mrow><mo>(</mo><mi>&#x03BC;</mi><mo>+</mo><mi>z</mi><mi>&#x03C3;</mi><mo>)</mo></mrow><mn>3</mn></msup></math>):
      </p>
      <ul class="explain-list">
        <li><strong>~95 PPD</strong> — median eye (~50th percentile); gauge tick “95 (Median eye)”.</li>
        <li><strong>~113 PPD</strong> — 95th percentile limit (<math xmlns="http://www.w3.org/1998/Math/MathML"><mi>z</mi><mo>=</mo><mn>1.645</mn></math>); above this, fewer than 5% of the modeled population can tell the display from perfect at the chosen distance.</li>
      </ul>
      <p>
        The acuity gauge background bands use ~79 PPD (5th percentile) and ~113 PPD as soft zone boundaries: below the lower band the display is likely detail-limited; between the bands is “at the eye’s limit” for many viewers; above the upper band extra pixels mostly benefit only the highest-acuity tail (“wasted pixels” in the badge label).
      </p>
      <p>
        Resolution rows labeled <strong>Impossible to tell</strong> when either the previous or current effective PPD already has
        <math xmlns="http://www.w3.org/1998/Math/MathML"><msub><mi>p</mi><mi>visible</mi></msub><mo>&lt;</mo><mn>5</mn><mo>%</mo></math>
        (threshold 0.05 in code). In that regime, SQRI step sizes between resolutions are still computed for completeness, but the upgrade badge communicates that the population model no longer supports a meaningful “who can tell” story for that step.
      </p>

      <h3>3. Contrast sensitivity (CSF) <a href="#ref-4" class="cite">[4]</a></h3>
      <p>
        SQRI needs the human contrast sensitivity function: how much modulation is needed at each spatial frequency for the eye to detect a pattern. The implementation uses Barten’s simplified CSF (2003), Equation 11, evaluated at fixed photopic luminance
        <math xmlns="http://www.w3.org/1998/Math/MathML"><mi>L</mi><mo>=</mo><mn>100</mn><mtext> cd/m²</mtext></math>
        to match Ashraf et al. <a href="#ref-1" class="cite">[1]</a>:
      </p>
      <math xmlns="http://www.w3.org/1998/Math/MathML" display="block">
        <mrow>
          <mi>S</mi><mo>(</mo><mi>u</mi><mo>,</mo><msub><mi>X</mi><mn>0</mn></msub><mo>,</mo><mi>L</mi><mo>)</mo>
          <mo>=</mo>
          <mfrac>
            <mrow><mn>5200</mn><msup><mi>e</mi><mrow><mo>&#x2212;</mo><mn>0.0016</mn><msup><mi>u</mi><mn>2</mn></msup><msup><mrow><mo>(</mo><mn>1</mn><mo>+</mo><mn>100</mn><mo>/</mo><mi>L</mi><mo>)</mo></mrow><mn>0.08</mn></msup></mrow></msup></mrow>
            <msqrt>
              <mrow>
                <mo>(</mo><mn>1</mn><mo>+</mo><mn>144</mn><mo>/</mo><msubsup><mi>X</mi><mn>0</mn><mn>2</mn></msubsup><mo>+</mo><mn>0.64</mn><msup><mi>u</mi><mn>2</mn></msup><mo>)</mo>
                <mo>(</mo><mn>63</mn><mo>/</mo><msup><mi>L</mi><mn>0.83</mn></msup><mo>+</mo><mn>1</mn><mo>/</mo><mo>(</mo><mn>1</mn><mo>&#x2212;</mo><msup><mi>e</mi><mrow><mo>&#x2212;</mo><mn>0.02</mn><msup><mi>u</mi><mn>2</mn></msup></mrow></msup><mo>)</mo><mo>)</mo>
              </mrow>
            </msqrt>
          </mfrac>
        </mrow>
      </math>
      <p>
        Here <math xmlns="http://www.w3.org/1998/Math/MathML"><mi>u</mi></math> is spatial frequency in cycles per degree and
        <math xmlns="http://www.w3.org/1998/Math/MathML"><msub><mi>X</mi><mn>0</mn></msub></math> is field size in degrees from Section 1. Larger screens at the same distance increase
        <math xmlns="http://www.w3.org/1998/Math/MathML"><msub><mi>X</mi><mn>0</mn></msub></math>, which lowers sensitivity at low frequencies—this is why SQRI and cutoff distances depend on size and distance jointly, not on resolution alone.
      </p>

      <h3>4. Subpixel layouts, MTF, and the <math xmlns="http://www.w3.org/1998/Math/MathML"><mi>k</mi></math> factor <a href="#ref-10" class="cite">[10]</a> <a href="#ref-11" class="cite">[11]</a> <a href="#ref-12" class="cite">[12]</a> <a href="#ref-15" class="cite">[15]</a></h3>
      <p>
        Real pixels are not uniform squares of light: RGB stripes, PenTile, WOLED, and QD-OLED patterns spread luminance differently along horizontal and vertical axes. The code represents each layout as one-dimensional luminance apertures (subpixel strip weights) and computes a modulation transfer function
        <math xmlns="http://www.w3.org/1998/Math/MathML"><mi>M</mi><mo>(</mo><mi>u</mi><mo>)</mo></math> as the magnitude of the Fourier transform of the normalized aperture (see Kim &amp; Allebach-style discrete MTF <a href="#ref-11" class="cite">[11]</a>, with layout data aligned to Frérot et al. <a href="#ref-10" class="cite">[10]</a>).
      </p>
      <p>
        SQRI integrates along each axis with that axis’s MTF. For population limits, Ashraf’s study used RGB stripe references, so non-stripe layouts receive an effective PPD scale
        <math xmlns="http://www.w3.org/1998/Math/MathML"><mi>k</mi><mo>&#x2264;</mo><mn>1</mn></math> per axis: find the stripe PPD whose SQRI on the reference aperture matches the layout’s SQRI at reference conditions (60 PPD,
        <math xmlns="http://www.w3.org/1998/Math/MathML"><msub><mi>X</mi><mn>0</mn></msub><mo>=</mo><mn>30</mn><mo>&#xB0;</mo></math>, bisection in code). Values are cached per layout; RGB and BGR use
        <math xmlns="http://www.w3.org/1998/Math/MathML"><mi>k</mi><mo>=</mo><mn>1</mn></math>. WOLED/QD-OLED geometries are simplified versus full panel metrology <a href="#ref-15" class="cite">[15]</a>.
      </p>

      <h3>5. SQRI quality, upgrade tiers, and cutoff distances <a href="#ref-5" class="cite">[5]</a> <a href="#ref-7" class="cite">[7]</a></h3>
      <p>
        <strong>Square Root Integral (SQRI)</strong> quality in just-noticeable-difference (JND) units summarizes how visible pixel structure is across spatial frequencies, following Winkler’s definition <a href="#ref-5" class="cite">[5]</a>. For each axis, integrate in log-frequency from
        <math xmlns="http://www.w3.org/1998/Math/MathML"><msub><mi>u</mi><mi>min</mi></msub><mo>=</mo><mn>1</mn><mo>/</mo><msub><mi>X</mi><mn>0</mn></msub></math>
        to
        <math xmlns="http://www.w3.org/1998/Math/MathML"><msub><mi>u</mi><mi>max</mi></msub><mo>=</mo><mi>PPD</mi><mo>/</mo><mn>2</mn></math>
        (Nyquist). Integrand at each frequency:
      </p>
      <math xmlns="http://www.w3.org/1998/Math/MathML" display="block">
        <mrow>
          <mi>g</mi><mo>(</mo><mi>u</mi><mo>)</mo>
          <mo>=</mo>
          <mrow>
            <mo>{</mo>
            <mtable columnalign="left">
              <mtr><mtd><msqrt><mrow><mi>M</mi><mo>(</mo><mi>u</mi><mo>)</mo><mi>S</mi><mo>(</mo><mi>u</mi><mo>)</mo></mrow></msqrt></mtd><mtd><mtext>if </mtext><mi>M</mi><mi>S</mi><mo>&#x2265;</mo><mn>1</mn></mtd></mtr>
              <mtr><mtd><mn>0</mn></mtd><mtd><mtext>otherwise (clamped)</mtext></mtd></mtr>
            </mtable>
          </mrow>
        </mrow>
      </math>
      <p>
        Integration uses a log-spaced trapezoid rule with 600 steps per axis; total
        <math xmlns="http://www.w3.org/1998/Math/MathML"><mi>J</mi><mo>=</mo><mo>(</mo><msub><mi>J</mi><mi>H</mi></msub><mo>+</mo><msub><mi>J</mi><mi>V</mi></msub><mo>)</mo><mo>/</mo><mn>2</mn></math>,
        normalized by ln 2 per Winkler. Resolution rows are sorted by effective PPD at your current setup; consecutive rows differ by
        <math xmlns="http://www.w3.org/1998/Math/MathML"><mi>&#x0394;</mi><mi>J</mi><mo>=</mo><msub><mi>J</mi><mi>current</mi></msub><mo>&#x2212;</mo><msub><mi>J</mi><mi>previous</mi></msub></math>.
        Badge text maps
        <math xmlns="http://www.w3.org/1998/Math/MathML"><mi>&#x0394;</mi><mi>J</mi></math> to ISO 20462-1-style bands <a href="#ref-7" class="cite">[7]</a>:
      </p>
      <ul class="explain-list">
        <li><strong>Barely Noticable Difference</strong> — <math xmlns="http://www.w3.org/1998/Math/MathML"><mi>&#x0394;</mi><mi>J</mi><mo>&lt;</mo><mn>1</mn></math></li>
        <li><strong>Subtle Difference</strong> — <math xmlns="http://www.w3.org/1998/Math/MathML"><mi>&#x0394;</mi><mi>J</mi><mo>&lt;</mo><mn>3</mn></math></li>
        <li><strong>Noticable Difference</strong> — <math xmlns="http://www.w3.org/1998/Math/MathML"><mi>&#x0394;</mi><mi>J</mi><mo>&lt;</mo><mn>6</mn></math></li>
        <li><strong>Very Noticable Difference</strong> — <math xmlns="http://www.w3.org/1998/Math/MathML"><mi>&#x0394;</mi><mi>J</mi><mo>&lt;</mo><mn>12</mn></math></li>
        <li><strong>Massive Difference</strong> — <math xmlns="http://www.w3.org/1998/Math/MathML"><mi>&#x0394;</mi><mi>J</mi><mo>&#x2265;</mo><mn>12</mn></math> (extension beyond the standard’s top band)</li>
      </ul>
      <p>
        Tooltip JND values on badges report
        <math xmlns="http://www.w3.org/1998/Math/MathML"><mi>&#x0394;</mi><mi>J</mi></math> to one decimal place (“JND Limen: +7.4”).
      </p>
      <p>
        <strong>Cutoff distance</strong> for a row answers: how far back must you sit before effective PPD drops to the population 95th-percentile limit (~113 PPD on the effective axis)? For each axis, invert the PPD–distance relationship with
        <math xmlns="http://www.w3.org/1998/Math/MathML"><msub><mi>P</mi><mn>95</mn></msub><mo>/</mo><mi>k</mi></math>;
        take the maximum of horizontal and vertical required distances so both axes are below threshold. That distance is shown on the selected resolution row and encoded in the Human Vision Limits chart: for each resolution, cutoff scales linearly with diagonal (constant ratio
        <math xmlns="http://www.w3.org/1998/Math/MathML"><mtext>cutoff</mtext><mo>/</mo><mtext>diagonal</mtext></math>
        in meters per meter), which appears as a straight line in display units until the chart’s distance axis cap (20 ft / 6.096 m), after which the drawn line runs horizontally along the cap. Shaded bands between neighboring lines mark PPD-tier regions; they do not cross because higher resolutions always require closer viewing before the same visual limit is reached.
      </p>

      <h3>6. Hyperacuity (aliasing on hard edges) <a href="#ref-8" class="cite">[8]</a> <a href="#ref-9" class="cite">[9]</a></h3>
      <p>
        Hyperacuity in this app is a separate, conservative limit for vernier-style alignment of sharp edges: observers can detect tiny misalignments much finer than one pixel pitch. The implementation fixes a 10 arcsecond threshold (~360 PPD equivalent) following Westheimer &amp; McKee and untrained vernier data <a href="#ref-8" class="cite">[8]</a> <a href="#ref-9" class="cite">[9]</a>. The distance shown under Visual acuity is computed like cutoff distance but with that higher PPD target—when you are closer than this distance, jagged non-antialiased edges may still look wrong even if SQRI and population metrics suggest sufficient resolution for general content. It does not replace the main PPD / SQRI analysis for photographs, video, or anti-aliased text.
      </p>

      <h3>7. Linked state and recomputation</h3>
      <p>
        Bird’s Eye View, Human Vision Limits, Resolution, and Visual acuity share one state object: diagonal, distance, aspect ratio, subpixel layout, selected resolution row, optional custom resolutions, and units. Any drag or control change recomputes all rows (
        <math xmlns="http://www.w3.org/1998/Math/MathML"><mi>J</mi></math>,
        <math xmlns="http://www.w3.org/1998/Math/MathML"><msub><mi>p</mi><mi>visible</mi></msub></math>,
        cutoffs, chart slopes) from the same formulas above. Settings persist in browser local storage so refreshes keep your scenario.
      </p>

      <h3>Assumptions and limitations</h3>
      <ul class="limitations">
        <li><strong>Content:</strong> Models target high-contrast, text-like structure where pixel grids matter. Natural scenes, film grain, and heavy compression often mask pixel structure; results can be pessimistic for Hollywood movies, optimistic for crisp UI fonts if poorly anti-aliased.</li>
        <li><strong>Viewing conditions:</strong> Binocular foveal viewing on-axis at 100 cd/m², matching Ashraf et al.; population age mean 25.5 years <a href="#ref-1" class="cite">[1]</a>. Off-axis viewing, monocular vision, and very dim or HDR highlights are not modeled.</li>
        <li><strong>Geometry:</strong> Flat panel, uniform pixel grid, center-of-screen metrics. Curved screens, bezels, and variable zoom / overscan are ignored.</li>
        <li><strong>Layouts:</strong> Subpixel MTF uses idealized 1D apertures; measured panel crosstalk and color subpixel rendering are only approximated <a href="#ref-10" class="cite">[10]</a> <a href="#ref-15" class="cite">[15]</a>.</li>
        <li><strong>Population vs SQRI:</strong> Percent visible uses effective PPD with layout <math xmlns="http://www.w3.org/1998/Math/MathML"><mi>k</mi></math>; SQRI uses full MTF on each axis. They are consistent in spirit but not identical metrics.</li>
        <li><strong>Processing chain:</strong> No GPU scaling, sharpening, temporal anti-aliasing, or motion blur; frozen frames only.</li>
        <li><strong>Distance effects in data:</strong> Ashraf supplementary material reports no consistent viewing-distance effect on the fitted limit within their tested range <a href="#ref-1" class="cite">[1]</a>; the app still changes PPD with distance geometrically, which is the dominant practical effect.</li>
      </ul>
        </div>
      </details>

      <details class="methodology-details" id="references">
        <summary>References</summary>
        <div class="methodology-details-body">
      <ol class="ref-list"></ol>
        </div>
      </details>
    </section>
  `;

  const list = root.querySelector(".ref-list");
  list.innerHTML = REFERENCES.map(
    (r) => `
    <li id="ref-${r.id}">
      <strong>[${r.id}]</strong> ${r.citation}
      <a href="${r.url}" target="_blank" rel="noopener">Link</a>
      <ul>${r.usedFor.map((u) => `<li>${u}</li>`).join("")}</ul>
    </li>`
  ).join("");
}
