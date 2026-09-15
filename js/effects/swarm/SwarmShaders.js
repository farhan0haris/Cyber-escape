/**
 * GLSL Shaders for Cyber Particle Swarm
 * GPU-accelerated spherical convergence, Fibonacci distribution,
 * acceleration toward core, directional stability, and cyber color mapping.
 */

export const SWARM_VERTEX_SHADER = `
precision highp float;

attribute float a_norm;
attribute float a_theta;
attribute float a_phi;
attribute float a_phase;

uniform float u_time;
uniform float u_speed;
uniform float u_chaos;
uniform float u_coreSize;
uniform float u_maxRadius;
uniform mat4 u_viewMatrix;
uniform mat4 u_projMatrix;
uniform vec2 u_viewport;
uniform float u_intensity;
uniform float u_reducedMotion;

varying vec4 v_color;
varying float v_progress;

// Helper: HSL to RGB conversion
vec3 hsl2rgb(vec3 c) {
  vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
  return c.z + c.y * (rgb - 0.5) * (1.0 - abs(2.0 * c.z - 1.0));
}

void main() {
  float speed = u_reducedMotion > 0.5 ? u_speed * 0.12 : u_speed;
  float t = u_time * speed;

  // 1. Calculate continuous inward flow toward core (~2.5x faster flow rate)
  float progress = fract(a_norm + t * 0.22 + a_phase * 0.05);

  // 2. Clear directional acceleration pulling inward toward core
  float easeProgress = pow(progress, 1.7);

  // 3. Radius calculation: from outer boundary down to core size
  float currentRadius = u_coreSize + (u_maxRadius * (1.0 - easeProgress));

  // 4. Directional stability: outer turbulence smoothly vanishes as packets accelerate into the core
  float instability = pow(1.0 - progress, 2.2);
  float chaos = u_reducedMotion > 0.5 ? 0.0 : u_chaos;

  float wobbleX = sin(u_time * 2.2 + a_norm * 90.0 + a_phase * 6.28) * chaos * instability;
  float wobbleY = cos(u_time * 1.8 + a_norm * 170.0 + a_phase * 3.14) * chaos * instability;
  float wobbleZ = sin(u_time * 2.5 - a_norm * 230.0 + a_phase * 4.71) * chaos * instability;

  // 5. Spherical Fibonacci Coordinate Assembly
  float sinPhi = sin(a_phi);
  vec3 pos = vec3(
    (currentRadius * sinPhi * cos(a_theta)) + wobbleX,
    (currentRadius * sinPhi * sin(a_theta)) + wobbleY,
    (currentRadius * cos(a_phi)) + wobbleZ
  );

  // 6. Camera Space & Projection
  vec4 viewPos = u_viewMatrix * vec4(pos, 1.0);
  gl_Position = u_projMatrix * viewPos;

  // 7. Point Size attenuation based on depth and progression
  float dist = -viewPos.z;
  float baseSize = 2.4 + progress * 2.2;
  gl_PointSize = clamp((baseSize * u_viewport.y / max(dist, 10.0)) * 0.55, 1.5, 11.0);

  // 8. Cyber Palette: Outer Cool Deep Navy/Cyan (~0.51) -> Core Energetic Cyan / Cool Violet (~0.67)
  float hue = 0.51 + (0.16 * progress);
  float sat = 0.88 + (0.12 * progress);

  // Subtle core pulse on terminal convergence
  float corePulse = 0.0;
  if (progress > 0.93 && u_reducedMotion < 0.5) {
    corePulse = sin(u_time * 8.0 + a_phase * 6.28) * 0.18;
  }

  float lightness = 0.22 + (0.55 * progress) + corePulse;
  vec3 rgb = hsl2rgb(vec3(hue, sat, clamp(lightness, 0.0, 1.0)));

  // Smooth entry and exit fading to prevent pops
  float alpha = smoothstep(0.0, 0.08, progress) * smoothstep(1.0, 0.94, progress) * u_intensity;
  alpha *= clamp(0.3 + 0.7 * progress, 0.0, 1.0);

  v_color = vec4(rgb, alpha);
  v_progress = progress;
}
`;

export const SWARM_FRAGMENT_SHADER = `
precision mediump float;

varying vec4 v_color;
varying float v_progress;

void main() {
  // Soft circular particle with illuminated cyber core
  vec2 coord = gl_PointCoord - vec2(0.5);
  float dist = length(coord);
  if (dist > 0.5) discard;

  float softness = smoothstep(0.5, 0.05, dist);
  float coreGlow = smoothstep(0.18, 0.0, dist) * 0.45;

  float finalAlpha = v_color.a * (softness + coreGlow);
  gl_FragColor = vec4(v_color.rgb * finalAlpha, finalAlpha);
}
`;
