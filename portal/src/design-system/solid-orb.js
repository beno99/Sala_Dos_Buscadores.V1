/* Glass gemstones with a layered, rotating interior. The caller owns motion. */
(function (global) {
  'use strict';

  const vertexSource = `
    attribute vec2 aPosition;
    varying vec2 vUv;
    void main() {
      vUv = aPosition * 0.5 + 0.5;
      gl_Position = vec4(aPosition, 0.0, 1.0);
    }
  `;

  const fragmentSource = `
    #ifdef GL_FRAGMENT_PRECISION_HIGH
    precision highp float;
    #else
    precision mediump float;
    #endif
    varying vec2 vUv;
    uniform vec2 uResolution;
    uniform vec2 uPointer;
    uniform float uTime;
    uniform float uHover;
    uniform float uPulse;
    uniform float uDark;
    uniform float uReveal;
    uniform float uSeed;
    uniform int uStyle;
    uniform vec3 uColor0;
    uniform vec3 uColor1;
    uniform vec3 uColor2;

    mat2 turn(float a) {
      return mat2(cos(a), -sin(a), sin(a), cos(a));
    }

    float softLight(vec2 p, vec2 center, vec2 width) {
      vec2 d = (p - center) / width;
      return exp(-dot(d, d));
    }

    float hash3(vec3 p) {
      p = fract(p * 0.1031);
      p += dot(p, p.yzx + 33.33);
      return fract((p.x + p.y) * p.z);
    }

    float noise3(vec3 p) {
      vec3 cell = floor(p);
      vec3 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(
        mix(mix(hash3(cell), hash3(cell + vec3(1,0,0)), f.x),
            mix(hash3(cell + vec3(0,1,0)), hash3(cell + vec3(1,1,0)), f.x), f.y),
        mix(mix(hash3(cell + vec3(0,0,1)), hash3(cell + vec3(1,0,1)), f.x),
            mix(hash3(cell + vec3(0,1,1)), hash3(cell + vec3(1,1,1)), f.x), f.y), f.z);
    }

    float mineral(vec3 p) {
      float n = noise3(p) * 0.57;
      p = p.yzx * 2.03 + vec3(7.3, 3.1, 5.7);
      n += noise3(p) * 0.29;
      return n + noise3(p.zxy * 2.07 + 4.3) * 0.14;
    }

    vec3 turnMaterial(vec3 p, float angle) {
      p.xy = turn(-0.32) * p.xy;
      p.xz = turn(angle) * p.xz;
      p.xy = turn(0.32) * p.xy;
      return p;
    }

    void main() {
      vec2 p = (vUv - 0.5) * 2.0;
      p *= uResolution / max(1.0, min(uResolution.x, uResolution.y));
      vec2 pointer = vec2(uPointer.x, -uPointer.y);
      float phase = uSeed * 2.13;

      // A small elastic deformation preserves one uninterrupted silhouette.
      // The pulse grows by at most 4%; hover distortion stays around 3%.
      vec2 q = p / (0.75 * (1.0 + 0.04 * uPulse));
      float wobble = sin(uTime * 2.8 + phase);
      q *= vec2(1.0 + 0.018 * uHover * wobble,
                1.0 - 0.016 * uHover * wobble);
      q += uHover * 0.009 * vec2(
        sin(q.y * 2.6 + uTime * 2.2 + phase),
        sin(q.x * 2.2 - uTime * 2.0 + phase)
      );
      q -= pointer * uHover * 0.008;

      float radius = length(q);
      float aa = 2.0 / max(1.0, min(uResolution.x, uResolution.y));
      float coverage = 1.0 - smoothstep(1.0 - aa, 1.0 + aa, radius);
      float z = sqrt(max(0.0, 1.0 - dot(q, q)));
      vec3 normal = normalize(vec3(q, z));

      float angle = uTime * 0.1745329252 + phase;
      float edge = pow(1.0 - normal.z, 2.8);
      vec3 neutral = vec3(mix(0.53, 0.58, uDark));
      float broad = softLight(q, vec2(-0.34, 0.52), vec2(0.39, 0.22));
      float silk = softLight(q, vec2(-0.27, 0.71), vec2(0.32, 0.065));
      float bounce = softLight(q, vec2(0.55, -0.53), vec2(0.12, 0.29));

      // Locked glass is frosted gray. It has no colored interior or starlight.
      if (uReveal < 0.001) {
        vec3 gray = neutral * (0.72 + 0.28 * z);
        gray = mix(gray, vec3(0.97), broad * 0.34 + silk * 0.32 + edge * 0.16);
        gray += bounce * 0.07;
        float opacity = (0.63 + edge * 0.16) * coverage;
        gl_FragColor = vec4(gray * opacity, opacity);
        return;
      }

      // Three refracted slices give the mineral clouds depth and parallax.
      // The interior is composited back to front, independently of the shell.
      vec3 volume = vec3(0.0);
      float opacity = 0.0;
      float envelope = smoothstep(0.0, 0.42, z);
      for (int i = 0; i < 3; i++) {
        float depth = float(i) * 0.62 - 0.62;
        vec3 samplePoint = vec3(q * (0.84 + depth * 0.08), z * depth);
        vec3 materialPoint = turnMaterial(samplePoint, angle);
        materialPoint += vec3(sin(materialPoint.y * 3.0), sin(materialPoint.z * 3.2), sin(materialPoint.x * 2.7)) * 0.16;
        float mineralSample = mineral(materialPoint * 3.4 + vec3(uSeed * 0.73, 2.1, 5.4));
        // Stronger mineral contrast keeps clear pockets between colored layers.
        float cloud = clamp((mineralSample - 0.5) * 1.55 + 0.5, 0.0, 1.0);
        float vein = pow(0.5 + 0.5 * sin(materialPoint.y * 7.0 + materialPoint.z * 4.0 + cloud * 9.0), 5.0);
        float density = smoothstep(0.27, 0.76, cloud + vein * 0.16);
        vec3 pigment = mix(uColor2, uColor0, smoothstep(0.24, 0.68, cloud));
        pigment = mix(pigment, uColor1, vein * 0.70 + density * 0.15);
        if (uStyle == 4) {
          float divide = materialPoint.x * 0.8 + materialPoint.y * 0.55 + (cloud - 0.5) * 0.7;
          pigment = mix(uColor0, uColor1, smoothstep(-0.32, 0.32, divide));
          pigment = mix(pigment, uColor2, (1.0 - density) * 0.18);
        } else if (uStyle == 5) {
          vec3 weights = exp(vec3(materialPoint.x * 3.0, materialPoint.y * -3.0, materialPoint.z * 3.0));
          pigment = (uColor0 * weights.x + uColor1 * weights.y + uColor2 * weights.z) / (weights.x + weights.y + weights.z);
        }
        pigment = clamp(pigment * (0.74 + density * 0.42 + uDark * 0.13), 0.0, 1.0);
        float layer = (0.04 + density * 0.40) * envelope;
        volume = volume * (1.0 - layer) + pigment * layer;
        opacity = opacity + layer * (1.0 - opacity);
      }

      // Embedded sparks rotate at different depths; no screen-space glitter.
      float stars = 0.0;
      float glow = 0.0;
      for (int i = 0; i < 14; i++) {
        float index = float(i);
        vec3 source = vec3(hash3(vec3(index, uSeed, 1.3)), hash3(vec3(index, uSeed, 4.7)), hash3(vec3(index, uSeed, 8.1)));
        vec3 point = (source - 0.5) * 1.24;
        point = turnMaterial(point, -angle);
        vec2 projection = point.xy * (1.0 + point.z * 0.10);
        float d = length(q - projection);
        float size = 0.008 + source.x * 0.009;
        float luminosity = (0.48 + 0.52 * smoothstep(-0.65, 0.65, point.z)) * (0.94 + 0.06 * sin(uTime * 0.7 + index));
        stars += exp(-pow(d / size, 2.0)) * luminosity;
        glow += exp(-pow(d / (size * 3.8), 2.0)) * luminosity * 0.10;
      }
      float starAlpha = clamp((stars * 0.86 + glow * 0.17) * envelope, 0.0, 0.85);
      vec3 starlight = mix(vec3(1.0, 0.985, 0.96), uColor1, 0.16);
      volume = volume * (1.0 - starAlpha) + starlight * starAlpha;
      opacity += starAlpha * (1.0 - opacity);

      // Fresnel edge and broad reflections describe a clear polished shell.
      // Actual partial alpha lets the card remain visible through the sphere.
      float rimLight = exp(-pow((radius - 0.94) / 0.025, 2.0))
                     * smoothstep(-0.15, 0.75, normal.y * 0.8 - normal.x * 0.6);
      float reflection = clamp(broad * 0.43 + silk * 0.64 + bounce * 0.40 + rimLight * 0.60, 0.0, 0.88);
      float shellAlpha = 0.12 + edge * 0.28 + reflection * 0.38;
      vec3 shell = mix(uColor0, vec3(0.91, 0.95, 0.98), 0.72);
      shell = mix(shell, vec3(1.0), reflection * 0.85 + edge * 0.28);
      volume = volume * (1.0 - shellAlpha) + shell * shellAlpha;
      opacity += shellAlpha * (1.0 - opacity);
      gl_FragColor = vec4(clamp(volume, 0.0, 1.0) * coverage, opacity * coverage);
    }
  `;

  function finite(value, fallback) {
    return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
  }

  function clamp(value, low, high) {
    return Math.max(low, Math.min(high, value));
  }

  function rgb(hex) {
    let value = typeof hex === 'string' ? hex.replace(/^#/, '') : '';
    if (/^[0-9a-f]{3}$/i.test(value)) value = value.split('').map(part => part + part).join('');
    if (!/^[0-9a-f]{6}$/i.test(value)) value = 'd8bc89';
    const integer = parseInt(value, 16);
    return [((integer >> 16) & 255) / 255, ((integer >> 8) & 255) / 255, (integer & 255) / 255];
  }

  function create(canvas, config) {
    let gl;
    try {
      gl = canvas.getContext('webgl', {
        alpha: true,
        premultipliedAlpha: true,
        depth: false,
        stencil: false,
        antialias: false,
        preserveDrawingBuffer: false,
        powerPreference: 'low-power'
      });
    } catch (_) {
      return null;
    }
    if (!gl || gl.isContextLost()) return null;
    config = config || {};
    let vertex = null;
    let fragment = null;
    let program = null;
    let buffer = null;
    let disposed = false;

    function dispose() {
      if (disposed) return;
      disposed = true;
      if (buffer) gl.deleteBuffer(buffer);
      if (program) gl.deleteProgram(program);
      if (vertex) gl.deleteShader(vertex);
      if (fragment) gl.deleteShader(fragment);
    }

    function compile(type, source) {
      const shader = gl.createShader(type);
      if (!shader) throw new Error('Unable to allocate the badge shader.');
      try {
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
          throw new Error(gl.getShaderInfoLog(shader) || 'Unable to compile the badge shader.');
        }
        return shader;
      } catch (error) {
        gl.deleteShader(shader);
        throw error;
      }
    }

    try {
      vertex = compile(gl.VERTEX_SHADER, vertexSource);
      fragment = compile(gl.FRAGMENT_SHADER, fragmentSource);
      program = gl.createProgram();
      if (!program) throw new Error('Unable to allocate the badge program.');
      gl.attachShader(program, vertex);
      gl.attachShader(program, fragment);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(program) || 'Unable to link the badge program.');
      }
      buffer = gl.createBuffer();
      if (!buffer) throw new Error('Unable to allocate the badge buffer.');
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      gl.useProgram(program);
      const position = gl.getAttribLocation(program, 'aPosition');
      if (position < 0) throw new Error('The badge vertex attribute is missing.');
      gl.enableVertexAttribArray(position);
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
      const uniforms = {};
      ['Resolution', 'Pointer', 'Time', 'Hover', 'Pulse', 'Dark', 'Reveal', 'Seed', 'Style', 'Color0', 'Color1', 'Color2']
        .forEach(name => {
          uniforms[name] = gl.getUniformLocation(program, 'u' + name);
          if (uniforms[name] === null) throw new Error('The badge uniform ' + name + ' is missing.');
        });
      const colors = Array.isArray(config.colors) ? config.colors : [];
      gl.uniform3fv(uniforms.Color0, rgb(colors[0]));
      gl.uniform3fv(uniforms.Color1, rgb(colors[1]));
      gl.uniform3fv(uniforms.Color2, rgb(colors[2]));
      gl.uniform1f(uniforms.Seed, clamp(finite(config.seed, 1), 0, 100));
      gl.uniform1i(uniforms.Style, clamp(Math.round(finite(config.style, 0)), 0, 7));
      gl.disable(gl.DEPTH_TEST);
      gl.disable(gl.BLEND);
      gl.clearColor(0, 0, 0, 0);
      const maxSize = Math.min(2048, gl.getParameter(gl.MAX_TEXTURE_SIZE));

      return {
        resize(width, height) {
          if (disposed || gl.isContextLost()) return;
          const w = clamp(Math.round(finite(width, canvas.width)), 1, maxSize);
          const h = clamp(Math.round(finite(height, canvas.height)), 1, maxSize);
          if (canvas.width !== w) canvas.width = w;
          if (canvas.height !== h) canvas.height = h;
          gl.viewport(0, 0, w, h);
        },
        render(state) {
          if (disposed || gl.isContextLost()) return;
          state = state || {};
          const reveal = clamp(finite(state.reveal, 1), 0, 1);
          const moving = !state.reduced && reveal > 0;
          const pointer = Array.isArray(state.pointer) ? state.pointer : [0, 0];
          gl.viewport(0, 0, canvas.width, canvas.height);
          gl.useProgram(program);
          gl.uniform2f(uniforms.Resolution, canvas.width, canvas.height);
          gl.uniform2f(uniforms.Pointer,
            moving ? clamp(finite(pointer[0], 0), -1, 1) : 0,
            moving ? clamp(finite(pointer[1], 0), -1, 1) : 0);
          gl.uniform1f(uniforms.Time, moving ? Math.max(0, finite(state.time, 0)) % 3600 : 0);
          gl.uniform1f(uniforms.Hover, moving ? clamp(finite(state.hover, 0), 0, 1) * reveal : 0);
          gl.uniform1f(uniforms.Pulse, moving ? clamp(finite(state.pulse, 0), 0, 1) * reveal : 0);
          gl.uniform1f(uniforms.Dark, state.dark ? 1 : 0);
          gl.uniform1f(uniforms.Reveal, reveal);
          gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        },
        dispose
      };
    } catch (_) {
      dispose();
      return null;
    }
  }

  global.SDBSolidOrb = { create };
})(window);
