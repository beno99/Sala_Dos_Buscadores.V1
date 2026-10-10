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
export function initializeGoldOrb(canvas) {
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
