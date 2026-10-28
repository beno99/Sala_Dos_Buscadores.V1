const VERTEX_SOURCE = `
  attribute vec2 aPosition;
  void main() { gl_Position = vec4(aPosition, 0.0, 1.0); }
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
  uniform float uHover;

  mat2 rotate(float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat2(c, -s, s, c);
  }

  vec3 mineralSpace(vec3 p) {
    p.xz = rotate(uTime * 0.075) * p.xz;
    p.yz = rotate(0.18) * p.yz;
    return p;
  }

  float hash(vec3 p) {
    p = fract(p * 0.1031);
    p += dot(p, p.yzx + 33.33);
    return fract((p.x + p.y) * p.z);
  }

  float noise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash(i), hash(i + vec3(1, 0, 0)), f.x),
        mix(hash(i + vec3(0, 1, 0)), hash(i + vec3(1, 1, 0)), f.x), f.y),
      mix(mix(hash(i + vec3(0, 0, 1)), hash(i + vec3(1, 0, 1)), f.x),
        mix(hash(i + vec3(0, 1, 1)), hash(i + vec3(1, 1, 1)), f.x), f.y), f.z);
  }

  float mineralNoise(vec3 p) {
    return 0.56 * noise(p) + 0.28 * noise(p * 2.03 + 8.0)
      + 0.12 * noise(p * 4.07 + 17.0);
  }

  float surface(vec3 p) {
    float radius = length(p);
    // Keep tracing outside the object inexpensive and its silhouette almost round.
    if (radius > 1.01) return radius - 0.99;
    vec3 q = mineralSpace(p);
    q += 0.14 * sin(q.yzx * 3.2 + vec3(0.3, 1.8, 3.4));
    float broadFold = sin(q.x * 4.5 + q.y * 2.0) * sin(q.y * 4.0 - q.z * 3.4);
    float fineFold = sin(q.y * 13.0 + 2.2 * sin(q.x * 4.3 + q.z * 3.4));
    float hoverWave = sin(q.x * 3.5 + uTime * 1.2)
      * sin(q.y * 3.4 - uTime * 1.0) * sin(q.z * 3.3 + uTime * 0.8);
    return radius - (0.914 + broadFold * 0.026 + fineFold * 0.006
      + hoverWave * uHover * 0.027 + uActive * 0.006);
  }

  vec3 normalAt(vec3 p) {
    float epsilon = max(0.0011, 0.40 / min(uResolution.x, uResolution.y));
    vec2 e = vec2(1.0, -1.0) * epsilon;
    return normalize(e.xyy * surface(p + e.xyy) + e.yyx * surface(p + e.yyx)
      + e.yxy * surface(p + e.yxy) + e.xxx * surface(p + e.xxx));
  }

  vec3 studio(vec3 direction) {
    // Neutral silver softboxes reveal the stone while keeping its body graphite.
    float top = pow(max(dot(direction, normalize(vec3(-0.55, 0.72, 0.82))), 0.0), 10.0);
    float side = pow(max(dot(direction, normalize(vec3(0.82, 0.24, 0.54))), 0.0), 24.0);
    float bottom = pow(max(dot(direction, normalize(vec3(-0.48, -0.78, 0.56))), 0.0), 18.0);
    float ribbonPosition = direction.y + direction.x * 0.42;
    float ribbon = smoothstep(0.13, 0.19, ribbonPosition)
      * (1.0 - smoothstep(0.28, 0.39, ribbonPosition));
    ribbon *= smoothstep(-0.08, 0.65, direction.z);
    return vec3(0.018) + vec3(0.76, 0.78, 0.81) * top
      + vec3(0.30, 0.32, 0.35) * side + vec3(0.09) * bottom
      + vec3(0.27, 0.28, 0.30) * ribbon;
  }

  void main() {
    vec2 uv = (gl_FragCoord.xy * 2.0 - uResolution.xy)
      / min(uResolution.x, uResolution.y) * 1.18;
    vec3 origin = vec3(0.0, 0.0, 4.6);
    vec3 direction = normalize(vec3(uv, -4.6));
    float b = dot(origin, direction);
    float discriminant = b * b - dot(origin, origin) + 1.02 * 1.02;
    if (discriminant < 0.0) { gl_FragColor = vec4(0.0); return; }

    float distanceAlongRay = -b - sqrt(discriminant);
    float rayEnd = -b + sqrt(discriminant);
    float epsilon = max(0.0011, 0.32 / min(uResolution.x, uResolution.y));
    float closestDistance = 1.0;
    vec3 closestPoint = origin + direction * distanceAlongRay;
    for (int index = 0; index < 60; index++) {
      vec3 point = origin + direction * distanceAlongRay;
      float sampleDistance = surface(point);
      if (sampleDistance < closestDistance) {
        closestDistance = sampleDistance;
        closestPoint = point;
      }
      if (sampleDistance < epsilon || distanceAlongRay > rayEnd) break;
      distanceAlongRay += max(sampleDistance * 0.58, epsilon * 0.45);
    }

    float coverage = 1.0 - smoothstep(epsilon,
      epsilon + 1.4 / min(uResolution.x, uResolution.y), closestDistance);
    if (coverage <= 0.0) { gl_FragColor = vec4(0.0); return; }

    vec3 normal = normalAt(closestPoint);
    vec3 reflection = reflect(direction, normal);
    float facing = max(dot(normal, -direction), 0.0);
    float fresnel = pow(1.0 - facing, 3.0);
    vec3 q = mineralSpace(closestPoint);
    float layers = mineralNoise(q * 4.0 + vec3(1.2, 0.2, 2.1));
    float veins = sin(q.y * 19.0 + q.x * 6.0 + layers * 15.0);
    float silverVein = pow(1.0 - abs(veins), 13.0);
    float mineral = mix(0.032, 0.095, smoothstep(0.23, 0.75, layers));
    float diffuse = 0.35 + 0.65 * max(dot(normal, normalize(vec3(-0.45, 0.70, 0.7))), 0.0);
    vec3 color = vec3(mineral * diffuse);
    color += studio(reflection) * (0.42 + layers * 0.28 + fresnel * 0.25);
    // Fine seams stay inside the material, never become a ring or an outer glow.
    color += vec3(0.060, 0.062, 0.066) * silverVein * (0.35 + diffuse * 0.65);
    color += vec3(0.035, 0.037, 0.041) * fresnel;
    color *= 1.0 + uActive * 0.10;
    color = pow(clamp(color, 0.0, 1.0), vec3(0.66));
    gl_FragColor = vec4(color * coverage, coverage);
  }
`;

const FRAME_INTERVAL = 1000 / 30;
const MAX_PIXEL_RATIO = 1.5;

function unavailableController(canvas) {
  if (canvas?.dataset) canvas.dataset.renderer = 'fallback';
  return { isAvailable: false, setPaused() {}, setActive() {}, setHovered() {}, destroy() {} };
}

/** An independently controlled graphite mineral sphere with no rings or external assets. */
export function initializeDarkOrb(canvas) {
  if (!canvas || typeof canvas.getContext !== 'function') return unavailableController(canvas);
  let gl;
  try {
    gl = canvas.getContext('webgl', {
      alpha: true, antialias: false, depth: false, stencil: false,
      premultipliedAlpha: true, preserveDrawingBuffer: false, powerPreference: 'low-power',
    });
  } catch { return unavailableController(canvas); }
  if (!gl) return unavailableController(canvas);

  let resources = null;
  let frameRequest = 0;
  let previousTick = null;
  let lastDraw = null;
  let elapsed = 1.8;
  let active = 0;
  let activeTarget = 0;
  let hover = 0;
  let hoverTarget = 0;
  let paused = false;
  let inViewport = true;
  let hasSize = false;
  let contextLost = false;
  let destroyed = false;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const durationToken = getComputedStyle(canvas).getPropertyValue('--duration-spring').trim();
  const durationSeconds = parseFloat(durationToken) / (durationToken.endsWith('ms') ? 1000 : 1);
  const responseRate = -Math.log(0.01) / (durationSeconds > 0 ? durationSeconds : 0.46);

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
      program, buffer,
      resolution: gl.getUniformLocation(program, 'uResolution'),
      time: gl.getUniformLocation(program, 'uTime'),
      active: gl.getUniformLocation(program, 'uActive'),
      hover: gl.getUniformLocation(program, 'uHover'),
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
    gl.uniform1f(resources.hover, hover);
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
    active += (activeTarget - active) * (1 - Math.exp(-delta * responseRate));
    hover += (hoverTarget - hover) * (1 - Math.exp(-delta * responseRate));
    if (lastDraw === null || now - lastDraw >= FRAME_INTERVAL - 0.5) {
      draw();
      lastDraw = now;
    }
    frameRequest = requestAnimationFrame(tick);
  }

  function synchronize() {
    stopFrames();
    if (!canDraw()) return;
    if (paused || reducedMotion.matches) active = activeTarget;
    if (reducedMotion.matches) hover = 0;
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

  function onPointerCapabilityChange() {
    if (!finePointer.matches) hoverTarget = 0;
  }

  if (!createResources()) return unavailableController(canvas);
  canvas.addEventListener('webglcontextlost', onContextLost);
  canvas.addEventListener('webglcontextrestored', onContextRestored);
  document.addEventListener('visibilitychange', synchronize);
  if (reducedMotion.addEventListener) reducedMotion.addEventListener('change', synchronize);
  else reducedMotion.addListener(synchronize);
  if (finePointer.addEventListener) finePointer.addEventListener('change', onPointerCapabilityChange);
  else finePointer.addListener(onPointerCapabilityChange);
  const resizeObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(resize) : null;
  if (resizeObserver) resizeObserver.observe(canvas);
  else window.addEventListener('resize', resize);
  const intersectionObserver = typeof IntersectionObserver === 'function'
    ? new IntersectionObserver(([entry]) => {
      inViewport = entry.isIntersecting;
      synchronize();
    }, { threshold: 0 }) : null;
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
      if (paused || reducedMotion.matches) { active = activeTarget; draw(); }
    },
    setHovered(value) {
      if (destroyed) return;
      hoverTarget = value && finePointer.matches && !reducedMotion.matches ? 1 : 0;
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
      if (finePointer.removeEventListener) finePointer.removeEventListener('change', onPointerCapabilityChange);
      else finePointer.removeListener(onPointerCapabilityChange);
      if (resources && !contextLost) {
        gl.deleteBuffer(resources.buffer);
        gl.deleteProgram(resources.program);
      }
      resources = null;
      gl.clear(gl.COLOR_BUFFER_BIT);
      canvas.dataset.renderer = 'fallback';
    },
  };
}
