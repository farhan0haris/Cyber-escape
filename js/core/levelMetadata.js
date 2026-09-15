/**
 * Central Level & Sector Metadata
 * Source of truth for sector names, objectives, durations, and mechanics.
 */

export const LEVEL_METADATA = Object.freeze({
  1: {
    number: 1,
    id: 'sector_01',
    name: 'FIREWALL GATE',
    type: 'LOGIC HASH',
    objective: 'SECTOR 01: FIREWALL GATE // AUTHENTICATE PASSWORD HASH',
    standbyObjective: 'SECTOR 01: AWAITING SECURITY PUZZLE INITIALIZATION',
    durationSeconds: 75,
    baseScore: 1000,
    timeBonusMultiplier: 10,
    description: 'Bypass firewall gateway by deducing the root password hash from forensic clues.'
  },
  2: {
    number: 2,
    id: 'sector_02',
    name: 'DIGITAL LABYRINTH',
    type: 'GRID ROUTING',
    objective: 'SECTOR 02: DIGITAL LABYRINTH // REACH CORE EXIT NODE',
    standbyObjective: 'SECTOR 02: AWAITING GRID CHANNEL ROUTING',
    durationSeconds: 60,
    baseScore: 1500,
    timeBonusMultiplier: 15,
    description: 'Navigate corrupted memory channels and route the packet safely to the exit node.'
  },
  3: {
    number: 3,
    id: 'sector_03',
    name: 'MEMORY DUMP',
    type: 'DECOY FILTER',
    objective: 'SECTOR 03: MEMORY DUMP // ISOLATE AUTHENTIC DECRYPTION KEY',
    standbyObjective: 'SECTOR 03: AWAITING MEMORY CLUSTER INSPECTION',
    durationSeconds: 75,
    baseScore: 1200,
    timeBonusMultiplier: 15,
    description: 'Inspect 12 cryptographic memory chips and isolate the authentic AES decryption key.'
  },
  4: {
    number: 4,
    id: 'sector_04',
    name: 'PACKET CORRIDOR',
    type: 'LASER EVASION',
    objective: 'SECTOR 04: PACKET CORRIDOR // EVADE FIREWALL LASER SWEEPS',
    standbyObjective: 'SECTOR 04: AWAITING HAZARD CALIBRATION',
    durationSeconds: 60,
    baseScore: 2000,
    timeBonusMultiplier: 20,
    description: 'Traverse active packet inspection zones while dodging sweeping firewall lasers in real time.'
  },
  5: {
    number: 5,
    id: 'sector_05',
    name: 'ROOT KERNEL',
    type: 'MASTER OVERRIDE',
    objective: 'SECTOR 05: ROOT KERNEL // EXECUTE MASTER OVERRIDE',
    standbyObjective: 'SECTOR 05: AWAITING OVERRIDE PROTOCOL SEQUENCE',
    durationSeconds: 90,
    baseScore: 2500,
    timeBonusMultiplier: 25,
    description: 'Recall sequence echoes, synchronize carrier frequencies, and trigger the emergency root disconnect.'
  }
});

/**
 * Helper to fetch level metadata safely with fallback
 * @param {number} levelNumber (1-5)
 */
export function getLevelMetadata(levelNumber) {
  const num = Math.min(5, Math.max(1, Number(levelNumber) || 1));
  return LEVEL_METADATA[num] || LEVEL_METADATA[1];
}
