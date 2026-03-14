import { ComponentSchema } from './src/config/schemas.js';

const dummyComponent = {
  id: 'resistor',
  name: 'Resistor',
  shapes: [
    { type: 'rect', x: 0, y: 0, width: 40, height: 10, fill: 'none', stroke: 'black', strokeWidth: 2 }
  ],
  pins: [
    { id: 'p1', x: 0, y: 5, type: 'inout' },
    { id: 'p2', x: 40, y: 5, type: 'inout' }
  ]
};

try {
  ComponentSchema.parse(dummyComponent);
  console.log('Schema validation successful!');
} catch (e) {
  console.error('Schema validation failed:', e);
  process.exit(1);
}
