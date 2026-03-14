import { ComponentPin, ComponentShape } from '../config/schemas';

const DEFAULT_STROKE_WIDTH = 0;
const PIN_RADIUS = 5;
const BOUNDS_PADDING = 2;

function expandBounds(
  bounds: { minX: number; minY: number; maxX: number; maxY: number },
  x1: number,
  y1: number,
  x2: number,
  y2: number,
) {
  bounds.minX = Math.min(bounds.minX, x1, x2);
  bounds.minY = Math.min(bounds.minY, y1, y2);
  bounds.maxX = Math.max(bounds.maxX, x1, x2);
  bounds.maxY = Math.max(bounds.maxY, y1, y2);
}

function getPathBounds(shape: ComponentShape) {
  const strokeInset = (shape.strokeWidth ?? DEFAULT_STROKE_WIDTH) / 2;
  const coordinates = (shape.d?.match(/-?\d*\.?\d+/g) ?? []).map(Number);

  if (coordinates.length < 2) {
    return null;
  }

  const xs: number[] = [];
  const ys: number[] = [];

  for (let index = 0; index < coordinates.length - 1; index += 2) {
    xs.push(coordinates[index]);
    ys.push(coordinates[index + 1]);
  }

  return {
    minX: Math.min(...xs) - strokeInset,
    minY: Math.min(...ys) - strokeInset,
    maxX: Math.max(...xs) + strokeInset,
    maxY: Math.max(...ys) + strokeInset,
  };
}

function getTextBounds(shape: ComponentShape) {
  const x = shape.x ?? 0;
  const y = shape.y ?? 0;
  const fontSize = shape.fontSize ?? 12;
  const textWidth = Math.max((shape.text?.length ?? 0) * fontSize * 0.6, fontSize * 0.5);

  let minX = x;
  let maxX = x + textWidth;

  if (shape.textAnchor === 'middle') {
    minX = x - textWidth / 2;
    maxX = x + textWidth / 2;
  } else if (shape.textAnchor === 'end') {
    minX = x - textWidth;
    maxX = x;
  }

  return {
    minX,
    minY: y - fontSize,
    maxX,
    maxY: y + fontSize * 0.25,
  };
}

export function getComponentBounds(shapes: ComponentShape[] = [], pins: ComponentPin[] = []) {
  const bounds = {
    minX: Number.POSITIVE_INFINITY,
    minY: Number.POSITIVE_INFINITY,
    maxX: Number.NEGATIVE_INFINITY,
    maxY: Number.NEGATIVE_INFINITY,
  };

  shapes.forEach((shape) => {
    switch (shape.type) {
      case 'rect': {
        const strokeInset = (shape.strokeWidth ?? DEFAULT_STROKE_WIDTH) / 2;
        const x = shape.x ?? 0;
        const y = shape.y ?? 0;
        const width = shape.width ?? 0;
        const height = shape.height ?? 0;
        expandBounds(bounds, x - strokeInset, y - strokeInset, x + width + strokeInset, y + height + strokeInset);
        break;
      }
      case 'circle': {
        const strokeInset = (shape.strokeWidth ?? DEFAULT_STROKE_WIDTH) / 2;
        const cx = shape.cx ?? 0;
        const cy = shape.cy ?? 0;
        const r = shape.r ?? 0;
        expandBounds(bounds, cx - r - strokeInset, cy - r - strokeInset, cx + r + strokeInset, cy + r + strokeInset);
        break;
      }
      case 'path': {
        const pathBounds = getPathBounds(shape);
        if (pathBounds) {
          expandBounds(bounds, pathBounds.minX, pathBounds.minY, pathBounds.maxX, pathBounds.maxY);
        }
        break;
      }
      case 'text': {
        const textBounds = getTextBounds(shape);
        expandBounds(bounds, textBounds.minX, textBounds.minY, textBounds.maxX, textBounds.maxY);
        break;
      }
      default:
        break;
    }
  });

  pins.forEach((pin) => {
    expandBounds(bounds, pin.x - PIN_RADIUS, pin.y - PIN_RADIUS, pin.x + PIN_RADIUS, pin.y + PIN_RADIUS);
  });

  const hasBounds = Number.isFinite(bounds.minX)
    && Number.isFinite(bounds.minY)
    && Number.isFinite(bounds.maxX)
    && Number.isFinite(bounds.maxY);

  const minX = hasBounds ? bounds.minX - BOUNDS_PADDING : -BOUNDS_PADDING;
  const minY = hasBounds ? bounds.minY - BOUNDS_PADDING : -BOUNDS_PADDING;
  const maxX = hasBounds ? bounds.maxX + BOUNDS_PADDING : BOUNDS_PADDING;
  const maxY = hasBounds ? bounds.maxY + BOUNDS_PADDING : BOUNDS_PADDING;

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: Math.max(maxX - minX, 1),
    height: Math.max(maxY - minY, 1),
  };
}
