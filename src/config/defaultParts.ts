import { HardwareComponent } from './schemas';

export const defaultParts: HardwareComponent[] = [
  {
    id: 'resistor',
    name: 'Resistor',
    shapes: [
      { type: 'rect', x: 0, y: 0, width: 72, height: 32, fill: 'transparent', stroke: 'none', strokeWidth: 0 },
      { type: 'rect', x: 4, y: 15, width: 14, height: 2, fill: '#6b7280' },
      { type: 'rect', x: 54, y: 15, width: 14, height: 2, fill: '#6b7280' },
      { type: 'rect', x: 18, y: 8, width: 36, height: 16, rx: 5, ry: 5, fill: '#d6b37a', stroke: '#6b4f2a', strokeWidth: 2 },
      { type: 'rect', x: 25, y: 9, width: 3, height: 14, fill: '#7c2d12' },
      { type: 'rect', x: 31, y: 9, width: 3, height: 14, fill: '#111827' },
      { type: 'rect', x: 37, y: 9, width: 3, height: 14, fill: '#dc2626' },
      { type: 'rect', x: 43, y: 9, width: 3, height: 14, fill: '#f59e0b' },
      { type: 'text', x: 36, y: 29, text: '1kΩ', fill: '#5b4636', fontSize: 8, fontFamily: 'Arial, sans-serif', fontWeight: 700, textAnchor: 'middle' }
    ],
    pins: [
      { id: 'a', x: 4, y: 16, type: 'inout' },
      { id: 'b', x: 68, y: 16, type: 'inout' }
    ]
  },
  {
    id: 'ceramic-capacitor',
    name: 'Ceramic Capacitor',
    shapes: [
      { type: 'rect', x: 0, y: 0, width: 60, height: 36, fill: 'transparent', stroke: 'none', strokeWidth: 0 },
      { type: 'rect', x: 6, y: 17, width: 14, height: 2, fill: '#6b7280' },
      { type: 'rect', x: 40, y: 17, width: 14, height: 2, fill: '#6b7280' },
      { type: 'rect', x: 20, y: 8, width: 20, height: 20, rx: 6, ry: 6, fill: '#f59e0b', stroke: '#b45309', strokeWidth: 2 },
      { type: 'rect', x: 23, y: 10, width: 2, height: 16, fill: '#78350f' },
      { type: 'rect', x: 35, y: 10, width: 2, height: 16, fill: '#78350f' },
      { type: 'text', x: 30, y: 33, text: '104', fill: '#92400e', fontSize: 8, fontFamily: 'Arial, sans-serif', fontWeight: 700, textAnchor: 'middle' }
    ],
    pins: [
      { id: 'a', x: 6, y: 18, type: 'inout' },
      { id: 'b', x: 54, y: 18, type: 'inout' }
    ]
  },
  {
    id: 'electrolytic-capacitor',
    name: 'Electrolytic Cap',
    shapes: [
      { type: 'rect', x: 0, y: 0, width: 64, height: 40, fill: 'transparent', stroke: 'none', strokeWidth: 0 },
      { type: 'rect', x: 6, y: 19, width: 12, height: 2, fill: '#6b7280' },
      { type: 'rect', x: 46, y: 19, width: 12, height: 2, fill: '#6b7280' },
      { type: 'rect', x: 18, y: 6, width: 28, height: 28, rx: 8, ry: 8, fill: '#1d4ed8', stroke: '#1e3a8a', strokeWidth: 2 },
      { type: 'rect', x: 36, y: 8, width: 4, height: 24, fill: '#dbeafe' },
      { type: 'text', x: 26, y: 22, text: '+', fill: '#ffffff', fontSize: 11, fontFamily: 'Arial, sans-serif', fontWeight: 700, textAnchor: 'middle' },
      { type: 'text', x: 32, y: 38, text: '10µF', fill: '#1e3a8a', fontSize: 8, fontFamily: 'Arial, sans-serif', fontWeight: 700, textAnchor: 'middle' }
    ],
    pins: [
      { id: 'positive', x: 6, y: 20, type: 'inout' },
      { id: 'negative', x: 58, y: 20, type: 'inout' }
    ]
  },
  {
    id: 'led-red',
    name: 'Red LED',
    shapes: [
      { type: 'rect', x: 0, y: 0, width: 60, height: 34, fill: 'transparent', stroke: 'none', strokeWidth: 0 },
      { type: 'rect', x: 6, y: 16, width: 13, height: 2, fill: '#6b7280' },
      { type: 'rect', x: 41, y: 16, width: 13, height: 2, fill: '#6b7280' },
      { type: 'circle', cx: 30, cy: 17, r: 10, fill: '#ef4444', stroke: '#991b1b', strokeWidth: 2 },
      { type: 'circle', cx: 26, cy: 13, r: 3, fill: '#fee2e2', stroke: '#fecaca', strokeWidth: 1 },
      { type: 'text', x: 30, y: 32, text: 'LED', fill: '#991b1b', fontSize: 8, fontFamily: 'Arial, sans-serif', fontWeight: 700, textAnchor: 'middle' }
    ],
    pins: [
      { id: 'anode', x: 6, y: 17, type: 'inout' },
      { id: 'cathode', x: 54, y: 17, type: 'inout' }
    ]
  },
  {
    id: 'led-green',
    name: 'Green LED',
    shapes: [
      { type: 'rect', x: 0, y: 0, width: 60, height: 34, fill: 'transparent', stroke: 'none', strokeWidth: 0 },
      { type: 'rect', x: 6, y: 16, width: 13, height: 2, fill: '#6b7280' },
      { type: 'rect', x: 41, y: 16, width: 13, height: 2, fill: '#6b7280' },
      { type: 'circle', cx: 30, cy: 17, r: 10, fill: '#22c55e', stroke: '#166534', strokeWidth: 2 },
      { type: 'circle', cx: 26, cy: 13, r: 3, fill: '#dcfce7', stroke: '#bbf7d0', strokeWidth: 1 },
      { type: 'text', x: 30, y: 32, text: 'LED', fill: '#166534', fontSize: 8, fontFamily: 'Arial, sans-serif', fontWeight: 700, textAnchor: 'middle' }
    ],
    pins: [
      { id: 'anode', x: 6, y: 17, type: 'inout' },
      { id: 'cathode', x: 54, y: 17, type: 'inout' }
    ]
  },
  {
    id: 'diode',
    name: 'Diode',
    shapes: [
      { type: 'rect', x: 0, y: 0, width: 74, height: 30, fill: 'transparent', stroke: 'none', strokeWidth: 0 },
      { type: 'rect', x: 6, y: 14, width: 14, height: 2, fill: '#6b7280' },
      { type: 'rect', x: 54, y: 14, width: 14, height: 2, fill: '#6b7280' },
      { type: 'rect', x: 20, y: 8, width: 34, height: 14, rx: 4, ry: 4, fill: '#fef3c7', stroke: '#a16207', strokeWidth: 2 },
      { type: 'path', d: 'M24 10 L41 15 L24 20 Z', fill: '#374151', stroke: '#374151', strokeWidth: 1 },
      { type: 'rect', x: 43, y: 9, width: 4, height: 12, fill: '#111827' },
      { type: 'text', x: 37, y: 28, text: '1N4148', fill: '#854d0e', fontSize: 8, fontFamily: 'Arial, sans-serif', fontWeight: 700, textAnchor: 'middle' }
    ],
    pins: [
      { id: 'anode', x: 6, y: 15, type: 'inout' },
      { id: 'cathode', x: 68, y: 15, type: 'inout' }
    ]
  },
  {
    id: 'timer-555',
    name: '555 Timer IC',
    shapes: [
      { type: 'rect', x: 0, y: 0, width: 92, height: 58, fill: 'transparent', stroke: 'none', strokeWidth: 0 },
      { type: 'rect', x: 14, y: 14, width: 8, height: 4, fill: '#94a3b8' },
      { type: 'rect', x: 14, y: 24, width: 8, height: 4, fill: '#94a3b8' },
      { type: 'rect', x: 14, y: 34, width: 8, height: 4, fill: '#94a3b8' },
      { type: 'rect', x: 14, y: 44, width: 8, height: 4, fill: '#94a3b8' },
      { type: 'rect', x: 70, y: 14, width: 8, height: 4, fill: '#94a3b8' },
      { type: 'rect', x: 70, y: 24, width: 8, height: 4, fill: '#94a3b8' },
      { type: 'rect', x: 70, y: 34, width: 8, height: 4, fill: '#94a3b8' },
      { type: 'rect', x: 70, y: 44, width: 8, height: 4, fill: '#94a3b8' },
      { type: 'rect', x: 22, y: 8, width: 48, height: 46, rx: 6, ry: 6, fill: '#1f2937', stroke: '#111827', strokeWidth: 2 },
      { type: 'circle', cx: 46, cy: 14, r: 3, fill: '#9ca3af', stroke: '#d1d5db', strokeWidth: 1 },
      { type: 'text', x: 46, y: 30, text: 'NE555', fill: '#f9fafb', fontSize: 10, fontFamily: 'Arial, sans-serif', fontWeight: 700, textAnchor: 'middle' },
      { type: 'text', x: 46, y: 42, text: 'TIMER', fill: '#9ca3af', fontSize: 7, fontFamily: 'Arial, sans-serif', fontWeight: 600, textAnchor: 'middle' }
    ],
    pins: [
      { id: '1-gnd', x: 14, y: 16, type: 'inout' },
      { id: '2-trig', x: 14, y: 26, type: 'inout' },
      { id: '3-out', x: 14, y: 36, type: 'output' },
      { id: '4-reset', x: 14, y: 46, type: 'input' },
      { id: '8-vcc', x: 78, y: 16, type: 'input' },
      { id: '7-dis', x: 78, y: 26, type: 'output' },
      { id: '6-thr', x: 78, y: 36, type: 'input' },
      { id: '5-ctrl', x: 78, y: 46, type: 'input' }
    ]
  },
  {
    id: 'npn-transistor',
    name: 'NPN Transistor',
    shapes: [
      { type: 'rect', x: 0, y: 0, width: 64, height: 64, fill: 'transparent', stroke: 'none', strokeWidth: 0 },
      { type: 'rect', x: 30, y: 6, width: 4, height: 12, fill: '#6b7280' },
      { type: 'rect', x: 30, y: 46, width: 4, height: 12, fill: '#6b7280' },
      { type: 'rect', x: 6, y: 30, width: 12, height: 4, fill: '#6b7280' },
      { type: 'circle', cx: 32, cy: 32, r: 16, fill: '#e5e7eb', stroke: '#4b5563', strokeWidth: 2 },
      { type: 'path', d: 'M22 32 L32 32 L32 20', fill: 'none', stroke: '#111827', strokeWidth: 2 },
      { type: 'path', d: 'M32 32 L42 22', fill: 'none', stroke: '#111827', strokeWidth: 2 },
      { type: 'path', d: 'M32 32 L42 42', fill: 'none', stroke: '#111827', strokeWidth: 2 },
      { type: 'text', x: 32, y: 60, text: 'NPN', fill: '#374151', fontSize: 8, fontFamily: 'Arial, sans-serif', fontWeight: 700, textAnchor: 'middle' }
    ],
    pins: [
      { id: 'collector', x: 32, y: 6, type: 'inout' },
      { id: 'base', x: 6, y: 32, type: 'input' },
      { id: 'emitter', x: 32, y: 58, type: 'output' }
    ]
  },
  {
    id: 'push-button',
    name: 'Push Button',
    shapes: [
      { type: 'rect', x: 0, y: 0, width: 70, height: 42, fill: 'transparent', stroke: 'none', strokeWidth: 0 },
      { type: 'rect', x: 16, y: 15, width: 38, height: 14, rx: 6, ry: 6, fill: '#cbd5e1', stroke: '#64748b', strokeWidth: 2 },
      { type: 'rect', x: 26, y: 5, width: 18, height: 14, rx: 5, ry: 5, fill: '#60a5fa', stroke: '#2563eb', strokeWidth: 2 },
      { type: 'circle', cx: 10, cy: 18, r: 4, fill: '#94a3b8', stroke: '#475569', strokeWidth: 1.5 },
      { type: 'circle', cx: 10, cy: 26, r: 4, fill: '#94a3b8', stroke: '#475569', strokeWidth: 1.5 },
      { type: 'circle', cx: 60, cy: 18, r: 4, fill: '#94a3b8', stroke: '#475569', strokeWidth: 1.5 },
      { type: 'circle', cx: 60, cy: 26, r: 4, fill: '#94a3b8', stroke: '#475569', strokeWidth: 1.5 },
      { type: 'text', x: 35, y: 39, text: 'SW', fill: '#334155', fontSize: 8, fontFamily: 'Arial, sans-serif', fontWeight: 700, textAnchor: 'middle' }
    ],
    pins: [
      { id: 'top-left', x: 10, y: 18, type: 'inout' },
      { id: 'bottom-left', x: 10, y: 26, type: 'inout' },
      { id: 'top-right', x: 60, y: 18, type: 'inout' },
      { id: 'bottom-right', x: 60, y: 26, type: 'inout' }
    ]
  },
  {
    id: 'battery-9v',
    name: '9V Battery',
    shapes: [
      { type: 'rect', x: 0, y: 0, width: 82, height: 52, fill: 'transparent', stroke: 'none', strokeWidth: 0 },
      { type: 'rect', x: 12, y: 12, width: 58, height: 32, rx: 7, ry: 7, fill: '#475569', stroke: '#1f2937', strokeWidth: 2 },
      { type: 'rect', x: 24, y: 6, width: 34, height: 10, rx: 4, ry: 4, fill: '#94a3b8', stroke: '#475569', strokeWidth: 2 },
      { type: 'circle', cx: 31, cy: 11, r: 3, fill: '#e5e7eb', stroke: '#64748b', strokeWidth: 1 },
      { type: 'circle', cx: 49, cy: 11, r: 4, fill: '#cbd5e1', stroke: '#64748b', strokeWidth: 1 },
      { type: 'text', x: 41, y: 30, text: '9V', fill: '#f8fafc', fontSize: 14, fontFamily: 'Arial, sans-serif', fontWeight: 700, textAnchor: 'middle' },
      { type: 'text', x: 31, y: 49, text: '+', fill: '#dc2626', fontSize: 10, fontFamily: 'Arial, sans-serif', fontWeight: 700, textAnchor: 'middle' },
      { type: 'text', x: 50, y: 49, text: '-', fill: '#f8fafc', fontSize: 12, fontFamily: 'Arial, sans-serif', fontWeight: 700, textAnchor: 'middle' }
    ],
    pins: [
      { id: 'positive', x: 31, y: 6, type: 'output' },
      { id: 'negative', x: 49, y: 6, type: 'output' }
    ]
  },
  {
    id: 'inductor',
    name: 'Inductor',
    shapes: [
      { type: 'rect', x: 0, y: 0, width: 78, height: 34, fill: 'transparent', stroke: 'none', strokeWidth: 0 },
      { type: 'rect', x: 6, y: 16, width: 12, height: 2, fill: '#6b7280' },
      { type: 'rect', x: 60, y: 16, width: 12, height: 2, fill: '#6b7280' },
      { type: 'circle', cx: 24, cy: 17, r: 6, fill: 'none', stroke: '#7c3aed', strokeWidth: 2 },
      { type: 'circle', cx: 34, cy: 17, r: 6, fill: 'none', stroke: '#7c3aed', strokeWidth: 2 },
      { type: 'circle', cx: 44, cy: 17, r: 6, fill: 'none', stroke: '#7c3aed', strokeWidth: 2 },
      { type: 'circle', cx: 54, cy: 17, r: 6, fill: 'none', stroke: '#7c3aed', strokeWidth: 2 },
      { type: 'text', x: 39, y: 31, text: '10µH', fill: '#6d28d9', fontSize: 8, fontFamily: 'Arial, sans-serif', fontWeight: 700, textAnchor: 'middle' }
    ],
    pins: [
      { id: 'a', x: 6, y: 17, type: 'inout' },
      { id: 'b', x: 72, y: 17, type: 'inout' }
    ]
  }
];
