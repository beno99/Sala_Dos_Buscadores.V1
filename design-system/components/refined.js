/* Gerado: runtime clássico, compatível com file:// e HTTP. */
window.SDBRefined = {};
(()=>{
/** Melhoria progressiva: botões de estante, sem dependências ou HTML injetado. */
function initializeSalaCards(root = document, { onSaveChange = () => {} } = {}) {
  const key = 'sdb-card-sala-preview-estante';
  let saved = new Set();
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || '[]');
    if (Array.isArray(parsed)) saved = new Set(parsed.filter((item) => typeof item === 'string'));
  } catch { /* A estante funciona nesta página mesmo sem armazenamento. */ }

  const buttons = [...root.querySelectorAll('[data-save-room]')];
  const update = () => buttons.forEach((button) => {
    button.setAttribute('aria-pressed', String(saved.has(button.dataset.saveRoom)));
  });
  update();

  const listeners = buttons.map((button) => {
    const onClick = () => {
      const id = button.dataset.saveRoom;
      const isSaved = !saved.has(id);
      if (isSaved) saved.add(id);
      else saved.delete(id);
      try { localStorage.setItem(key, JSON.stringify([...saved])); } catch { /* Memória local continua válida. */ }
      update();
      const detail = { id, name: button.dataset.roomName, saved: isSaved };
      button.dispatchEvent(new CustomEvent('sala:save-change', { bubbles: true, detail }));
      onSaveChange(detail);
    };
    button.addEventListener('click', onClick);
    return () => button.removeEventListener('click', onClick);
  });
  return () => listeners.forEach((remove) => remove());
}

Object.assign(window.SDBRefined,{initializeSalaCards});
})();
(()=>{
/** Local comparison selection; removing a card never edits source data. */
function initializeComparison(root) {
  if (!root) return;
  const track = root.querySelector('[data-comparison-track]');
  const cards = [...track.querySelectorAll('[data-comparison-card]')];
  const count = root.querySelector('[data-comparison-count]');
  const notice = root.querySelector('[data-comparison-notice]');
  const message = root.querySelector('[data-comparison-message]');
  const undo = root.querySelector('[data-comparison-undo]');
  const reset = root.querySelector('[data-comparison-reset]');
  const previous = root.querySelector('[data-comparison-previous]');
  const next = root.querySelector('[data-comparison-next]');
  const removed = [];
  const visible = () => cards.filter((card) => !card.hidden);

  function updateNavigation() {
    previous.disabled = track.scrollLeft <= 1;
    next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 1;
  }
  function update() {
    const active = visible();
    count.textContent = `${active.length} ${active.length === 1 ? 'sala' : 'salas'}`;
    for (const card of active) {
      const remove = card.querySelector('[data-comparison-remove]');
      if (remove) remove.hidden = active.length === 1;
    }
    reset.hidden = removed.length === 0;
    notice.hidden = removed.length === 0;
    if (removed.length) message.textContent = `${removed.at(-1).dataset.roomName} saiu da comparação.`;
    requestAnimationFrame(updateNavigation);
  }
  function handleClick(event) {
    const remove = event.target.closest('[data-comparison-remove]');
    if (!remove) return;
    const card = remove.closest('[data-comparison-card]');
    const active = visible();
    if (active.length <= 1) return;
    const index = active.indexOf(card);
    card.hidden = true;
    removed.push(card);
    update();
    const neighbor = active[index + 1] || active[index - 1];
    const control = neighbor.querySelector('[data-comparison-remove]:not([hidden])') || neighbor.querySelector('a');
    control.focus({ preventScroll: true });
  }
  function restoreLast() {
    const card = removed.pop();
    if (!card) return;
    card.hidden = false;
    update();
    const control = card.querySelector('[data-comparison-remove]') || card.querySelector('a');
    control.focus();
  }
  function restoreAll() {
    cards.forEach((card) => { card.hidden = false; });
    removed.length = 0;
    update();
    cards[0].querySelector('[data-comparison-remove]').focus();
  }
  function move(direction) {
    const active = visible();
    if (!active.length) return;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    track.scrollBy({ left: direction * (active[0].getBoundingClientRect().width + gap), behavior: 'auto' });
  }
  const goPrevious = () => move(-1);
  const goNext = () => move(1);
  track.addEventListener('click', handleClick);
  track.addEventListener('scroll', updateNavigation, { passive: true });
  undo.addEventListener('click', restoreLast);
  reset.addEventListener('click', restoreAll);
  previous.addEventListener('click', goPrevious);
  next.addEventListener('click', goNext);
  const observer = new ResizeObserver(updateNavigation);
  observer.observe(track);
  update();
  return () => {
    observer.disconnect();
    track.removeEventListener('click', handleClick);
    track.removeEventListener('scroll', updateNavigation);
    undo.removeEventListener('click', restoreLast);
    reset.removeEventListener('click', restoreAll);
    previous.removeEventListener('click', goPrevious);
    next.removeEventListener('click', goNext);
  };
}

Object.assign(window.SDBRefined,{initializeComparison});
})();
(()=>{
const VERTEX_SOURCE = `
  attribute vec2 aPosition;

  void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`;

const FRAGMENT_SOURCE = `
  #ifdef GL_FRAGMENT_PRECISION_HIGH
    precision highp float;
  #else
    precision mediump float;
  #endif

  uniform vec2 uResolution;
  uniform float uTime;
  uniform float uActive;
  uniform float uRingOpen;

  mat2 rotate(float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat2(c, -s, s, c);
  }

  float coreSurface(vec3 p) {
    float radius = length(p);
    // The core stays inside the same conservative bound as the armillary scene.
    if (radius > 0.86) return radius - 0.82;
    p.xz = rotate(uTime * 0.055) * p.xz;
    p.xy = rotate(0.13 * sin(uTime * 0.18)) * p.xy;
    vec3 q = p + 0.17 * sin(p.yzx * 2.8 + uTime * vec3(0.20, -0.17, 0.15));
    // Smooth folds bend broad reflections like polished mercury.
    // There is no grain, cellular noise or fine-scale surface roughness.
    float swell = sin(q.x * 3.4 + uTime * 0.25)
      * sin(q.y * 2.8 - uTime * 0.20) * sin(q.z * 3.2 + uTime * 0.15);
    float fold = sin(dot(q, vec3(4.2, 2.1, -2.5)) + uTime * 0.32)
      * sin(dot(q, vec3(0.0, 3.1, 2.4)) - uTime * 0.23);
    float ripple = sin(dot(q, vec3(7.0, 2.4, 3.0)) + uTime * 0.23)
      * sin(q.y * 5.0 - uTime * 0.19);
    return radius - (0.695 + swell * 0.062 + fold * 0.035 + ripple * 0.018);
  }

  vec3 ringSpace(vec3 p, float material) {
    // Closed: three concentric bands in one plane. Hover unfolds each
    // into a distinct, fixed plane; time never spins the assembly.
    vec3 closed = vec3(0.16, 0.12, 0.0);
    vec3 opened;
    if (material < 2.5) {
      opened = vec3(-0.36, 0.38, 0.18);
    } else if (material < 3.5) {
      opened = vec3(1.18, 0.12, -0.12);
    } else {
      opened = vec3(0.26, 0.95, -0.76);
    }
    vec3 angles = mix(closed, opened, uRingOpen);
    p.xy = rotate(angles.z) * p.xy;
    p.xz = rotate(angles.y) * p.xz;
    p.yz = rotate(angles.x) * p.yz;
    return p;
  }

  float ringSurface(vec3 p, float material) {
    p = ringSpace(p, material);
    float radius = material < 2.5 ? 1.00 : (material < 3.5 ? 1.15 : 1.30);
    // A rounded rectangular section creates flat metallic band faces,
    // with thin polished bevels, instead of three wire-like toruses.
    vec2 section = abs(vec2(length(p.xy) - radius, p.z)) - vec2(0.020, 0.060);
    return length(max(section, 0.0)) + min(max(section.x, section.y), 0.0) - 0.008;
  }

  vec2 scene(vec3 p) {
    vec2 result = vec2(coreSurface(p), 1.0);
    float ringOne = ringSurface(p, 2.0);
    float ringTwo = ringSurface(p, 3.0);
    float ringThree = ringSurface(p, 4.0);
    if (ringOne < result.x) result = vec2(ringOne, 2.0);
    if (ringTwo < result.x) result = vec2(ringTwo, 3.0);
    if (ringThree < result.x) result = vec2(ringThree, 4.0);
    return result;
  }

  float materialSurface(vec3 p, float material) {
    return material < 1.5 ? coreSurface(p) : ringSurface(p, material);
  }

  vec3 normalAt(vec3 p, float material) {
    float epsilon = max(0.0012, 0.58 / min(uResolution.x, uResolution.y));
    vec2 e = vec2(1.0, -1.0) * epsilon;
    return normalize(
      e.xyy * materialSurface(p + e.xyy, material)
      + e.yyx * materialSurface(p + e.yyx, material)
      + e.yxy * materialSurface(p + e.yxy, material)
      + e.xxx * materialSurface(p + e.xxx, material)
    );
  }

  vec3 reflectedStudio(vec3 direction) {
    vec3 result = vec3(0.14, 0.075, 0.022);
    float horizon = exp(-pow((direction.y + 0.20) / 0.43, 2.0));
    result += vec3(0.72, 0.43, 0.13) * horizon;
    float upperSoftbox = pow(max(dot(direction, normalize(vec3(-0.48, 0.65, 0.84))), 0.0), 9.0);
    float rightSoftbox = pow(max(dot(direction, normalize(vec3(0.87, 0.10, 0.50))), 0.0), 15.0);
    result += vec3(4.8, 4.2, 2.9) * upperSoftbox;
    result += vec3(2.8, 1.9, 0.85) * rightSoftbox;
    float ribbonPosition = direction.y + direction.x * 0.30;
    float ribbon = smoothstep(0.15, 0.21, ribbonPosition)
      * (1.0 - smoothstep(0.32, 0.43, ribbonPosition));
    result += vec3(2.8, 2.38, 1.48) * ribbon * smoothstep(-0.35, 0.5, direction.z);
    float lowerLight = pow(max(dot(direction, normalize(vec3(-0.15, -0.82, 0.57))), 0.0), 8.0);
    result += vec3(1.55, 0.78, 0.21) * lowerLight;
    return result;
  }

  vec3 reflectedLiquidStudio(vec3 direction) {
    // A dark studio with large luminous panels gives the smooth liquid core
    // strong, flowing specular shapes rather than a diffuse plastic highlight.
    vec3 result = vec3(0.025, 0.013, 0.003);
    float horizon = exp(-pow((direction.y + 0.14) / 0.46, 2.0));
    result += vec3(0.23, 0.13, 0.038) * horizon;
    float mainPanel = pow(max(dot(direction, normalize(vec3(-0.53, 0.62, 0.82))), 0.0), 6.0);
    float rightPanel = pow(max(dot(direction, normalize(vec3(0.89, 0.08, 0.48))), 0.0), 16.0);
    result += vec3(5.8, 5.3, 4.0) * mainPanel;
    result += vec3(3.0, 2.2, 1.12) * rightPanel;

    float ribbonPosition = direction.y + direction.x * 0.26
      + 0.075 * sin(direction.z * 3.0);
    float upperRibbon = smoothstep(0.08, 0.13, ribbonPosition)
      * (1.0 - smoothstep(0.31, 0.37, ribbonPosition));
    result += vec3(4.6, 4.0, 2.75) * upperRibbon * smoothstep(-0.25, 0.42, direction.z);
    float lowerPanel = smoothstep(-0.82, -0.65, direction.y)
      * (1.0 - smoothstep(-0.40, -0.24, direction.y));
    result += vec3(1.9, 1.5, 0.76) * lowerPanel;

    float darkFold = 1.0 - smoothstep(0.025, 0.13,
      abs(direction.x + direction.y * 0.36 + 0.10));
    result *= 1.0 - darkFold * 0.72;
    return result;
  }

  vec3 toneMap(vec3 color) {
    color = (color * (2.51 * color + 0.03)) / (color * (2.43 * color + 0.59) + 0.14);
    return pow(clamp(color, 0.0, 1.0), vec3(0.4545));
  }

  void main() {
    vec2 uv = (gl_FragCoord.xy * 2.0 - uResolution.xy)
      / min(uResolution.x, uResolution.y) * 1.54;
    vec3 rayOrigin = vec3(0.0, 0.0, 4.4);
    vec3 rayDirection = normalize(vec3(uv, -4.4));
    float halo = exp(-pow(length(uv) / 1.08, 4.0)) * (0.045 + uActive * 0.020);
    vec3 haloColor = vec3(0.72, 0.40, 0.075);
    vec4 background = vec4(haloColor * halo, halo);

    float b = dot(rayOrigin, rayDirection);
    float discriminant = b * b - dot(rayOrigin, rayOrigin) + 1.39 * 1.39;
    if (discriminant < 0.0) {
      gl_FragColor = background;
      return;
    }

    float rayLength = -b - sqrt(discriminant);
    float rayEnd = -b + sqrt(discriminant);
    float closestDistance = 1.0;
    vec3 closestPoint = rayOrigin + rayDirection * rayLength;
    float closestMaterial = 1.0;
    float epsilon = max(0.0013, 0.36 / min(uResolution.x, uResolution.y));

    for (int stepIndex = 0; stepIndex < 64; stepIndex++) {
      vec3 p = rayOrigin + rayDirection * rayLength;
      vec2 samplePoint = scene(p);
      if (samplePoint.x < closestDistance) {
        closestDistance = samplePoint.x;
        closestPoint = p;
        closestMaterial = samplePoint.y;
      }
      if (samplePoint.x < epsilon || rayLength > rayEnd) break;
      // Organic folds use a conservative step; the bands are exact distances.
      float stepScale = samplePoint.y < 1.5 ? 0.43 : 0.78;
      rayLength += max(samplePoint.x * stepScale, epsilon * 0.45);
    }

    float edgeWidth = 1.4 / min(uResolution.x, uResolution.y);
    float coverage = 1.0 - smoothstep(epsilon, epsilon + edgeWidth, closestDistance);
    if (coverage <= 0.0) {
      gl_FragColor = background;
      return;
    }

    vec3 normal = normalAt(closestPoint, closestMaterial);
    vec3 reflection = reflect(rayDirection, normal);
    float facing = max(dot(normal, -rayDirection), 0.0);
    float fresnel = pow(1.0 - facing, 5.0);
    vec3 metalTint = mix(vec3(1.0, 0.74, 0.34), vec3(1.0, 0.94, 0.72), fresnel);
    vec3 color = reflectedStudio(reflection) * metalTint;
    if (closestMaterial < 1.5) {
      vec3 liquidGold = mix(vec3(1.0, 0.76, 0.36), vec3(1.0, 0.95, 0.76), fresnel);
      color = reflectedLiquidStudio(reflection) * liquidGold;
      color += vec3(0.030, 0.014, 0.003) * facing;
    } else {
      vec3 local = ringSpace(closestPoint, closestMaterial);
      // Light catches the rounded edges of each band as in an armillary globe.
      float bevel = smoothstep(0.046, 0.067, abs(local.z));
      color += vec3(0.64, 0.43, 0.12) * bevel;
      color += vec3(0.055, 0.027, 0.006);
    }
    color *= 0.96 + uActive * 0.04;
    color = toneMap(color);
    float alpha = coverage + background.a * (1.0 - coverage);
    gl_FragColor = vec4(color * coverage + background.rgb * (1.0 - coverage), alpha);
  }
`;

const FRAME_INTERVAL = 1000 / 30;
const MAX_PIXEL_RATIO = 1.5;

function unavailableController(canvas) {
  if (canvas?.dataset) canvas.dataset.renderer = 'fallback';
  return {
    isAvailable: false,
    setPaused() {},
    setActive() {},
    setHovered() {},
    destroy() {},
  };
}

/** A liquid gold core and exactly three 3D armillary bands; no external assets. */
function initializeGoldOrb(canvas) {
  if (!canvas || typeof canvas.getContext !== 'function') return unavailableController(canvas);

  let gl;
  try {
    gl = canvas.getContext('webgl', {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: true,
      preserveDrawingBuffer: false,
      powerPreference: 'low-power',
    });
  } catch {
    return unavailableController(canvas);
  }
  if (!gl) return unavailableController(canvas);

  let resources = null;
  let frameRequest = 0;
  let previousTick = null;
  let lastDraw = null;
  let elapsed = 1.8;
  let active = 0;
  let activeTarget = 0;
  let hovered = false;
  let ringOpen = 0;
  const durationToken = getComputedStyle(canvas).getPropertyValue('--duration-spring').trim();
  const durationSeconds = parseFloat(durationToken) / (durationToken.endsWith('ms') ? 1000 : 1);
  // Reach 99% of the new pose within the existing motion token (460ms).
  const openingRate = -Math.log(0.01) / (durationSeconds > 0 ? durationSeconds : 0.46);
  let paused = false;
  let inViewport = true;
  let hasSize = false;
  let contextLost = false;
  let destroyed = false;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function releaseResources() {
    if (!resources || contextLost) return;
    gl.deleteBuffer(resources.buffer);
    gl.deleteProgram(resources.program);
    resources = null;
  }

  function compile(type, source) {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
    gl.deleteShader(shader);
    return null;
  }

  function createResources() {
    const vertex = compile(gl.VERTEX_SHADER, VERTEX_SOURCE);
    const fragment = compile(gl.FRAGMENT_SHADER, FRAGMENT_SOURCE);
    const program = gl.createProgram();
    if (!vertex || !fragment || !program) {
      if (vertex) gl.deleteShader(vertex);
      if (fragment) gl.deleteShader(fragment);
      if (program) gl.deleteProgram(program);
      canvas.dataset.renderer = 'fallback';
      return false;
    }
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);

    const buffer = gl.createBuffer();
    if (!gl.getProgramParameter(program, gl.LINK_STATUS) || !buffer) {
      if (buffer) gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      canvas.dataset.renderer = 'fallback';
      return false;
    }

    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'aPosition');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.BLEND);
    gl.clearColor(0, 0, 0, 0);

    resources = {
      program,
      buffer,
      resolution: gl.getUniformLocation(program, 'uResolution'),
      time: gl.getUniformLocation(program, 'uTime'),
      active: gl.getUniformLocation(program, 'uActive'),
      ringOpen: gl.getUniformLocation(program, 'uRingOpen'),
    };
    canvas.dataset.renderer = 'webgl';
    return true;
  }

  function canDraw() {
    return !destroyed && !contextLost && resources && hasSize && inViewport && !document.hidden;
  }

  function draw() {
    if (!canDraw()) return;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.useProgram(resources.program);
    gl.uniform2f(resources.resolution, canvas.width, canvas.height);
    gl.uniform1f(resources.time, elapsed);
    gl.uniform1f(resources.active, active);
    gl.uniform1f(resources.ringOpen, ringOpen);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  function stopFrames() {
    if (frameRequest) cancelAnimationFrame(frameRequest);
    frameRequest = 0;
    previousTick = null;
    lastDraw = null;
  }

  function tick(now) {
    frameRequest = 0;
    if (!canDraw() || paused || reducedMotion.matches) return;
    if (previousTick === null) previousTick = now;
    const delta = Math.min((now - previousTick) / 1000, 0.1);
    previousTick = now;
    elapsed += delta;
    active += (activeTarget - active) * (1 - Math.exp(-delta * 8));
    const targetOpen = hovered ? 1 : 0;
    // Retarget from the current pose so rapid pointer changes never jump.
    ringOpen += (targetOpen - ringOpen) * (1 - Math.exp(-delta * openingRate));
    if (Math.abs(targetOpen - ringOpen) < 0.0005) ringOpen = targetOpen;
    if (lastDraw === null || now - lastDraw >= FRAME_INTERVAL - 0.5) {
      draw();
      lastDraw = now;
    }
    frameRequest = requestAnimationFrame(tick);
  }

  function synchronize() {
    stopFrames();
    if (!canDraw()) return;
    if (reducedMotion.matches || paused) {
      active = activeTarget;
    }
    draw();
    if (!paused && !reducedMotion.matches) frameRequest = requestAnimationFrame(tick);
  }

  function resize() {
    if (destroyed) return;
    const bounds = canvas.getBoundingClientRect();
    hasSize = bounds.width > 0 && bounds.height > 0;
    const ratio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
    const width = Math.max(1, Math.round(bounds.width * ratio));
    const height = Math.max(1, Math.round(bounds.height * ratio));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    synchronize();
  }

  function onContextLost(event) {
    event.preventDefault();
    contextLost = true;
    resources = null;
    canvas.dataset.renderer = 'fallback';
    stopFrames();
  }

  function onContextRestored() {
    if (destroyed) return;
    contextLost = false;
    if (createResources()) resize();
  }

  if (!createResources()) return unavailableController(canvas);

  canvas.addEventListener('webglcontextlost', onContextLost);
  canvas.addEventListener('webglcontextrestored', onContextRestored);
  document.addEventListener('visibilitychange', synchronize);
  if (reducedMotion.addEventListener) reducedMotion.addEventListener('change', synchronize);
  else reducedMotion.addListener(synchronize);

  const resizeObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(resize) : null;
  if (resizeObserver) resizeObserver.observe(canvas);
  else window.addEventListener('resize', resize);

  const intersectionObserver = typeof IntersectionObserver === 'function'
    ? new IntersectionObserver(([entry]) => {
      inViewport = entry.isIntersecting;
      synchronize();
    }, { threshold: 0 })
    : null;
  intersectionObserver?.observe(canvas);
  resize();

  return {
    get isAvailable() { return !destroyed && !contextLost && Boolean(resources); },
    setPaused(value) {
      if (destroyed || paused === Boolean(value)) return;
      paused = Boolean(value);
      synchronize();
    },
    setActive(value) {
      if (destroyed) return;
      activeTarget = value ? 1 : 0;
      if (paused || reducedMotion.matches) {
        active = activeTarget;
        draw();
      }
    },
    setHovered(value) {
      if (destroyed) return;
      hovered = Boolean(value);
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      stopFrames();
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', synchronize);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      canvas.removeEventListener('webglcontextrestored', onContextRestored);
      if (reducedMotion.removeEventListener) reducedMotion.removeEventListener('change', synchronize);
      else reducedMotion.removeListener(synchronize);
      releaseResources();
      canvas.dataset.renderer = 'fallback';
    },
  };
}

Object.assign(window.SDBRefined,{initializeGoldOrb});
})();
(()=>{
const assistantSuggestions = [
  'O que é o Pleroma?',
  'Como o Poimandres descreve a criação?',
  'O que acontece com a alma após a morte?',
];

// Exemplos locais do catálogo original. Este módulo não consulta uma IA.
const examples = {
  pleroma: {
    text: 'Nos textos gnósticos de Nag Hammadi, o Pleroma é a totalidade da esfera divina, habitada pelos éons. Segundo o Apócrifo de João, a queda de Sofia ocorre fora dele.',
    source: 'Interpretação editorial · Glossário · Pleroma · Sala Nag Hammadi',
    tab: 'salas',
  },
  creation: {
    text: 'Segundo o Tratado I, Hermes vê primeiro uma luz sem limites, que o texto identifica com a Mente, e depois uma escuridão úmida. Da luz sai o Logos, que separa os elementos, e uma segunda Mente, artífice, forma os sete governadores.',
    source: 'Síntese de exemplo · Corpus Hermeticum, Tratado I, §4–11 · Copenhaver, 1992',
    tab: 'salas',
  },
  death: {
    text: 'No Poimandres (Tratado I, 24–26), o corpo se dissolve e a alma sobe pelas sete esferas, devolvendo a cada uma a paixão que dela recebeu, até chegar à Ogdóade e entrar em Deus.',
    source: 'Comparativo · Corpus Hermeticum · CH I, 24–26 · trad. Copenhaver, 1992',
    tab: 'comparativos',
  },
};

/**
 * @param {string} question
 * @returns {{text: string, source: string, tab?: 'salas' | 'comparativos'}}
 */
function getDemoResponse(question) {
  const normalized = String(question ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  // O tema da morte tem prioridade quando a pergunta também cita Poimandres.
  if (/\b(morte|morrer|morremos|falecimento|pos[- ]morte)\b/.test(normalized)) {
    return { ...examples.death };
  }

  if (/\b(pleroma|gnose|gnosticismo|gnosticos?|sofia|eons?|demiurgo|arcontes?)\b/.test(normalized)) {
    return { ...examples.pleroma };
  }

  if (/\b(poimandres|criacao|cosmogonia)\b|\borigem (do universo|do mundo)\b/.test(normalized)) {
    return { ...examples.creation };
  }

  return {
    text: 'Esta prévia usa respostas de exemplo e não está conectada a uma IA. Experimente perguntar “O que é o Pleroma?”, “Como o Poimandres descreve a criação?” ou “O que acontece com a alma após a morte?”.',
    source: 'Prévia local · respostas de exemplo',
  };
}

Object.assign(window.SDBRefined,{assistantSuggestions,getDemoResponse});
})();
(()=>{
const { initializeGoldOrb } = window.SDBRefined;
const { assistantSuggestions, getDemoResponse } = window.SDBRefined;

function initializeAssistant(root = document) {
  const panel = root.querySelector('#assistant-chat');
  if (!panel) return;
  const triggers = [...root.querySelectorAll('[data-assistant-open]')];
  const motionButtons = [...root.querySelectorAll('[data-orb-pause]')];
  const hoverMedia = window.matchMedia('(hover: hover) and (pointer: fine)');
  const orbBindings = [...root.querySelectorAll('[data-gold-orb]')].map((canvas) => {
    const renderer = initializeGoldOrb(canvas);
    const trigger = canvas.closest('[data-assistant-open]');
    const visual = canvas.closest('.orb-visual');
    const enter = (event) => {
      if (!hoverMedia.matches || event.pointerType === 'touch') return;
      renderer.setHovered(true);
      visual.dataset.hovered = 'true';
    };
    const leave = () => {
      renderer.setHovered(false);
      visual.dataset.hovered = 'false';
    };
    trigger.addEventListener('pointerenter', enter);
    trigger.addEventListener('pointerleave', leave);
    trigger.addEventListener('pointercancel', leave);
    hoverMedia.addEventListener('change', leave);
    const onVisibility = () => { if (document.hidden) leave(); };
    document.addEventListener('visibilitychange', onVisibility);
    return { renderer, visual, cleanup() {
      trigger.removeEventListener('pointerenter', enter);
      trigger.removeEventListener('pointerleave', leave);
      trigger.removeEventListener('pointercancel', leave);
      hoverMedia.removeEventListener('change', leave);
      document.removeEventListener('visibilitychange', onVisibility);
      renderer.destroy();
    } };
  });
  const renderers = orbBindings.map(({ renderer }) => renderer);
  const field = panel.querySelector('textarea');
  const form = panel.querySelector('form');
  const send = panel.querySelector('[data-assistant-send]');
  const welcome = panel.querySelector('[data-assistant-welcome]');
  const log = panel.querySelector('[data-assistant-log]');
  const scroller = panel.querySelector('[data-assistant-scroll]');
  const clear = panel.querySelector('[data-assistant-clear]');
  const close = panel.querySelector('[data-assistant-close]');
  const suggestions = panel.querySelector('[data-assistant-suggestions]');
  const supportsPopover = typeof panel.showPopover === 'function';
  let opener = triggers[0];
  let paused = false;

  const isOpen = () => supportsPopover ? panel.matches(':popover-open') : panel.dataset.fallbackOpen === 'true';
  function reflectOpen(open) {
    triggers.forEach((trigger) => trigger.setAttribute('aria-expanded', String(open)));
    renderers.forEach((renderer) => renderer.setActive(open));
    if (open) field.focus({ preventScroll: true });
  }
  function hide() {
    if (supportsPopover) panel.hidePopover();
    else { panel.hidden = true; delete panel.dataset.fallbackOpen; reflectOpen(false); }
  }
  if (!supportsPopover) panel.hidden = true;
  panel.addEventListener('toggle', (event) => reflectOpen(event.newState === 'open'));
  triggers.forEach((trigger) => trigger.addEventListener('click', (event) => {
    opener = trigger;
    panel.dataset.instant = String(event.detail === 0);
    if (supportsPopover) return; // Native popovertarget handles toggling and Escape.
    if (isOpen()) hide();
    else { panel.hidden = false; panel.dataset.fallbackOpen = 'true'; reflectOpen(true); }
  }));
  close.addEventListener('click', (event) => {
    panel.dataset.instant = String(event.detail === 0);
    hide();
    opener.focus({ preventScroll: true });
  });
  if (!supportsPopover) {
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && isOpen()) { hide(); opener.focus({ preventScroll: true }); }
    });
    document.addEventListener('pointerdown', (event) => {
      if (isOpen() && !panel.contains(event.target) && !triggers.some((t) => t.contains(event.target))) hide();
    });
  }
  panel.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') panel.dataset.instant = 'true';
  });
  motionButtons.forEach((button) => button.addEventListener('click', () => {
    paused = !paused;
    renderers.forEach((renderer) => renderer.setPaused(paused));
    orbBindings.forEach(({ visual }) => {
      visual.dataset.orbPaused = String(paused);
      // Freeze the CSS fallback at its current pose as well as the WebGL scene.
      visual.querySelectorAll('.orb-fallback-rings i').forEach((ring) => {
        if (paused) {
          const currentPose = getComputedStyle(ring).transform;
          ring.style.transition = 'none';
          ring.style.transform = currentPose;
        } else {
          ring.style.removeProperty('transition');
          ring.style.removeProperty('transform');
        }
      });
    });
    motionButtons.forEach((control) => {
      control.setAttribute('aria-pressed', String(paused));
      control.querySelector('span').textContent = paused ? 'Retomar movimento' : 'Pausar movimento';
    });
  }));

  function updateSend() { send.disabled = !field.value.trim(); }
  field.addEventListener('input', updateSend);
  field.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      if (field.value.trim()) form.requestSubmit();
    }
  });
  assistantSuggestions.forEach((text) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = text;
    button.addEventListener('click', () => {
      field.value = text;
      updateSend();
      field.focus();
    });
    suggestions.append(button);
  });
  function appendMessage(text, type) {
    const article = document.createElement('div');
    article.className = `assistant-chat__message assistant-chat__message--${type}`;
    article.setAttribute('aria-label', type === 'user' ? 'Você' : 'Assistente, resposta de exemplo');
    if (type === 'assistant') {
      const label = document.createElement('span');
      label.className = 'assistant-chat__message-label';
      label.textContent = 'ASSISTENTE · EXEMPLO DO ACERVO';
      article.append(label);
    }
    const p = document.createElement('p');
    p.textContent = text;
    article.append(p);
    log.append(article);
    return article;
  }
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const question = field.value.trim().slice(0, 2000);
    if (!question) return;
    welcome.hidden = true;
    clear.hidden = false;
    appendMessage(question, 'user');
    const response = getDemoResponse(question);
    const message = appendMessage(response.text, 'assistant');
    const source = document.createElement('p');
    source.className = 'assistant-chat__source';
    source.textContent = response.source;
    message.append(source);
    if (response.tab) {
      const link = document.createElement('button');
      link.type = 'button';
      link.className = 'assistant-chat__link';
      link.textContent = response.tab === 'comparativos' ? 'Ver comparativo no catálogo ↗' : 'Explorar cards de sala ↗';
      link.addEventListener('click', () => {
        hide();
        const tab = document.getElementById(`tab-${response.tab}`);
        if (tab) { tab.click(); tab.focus(); }
        else {
          const name = response.tab === 'comparativos' ? 'GradeComparativa' : 'CardSala';
          if (window.parent !== window) window.parent.postMessage({sdbNavigate:name}, '*');
          else location.href = window.SDBCatalog.base + 'catalogo.html#' + name;
        }
      });
      message.append(link);
    }
    field.value = '';
    updateSend();
    field.focus({ preventScroll: true });
    scroller.scrollTop = scroller.scrollHeight;
  });
  clear.addEventListener('click', () => {
    log.replaceChildren();
    welcome.hidden = false;
    clear.hidden = true;
    field.value = '';
    updateSend();
    field.focus();
    scroller.scrollTop = 0;
  });
  updateSend();
  return { destroy: () => orbBindings.forEach((binding) => binding.cleanup()) };
}

Object.assign(window.SDBRefined,{initializeAssistant});
})();
(function(){
  const api = window.SDBRefined;
  const base = new URL('../',document.currentScript.src);
  window.SDBCatalog = {base:base.href};
  document.querySelectorAll('[role="tablist"]').forEach(list=>{
    const tabs=[...list.querySelectorAll('[role="tab"]')];
    const activate=(tab,focus=false)=>{tabs.forEach(t=>{const selected=t===tab;t.setAttribute('aria-selected',String(selected));t.tabIndex=selected?0:-1;const p=document.getElementById(t.getAttribute('aria-controls'));if(p)p.hidden=!selected;});if(focus)tab.focus();};
    tabs.forEach((tab,index)=>{tab.addEventListener('click',()=>activate(tab));tab.addEventListener('keydown',e=>{let next;if(e.key==='ArrowRight')next=tabs[(index+1)%tabs.length];if(e.key==='ArrowLeft')next=tabs[(index+tabs.length-1)%tabs.length];if(e.key==='Home')next=tabs[0];if(e.key==='End')next=tabs.at(-1);if(next){e.preventDefault();activate(next,true);}});});
  });
  api.initializeSalaCards(document,{onSaveChange:({name,saved})=>window.SalaBuscadores.toast(`${name} ${saved?'salvo na estante.':'removido da estante.'}`)});
  api.initializeComparison(document.querySelector('[data-comparison]'));
  api.initializeAssistant(document);
  document.querySelectorAll('[data-preview-room]').forEach(link=>link.addEventListener('click',event=>{event.preventDefault();const dialog=document.querySelector('dialog');if(!dialog)return;dialog.querySelector('#dialog-title').textContent=link.dataset.previewTitle||'Corpus Hermeticum';dialog.querySelector('[data-dialog-description]').textContent=link.dataset.previewDescription||'Hermetismo greco-egípcio · séculos I–III';dialog.showModal();}));
})();
