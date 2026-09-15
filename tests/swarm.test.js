/**
 * Swarm Particle Background & WebGL Shader Unit Tests
 * Verifies WebGL Swarm compilation, Fibonacci spherical distribution,
 * adaptive particle budgets, and lifecycle management.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { SWARM_VERTEX_SHADER, SWARM_FRAGMENT_SHADER } from '../js/effects/swarm/SwarmShaders.js';
import { SwarmRenderer } from '../js/effects/swarm/SwarmRenderer.js';
import { SwarmBackground } from '../js/effects/swarm/SwarmBackground.js';

describe('Swarm WebGL & Background Module Tests', () => {

  it('SWARM-001: Vertex and Fragment shaders are defined and non-empty', () => {
    assert.ok(typeof SWARM_VERTEX_SHADER === 'string' && SWARM_VERTEX_SHADER.length > 50);
    assert.ok(typeof SWARM_FRAGMENT_SHADER === 'string' && SWARM_FRAGMENT_SHADER.length > 50);
    assert.ok(SWARM_VERTEX_SHADER.includes('a_norm'));
    assert.ok(SWARM_VERTEX_SHADER.includes('a_theta'));
    assert.ok(SWARM_VERTEX_SHADER.includes('a_phi'));
    assert.ok(SWARM_VERTEX_SHADER.includes('u_coreSize'));
    assert.ok(SWARM_VERTEX_SHADER.includes('u_maxRadius'));
    assert.ok(SWARM_VERTEX_SHADER.includes('wobbleX'));
    assert.ok(SWARM_VERTEX_SHADER.includes('hsl2rgb'));
  });

  it('SWARM-002: Fibonacci distribution calculation produces valid coordinates', () => {
    const count = 100;
    const goldenRatio = (1.0 + Math.sqrt(5.0)) / 2.0;

    for (let i = 0; i < count; i++) {
      const norm = i / count;
      const theta = (2.0 * Math.PI * i) / goldenRatio;
      const phi = Math.acos(Math.max(-1.0, Math.min(1.0, 1.0 - 2.0 * norm)));

      assert.ok(!Number.isNaN(theta), `Theta for index ${i} must be valid`);
      assert.ok(!Number.isNaN(phi), `Phi for index ${i} must be valid`);
      assert.ok(phi >= 0 && phi <= Math.PI, `Phi for index ${i} must be in [0, PI] range`);
    }
  });

  it('SWARM-003: Adaptive particle budgeting scales appropriately across device classes', () => {
    const renderer = new SwarmRenderer(null, { speed: 0.35 });

    // Desktop
    assert.strictEqual(renderer.getAdaptiveParticleCount(1440), 8500);
    assert.strictEqual(renderer.getAdaptiveParticleCount(1920), 8500);

    // Tablet
    assert.strictEqual(renderer.getAdaptiveParticleCount(768), 4800);
    assert.strictEqual(renderer.getAdaptiveParticleCount(1024), 4800);

    // Mobile
    assert.strictEqual(renderer.getAdaptiveParticleCount(390), 2200);
    assert.strictEqual(renderer.getAdaptiveParticleCount(412), 2200);

    // Reduced Motion
    renderer.setReducedMotion(true);
    assert.strictEqual(renderer.getAdaptiveParticleCount(1920), 800);
    assert.strictEqual(renderer.getAdaptiveParticleCount(390), 800);
  });

  it('SWARM-004: SwarmRenderer handles null canvas gracefully in headless environment', () => {
    const renderer = new SwarmRenderer(null, {
      speed: 0.4,
      chaos: 20.0,
      coreSize: 10.0
    });

    assert.strictEqual(renderer.canvas, null);
    assert.strictEqual(renderer.gl, null);
    assert.strictEqual(renderer.isInitialized, false);

    assert.doesNotThrow(() => {
      renderer.render(1.5);
      renderer.resize(1280, 720);
      renderer.setIntensity(0.5);
      renderer.destroy();
    });
  });

  it('SWARM-005: SwarmBackground host manages lifecycle, opacity, and destruction', () => {
    const bg = new SwarmBackground({
      opacity: 0.65
    });

    assert.strictEqual(bg.opacity, 0.65);
    assert.strictEqual(bg.isRunning, false);

    bg.setOpacity(0.8);
    assert.strictEqual(bg.opacity, 0.8);

    bg.pause();
    assert.strictEqual(bg.isPaused, true);

    bg.resume();
    assert.strictEqual(bg.isPaused, false);

    // Zero opacity automatically pauses render
    bg.setOpacity(0.0);
    assert.strictEqual(bg.isPaused, true);

    bg.destroy();
    assert.strictEqual(bg.isRunning, false);
  });

});
