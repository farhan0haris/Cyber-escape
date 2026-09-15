/**
 * Level 4: Firewall Dodge / Packet Inspection Corridor — Data & Variant Definitions
 * 
 * Defines 5 hand-authored hazard course variants with multi-lane topologies,
 * 4-state deterministic hazard models, safe zones, and checkpoint definitions.
 */

export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 450;

export const ZONE_BOUNDS = Object.freeze({
  START_ZONE_MAX_X: 80,
  CHECKPOINT_MIN_X: 380,
  CHECKPOINT_MAX_X: 420,
  GOAL_ZONE_MIN_X: 720,
  GOAL_TRIGGER_X: 730
});

export const SPAWN_POSITION = Object.freeze({ x: 40, y: 225 });
export const CHECKPOINT_POSITION = Object.freeze({ x: 400, y: 225 });

/**
 * 5 Authored Variants for Sector 04
 */
export const LEVEL4_VARIANTS = Object.freeze([
  {
    id: 'v1_timing_gates',
    name: 'SECTOR 04-A // TIMING GATES',
    description: 'Rhythmic firewall gate barriers with predictable cycle patterns across 3 conduit lanes.',
    theme: 'gates',
    hazards: [
      // Sector 1 (x: 80 -> 380px)
      {
        id: 'h1_gate_top',
        type: 'barrier_pulse',
        x: 180,
        y: 20,
        width: 16,
        height: 180,
        lane: 'TOP',
        cycle: { safe: 2.2, warning: 0.8, active: 1.4, cooldown: 0.6 },
        offset: 0.0
      },
      {
        id: 'h2_gate_bot',
        type: 'barrier_pulse',
        x: 180,
        y: 250,
        width: 16,
        height: 180,
        lane: 'BOTTOM',
        cycle: { safe: 2.2, warning: 0.8, active: 1.4, cooldown: 0.6 },
        offset: 2.5 // Inverted cycle to guarantee one open lane
      },
      {
        id: 'h3_gate_mid',
        type: 'barrier_pulse',
        x: 290,
        y: 135,
        width: 16,
        height: 180,
        lane: 'MIDDLE',
        cycle: { safe: 2.4, warning: 0.8, active: 1.2, cooldown: 0.6 },
        offset: 1.2
      },

      // Sector 2 (x: 420 -> 720px)
      {
        id: 'h4_gate_split_top',
        type: 'barrier_pulse',
        x: 520,
        y: 30,
        width: 16,
        height: 170,
        lane: 'TOP',
        cycle: { safe: 1.8, warning: 0.7, active: 1.3, cooldown: 0.5 },
        offset: 0.5
      },
      {
        id: 'h5_gate_split_bot',
        type: 'barrier_pulse',
        x: 520,
        y: 250,
        width: 16,
        height: 170,
        lane: 'BOTTOM',
        cycle: { safe: 1.8, warning: 0.7, active: 1.3, cooldown: 0.5 },
        offset: 2.2
      },
      {
        id: 'h6_gate_final_mid',
        type: 'barrier_pulse',
        x: 640,
        y: 110,
        width: 18,
        height: 230,
        lane: 'MIDDLE',
        cycle: { safe: 2.0, warning: 0.8, active: 1.4, cooldown: 0.6 },
        offset: 1.0
      }
    ]
  },
  {
    id: 'v2_patrol_drones',
    name: 'SECTOR 04-B // PATROL SENTINELS',
    description: 'Autonomous packet scrubber drones patrolling fixed vertical waypoint tracks.',
    theme: 'drones',
    hazards: [
      // Sector 1 (x: 80 -> 380px)
      {
        id: 'h1_drone_v1',
        type: 'drone_patrol',
        x: 160,
        yStart: 40,
        yEnd: 410,
        radius: 14,
        speed: 130,
        lane: 'CROSS_VERTICAL',
        offset: 0.0
      },
      {
        id: 'h2_drone_v2',
        type: 'drone_patrol',
        x: 270,
        yStart: 410,
        yEnd: 40,
        radius: 14,
        speed: 140,
        lane: 'CROSS_VERTICAL',
        offset: 0.8
      },
      {
        id: 'h3_drone_mid_pulse',
        type: 'barrier_pulse',
        x: 320,
        y: 160,
        width: 14,
        height: 130,
        lane: 'MIDDLE',
        cycle: { safe: 2.2, warning: 0.8, active: 1.2, cooldown: 0.5 },
        offset: 1.5
      },

      // Sector 2 (x: 420 -> 720px)
      {
        id: 'h4_drone_v3',
        type: 'drone_patrol',
        x: 490,
        yStart: 30,
        yEnd: 420,
        radius: 14,
        speed: 160,
        lane: 'CROSS_VERTICAL',
        offset: 0.3
      },
      {
        id: 'h5_drone_v4',
        type: 'drone_patrol',
        x: 580,
        yStart: 420,
        yEnd: 30,
        radius: 14,
        speed: 160,
        lane: 'CROSS_VERTICAL',
        offset: 1.4
      },
      {
        id: 'h6_drone_final_guard',
        type: 'drone_patrol',
        x: 670,
        yStart: 80,
        yEnd: 370,
        radius: 16,
        speed: 180,
        lane: 'CROSS_VERTICAL',
        offset: 0.0
      }
    ]
  },
  {
    id: 'v3_crossfire_beams',
    name: 'SECTOR 04-C // CROSSFIRE LASERS',
    description: 'Harmonically sweeping laser beams creating oscillating safe pockets across upper and lower lanes.',
    theme: 'lasers',
    hazards: [
      // Sector 1 (x: 80 -> 380px)
      {
        id: 'h1_beam_sweep_1',
        type: 'beam_vertical',
        x: 170,
        height: 300,
        amplitude: 60,
        frequency: 0.7,
        beamWidth: 10,
        lane: 'TOP_MID',
        offset: 0.0
      },
      {
        id: 'h2_beam_sweep_2',
        type: 'beam_vertical',
        x: 280,
        height: 300,
        amplitude: 60,
        frequency: 0.7,
        beamWidth: 10,
        lane: 'BOT_MID',
        offset: Math.PI
      },

      // Sector 2 (x: 420 -> 720px)
      {
        id: 'h3_cross_laser_a',
        type: 'beam_vertical',
        x: 480,
        height: 320,
        amplitude: 55,
        frequency: 0.85,
        beamWidth: 10,
        lane: 'CROSS_SWEEP',
        offset: 0.4
      },
      {
        id: 'h4_cross_laser_b',
        type: 'beam_vertical',
        x: 570,
        height: 320,
        amplitude: 55,
        frequency: 0.85,
        beamWidth: 10,
        lane: 'CROSS_SWEEP',
        offset: 0.4 + Math.PI
      },
      {
        id: 'h5_exit_laser_final',
        type: 'beam_vertical',
        x: 660,
        height: 340,
        amplitude: 45,
        frequency: 1.0,
        beamWidth: 12,
        lane: 'FINAL_SWEEP',
        offset: 1.2
      }
    ]
  },
  {
    id: 'v4_packet_storms',
    name: 'SECTOR 04-D // PACKET STORM',
    description: 'High-density packet inspection streams traversing vertical conduit lanes.',
    theme: 'storms',
    hazards: [
      // Sector 1 (x: 80 -> 380px)
      {
        id: 'h1_storm_lane_1',
        type: 'burst_stream',
        x: 170,
        direction: 'DOWN',
        speed: 260,
        packetSize: 14,
        packetCount: 3,
        lane: 'LANE_1',
        cycle: { warning: 0.9, active: 1.4, cooldown: 1.8 },
        offset: 0.0
      },
      {
        id: 'h2_storm_lane_2',
        type: 'burst_stream',
        x: 280,
        direction: 'UP',
        speed: 260,
        packetSize: 14,
        packetCount: 3,
        lane: 'LANE_2',
        cycle: { warning: 0.9, active: 1.4, cooldown: 1.8 },
        offset: 1.6
      },

      // Sector 2 (x: 420 -> 720px)
      {
        id: 'h3_storm_lane_3',
        type: 'burst_stream',
        x: 490,
        direction: 'DOWN',
        speed: 280,
        packetSize: 14,
        packetCount: 3,
        lane: 'LANE_3',
        cycle: { warning: 0.8, active: 1.3, cooldown: 1.6 },
        offset: 0.4
      },
      {
        id: 'h4_storm_lane_4',
        type: 'burst_stream',
        x: 580,
        direction: 'UP',
        speed: 280,
        packetSize: 14,
        packetCount: 3,
        lane: 'LANE_4',
        cycle: { warning: 0.8, active: 1.3, cooldown: 1.6 },
        offset: 1.8
      },
      {
        id: 'h5_storm_lane_5',
        type: 'burst_stream',
        x: 660,
        direction: 'DOWN',
        speed: 300,
        packetSize: 15,
        packetCount: 4,
        lane: 'LANE_5',
        cycle: { warning: 0.75, active: 1.4, cooldown: 1.5 },
        offset: 0.9
      }
    ]
  },
  {
    id: 'v5_master_gauntlet',
    name: 'SECTOR 04-E // DEEP INSPECTION GAUNTLET',
    description: 'Master defense grid combining coordinated pulse barriers, harmonic sweeps, and patrol drones.',
    theme: 'gauntlet',
    hazards: [
      // Sector 1 (x: 80 -> 380px)
      {
        id: 'h1_g_pulse_top',
        type: 'barrier_pulse',
        x: 160,
        y: 20,
        width: 16,
        height: 190,
        lane: 'TOP',
        cycle: { safe: 2.2, warning: 0.8, active: 1.4, cooldown: 0.6 },
        offset: 0.0
      },
      {
        id: 'h2_g_pulse_bot',
        type: 'barrier_pulse',
        x: 160,
        y: 240,
        width: 16,
        height: 190,
        lane: 'BOTTOM',
        cycle: { safe: 2.2, warning: 0.8, active: 1.4, cooldown: 0.6 },
        offset: 2.4
      },
      {
        id: 'h3_g_drone_mid',
        type: 'drone_patrol',
        x: 270,
        yStart: 60,
        yEnd: 390,
        radius: 14,
        speed: 150,
        lane: 'CROSS_VERTICAL',
        offset: 1.0
      },

      // Sector 2 (x: 420 -> 720px)
      {
        id: 'h4_g_sweep_a',
        type: 'beam_vertical',
        x: 500,
        height: 310,
        amplitude: 55,
        frequency: 0.8,
        beamWidth: 11,
        lane: 'UPPER_SWEEP',
        offset: 0.2
      },
      {
        id: 'h5_g_storm_lane',
        type: 'burst_stream',
        x: 590,
        direction: 'UP',
        speed: 280,
        packetSize: 14,
        packetCount: 3,
        lane: 'MID_STORM',
        cycle: { warning: 0.8, active: 1.3, cooldown: 1.6 },
        offset: 1.4
      },
      {
        id: 'h6_g_final_pulse',
        type: 'barrier_pulse',
        x: 670,
        y: 100,
        width: 18,
        height: 250,
        lane: 'FINAL_CHOKE',
        cycle: { safe: 2.0, warning: 0.8, active: 1.4, cooldown: 0.6 },
        offset: 0.8
      }
    ]
  }
]);

/**
 * Validate Level 4 Variant definition schema
 * @param {Object} variant
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateLevel4Variant(variant) {
  const errors = [];
  if (!variant || typeof variant !== 'object') {
    return { valid: false, errors: ['Variant is null or undefined'] };
  }
  if (!variant.id || typeof variant.id !== 'string') errors.push('Missing variant id');
  if (!variant.name || typeof variant.name !== 'string') errors.push('Missing variant name');
  if (!Array.isArray(variant.hazards) || variant.hazards.length === 0) {
    errors.push('Variant must have at least one hazard');
  } else {
    variant.hazards.forEach((h, idx) => {
      if (!h.id) errors.push(`Hazard at index ${idx} missing id`);
      if (!h.type) errors.push(`Hazard ${h.id || idx} missing type`);
      if (typeof h.x !== 'number') errors.push(`Hazard ${h.id || idx} missing valid x coordinate`);
      
      // Check hazard doesn't intersect start safe zone or checkpoint safe zone
      if (h.x < ZONE_BOUNDS.START_ZONE_MAX_X) {
        errors.push(`Hazard ${h.id} intersects start safe buffer (x < ${ZONE_BOUNDS.START_ZONE_MAX_X})`);
      }
      if (h.x >= ZONE_BOUNDS.CHECKPOINT_MIN_X && h.x <= ZONE_BOUNDS.CHECKPOINT_MAX_X) {
        errors.push(`Hazard ${h.id} intersects midpoint safe island (x in [${ZONE_BOUNDS.CHECKPOINT_MIN_X}, ${ZONE_BOUNDS.CHECKPOINT_MAX_X}])`);
      }
      if (h.x >= ZONE_BOUNDS.GOAL_ZONE_MIN_X) {
        errors.push(`Hazard ${h.id} intersects goal extraction zone (x >= ${ZONE_BOUNDS.GOAL_ZONE_MIN_X})`);
      }
    });
  }
  return { valid: errors.length === 0, errors };
}
