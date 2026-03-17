import { z } from 'zod';

export const ShapeSchema = z.object({
  type: z.enum(['rect', 'circle', 'path', 'text']),
  x: z.number().optional(),
  y: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  cx: z.number().optional(),
  cy: z.number().optional(),
  r: z.number().optional(),
  d: z.string().optional(),
  text: z.string().optional(),
  fill: z.string().optional(),
  stroke: z.string().optional(),
  strokeWidth: z.number().optional(),
  rx: z.number().optional(),
  ry: z.number().optional(),
  fontSize: z.number().optional(),
  fontFamily: z.string().optional(),
  fontWeight: z.union([z.string(), z.number()]).optional(),
  textAnchor: z.string().optional(),
});

export const PropertySchema = z.object({
  id: z.string(),
  label: z.string(),
  type: z.enum(['text', 'number', 'select']),
  options: z.array(z.string()).optional(),
  default: z.any(),
});

export const PinSchema = z.object({
  id: z.string(),
  x: z.number(),
  y: z.number(),
  type: z.enum(['input', 'output', 'inout', 'any']).default('any'),
  signalType: z.enum(['digital', 'analog', 'pwm', 'power', 'gnd', 'default']).default('default'),
});

export const ComponentSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.enum(['passive', 'diode-led', 'ic', 'transistor', 'switch', 'power', 'microcontroller']).default('passive'),
  properties: z.array(PropertySchema).optional(),
  shapes: z.array(ShapeSchema),
  pins: z.array(PinSchema),
});

export type ComponentShape = z.infer<typeof ShapeSchema>;
export type ComponentPin = z.infer<typeof PinSchema>;
export type HardwareComponent = z.infer<typeof ComponentSchema>;
