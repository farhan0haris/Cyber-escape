/**
 * CRT WebGL Shader Sources
 * High-fidelity curved tube, halation, scanlines, aperture grille, chromatic aberration,
 * rolling bar, transport noise, and CRT color grading.
 */

export const CRT_VERTEX_SHADER = `
attribute vec2 a_position;
varying vec2 v_uv;

void main() {
  v_uv = (a_position + 1.0) * 0.5;
  // Flip Y for texture alignment
  v_uv.y = 1.0 - v_uv.y;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

export const CRT_FRAGMENT_SHADER = `
precision highp float;

varying vec2 v_uv;

uniform sampler2D u_screenTexture;
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_curvature;
uniform float u_scanlines;
uniform float u_grille;
uniform float u_bloom;
uniform float u_chromatic;
uniform float u_noise;
uniform float u_rollingBar;
uniform float u_flicker;
uniform float u_brightness;
uniform float u_contrast;
uniform float u_saturation;
uniform vec3 u_tint;
uniform float u_vignette;
uniform float u_motion;

// Barrel distortion / curvature
vec2 curveUV(vec2 uv, float k) {
  if (k <= 0.0) return uv;
  vec2 centered = uv * 2.0 - 1.0;
  vec2 offset = centered.yx / vec2(6.0, 4.0);
  centered += centered * offset * offset * k;
  return centered * 0.5 + 0.5;
}

// Pseudo-random noise
float hash21(vec2 p) {
  p = fract(p * vec2(234.34, 435.345));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}

void main() {
  vec2 uv = curveUV(v_uv, u_curvature);

  // Bezel cut
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    return;
  }

  // Rolling bar drift
  float roll = 0.0;
  if (u_rollingBar > 0.0 && u_motion > 0.0) {
    roll = sin(uv.y * 12.0 - u_time * 2.5) * 0.003 * u_rollingBar;
  }

  vec2 sampledUV = uv + vec2(0.0, roll);

  // Chromatic Aberration
  float ca = u_chromatic * 0.004;
  vec3 col;
  col.r = texture2D(u_screenTexture, sampledUV + vec2(-ca, 0.0)).r;
  col.g = texture2D(u_screenTexture, sampledUV).g;
  col.b = texture2D(u_screenTexture, sampledUV + vec2(ca, 0.0)).b;

  // Halation / Bloom approximation
  if (u_bloom > 0.0) {
    vec3 bloom = vec3(0.0);
    float bRadius = u_bloom * 0.003;
    bloom += texture2D(u_screenTexture, sampledUV + vec2(-bRadius, 0.0)).rgb * 0.25;
    bloom += texture2D(u_screenTexture, sampledUV + vec2(bRadius, 0.0)).rgb * 0.25;
    bloom += texture2D(u_screenTexture, sampledUV + vec2(0.0, -bRadius)).rgb * 0.25;
    bloom += texture2D(u_screenTexture, sampledUV + vec2(0.0, bRadius)).rgb * 0.25;
    col += bloom * u_bloom * 0.6;
  }

  // Scanlines
  if (u_scanlines > 0.0) {
    float scanline = sin(uv.y * u_resolution.y * 1.5) * 0.5 + 0.5;
    col *= 1.0 - (scanline * u_scanlines * 0.4);
  }

  // Aperture Grille (vertical RGB phosphors)
  if (u_grille > 0.0) {
    float x = mod(gl_FragCoord.x, 3.0);
    vec3 mask = vec3(1.0);
    if (x < 1.0) mask = vec3(1.2, 0.8, 0.8);
    else if (x < 2.0) mask = vec3(0.8, 1.2, 0.8);
    else mask = vec3(0.8, 0.8, 1.2);
    col *= mix(vec3(1.0), mask, u_grille * 0.5);
  }

  // Transport Noise & Grain
  if (u_noise > 0.0) {
    float n = hash21(uv + vec2(u_time * 0.05, u_time * 0.1));
    col += (n - 0.5) * u_noise * 0.12;
  }

  // Flicker
  if (u_flicker > 0.0 && u_motion > 0.0) {
    float flk = (sin(u_time * 60.0) + sin(u_time * 30.0)) * 0.5;
    col *= 1.0 + flk * u_flicker * 0.025;
  }

  // Vignette
  if (u_vignette > 0.0) {
    vec2 vigUV = uv * (1.0 - uv.yx);
    float vig = vigUV.x * vigUV.y * 15.0;
    vig = clamp(pow(vig, u_vignette * 0.45), 0.0, 1.0);
    col *= vig;
  }

  // Color Grade: Brightness, Contrast, Saturation & Tint
  col *= u_brightness;
  col = (col - 0.5) * u_contrast + 0.5;
  float gray = dot(col, vec3(0.299, 0.587, 0.114));
  col = mix(vec3(gray), col, u_saturation);
  col *= u_tint;

  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;
