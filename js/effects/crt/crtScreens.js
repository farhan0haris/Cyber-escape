/**
 * Authored CRT Screen Generators
 * Renders high-fidelity screen buffers onto offscreen 2D canvas:
 * 1. Terminal (Cyber Matrix surveillance & telemetry logs)
 * 2. Cinematic (Wide-angle schematic sector radar & waveform vectors)
 * 3. Blue Screen (Authentic BSOD memory diagnostic fault dump)
 * 4. Nintendo (Retro 8-bit cyber grid pixel font landscape)
 */

export const CRT_SCREENS = Object.freeze({
  TERMINAL: 'terminal',
  CINEMATIC: 'cinematic',
  BLUE_SCREEN: 'blue_screen',
  NINTENDO: 'nintendo'
});

// Authored 5x7 Pixel Font Matrix for retro pixel rendering
const FONT_5X7 = {
  'A': [0x0E, 0x11, 0x11, 0x1F, 0x11, 0x11, 0x11],
  'B': [0x1E, 0x11, 0x11, 0x1E, 0x11, 0x11, 0x1E],
  'C': [0x0E, 0x11, 0x10, 0x10, 0x10, 0x11, 0x0E],
  'D': [0x1C, 0x12, 0x11, 0x11, 0x11, 0x12, 0x1C],
  'E': [0x1F, 0x10, 0x10, 0x1E, 0x10, 0x10, 0x1F],
  'F': [0x1F, 0x10, 0x10, 0x1E, 0x10, 0x10, 0x10],
  'G': [0x0E, 0x11, 0x10, 0x17, 0x11, 0x11, 0x0F],
  'H': [0x11, 0x11, 0x11, 0x1F, 0x11, 0x11, 0x11],
  'I': [0x0E, 0x04, 0x04, 0x04, 0x04, 0x04, 0x0E],
  'J': [0x07, 0x02, 0x02, 0x02, 0x02, 0x12, 0x0C],
  'K': [0x11, 0x12, 0x14, 0x18, 0x14, 0x12, 0x11],
  'L': [0x10, 0x10, 0x10, 0x10, 0x10, 0x10, 0x1F],
  'M': [0x11, 0x1B, 0x15, 0x11, 0x11, 0x11, 0x11],
  'N': [0x11, 0x19, 0x15, 0x13, 0x11, 0x11, 0x11],
  'O': [0x0E, 0x11, 0x11, 0x11, 0x11, 0x11, 0x0E],
  'P': [0x1E, 0x11, 0x11, 0x1E, 0x10, 0x10, 0x10],
  'Q': [0x0E, 0x11, 0x11, 0x11, 0x15, 0x12, 0x0D],
  'R': [0x1E, 0x11, 0x11, 0x1E, 0x14, 0x12, 0x11],
  'S': [0x0E, 0x11, 0x10, 0x0E, 0x01, 0x11, 0x0E],
  'T': [0x1F, 0x04, 0x04, 0x04, 0x04, 0x04, 0x04],
  'U': [0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x0E],
  'V': [0x11, 0x11, 0x11, 0x11, 0x11, 0x0A, 0x04],
  'W': [0x11, 0x11, 0x11, 0x15, 0x15, 0x1B, 0x11],
  'X': [0x11, 0x11, 0x0A, 0x04, 0x0A, 0x11, 0x11],
  'Y': [0x11, 0x11, 0x0A, 0x04, 0x04, 0x04, 0x04],
  'Z': [0x1F, 0x01, 0x02, 0x04, 0x08, 0x10, 0x1F],
  '0': [0x0E, 0x13, 0x15, 0x19, 0x11, 0x11, 0x0E],
  '1': [0x04, 0x0C, 0x04, 0x04, 0x04, 0x04, 0x0E],
  '2': [0x0E, 0x11, 0x01, 0x06, 0x08, 0x10, 0x1F],
  '3': [0x1F, 0x02, 0x04, 0x06, 0x01, 0x11, 0x0E],
  '4': [0x02, 0x06, 0x0A, 0x12, 0x1F, 0x02, 0x02],
  '5': [0x1F, 0x10, 0x1E, 0x01, 0x01, 0x11, 0x0E],
  '6': [0x06, 0x08, 0x10, 0x1E, 0x11, 0x11, 0x0E],
  '7': [0x1F, 0x01, 0x02, 0x04, 0x08, 0x08, 0x08],
  '8': [0x0E, 0x11, 0x11, 0x0E, 0x11, 0x11, 0x0E],
  '9': [0x0E, 0x11, 0x11, 0x0F, 0x01, 0x02, 0x0C],
  ':': [0x00, 0x04, 0x00, 0x00, 0x04, 0x00, 0x00],
  '-': [0x00, 0x00, 0x00, 0x1F, 0x00, 0x00, 0x00],
  '_': [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x1F],
  '.': [0x00, 0x00, 0x00, 0x00, 0x00, 0x04, 0x04],
  '[': [0x0E, 0x08, 0x08, 0x08, 0x08, 0x08, 0x0E],
  ']': [0x0E, 0x02, 0x02, 0x02, 0x02, 0x02, 0x0E],
  '>': [0x10, 0x08, 0x04, 0x02, 0x04, 0x08, 0x10],
  ' ': [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]
};

export class CrtScreenGenerator {
  constructor(offscreenCanvas) {
    this.canvas = offscreenCanvas;
    this.ctx = offscreenCanvas ? offscreenCanvas.getContext('2d') : null;
    this.animFrame = 0;
    this.logHistory = [];
    this._initLogs();
  }

  _initLogs() {
    this.logHistory = [
      '> [SEC_NET] Loopback authenticated on enclave port 0x7F.',
      '> [CONTAINMENT] Quantum cryptographic sandbox: ACTIVE.',
      '> [ROUTING] 5 security sub-sectors initialized.',
      '> [TELEMETRY] Watchdog heartbeat nominal at 60.00 FPS.',
      '> [OVERRIDE] Awaiting authorized operator input...'
    ];
  }

  /**
   * Render screen content onto the offscreen canvas
   * @param {string} variant 'terminal' | 'cinematic' | 'blue_screen' | 'nintendo'
   * @param {number} time Time in seconds
   * @param {boolean} reducedMotion
   */
  render(variant, time = 0, reducedMotion = false) {
    if (!this.ctx || !this.canvas) return;
    const { width, height } = this.canvas;
    const ctx = this.ctx;

    ctx.save();
    ctx.clearRect(0, 0, width, height);

    switch (variant) {
      case CRT_SCREENS.TERMINAL:
        this._renderTerminal(ctx, width, height, time, reducedMotion);
        break;
      case CRT_SCREENS.CINEMATIC:
        this._renderCinematic(ctx, width, height, time, reducedMotion);
        break;
      case CRT_SCREENS.BLUE_SCREEN:
        this._renderBlueScreen(ctx, width, height, time, reducedMotion);
        break;
      case CRT_SCREENS.NINTENDO:
        this._renderNintendo(ctx, width, height, time, reducedMotion);
        break;
      default:
        this._renderTerminal(ctx, width, height, time, reducedMotion);
        break;
    }

    ctx.restore();
  }

  /* --------------------------------------------------------------------------
      1. TERMINAL VARIANT (Cyber Matrix Security Environment — Quiet & Authored)
     -------------------------------------------------------------------------- */
  _renderTerminal(ctx, width, height, time, reducedMotion) {
    // Deep phosphor background
    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, width, height);

    // CRT Top Status Banner (Faint & technical)
    ctx.fillStyle = 'rgba(0, 210, 255, 0.45)';
    ctx.font = '10px monospace';
    ctx.fillText('CYBER ESCAPE // ENCLAVE MONITOR', 24, 22);

    ctx.fillStyle = 'rgba(0, 229, 153, 0.4)';
    ctx.font = '9px monospace';
    ctx.fillText('SIGNAL // NOMINAL', width - 140, 22);

    ctx.fillStyle = 'rgba(0, 210, 255, 0.12)';
    ctx.fillRect(20, 28, width - 40, 1);

    // Peripheral Margin Calculations
    const marginW = Math.max(90, Math.floor((width - 500) / 2));

    // Left Peripheral Telemetry Rail (Sparse authored cyber signals)
    const leftX = 24;
    ctx.strokeStyle = 'rgba(0, 210, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(leftX, 40);
    ctx.lineTo(leftX, height - 30);
    ctx.stroke();

    const leftSignals = [
      'SECURE CHANNEL // 05',
      'PACKET FLOW // ACTIVE',
      'NODE 04 // STABLE',
      'ROOT SIGNAL // SYNC',
      'ENCRYPTION // AES-256'
    ];

    ctx.font = '9px monospace';
    leftSignals.forEach((sig, idx) => {
      const y = 60 + idx * 42;
      if (y < height - 40) {
        // Dot indicator
        ctx.fillStyle = (idx === 1) ? 'rgba(0, 229, 153, 0.5)' : 'rgba(0, 210, 255, 0.35)';
        ctx.fillRect(leftX - 3, y - 4, 6, 2);

        ctx.fillStyle = 'rgba(148, 163, 184, 0.35)';
        ctx.fillText(sig, leftX + 12, y);
      }
    });

    // Right Peripheral Telemetry Rail (Signal bars & network telemetry)
    if (width > 640) {
      const rightX = width - 24;
      ctx.strokeStyle = 'rgba(0, 210, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(rightX, 40);
      ctx.lineTo(rightX, height - 30);
      ctx.stroke();

      const rightSignals = [
        'BUFFER // 100Gbps',
        'LATENCY // 0.12ms',
        'CLEARANCE // ROOT',
        'WATCHDOG // ARMED'
      ];

      rightSignals.forEach((sig, idx) => {
        const y = 60 + idx * 42;
        if (y < height - 40) {
          ctx.fillStyle = 'rgba(0, 210, 255, 0.35)';
          ctx.fillRect(rightX - 3, y - 4, 6, 2);

          ctx.fillStyle = 'rgba(148, 163, 184, 0.35)';
          const textW = ctx.measureText(sig).width;
          ctx.fillText(sig, rightX - textW - 12, y);
        }
      });
    }

    // Bottom Subtle Hairline Rule
    ctx.fillStyle = 'rgba(0, 210, 255, 0.10)';
    ctx.fillRect(20, height - 24, width - 40, 1);

    // Center Calm Zone Framing Marks (Very faint corner alignment crosses)
    const centerX = 20 + marginW;
    const centerW = width - (marginW * 2) - 40;
    const boxY = 40;
    const boxH = height - 70;

    ctx.strokeStyle = 'rgba(0, 210, 255, 0.15)';
    ctx.lineWidth = 1;
    const cSize = 6;

    // Center Top-Left Cross
    ctx.beginPath();
    ctx.moveTo(centerX - cSize, boxY);
    ctx.lineTo(centerX + cSize, boxY);
    ctx.moveTo(centerX, boxY - cSize);
    ctx.lineTo(centerX, boxY + cSize);
    ctx.stroke();

    // Center Top-Right Cross
    ctx.beginPath();
    ctx.moveTo(centerX + centerW - cSize, boxY);
    ctx.lineTo(centerX + centerW + cSize, boxY);
    ctx.moveTo(centerX + centerW, boxY - cSize);
    ctx.lineTo(centerX + centerW, boxY + cSize);
    ctx.stroke();

    // Center Bottom-Left Cross
    ctx.beginPath();
    ctx.moveTo(centerX - cSize, boxY + boxH);
    ctx.lineTo(centerX + cSize, boxY + boxH);
    ctx.moveTo(centerX, boxY + boxH - cSize);
    ctx.lineTo(centerX, boxY + boxH + cSize);
    ctx.stroke();

    // Center Bottom-Right Cross
    ctx.beginPath();
    ctx.moveTo(centerX + centerW - cSize, boxY + boxH);
    ctx.lineTo(centerX + centerW + cSize, boxY + boxH);
    ctx.moveTo(centerX + centerW, boxY + boxH - cSize);
    ctx.lineTo(centerX + centerW, boxY + boxH + cSize);
    ctx.stroke();
  }

  /* --------------------------------------------------------------------------
     2. CINEMATIC VARIANT (Schematic Sector Radar & Waveform Vectors)
     -------------------------------------------------------------------------- */
  _renderCinematic(ctx, width, height, time, reducedMotion) {
    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, width, height);

    const cx = width / 2;
    const cy = height / 2;

    // Top Header & Coordinates
    ctx.fillStyle = '#00e599';
    ctx.font = '11px monospace';
    ctx.fillText('SECTOR TOPOLOGY SCANNER // SECTOR_MAP_01_05', 20, 24);
    ctx.fillStyle = '#546a85';
    ctx.fillText(`FREQ: 440.00 MHz  |  SYNC_LATENCY: 0.12ms  |  AZIMUTH: ${Math.floor((time * 45) % 360)}°`, 20, 40);

    // Radar Concentric Circles
    ctx.strokeStyle = 'rgba(0, 229, 153, 0.25)';
    ctx.lineWidth = 1;
    [40, 80, 120, 160].forEach(r => {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Crosshairs
    ctx.beginPath();
    ctx.moveTo(cx - 180, cy);
    ctx.lineTo(cx + 180, cy);
    ctx.moveTo(cx, cy - 140);
    ctx.lineTo(cx, cy + 140);
    ctx.stroke();

    // Rotating Radar Sweep Needle
    const angle = reducedMotion ? 0.75 : time * 1.5;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.strokeStyle = '#00e599';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(160, 0);
    ctx.stroke();
    ctx.restore();

    // Bottom Sine Waveform Feed
    ctx.strokeStyle = '#00d2ff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    const waveY = height - 35;
    const waveW = width - 40;
    for (let x = 0; x < waveW; x += 4) {
      const y = waveY + Math.sin((x * 0.05) + (time * 4)) * 14;
      if (x === 0) ctx.moveTo(20 + x, y);
      else ctx.lineTo(20 + x, y);
    }
    ctx.stroke();
  }

  /* --------------------------------------------------------------------------
     3. BLUE SCREEN VARIANT (Authentic BSOD Kernel Fault Diagnostic)
     -------------------------------------------------------------------------- */
  _renderBlueScreen(ctx, width, height, time, reducedMotion) {
    ctx.fillStyle = '#000082';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px monospace';
    ctx.fillText('*** STOP: 0x0000007F (0x00000008, 0x80042000, 0x00000000)', 30, 40);

    ctx.font = '12px monospace';
    const lines = [
      'A fatal exception has occurred at SECTOR_05::ROOT_KERNEL_OVERRIDE.',
      'The current security session was suspended to prevent permanent core lockout.',
      '',
      'TECHNICAL INFORMATION:',
      '*** SEC_SANDBOX.SYS - Address F7A2B000 base at F7A00000 DateStamp 5F8D2E14',
      '*** REASON: CONTAINMENT_INTEGRITY_DEPLETED // LIFE_COUNT = 0x00',
      '',
      'Beginning dump of physical memory...',
      'Physical memory dump complete. Check operator terminal to execute retry.'
    ];

    lines.forEach((line, idx) => {
      ctx.fillText(line, 30, 75 + idx * 18);
    });

    // Prompt
    ctx.fillText('Press any key or click [RETRY MISSION] to re-initialize sandbox...', 30, height - 30);
  }

  /* --------------------------------------------------------------------------
     4. NINTENDO VARIANT (Retro 8-Bit Pixel Font & Grid Landscape)
     -------------------------------------------------------------------------- */
  _renderNintendo(ctx, width, height, time, reducedMotion) {
    ctx.fillStyle = '#0f380f'; // Game Boy / Famicom deep green
    ctx.fillRect(0, 0, width, height);

    // Pixel Grid Horizon
    ctx.strokeStyle = '#306230';
    ctx.lineWidth = 1;
    for (let y = height / 2; y < height; y += 12) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw Authored 5x7 Pixel Font Strings
    this._drawPixelString(ctx, 'CYBER ESCAPE', 40, 50, 4, '#9bbc0f');
    this._drawPixelString(ctx, 'ROOT KERNEL V 1.0', 40, 95, 2, '#8bac0f');
    this._drawPixelString(ctx, 'PLAYER 1 READY', 40, 130, 2, '#9bbc0f');
  }

  _drawPixelString(ctx, text, startX, startY, scale, color) {
    ctx.fillStyle = color;
    let curX = startX;
    const upper = text.toUpperCase();

    for (let i = 0; i < upper.length; i++) {
      const char = upper[i];
      const bitmap = FONT_5X7[char] || FONT_5X7[' '];

      for (let r = 0; r < 7; r++) {
        const rowByte = bitmap[r] || 0;
        for (let c = 0; c < 5; c++) {
          if ((rowByte >> (4 - c)) & 1) {
            ctx.fillRect(curX + c * scale, startY + r * scale, scale, scale);
          }
        }
      }
      curX += 6 * scale; // 5 width + 1 spacing
    }
  }
}
