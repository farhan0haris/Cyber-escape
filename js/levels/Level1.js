/**
 * Level 1: Password Breach (Dynamic Evidence Chain & Trust System)
 * Sector 01 — Firewall Gate Authentication Override
 */

import { gameState } from '../core/state.js';
import { audio } from '../systems/AudioManager.js';

export const LEVEL1_SCENARIOS = [
  {
    id: 'scenario_01_alpha',
    name: 'SECTOR ALPHA: MULTI-HOP BUFFER CORRELATION',
    format: '[HASH][PORT][YEAR]',
    expectedAnswer: '7F91222087',
    derivedHash: '7F91',
    derivedPort: '22',
    derivedYear: '2087',
    chainTargets: {
      node: 'NODE-07',
      trace: '7F91',
      service: 'SSH (PORT 22)',
      timeline: '2087'
    },
    hints: [
      {
        level: 1,
        cost: 100,
        text: 'HINT 1: Cross-reference the Node Verification Matrix with the Security Audit to isolate the authentic node. Notice that Buffer-01 and Buffer-03 map to Trace Family A & C.'
      },
      {
        level: 2,
        cost: 150,
        text: 'HINT 2: Node-07 links to TR-1 (7F) and TR-3 (91). Policy eliminates cleartext FTP (21); active tunnel is SSH (22). Compute Year as Base (2060) + Delta (18) + Offset (9) = 2087.'
      }
    ],
    evidence: [
      {
        id: 'REC-01',
        category: 'nodes',
        tag: 'NODE VERIFICATION MATRIX',
        title: 'SUB-SECTOR NODE INTEGRITY LOG',
        trust: 'VERIFIED',
        body: 'Audit sweep status:\n• NODE-01: [COMPROMISED] — Allocated to Buffer-02\n• NODE-07: [VERIFIED AUTHENTIC] — Allocated to Buffer-01 & Buffer-03\n• NODE-12: [DECOY] — Allocated to Buffer-04'
      },
      {
        id: 'REC-02',
        category: 'nodes',
        tag: 'BUFFER ROUTING TABLE',
        title: 'INTERMEDIATE MEMORY REGISTERS',
        trust: 'VERIFIED',
        body: 'Register mappings:\n• Buffer-01 -> Trace Family A (Contains Fragment: 7F)\n• Buffer-02 -> Trace Family B (Contains Fragment: 2C)\n• Buffer-03 -> Trace Family C (Contains Fragment: 91)\n• Buffer-04 -> Trace Family D (Contains Fragment: A8)'
      },
      {
        id: 'REC-03',
        category: 'nodes',
        tag: 'FORENSIC INCIDENT TRACE',
        title: 'INTRUSION OCCURRENCE LOG',
        trust: 'SUSPECT',
        body: 'Unauthorized intrusion attempt trapped at Firewall Gate 01. Attacker simulated Node-01 traffic, but gateway requires credentials authenticated through the verified node.'
      },
      {
        id: 'REC-04',
        category: 'registry',
        tag: 'SERVICE REGISTRY',
        title: 'PROTOCOL PORT DIRECTORY',
        trust: 'VERIFIED',
        body: 'Service routing directory:\n• FTP (File Transfer Protocol): Port 21\n• SSH (Secure Shell Admin): Port 22\n• DNS (Domain Name Service): Port 53\n• HTTP (Cleartext Web): Port 80\n• HTTPS (Secure Web): Port 443'
      },
      {
        id: 'REC-05',
        category: 'registry',
        tag: 'SECURITY GATEWAY POLICY',
        title: 'ADMISSION DIRECTIVE 88-A',
        trust: 'VERIFIED',
        body: 'Policy Directive: "Clear-text channels (Ports 21 & 80) are permanently rejected by firewall rules. Node-07 gateway routing requires the encrypted Secure Shell (SSH) protocol."'
      },
      {
        id: 'REC-06',
        category: 'chronology',
        tag: 'ROOT ARCHIVE RECORD',
        title: 'SUB-SECTOR ARCHIVE REFERENCE',
        trust: 'VERIFIED',
        body: 'Sub-sector root partition archive baseline epoch established: YEAR [ 2060 ]. All subsequent timestamps are indexed relative to this baseline.'
      },
      {
        id: 'REC-07',
        category: 'chronology',
        tag: 'KERNEL DEPLOYMENT AUDIT',
        title: 'NODE-07 DEPLOYMENT DELTA',
        trust: 'VERIFIED',
        body: 'Node-07 micro-kernel compilation was committed exactly [ +18 YEARS ] after the root archive baseline epoch.'
      },
      {
        id: 'REC-08',
        category: 'chronology',
        tag: 'CONTAINMENT DELTA AUDIT',
        title: 'INCIDENT LOCKDOWN TIMELINE',
        trust: 'VERIFIED',
        body: 'Emergency containment seal was engaged exactly [ +9 YEARS ] following Node-07 kernel compilation.'
      }
    ]
  },
  {
    id: 'scenario_02_beta',
    name: 'SECTOR BETA: PROTOCOL CONFLICT RESOLUTION',
    format: '[HASH][PORT][YEAR]',
    expectedAnswer: 'E42B4432024',
    derivedHash: 'E42B',
    derivedPort: '443',
    derivedYear: '2024',
    chainTargets: {
      node: 'NODE-09',
      trace: 'E42B',
      service: 'HTTPS (PORT 443)',
      timeline: '2024'
    },
    hints: [
      {
        level: 1,
        cost: 100,
        text: 'HINT 1: Locate the authentic node in the Node Matrix. Resolve the protocol conflict by checking which service adheres to encryption policy.'
      },
      {
        level: 2,
        cost: 150,
        text: 'HINT 2: Node-09 links to Trace Family B (E4) + Trace Family D (2B). Service is HTTPS (443). Year is Base (2010) + Cluster (12) + Quarantine (2) = 2024.'
      }
    ],
    evidence: [
      {
        id: 'REC-01',
        category: 'nodes',
        tag: 'NODE VERIFICATION MATRIX',
        title: 'SUB-SECTOR NODE INTEGRITY LOG',
        trust: 'VERIFIED',
        body: 'Audit sweep status:\n• NODE-03: [DECOY / INSECURE] — Allocated to Buffer-01 & Buffer-02\n• NODE-09: [VERIFIED AUTHENTIC] — Allocated to Buffer-02 & Buffer-04\n• NODE-15: [CORRUPTED BUFFER] — Allocated to Buffer-03 & Buffer-01'
      },
      {
        id: 'REC-02',
        category: 'nodes',
        tag: 'BUFFER ROUTING TABLE',
        title: 'INTERMEDIATE MEMORY REGISTERS',
        trust: 'VERIFIED',
        body: 'Register mappings:\n• Buffer-01 -> Trace Family A (Fragment: A1)\n• Buffer-02 -> Trace Family B (Fragment: E4)\n• Buffer-03 -> Trace Family C (Fragment: 9F)\n• Buffer-04 -> Trace Family D (Fragment: 2B)'
      },
      {
        id: 'REC-03',
        category: 'nodes',
        tag: 'SECURITY AUDIT LOG',
        title: 'CERTIFICATE AUDIT REPORT',
        trust: 'SUSPECT',
        body: 'Node-03 transmitted plaintext packets, violating gateway rules. Only credentials correlated with Node-09 (Verified) will satisfy the firewall unlock sequence.'
      },
      {
        id: 'REC-04',
        category: 'registry',
        tag: 'SERVICE REGISTRY',
        title: 'PROTOCOL PORT DIRECTORY',
        trust: 'VERIFIED',
        body: 'Service routing directory:\n• TELNET (Legacy Remote): Port 23\n• HTTP (Cleartext Web): Port 80\n• NTP (Network Time): Port 123\n• HTTPS (Secure TLS Transport): Port 443\n• IMAP (Secure Mail): Port 993'
      },
      {
        id: 'REC-05',
        category: 'registry',
        tag: 'SECURITY GATEWAY POLICY',
        title: 'ADMISSION DIRECTIVE 92-C',
        trust: 'VERIFIED',
        body: 'Policy Directive: "Insecure terminal protocols (Telnet) are prohibited. Node-09 authorization tunnel enforces standard encrypted web transport (HTTPS)."'
      },
      {
        id: 'REC-06',
        category: 'chronology',
        tag: 'ROOT ARCHIVE RECORD',
        title: 'SYSTEM ARCHIVE REFERENCE',
        trust: 'VERIFIED',
        body: 'Mainframe sector baseline epoch initialized: YEAR [ 2010 ].'
      },
      {
        id: 'REC-07',
        category: 'chronology',
        tag: 'CLUSTER DEPLOYMENT AUDIT',
        title: 'NODE-09 DEPLOYMENT DELTA',
        trust: 'VERIFIED',
        body: 'Node-09 cluster infrastructure was deployed exactly [ +12 YEARS ] after baseline epoch.'
      },
      {
        id: 'REC-08',
        category: 'chronology',
        tag: 'QUARANTINE AUDIT',
        title: 'CONTAINMENT DELTA RECORD',
        trust: 'VERIFIED',
        body: 'Quarantine lockdown protocol was initiated exactly [ +2 YEARS ] following Node-09 deployment.'
      }
    ]
  },
  {
    id: 'scenario_03_gamma',
    name: 'SECTOR GAMMA: DNS ROUTING & TIMELINE RECONSTRUCTION',
    format: '[HASH][PORT][YEAR]',
    expectedAnswer: '5CD8532091',
    derivedHash: '5CD8',
    derivedPort: '53',
    derivedYear: '2091',
    chainTargets: {
      node: 'NODE-06',
      trace: '5CD8',
      service: 'DNS (PORT 53)',
      timeline: '2091'
    },
    hints: [
      {
        level: 1,
        cost: 100,
        text: 'HINT 1: Filter out quarantined and rejected nodes in the matrix. Identify Node-06 buffer mappings.'
      },
      {
        level: 2,
        cost: 150,
        text: 'HINT 2: Node-06 links Buffer-03 (5C) + Buffer-01 (D8). Service is authoritative DNS (53). Year is 2050 + 25 + 16 = 2091.'
      }
    ],
    evidence: [
      {
        id: 'REC-01',
        category: 'nodes',
        tag: 'NODE VERIFICATION MATRIX',
        title: 'SUB-SECTOR NODE INTEGRITY LOG',
        trust: 'VERIFIED',
        body: 'Audit sweep status:\n• NODE-02: [REJECTED CANDIDATE] — Allocated to Buffer-01 & Buffer-02\n• NODE-06: [VERIFIED AUTHENTIC] — Allocated to Buffer-03 & Buffer-01\n• NODE-11: [QUARANTINED] — Allocated to Buffer-04 & Buffer-02'
      },
      {
        id: 'REC-02',
        category: 'nodes',
        tag: 'BUFFER ROUTING TABLE',
        title: 'INTERMEDIATE MEMORY REGISTERS',
        trust: 'VERIFIED',
        body: 'Register mappings:\n• Buffer-01 -> Trace Family A (Fragment: D8)\n• Buffer-02 -> Trace Family B (Fragment: 3A)\n• Buffer-03 -> Trace Family C (Fragment: 5C)\n• Buffer-04 -> Trace Family D (Fragment: 1F)'
      },
      {
        id: 'REC-03',
        category: 'nodes',
        tag: 'SECURITY AUDIT LOG',
        title: 'ROUTING TABLE REPORT',
        trust: 'SUSPECT',
        body: 'Corrupted routing table isolated. Authentication sequence must be derived from the verified active name resolver cluster.'
      },
      {
        id: 'REC-04',
        category: 'registry',
        tag: 'SERVICE REGISTRY',
        title: 'PROTOCOL PORT DIRECTORY',
        trust: 'VERIFIED',
        body: 'Service routing directory:\n• SMTP (Mail Exchange): Port 25\n• DNS (Domain Name System): Port 53\n• SNMP (Network Management): Port 161\n• RDP (Remote Desktop): Port 3389\n• HTTPS (Secure Web): Port 443'
      },
      {
        id: 'REC-05',
        category: 'registry',
        tag: 'SECURITY GATEWAY POLICY',
        title: 'ADMISSION DIRECTIVE 41-G',
        trust: 'VERIFIED',
        body: 'Policy Directive: "Node-06 communication is strictly dedicated to authoritative Domain Name System (DNS) query resolution."'
      },
      {
        id: 'REC-06',
        category: 'chronology',
        tag: 'ROOT ARCHIVE RECORD',
        title: 'SYSTEM ARCHIVE REFERENCE',
        trust: 'VERIFIED',
        body: 'Sub-sector master ledger inception date recorded: YEAR [ 2050 ].'
      },
      {
        id: 'REC-07',
        category: 'chronology',
        tag: 'DNS COMPILATION AUDIT',
        title: 'NODE-06 COMPILATION DELTA',
        trust: 'VERIFIED',
        body: 'Node-06 DNS Kernel compiled and activated exactly [ +25 YEARS ] after ledger inception.'
      },
      {
        id: 'REC-08',
        category: 'chronology',
        tag: 'LOCKDOWN AUDIT',
        title: 'CONTAINMENT DELTA RECORD',
        trust: 'VERIFIED',
        body: 'Intrusion isolation triggered exactly [ +16 YEARS ] after DNS Kernel activation.'
      }
    ]
  },
  {
    id: 'scenario_04_delta',
    name: 'SECTOR DELTA: TEMPORAL DESYNCHRONIZATION RESOLUTION',
    format: '[HASH][PORT][YEAR]',
    expectedAnswer: 'A74D1232049',
    derivedHash: 'A74D',
    derivedPort: '123',
    derivedYear: '2049',
    chainTargets: {
      node: 'NODE-08',
      trace: 'A74D',
      service: 'NTP (PORT 123)',
      timeline: '2049'
    },
    hints: [
      {
        level: 1,
        cost: 100,
        text: 'HINT 1: The verified node is the temporal synchronization master. Eliminate compromised mail channels.'
      },
      {
        level: 2,
        cost: 150,
        text: 'HINT 2: Node-08 links Buffer-02 (A7) + Buffer-04 (4D). Service is NTP (123). Year is 2030 + 14 + 5 = 2049.'
      }
    ],
    evidence: [
      {
        id: 'REC-01',
        category: 'nodes',
        tag: 'NODE VERIFICATION MATRIX',
        title: 'SUB-SECTOR NODE INTEGRITY LOG',
        trust: 'VERIFIED',
        body: 'Audit sweep status:\n• NODE-04: [COMPROMISED CLUSTER] — Allocated to Buffer-01 & Buffer-02\n• NODE-08: [VERIFIED AUTHENTIC] — Allocated to Buffer-02 & Buffer-04\n• NODE-14: [OFFLINE DECOY] — Allocated to Buffer-03 & Buffer-01'
      },
      {
        id: 'REC-02',
        category: 'nodes',
        tag: 'BUFFER ROUTING TABLE',
        title: 'INTERMEDIATE MEMORY REGISTERS',
        trust: 'VERIFIED',
        body: 'Register mappings:\n• Buffer-01 -> Trace Family A (Fragment: 6B)\n• Buffer-02 -> Trace Family B (Fragment: A7)\n• Buffer-03 -> Trace Family C (Fragment: 19)\n• Buffer-04 -> Trace Family D (Fragment: 4D)'
      },
      {
        id: 'REC-03',
        category: 'nodes',
        tag: 'SECURITY AUDIT LOG',
        title: 'TEMPORAL DRIFT REPORT',
        trust: 'SUSPECT',
        body: 'Temporal desynchronization breach detected. Security perimeter locked. Authentication credentials must be synthesized from Node-08 (Verified Time Master).'
      },
      {
        id: 'REC-04',
        category: 'registry',
        tag: 'SERVICE REGISTRY',
        title: 'PROTOCOL PORT DIRECTORY',
        trust: 'VERIFIED',
        body: 'Service routing directory:\n• POP3 (Mail Retrieval): Port 110\n• NTP (Network Time Protocol): Port 123\n• IMAP (Mail Access): Port 143\n• FTPS (Encrypted File Sync): Port 990\n• HTTPS (Secure Web): Port 443'
      },
      {
        id: 'REC-05',
        category: 'registry',
        tag: 'SECURITY GATEWAY POLICY',
        title: 'ADMISSION DIRECTIVE 19-N',
        trust: 'VERIFIED',
        body: 'Policy Directive: "Node-08 clock calibration strictly requires Network Time Protocol (NTP) synchronization routing."'
      },
      {
        id: 'REC-06',
        category: 'chronology',
        tag: 'ROOT ARCHIVE RECORD',
        title: 'SYSTEM ARCHIVE REFERENCE',
        trust: 'VERIFIED',
        body: 'Root timing subsystem initialization baseline: YEAR [ 2030 ].'
      },
      {
        id: 'REC-07',
        category: 'chronology',
        tag: 'ENGINE DEPLOYMENT AUDIT',
        title: 'NODE-08 DEPLOYMENT DELTA',
        trust: 'VERIFIED',
        body: 'Node-08 precision time engine initialized exactly [ +14 YEARS ] after baseline.'
      },
      {
        id: 'REC-08',
        category: 'chronology',
        tag: 'CONTAINMENT DELTA AUDIT',
        title: 'INCIDENT SEAL TIMELINE',
        trust: 'VERIFIED',
        body: 'Breach quarantine lock enacted exactly [ +5 YEARS ] after time engine deployment.'
      }
    ]
  },
  {
    id: 'scenario_05_epsilon',
    name: 'SECTOR EPSILON: MULTI-DOMAIN DATABASE CORRELATION',
    format: '[HASH][PORT][YEAR]',
    expectedAnswer: 'F38833062031',
    derivedHash: 'F388',
    derivedPort: '3306',
    derivedYear: '2031',
    chainTargets: {
      node: 'NODE-10',
      trace: 'F388',
      service: 'MYSQL (PORT 3306)',
      timeline: '2031'
    },
    hints: [
      {
        level: 1,
        cost: 100,
        text: 'HINT 1: Trace the verified SQL core cluster. Eliminate unauthenticated cache and trivial TFTP services.'
      },
      {
        level: 2,
        cost: 150,
        text: 'HINT 2: Node-10 maps to Buffer-01 (F3) + Buffer-03 (88). Service is MySQL Database (3306). Year is 2000 + 15 + 16 = 2031.'
      }
    ],
    evidence: [
      {
        id: 'REC-01',
        category: 'nodes',
        tag: 'NODE VERIFICATION MATRIX',
        title: 'SUB-SECTOR NODE INTEGRITY LOG',
        trust: 'VERIFIED',
        body: 'Audit sweep status:\n• NODE-05: [FAILED AUTH] — Allocated to Buffer-01 & Buffer-03\n• NODE-10: [VERIFIED AUTHENTIC] — Allocated to Buffer-01 & Buffer-03\n• NODE-13: [DIRECTORY DECOY] — Allocated to Buffer-02 & Buffer-04'
      },
      {
        id: 'REC-02',
        category: 'nodes',
        tag: 'BUFFER ROUTING TABLE',
        title: 'INTERMEDIATE MEMORY REGISTERS',
        trust: 'VERIFIED',
        body: 'Register mappings:\n• Buffer-01 -> Trace Family A (Fragment: F3)\n• Buffer-02 -> Trace Family B (Fragment: 44)\n• Buffer-03 -> Trace Family C (Fragment: 88)\n• Buffer-04 -> Trace Family D (Fragment: CC)'
      },
      {
        id: 'REC-03',
        category: 'nodes',
        tag: 'SECURITY AUDIT LOG',
        title: 'DATABASE CLUSTER REPORT',
        trust: 'SUSPECT',
        body: 'Database cluster integrity fault. Master firewall gate locked. Authorization key must be correlated from Node-10 (Verified SQL Core).'
      },
      {
        id: 'REC-04',
        category: 'registry',
        tag: 'SERVICE REGISTRY',
        title: 'PROTOCOL PORT DIRECTORY',
        trust: 'VERIFIED',
        body: 'Service routing directory:\n• TFTP (Trivial File Transfer): Port 69\n• LDAP (Directory Service): Port 389\n• MYSQL (Relational SQL Core): Port 3306\n• REDIS (Memory Cache): Port 6379\n• HTTPS (Secure Web): Port 443'
      },
      {
        id: 'REC-05',
        category: 'registry',
        tag: 'SECURITY GATEWAY POLICY',
        title: 'ADMISSION DIRECTIVE 63-D',
        trust: 'VERIFIED',
        body: 'Policy Directive: "Node-10 relational storage gateway communicates exclusively through the standard MySQL Database port."'
      },
      {
        id: 'REC-06',
        category: 'chronology',
        tag: 'ROOT ARCHIVE RECORD',
        title: 'SYSTEM ARCHIVE REFERENCE',
        trust: 'VERIFIED',
        body: 'Relational storage baseline archive established: YEAR [ 2000 ].'
      },
      {
        id: 'REC-07',
        category: 'chronology',
        tag: 'SQL ACTIVATION AUDIT',
        title: 'NODE-10 ACTIVATION DELTA',
        trust: 'VERIFIED',
        body: 'Node-10 SQL cluster was activated exactly [ +15 YEARS ] after baseline archive.'
      },
      {
        id: 'REC-08',
        category: 'chronology',
        tag: 'CONTAINMENT DELTA AUDIT',
        title: 'SECURITY ISOLATION TIMELINE',
        trust: 'VERIFIED',
        body: 'Security isolation lock declared exactly [ +16 YEARS ] after SQL cluster activation.'
      }
    ]
  }
];

export class Level1 {
  constructor(container, callbacks = {}) {
    this.container = container;
    this.callbacks = callbacks; // { onComplete, onLoseLife, onPenalty }
    
    this.maxAttempts = 3;
    this.failedAttempts = 0;
    this.baseScore = 1000;
    this.timeMultiplier = 10;
    this.penaltyPerMistake = 150;

    this.hintsUsed = 0;
    this.hintPenaltyTotal = 0;
    this.activeFilter = 'all';

    this.selectedEvidenceIds = new Set();
    this.chainStatus = {
      node: false,
      trace: false,
      service: false,
      timeline: false
    };

    this.expandedCards = new Set(['REC-01', 'REC-02']); // default first 2 open

    this.scenario = null;
    this.isCompleted = false;
    this.isLocked = false;
    this._cleanups = [];
  }

  init() {
    this.cleanup();
    if (!this.scenario) {
      this.selectScenario();
    }
    this.render();
    this.bindEvents();
  }

  selectScenario(index = null) {
    if (typeof index === 'number' && index >= 0 && index < LEVEL1_SCENARIOS.length) {
      this.scenario = LEVEL1_SCENARIOS[index];
    } else {
      const randIndex = Math.floor(Math.random() * LEVEL1_SCENARIOS.length);
      this.scenario = LEVEL1_SCENARIOS[randIndex];
    }
  }

  render() {
    if (!this.container || typeof document === 'undefined') return;

    const attemptsRemaining = this.maxAttempts - this.failedAttempts;
    const maxHints = this.scenario.hints ? this.scenario.hints.length : 2;
    const hintsLeft = maxHints - this.hintsUsed;

    this.container.innerHTML = `
      <div class="level1-container" id="level1-screen">
        <!-- Level Header -->
        <div class="l1-header">
          <div class="l1-header-title-group">
            <span class="l1-status-pill" id="l1-status-pill">STATUS: LOCKED</span>
            <h2 class="l1-sector-heading">SECTOR 01: FIREWALL GATE // FORENSIC INVESTIGATION</h2>
          </div>
          <div class="l1-attempts-group">
            <span class="l1-attempts-label">INTEGRITY ATTEMPTS:</span>
            <div class="l1-attempt-nodes" id="l1-attempt-nodes" aria-label="${attemptsRemaining} attempts remaining">
              <span class="l1-attempt-pip ${this.failedAttempts >= 1 ? 'used' : ''}"></span>
              <span class="l1-attempt-pip ${this.failedAttempts >= 2 ? 'used' : ''}"></span>
              <span class="l1-attempt-pip ${this.failedAttempts >= 3 ? 'used' : ''}"></span>
            </div>
          </div>
        </div>

        <!-- Investigation Chain Progress Rail -->
        <div class="l1-chain-rail" aria-label="Investigation Chain Progress">
          <div class="l1-chain-node ${this.chainStatus.node ? 'verified' : ''}">
            <span class="chain-label">1. NODE</span>
            <span class="chain-val" id="chain-val-node">${this.chainStatus.node ? this.scenario.chainTargets.node : 'UNVERIFIED'}</span>
          </div>
          <span class="chain-arrow">→</span>
          <div class="l1-chain-node ${this.chainStatus.trace ? 'verified' : ''}">
            <span class="chain-label">2. TRACE HASH</span>
            <span class="chain-val" id="chain-val-trace">${this.chainStatus.trace ? this.scenario.chainTargets.trace : 'LOCKED'}</span>
          </div>
          <span class="chain-arrow">→</span>
          <div class="l1-chain-node ${this.chainStatus.service ? 'verified' : ''}">
            <span class="chain-label">3. SERVICE PORT</span>
            <span class="chain-val" id="chain-val-service">${this.chainStatus.service ? this.scenario.chainTargets.service : 'LOCKED'}</span>
          </div>
          <span class="chain-arrow">→</span>
          <div class="l1-chain-node ${this.chainStatus.timeline ? 'verified' : ''}">
            <span class="chain-label">4. TIMELINE</span>
            <span class="chain-val" id="chain-val-timeline">${this.chainStatus.timeline ? this.scenario.chainTargets.timeline : 'LOCKED'}</span>
          </div>
        </div>

        <!-- 3-Column Investigation Dashboard -->
        <div class="l1-investigation-grid">
          
          <!-- LEFT PANEL: Expandable Forensic Records -->
          <div class="l1-panel l1-panel-evidence">
            <div class="l1-panel-header">
              <h3 class="l1-panel-title">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                FORENSIC DOSSIER
              </h3>
              <div class="l1-filter-group" role="tablist">
                <button type="button" class="l1-filter-btn ${this.activeFilter === 'all' ? 'active' : ''}" data-filter="all">ALL (${this.scenario.evidence.length})</button>
                <button type="button" class="l1-filter-btn ${this.activeFilter === 'nodes' ? 'active' : ''}" data-filter="nodes">NODES</button>
                <button type="button" class="l1-filter-btn ${this.activeFilter === 'registry' ? 'active' : ''}" data-filter="registry">SERVICES</button>
                <button type="button" class="l1-filter-btn ${this.activeFilter === 'chronology' ? 'active' : ''}" data-filter="chronology">TIMELINE</button>
              </div>
            </div>

            <div class="l1-evidence-controls">
              <span class="l1-selection-count font-mono" id="l1-selection-count">${this.selectedEvidenceIds.size} RECORDS SELECTED</span>
              <button type="button" id="l1-btn-correlate" class="l1-btn-correlate" ${this.selectedEvidenceIds.size < 2 ? 'disabled' : ''}>
                ⚡ CORRELATE SELECTED
              </button>
            </div>
            
            <div class="l1-evidence-list" id="l1-evidence-container">
              ${this.renderEvidenceCards()}
            </div>
          </div>

          <!-- CENTER PANEL: Investigation Objective & Deduction Scratchpad -->
          <div class="l1-panel l1-panel-analysis">
            <div class="l1-panel-header">
              <h3 class="l1-panel-title">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                INVESTIGATION PROTOCOL
              </h3>
              <span class="l1-panel-tag">DYNAMIC REASONING</span>
            </div>
            
            <div class="l1-analysis-body">
              <div class="l1-instruction-box">
                <strong>AUTHORIZATION OBJECTIVE:</strong> Establish a verified chain of custody across nodes, buffer routing, service policies, and timeline deltas to synthesize the 3-part credential <strong>[HASH][PORT][YEAR]</strong>. Not all logs are trustworthy. Select and correlate compatible records to advance the chain.
              </div>

              <!-- Correlation Feedback Status -->
              <div id="l1-correlation-status" class="l1-correlation-status info" role="status" aria-live="polite">
                SELECT 2 OR MORE RECORDS TO ESTABLISH CORRELATION
              </div>

              <!-- Operator Scratchpad Workspace -->
              <div class="l1-scratchpad-box">
                <div class="l1-scratchpad-header">
                  <span>OPERATOR SYNTHESIS SCRATCHPAD</span>
                  <button type="button" id="l1-btn-autofill" class="l1-btn-scratch-fill" title="Transfer synthesized values to terminal">
                    TRANSFER TO TERMINAL →
                  </button>
                </div>
                <div class="l1-scratchpad-inputs">
                  <div class="l1-scratch-field">
                    <label for="l1-scratch-hash">DEDUCED HASH:</label>
                    <input type="text" id="l1-scratch-hash" class="l1-scratch-input" placeholder="e.g. 7F91" maxlength="6" />
                  </div>
                  <div class="l1-scratch-field">
                    <label for="l1-scratch-port">DEDUCED PORT:</label>
                    <input type="text" id="l1-scratch-port" class="l1-scratch-input" placeholder="e.g. 22" maxlength="5" />
                  </div>
                  <div class="l1-scratch-field">
                    <label for="l1-scratch-year">DEDUCED YEAR:</label>
                    <input type="text" id="l1-scratch-year" class="l1-scratch-input" placeholder="e.g. 2087" maxlength="4" />
                  </div>
                </div>
              </div>

              <!-- Hint Request Control -->
              <div class="l1-hint-container">
                <button type="button" id="l1-btn-hint" class="l1-btn-hint" ${hintsLeft <= 0 ? 'disabled' : ''}>
                  💡 REQUEST FORENSIC HINT (${hintsLeft} LEFT) <span class="text-amber">[-${this.hintsUsed === 0 ? 100 : 150} PTS]</span>
                </button>
                <div id="l1-hint-box" class="l1-hint-display" style="display:${this.hintsUsed > 0 ? 'block' : 'none'};">
                  ${this.renderActiveHints()}
                </div>
              </div>

            </div>
          </div>

          <!-- RIGHT PANEL: Authorization Terminal -->
          <div class="l1-panel l1-panel-terminal">
            <div class="l1-panel-header">
              <h3 class="l1-panel-title">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                AUTH TERMINAL
              </h3>
              <span class="l1-panel-tag text-emerald">GATE 01</span>
            </div>
            <form class="l1-terminal-form" id="l1-auth-form" autocomplete="off" onsubmit="return false;">
              <div class="l1-input-wrapper">
                <label for="l1-password-input" class="l1-input-label">
                  <span>ENTER SYNTHESIZED OVERRIDE KEY:</span>
                  <span class="text-cyan">${this.scenario.format}</span>
                </label>
                <input 
                  type="text" 
                  id="l1-password-input" 
                  class="l1-terminal-input" 
                  placeholder="${this.scenario.format}"
                  maxlength="30"
                  spellcheck="false"
                  autocapitalize="characters"
                  required
                />
              </div>

              <!-- Quick Virtual Keypad -->
              <div class="l1-keypad-grid" aria-label="Alphanumeric keypad">
                <button type="button" class="l1-key-btn" data-key="0">0</button>
                <button type="button" class="l1-key-btn" data-key="1">1</button>
                <button type="button" class="l1-key-btn" data-key="2">2</button>
                <button type="button" class="l1-key-btn" data-key="3">3</button>
                <button type="button" class="l1-key-btn" data-key="4">4</button>
                <button type="button" class="l1-key-btn" data-key="5">5</button>
                <button type="button" class="l1-key-btn" data-key="6">6</button>
                <button type="button" class="l1-key-btn" data-key="7">7</button>
                <button type="button" class="l1-key-btn" data-key="8">8</button>
                <button type="button" class="l1-key-btn" data-key="9">9</button>
                <button type="button" class="l1-key-btn" data-key="A">A</button>
                <button type="button" class="l1-key-btn" data-key="B">B</button>
                <button type="button" class="l1-key-btn" data-key="C">C</button>
                <button type="button" class="l1-key-btn" data-key="D">D</button>
                <button type="button" class="l1-key-btn" data-key="E">E</button>
                <button type="button" class="l1-key-btn" data-key="F">F</button>
                <button type="button" class="l1-key-btn l1-key-action" data-action="clear">CLR</button>
                <button type="button" class="l1-key-btn l1-key-action" data-action="backspace">⌫</button>
              </div>

              <button type="submit" id="l1-submit-btn" class="btn btn-primary l1-btn-authorize">
                AUTHENTICATE OVERRIDE
              </button>

              <!-- Feedback / Console Output -->
              <div class="l1-feedback-banner info" id="l1-feedback-banner" role="status" aria-live="polite">
                AWAITING CREDENTIAL ENTRY...
              </div>
            </form>
          </div>

        </div>
      </div>
    `;
  }

  renderEvidenceCards() {
    if (!this.scenario || !Array.isArray(this.scenario.evidence)) return '';
    
    const filtered = this.scenario.evidence.filter((ev) => {
      if (this.activeFilter === 'all') return true;
      return ev.category === this.activeFilter;
    });

    return filtered.map((ev) => {
      const isSelected = this.selectedEvidenceIds.has(ev.id);
      const isExpanded = this.expandedCards.has(ev.id);
      let trustClass = 'trust-verified';
      if (ev.trust === 'SUSPECT') trustClass = 'trust-suspect';
      if (ev.trust === 'CORRUPTED') trustClass = 'trust-corrupted';

      return `
        <div class="l1-evidence-card ${isSelected ? 'selected' : ''} ${isExpanded ? 'expanded' : 'collapsed'}" data-id="${ev.id}">
          <div class="l1-card-header">
            <label class="l1-card-checkbox-wrap">
              <input type="checkbox" class="l1-card-checkbox" data-id="${ev.id}" ${isSelected ? 'checked' : ''} />
              <span class="l1-card-id font-mono">[${ev.id}]</span>
            </label>
            <span class="l1-card-trust font-mono ${trustClass}">[${ev.trust || 'VERIFIED'}]</span>
            <button type="button" class="l1-card-toggle-btn" data-toggle="${ev.id}" aria-label="Toggle record details">
              ${isExpanded ? '▲ HIDE' : '▼ VIEW'}
            </button>
          </div>
          <div class="l1-card-title">${ev.title}</div>
          <div class="l1-card-body" style="display:${isExpanded ? 'block' : 'none'};">
            ${ev.body.replace(/\n/g, '<br>')}
          </div>
        </div>
      `;
    }).join('');
  }

  renderActiveHints() {
    if (!this.scenario || !Array.isArray(this.scenario.hints)) return '';
    const active = this.scenario.hints.slice(0, this.hintsUsed);
    return active.map((h) => `
      <div class="l1-hint-item">
        <span class="l1-hint-badge">HINT ${h.level}</span>
        <p class="l1-hint-text">${h.text}</p>
      </div>
    `).join('');
  }

  bindEvents() {
    if (typeof document === 'undefined') return;

    const form = document.getElementById('l1-auth-form');
    const input = document.getElementById('l1-password-input');
    const keypad = document.querySelector('.l1-keypad-grid');
    const filterGroup = document.querySelector('.l1-filter-group');
    const hintBtn = document.getElementById('l1-btn-hint');
    const autofillBtn = document.getElementById('l1-btn-autofill');
    const correlateBtn = document.getElementById('l1-btn-correlate');
    const evidenceContainer = document.getElementById('l1-evidence-container');

    // Submit handler
    if (form) {
      const submitHandler = (e) => {
        e.preventDefault();
        this.handleSubmit();
      };
      form.addEventListener('submit', submitHandler);
      this._cleanups.push(() => form.removeEventListener('submit', submitHandler));
    }

    // Keypad handler
    if (keypad && input) {
      const keypadHandler = (e) => {
        const btn = e.target.closest('button');
        if (!btn || this.isLocked || this.isCompleted) return;

        audio.playClick();
        const key = btn.dataset.key;
        const action = btn.dataset.action;

        if (key) {
          input.value += key;
          input.focus();
        } else if (action === 'clear') {
          input.value = '';
          input.focus();
        } else if (action === 'backspace') {
          input.value = input.value.slice(0, -1);
          input.focus();
        }
      };
      keypad.addEventListener('click', keypadHandler);
      this._cleanups.push(() => keypad.removeEventListener('click', keypadHandler));
    }

    // Filter tabs
    if (filterGroup) {
      const filterHandler = (e) => {
        const btn = e.target.closest('.l1-filter-btn');
        if (!btn) return;
        audio.playClick();

        document.querySelectorAll('.l1-filter-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        this.activeFilter = btn.dataset.filter || 'all';
        if (evidenceContainer) {
          evidenceContainer.innerHTML = this.renderEvidenceCards();
        }
      };
      filterGroup.addEventListener('click', filterHandler);
      this._cleanups.push(() => filterGroup.removeEventListener('click', filterHandler));
    }

    // Evidence selection & expansion click delegator
    if (evidenceContainer) {
      const evidenceClickHandler = (e) => {
        // Toggle expansion
        const toggleBtn = e.target.closest('.l1-card-toggle-btn');
        if (toggleBtn) {
          const cardId = toggleBtn.dataset.toggle;
          if (this.expandedCards.has(cardId)) {
            this.expandedCards.delete(cardId);
          } else {
            this.expandedCards.add(cardId);
          }
          evidenceContainer.innerHTML = this.renderEvidenceCards();
          return;
        }

        // Checkbox toggle
        const checkbox = e.target.closest('.l1-card-checkbox');
        if (checkbox) {
          const id = checkbox.dataset.id;
          if (checkbox.checked) {
            this.selectedEvidenceIds.add(id);
          } else {
            this.selectedEvidenceIds.delete(id);
          }
          this.updateSelectionUI();
        }
      };
      evidenceContainer.addEventListener('click', evidenceClickHandler);
      this._cleanups.push(() => evidenceContainer.removeEventListener('click', evidenceClickHandler));
    }

    // Correlate button handler
    if (correlateBtn) {
      const correlateHandler = () => {
        this.handleCorrelation();
      };
      correlateBtn.addEventListener('click', correlateHandler);
      this._cleanups.push(() => correlateBtn.removeEventListener('click', correlateHandler));
    }

    // Hint Button
    if (hintBtn) {
      const hintHandler = () => {
        this.requestHint();
      };
      hintBtn.addEventListener('click', hintHandler);
      this._cleanups.push(() => hintBtn.removeEventListener('click', hintHandler));
    }

    // Autofill from Scratchpad
    if (autofillBtn && input) {
      const autofillHandler = () => {
        audio.playClick();
        const h = (document.getElementById('l1-scratch-hash')?.value || '').trim();
        const p = (document.getElementById('l1-scratch-port')?.value || '').trim();
        const y = (document.getElementById('l1-scratch-year')?.value || '').trim();
        input.value = (h + p + y).toUpperCase();
        input.focus();
      };
      autofillBtn.addEventListener('click', autofillHandler);
      this._cleanups.push(() => autofillBtn.removeEventListener('click', autofillHandler));
    }
  }

  updateSelectionUI() {
    if (typeof document === 'undefined') return;
    const countEl = document.getElementById('l1-selection-count');
    const correlateBtn = document.getElementById('l1-btn-correlate');
    if (countEl) {
      countEl.textContent = `${this.selectedEvidenceIds.size} RECORDS SELECTED`;
    }
    if (correlateBtn) {
      correlateBtn.disabled = this.selectedEvidenceIds.size < 2;
    }
  }

  handleCorrelation() {
    if (this.selectedEvidenceIds.size < 2 || this.isLocked || this.isCompleted) return;

    audio.playClick();
    const selected = Array.from(this.selectedEvidenceIds);

    // Evaluate correlation compatibility
    let isNodeMatched = selected.includes('REC-01') && selected.includes('REC-02');
    let isServiceMatched = (selected.includes('REC-04') && selected.includes('REC-05')) || (selected.includes('REC-01') && selected.includes('REC-05'));
    let isTimelineMatched = (selected.includes('REC-06') && selected.includes('REC-07')) || (selected.includes('REC-07') && selected.includes('REC-08'));

    const statusBanner = (typeof document !== 'undefined') ? document.getElementById('l1-correlation-status') : null;

    if (isNodeMatched) {
      this.chainStatus.node = true;
      this.chainStatus.trace = true;
      if (statusBanner) {
        statusBanner.className = 'l1-correlation-status success';
        statusBanner.textContent = `CORRELATION ACCEPTED: Verified node ${this.scenario.chainTargets.node} and trace buffer origin confirmed.`;
      }
      this.updateChainRail();
      audio.playSuccess();
    } else if (isServiceMatched) {
      this.chainStatus.service = true;
      if (statusBanner) {
        statusBanner.className = 'l1-correlation-status success';
        statusBanner.textContent = `CORRELATION ACCEPTED: Protocol security policy verified (${this.scenario.chainTargets.service}).`;
      }
      this.updateChainRail();
      audio.playSuccess();
    } else if (isTimelineMatched) {
      this.chainStatus.timeline = true;
      if (statusBanner) {
        statusBanner.className = 'l1-correlation-status success';
        statusBanner.textContent = `CORRELATION ACCEPTED: Chronology deployment chain validated (${this.scenario.chainTargets.timeline}).`;
      }
      this.updateChainRail();
      audio.playSuccess();
    } else {
      audio.playError();
      if (statusBanner) {
        statusBanner.className = 'l1-correlation-status error';
        statusBanner.textContent = 'CORRELATION FAILED: Selected records do not share a verified origin or direct dependency.';
      }
    }
  }

  updateChainRail() {
    if (typeof document === 'undefined') return;
    const nodeEl = document.getElementById('chain-val-node');
    const traceEl = document.getElementById('chain-val-trace');
    const serviceEl = document.getElementById('chain-val-service');
    const timelineEl = document.getElementById('chain-val-timeline');

    if (nodeEl && this.chainStatus.node) {
      nodeEl.textContent = `${this.scenario.chainTargets.node} ✓`;
      nodeEl.closest('.l1-chain-node')?.classList.add('verified');
    }
    if (traceEl && this.chainStatus.trace) {
      traceEl.textContent = `${this.scenario.chainTargets.trace} ✓`;
      traceEl.closest('.l1-chain-node')?.classList.add('verified');
    }
    if (serviceEl && this.chainStatus.service) {
      serviceEl.textContent = `${this.scenario.chainTargets.service} ✓`;
      serviceEl.closest('.l1-chain-node')?.classList.add('verified');
    }
    if (timelineEl && this.chainStatus.timeline) {
      timelineEl.textContent = `${this.scenario.chainTargets.timeline} ✓`;
      timelineEl.closest('.l1-chain-node')?.classList.add('verified');
    }
  }

  requestHint() {
    if (this.isLocked || this.isCompleted) return;
    const maxHints = this.scenario.hints ? this.scenario.hints.length : 2;
    if (this.hintsUsed >= maxHints) return;

    this.hintsUsed++;
    const cost = this.hintsUsed === 1 ? 100 : 150;
    this.hintPenaltyTotal += cost;

    audio.playClick();

    if (this.callbacks && typeof this.callbacks.onPenalty === 'function') {
      this.callbacks.onPenalty(cost);
    }

    if (typeof document !== 'undefined') {
      const hintBox = document.getElementById('l1-hint-box');
      const hintBtn = document.getElementById('l1-btn-hint');
      if (hintBox) {
        hintBox.style.display = 'block';
        hintBox.innerHTML = this.renderActiveHints();
      }
      if (hintBtn) {
        const remaining = maxHints - this.hintsUsed;
        if (remaining <= 0) {
          hintBtn.disabled = true;
          hintBtn.textContent = '💡 MAXIMUM HINTS REACHED (2/2)';
        } else {
          hintBtn.innerHTML = `💡 REQUEST FORENSIC HINT (${remaining} LEFT) <span class="text-amber">[-150 PTS]</span>`;
        }
      }
    }
  }

  start() {
    this.isLocked = false;
    if (typeof document !== 'undefined') {
      const input = document.getElementById('l1-password-input');
      if (input) {
        input.disabled = false;
        input.focus();
      }
      this.setButtonsDisabled(false);
    }
  }

  pause() {
    this.isLocked = true;
    if (typeof document !== 'undefined') {
      const input = document.getElementById('l1-password-input');
      if (input) input.disabled = true;
      this.setButtonsDisabled(true);
    }
  }

  resume() {
    if (this.isCompleted) return;
    this.isLocked = false;
    if (typeof document !== 'undefined') {
      const input = document.getElementById('l1-password-input');
      if (input) input.disabled = false;
      this.setButtonsDisabled(false);
    }
  }

  setButtonsDisabled(disabled) {
    if (typeof document === 'undefined') return;
    const submitBtn = document.getElementById('l1-submit-btn');
    if (submitBtn) submitBtn.disabled = disabled;
    document.querySelectorAll('.l1-key-btn').forEach((b) => {
      b.disabled = disabled;
    });
    const hintBtn = document.getElementById('l1-btn-hint');
    if (hintBtn && this.hintsUsed < 2) {
      hintBtn.disabled = disabled;
    }
    const correlateBtn = document.getElementById('l1-btn-correlate');
    if (correlateBtn && this.selectedEvidenceIds.size >= 2) {
      correlateBtn.disabled = disabled;
    }
  }

  handleSubmit() {
    if (this.isLocked || this.isCompleted || typeof document === 'undefined') return;

    const input = document.getElementById('l1-password-input');
    const feedback = document.getElementById('l1-feedback-banner');
    if (!input || !feedback) return;

    const rawValue = input.value || '';
    const normalizedInput = rawValue.trim().toUpperCase();

    if (!normalizedInput) {
      this.showFeedback('ACCESS DENIED: CREDENTIAL INPUT CANNOT BE EMPTY', 'error');
      audio.playError();
      input.classList.add('error');
      setTimeout(() => input.classList.remove('error'), 500);
      return;
    }

    const expected = this.scenario.expectedAnswer.toUpperCase();

    if (normalizedInput === expected) {
      this.handleSuccess();
    } else {
      this.handleIncorrect();
    }
  }

  handleSuccess() {
    this.isCompleted = true;
    this.isLocked = true;

    if (typeof document === 'undefined') {
      if (this.callbacks && typeof this.callbacks.onComplete === 'function') {
        this.callbacks.onComplete(this.calculateScoreBonus());
      }
      return;
    }

    const input = document.getElementById('l1-password-input');
    const statusPill = document.getElementById('l1-status-pill');

    if (input) {
      input.disabled = true;
      input.classList.remove('error');
      input.classList.add('success');
    }

    if (statusPill) {
      statusPill.textContent = 'STATUS: GRANTED';
      statusPill.classList.add('granted');
    }

    this.setButtonsDisabled(true);
    this.showFeedback('ACCESS GRANTED // FIREWALL GATE OVERRIDDEN', 'success');
    audio.playSuccess();

    // Calculate score bonus
    const scoreBonus = this.calculateScoreBonus();

    // Render celebratory overlay
    const overlay = document.createElement('div');
    overlay.className = 'l1-success-overlay';
    overlay.innerHTML = `
      <div class="l1-success-ring">✓</div>
      <h3 class="l1-success-title">ACCESS GRANTED // SECTOR 01 BYPASSED</h3>
      <div class="l1-success-stats">
        <span>BASE: ${this.baseScore} PTS</span>
        <span>TIME BONUS: +${Math.max(0, (gameState.state.levelTimeRemaining || 0) * this.timeMultiplier)} PTS</span>
        <span>PENALTIES: -${(this.failedAttempts * this.penaltyPerMistake) + this.hintPenaltyTotal} PTS</span>
      </div>
      <p class="text-cyan font-mono" style="font-size:0.75rem;letter-spacing:0.1em;margin-top:4px;">
        TRANSITIONING TO SECTOR 02 BUFFER...
      </p>
    `;

    const screen = document.getElementById('level1-screen');
    if (screen) screen.appendChild(overlay);

    // Notify GameManager of completion
    const timerId = setTimeout(() => {
      if (this.callbacks && typeof this.callbacks.onComplete === 'function') {
        this.callbacks.onComplete(scoreBonus);
      }
    }, 1200);

    this._cleanups.push(() => clearTimeout(timerId));
  }

  handleIncorrect() {
    this.failedAttempts++;
    audio.playError();

    if (typeof document !== 'undefined') {
      const input = document.getElementById('l1-password-input');
      if (input) {
        input.classList.add('error');
        setTimeout(() => input.classList.remove('error'), 500);
      }
    }

    // Apply score penalty callback if registered
    if (this.callbacks && typeof this.callbacks.onPenalty === 'function') {
      this.callbacks.onPenalty(this.penaltyPerMistake);
    }

    this.updateAttemptPips();

    const attemptsLeft = this.maxAttempts - this.failedAttempts;

    if (attemptsLeft === 2) {
      this.showFeedback(
        'CORRELATION FAILED: Source node mismatch or invalid trace synthesis. [2 ATTEMPTS LEFT]',
        'error'
      );
    } else if (attemptsLeft === 1) {
      this.showFeedback(
        'RECORD CONFLICT: Service port rejected by policy or chronology miscalculated. [1 ATTEMPT LEFT]',
        'error'
      );
    } else {
      this.isLocked = true;
      this.showFeedback('SECURITY LOCKOUT: MAXIMUM ATTEMPTS EXCEEDED', 'error');
      this.setButtonsDisabled(true);

      const timerId = setTimeout(() => {
        if (this.callbacks && typeof this.callbacks.onLoseLife === 'function') {
          this.callbacks.onLoseLife();
        }
      }, 700);
      this._cleanups.push(() => clearTimeout(timerId));
    }
  }

  updateAttemptPips() {
    if (typeof document === 'undefined') return;
    const pips = document.querySelectorAll('.l1-attempt-pip');
    pips.forEach((pip, idx) => {
      if (idx < this.failedAttempts) {
        pip.classList.add('used');
      } else {
        pip.classList.remove('used');
      }
    });

    const nodes = document.getElementById('l1-attempt-nodes');
    if (nodes) {
      nodes.setAttribute('aria-label', `${this.maxAttempts - this.failedAttempts} attempts remaining`);
    }
  }

  showFeedback(message, type = 'info') {
    if (typeof document === 'undefined') return;
    const banner = document.getElementById('l1-feedback-banner');
    if (banner) {
      banner.className = `l1-feedback-banner ${type}`;
      banner.textContent = message;
    }
  }

  calculateScoreBonus() {
    const timeRemaining = Math.max(0, gameState.state.levelTimeRemaining || 0);
    const timeBonus = timeRemaining * this.timeMultiplier;
    const penalties = (this.failedAttempts * this.penaltyPerMistake) + this.hintPenaltyTotal;
    return Math.max(0, this.baseScore + timeBonus - penalties);
  }

  complete() {
    this.handleSuccess();
  }

  cleanup() {
    this._cleanups.forEach((cleanupFn) => {
      try {
        cleanupFn();
      } catch (err) {
        console.error('[Level1] Error during cleanup:', err);
      }
    });
    this._cleanups = [];
    this.selectedEvidenceIds.clear();

    if (this.container && typeof document !== 'undefined') {
      this.container.innerHTML = '';
    }
  }
}
