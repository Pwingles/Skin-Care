/* ============================================================
   STRATUM — app.js
   Navigation · Scroll Animations · Quiz Logic
   ============================================================ */

// ── 1. Navigation scroll effect ──────────────────────────────
const nav = document.getElementById('nav');
if (nav) {
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 24);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// ── 2. Intersection Observer — fade-up animations ─────────────
const fadeEls = document.querySelectorAll('.fade-up');
if (fadeEls.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: '-40px', threshold: 0.08 }
  );
  fadeEls.forEach(el => observer.observe(el));
}

// ── 3. Quiz Logic ─────────────────────────────────────────────
const TOTAL_QUESTIONS = 5;

const answers = {};
let currentQ = 0;

const slides       = document.querySelectorAll('.quiz-slide');
const resultsEl    = document.getElementById('quiz-results');
const progressFill = document.getElementById('progress-fill');
const progressLabel = document.getElementById('progress-label');

if (slides.length) {
  // Select an option
  slides.forEach((slide, qIdx) => {
    const opts = slide.querySelectorAll('.quiz-opt');
    const nextBtn = slide.querySelector(`#next-${qIdx}`);

    opts.forEach(opt => {
      opt.addEventListener('click', () => {
        opts.forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        answers[qIdx] = opt.dataset.value;
        if (nextBtn) nextBtn.disabled = false;
      });
    });
  });

  // Next buttons
  for (let i = 0; i < TOTAL_QUESTIONS; i++) {
    const btn = document.getElementById(`next-${i}`);
    if (btn) {
      btn.addEventListener('click', () => {
        if (answers[i] === undefined) return;
        goTo(i + 1);
      });
    }
  }

  // Back buttons
  for (let i = 1; i < TOTAL_QUESTIONS; i++) {
    const btn = document.getElementById(`back-${i}`);
    if (btn) {
      btn.addEventListener('click', () => goTo(i - 1));
    }
  }

  // Restart
  const restartBtn = document.getElementById('restart');
  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      Object.keys(answers).forEach(k => delete answers[k]);
      slides.forEach(s => {
        s.querySelectorAll('.quiz-opt').forEach(o => o.classList.remove('selected'));
        const nb = s.querySelector('[id^="next-"]');
        if (nb) nb.disabled = true;
      });
      if (resultsEl) {
        resultsEl.classList.remove('active');
        if (progressFill) progressFill.closest('.quiz-progress').style.display = '';
      }
      goTo(0);
    });
  }

  function goTo(idx) {
    if (idx >= TOTAL_QUESTIONS) {
      // Show results
      slides.forEach(s => s.classList.remove('active'));
      if (resultsEl) {
        resultsEl.classList.add('active');
        if (progressFill) progressFill.closest('.quiz-progress').style.display = 'none';
        buildResults();
      }
      return;
    }
    slides.forEach((s, i) => s.classList.toggle('active', i === idx));
    currentQ = idx;
    updateProgress(idx);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function updateProgress(idx) {
    const pct = ((idx) / TOTAL_QUESTIONS) * 100;
    if (progressFill) progressFill.style.width = pct + '%';
    if (progressLabel) progressLabel.textContent = `${idx + 1} of ${TOTAL_QUESTIONS}`;
  }

  updateProgress(0);
}

// ── 4. Build Quiz Results ─────────────────────────────────────
function buildResults() {
  const skinType  = answers[0]; // oily | dry | combo | sensitive
  const concern   = answers[1]; // acne | pigmentation | aging | redness
  const midday    = answers[2]; // very-oily | tzone | balanced | tight
  const breakouts = answers[3]; // often | sometimes | rarely | never
  const level     = answers[4]; // beginner | basic | intermediate | advanced

  const isOily = skinType === 'oily' || skinType === 'combo'
              || midday === 'very-oily' || midday === 'tzone'
              || breakouts === 'often';

  const needsAzelaic = concern === 'pigmentation' || concern === 'redness'
                    || skinType === 'sensitive';

  const niacPct = (skinType === 'oily' || midday === 'very-oily') ? '10%' : '5%';

  // Headline
  const headlines = {
    acne:          'Clear Skin Protocol',
    pigmentation:  'Brightening Protocol',
    aging:         'Anti-Aging Protocol',
    redness:       'Calming Protocol',
  };
  const subs = {
    acne:         `Formulated for ${skinType} skin — focused on controlling breakouts, regulating sebum, and strengthening your barrier so breakouts become the exception, not the rule.`,
    pigmentation: `Formulated for ${skinType} skin — targeting melanin pathways, evening tone, and reversing existing dark spots with evidence-backed ingredients.`,
    aging:        `Formulated for ${skinType} skin — building collagen, accelerating cell turnover, and protecting against the UV damage responsible for 80% of visible aging.`,
    redness:      `Formulated for ${skinType} skin — reducing inflammation, repairing the skin barrier, and calming reactivity with the gentlest active ingredients available.`,
  };

  document.getElementById('result-headline').textContent = headlines[concern] || 'Your Personalised Routine';
  document.getElementById('result-sub').textContent = subs[concern] || '';

  // Build steps
  const steps = [];

  // Step 1: Cleanser
  steps.push({
    num: '01',
    name: 'Cleanser',
    type: isOily ? 'Foaming formula — morning if oily, night always' : 'Hydrating formula — night always, morning optional',
    products: isOily ? [
      { brand: 'CeraVe', name: 'Foaming Facial Cleanser', link: 'https://amzn.to/3OfX9Vr' },
      { brand: 'La Roche-Posay', name: 'Effaclar Purifying Foaming Gel', link: 'https://amzn.to/4bIET0S' },
    ] : [
      { brand: 'CeraVe', name: 'Hydrating Facial Cleanser', link: 'https://amzn.to/45Wn4aO' },
      { brand: 'La Roche-Posay', name: 'Toleriane Hydrating Gentle Cleanser', link: 'https://amzn.to/4rcEIji' },
    ],
  });

  // Step 2: Vitamin C (always)
  steps.push({
    num: '02',
    name: 'Vitamin C Serum',
    type: 'Morning — L-ascorbic acid 15–20% + E + ferulic acid',
    products: [
      { brand: 'SkinCeuticals', name: 'C E Ferulic Serum', link: 'https://amzn.to/4qk6Qzp', tag: 'Premium' },
      { brand: 'Brandefy', name: 'Vitamin C + E + Ferulic Acid Serum', link: 'https://amzn.to/4aalOSw', tag: 'Value' },
    ],
  });

  // Step 3: Azelaic Acid (conditional)
  if (needsAzelaic) {
    steps.push({
      num: '03',
      name: 'Azelaic Acid',
      type: 'Morning after Vitamin C — blocks melanin, reduces inflammation',
      products: [
        { brand: "Paula's Choice", name: '10% Azelaic Acid Booster', link: 'https://amzn.to/4rxS9tG' },
        { brand: 'The Ordinary', name: 'Azelaic Acid 10% Suspension', link: 'https://amzn.to/4aHYLPB' },
      ],
    });
  }

  // Niacinamide
  const niacStep = needsAzelaic ? '04' : '03';
  steps.push({
    num: niacStep,
    name: 'Niacinamide',
    type: `${niacPct} — fades spots, strengthens barrier, controls sebum`,
    products: niacPct === '10%' ? [
      { brand: 'The Ordinary', name: 'Niacinamide 10% + Zinc 1%', link: 'https://amzn.to/3ZXZs1Y' },
      { brand: 'CeraVe', name: 'PM Moisturizing Lotion (4% built in)', link: 'https://amzn.to/3ZXZs1Y' },
    ] : [
      { brand: 'La Roche-Posay', name: 'Mela B3 Serum (5%)', link: 'https://amzn.to/4aiUm55' },
      { brand: 'CeraVe', name: 'PM Moisturizing Lotion (4% built in)', link: 'https://amzn.to/3ZXZs1Y' },
    ],
  });

  // Moisturizer
  const moistStep = (needsAzelaic ? 5 : 4).toString().padStart(2, '0');
  steps.push({
    num: moistStep,
    name: 'Moisturizer',
    type: isOily ? 'Lightweight, non-comedogenic — morning & night' : 'Rich ceramide cream — morning & night',
    products: isOily ? [
      { brand: 'La Roche-Posay', name: 'Toleriane Double Repair Moisturizer', link: 'https://amzn.to/4aBQ762' },
    ] : [
      { brand: 'CeraVe', name: 'Moisturizing Cream', link: 'https://amzn.to/4aDuJxi' },
    ],
  });

  // SPF (always last in morning)
  const spfStep = (needsAzelaic ? 6 : 5).toString().padStart(2, '0');
  steps.push({
    num: spfStep,
    name: 'Mineral Sunscreen',
    type: 'Morning — when outdoors 10am–4pm. Skip if fully indoors.',
    products: [
      { brand: 'La Roche-Posay', name: 'Anthelios Mineral Ultra-Light SPF 50+', link: 'https://amzn.to/3ZkjN1n' },
    ],
  });

  // Retinol (evening) — only suggest if not beginner and aging/acne concern
  if (level !== 'beginner' || concern === 'aging' || concern === 'acne') {
    steps.push({
      num: '★',
      name: 'Retinol (Evening)',
      type: 'Active nights Mon / Wed / Fri — the most important anti-aging ingredient',
      products: [
        { brand: 'CeraVe', name: 'Resurfacing Retinol Serum', link: 'https://amzn.to/4rxS9tG', tag: 'Start here' },
      ],
    });
  }

  // Render
  const container = document.getElementById('result-steps');
  container.innerHTML = '';
  steps.forEach(step => {
    const el = document.createElement('div');
    el.className = 'result-step';
    el.innerHTML = `
      <div class="result-step-num">${step.num}</div>
      <div>
        <div class="result-step-name">${step.name}</div>
        <div class="result-step-type">${step.type}</div>
        <div class="result-products">
          ${step.products.map(p => `
            <div class="result-product">
              <div class="result-product-info">
                <div class="result-product-brand">${p.brand}${p.tag ? ` — ${p.tag}` : ''}</div>
                <div class="result-product-name">${p.name}</div>
              </div>
              <a href="${p.link}" target="_blank" class="result-amazon">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M11 3H17V9M17 3L9 11M7 5H4a1 1 0 00-1 1v10a1 1 0 001 1h10a1 1 0 001-1v-3"/>
                </svg>
                Amazon
              </a>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    container.appendChild(el);
  });
}
