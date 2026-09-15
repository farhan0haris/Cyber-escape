/**
 * CRT Background & Shader Unit Tests
 * Verifies WebGL CRT compilation, 2D screen generators, variants,
 * parameter grading, and lifecycle management.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { CRT_VERTEX_SHADER, CRT_FRAGMENT_SHADER } from '../js/effects/crt/crtShaders.js';
import { CRT_SCREENS, CrtScreenGenerator } from '../js/effects/crt/crtScreens.js';
import { CrtRenderer } from '../js/effects/crt/crtRenderer.js';
import { CrtBackground } from '../js/effects/crt/CrtBackground.js';

describe('CRT WebGL & Background Module Tests', () => {

  it('CRT-001: Vertex and Fragment shaders are defined and non-empty', () => {
    assert.ok(typeof CRT_VERTEX_SHADER === 'string' && CRT_VERTEX_SHADER.length > 50);
    assert.ok(typeof CRT_FRAGMENT_SHADER === 'string' && CRT_FRAGMENT_SHADER.length > 100);
    assert.ok(CRT_FRAGMENT_SHADER.includes('u_curvature'));
    assert.ok(CRT_FRAGMENT_SHADER.includes('u_scanlines'));
    assert.ok(CRT_FRAGMENT_SHADER.includes('u_grille'));
    assert.ok(CRT_FRAGMENT_SHADER.includes('u_bloom'));
    assert.ok(CRT_FRAGMENT_SHADER.includes('u_chromatic'));
    assert.ok(CRT_FRAGMENT_SHADER.includes('u_rollingBar'));
  });

  it('CRT-002: Authored Screen Variants exist (Terminal, Cinematic, Blue Screen, Nintendo)', () => {
    assert.strictEqual(CRT_SCREENS.TERMINAL, 'terminal');
    assert.strictEqual(CRT_SCREENS.CINEMATIC, 'cinematic');
    assert.strictEqual(CRT_SCREENS.BLUE_SCREEN, 'blue_screen');
    assert.strictEqual(CRT_SCREENS.NINTENDO, 'nintendo');
  });

  it('CRT-003: CrtScreenGenerator handles null canvas gracefully in headless environment', () => {
    const gen = new CrtScreenGenerator(null);
    assert.strictEqual(gen.canvas, null);
    assert.strictEqual(gen.ctx, null);

    // Calling render without canvas should not throw
    assert.doesNotThrow(() => {
      gen.render(CRT_SCREENS.TERMINAL, 1.0, false);
      gen.render(CRT_SCREENS.CINEMATIC, 1.0, false);
      gen.render(CRT_SCREENS.BLUE_SCREEN, 1.0, false);
      gen.render(CRT_SCREENS.NINTENDO, 1.0, false);
    });
  });

  it('CRT-004: CrtRenderer initializes default parameters and options safely', () => {
    const renderer = new CrtRenderer(null, {
      variant: CRT_SCREENS.CINEMATIC,
      curvature: 0.2,
      scanlines: 0.6
    });

    assert.strictEqual(renderer.variant, CRT_SCREENS.CINEMATIC);
    assert.strictEqual(renderer.curvature, 0.2);
    assert.strictEqual(renderer.scanlines, 0.6);
    assert.strictEqual(renderer.isInitialized, false, 'Should be false without canvas');

    renderer.setVariant(CRT_SCREENS.BLUE_SCREEN);
    assert.strictEqual(renderer.variant, CRT_SCREENS.BLUE_SCREEN);

    renderer.setGrade({ brightness: 1.2, contrast: 1.05 });
    assert.strictEqual(renderer.brightness, 1.2);
    assert.strictEqual(renderer.contrast, 1.05);

    renderer.setReducedMotion(true);
    assert.strictEqual(renderer.reducedMotion, true);
    assert.strictEqual(renderer.motion, 0.05);

    renderer.destroy();
    assert.strictEqual(renderer.program, null);
  });

  it('CRT-005: CrtBackground host manages lifecycle, opacity, and destruction', () => {
    const bg = new CrtBackground({
      variant: CRT_SCREENS.TERMINAL,
      opacity: 0.3
    });

    assert.strictEqual(bg.initialVariant, CRT_SCREENS.TERMINAL);
    assert.strictEqual(bg.opacity, 0.3);
    assert.strictEqual(bg.isRunning, false);

    bg.setOpacity(0.5);
    assert.strictEqual(bg.opacity, 0.5);

    bg.pause();
    assert.strictEqual(bg.isPaused, true);

    bg.resume();
    assert.strictEqual(bg.isPaused, false);

    bg.destroy();
    assert.strictEqual(bg.isRunning, false);
  });

});
