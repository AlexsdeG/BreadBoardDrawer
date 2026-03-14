```markdown
# IMPLEMENTATION.md

## 1. Project Context & Architecture
**Goal:** Upgrade the ReactFlow-based breadboard drawing application by introducing a rich, colorful electronic component library and fixing the SVG bounding box calculation to ensure selection outlines fit tightly around components.

**Tech Stack & Dependencies:**
- **Environment:** Node.js / Vite
- **Framework:** React, TypeScript
- **Libraries:** ReactFlow, Zustand, Zod, TailwindCSS

**File Structure:**
```text
breadboarddrawer/
└── src/
    ├── config/
    │   ├── schemas.ts         # Zod schemas defining component shapes
    │   └── defaultParts.ts    # Library of pre-defined hardware components
    ├── components/
    │   ├── Canvas/
    │   │   └── CustomNode.tsx # ReactFlow node renderer
    │   └── UI/
    │       └── ComponentModal.tsx # Component selection menu
    └── App.tsx                # Main application entry point

```

**Attention Points:**

* **Bounding Box Math:** The bounding box algorithm must account for `circle` properties (`cx`, `cy`, `r`, `strokeWidth`) differently than `rect` properties (`x`, `y`, `width`, `height`).
* **SVG Attributes:** Ensure React-specific SVG attributes are used (e.g., `strokeWidth`, `fontFamily`, `fontSize`, `textAnchor`) and properly cast if TypeScript complains about string/number unions.

---

## 2. Execution Phases

#### Phase 1: Schema Extension

* [x] **Step 1.1:** Open `src/config/schemas.ts`.
* [x] **Step 1.2:** Extend `ShapeSchema` to include optional properties for rounded corners and text formatting: `rx: z.number().optional()`, `ry: z.number().optional()`, and `fontWeight: z.union([z.string(), z.number()]).optional()`.
* [x] **Verification:** Run `npx tsc --noEmit` to verify that the schema changes do not break any existing type inferences.

#### Phase 2: Component Library Upgrade

* [x] **Step 2.1:** Open `src/config/defaultParts.ts`.
* [x] **Step 2.2:** Replace the existing dummy components with the newly defined rich component array (Resistor, Ceramic Capacitor, Electrolytic Cap, Red/Green LEDs, Diode, 555 Timer IC, NPN Transistor, Push Button, 9V Battery, Inductor).
* [x] **Step 2.3:** Ensure all shapes utilize the newly available schema properties (e.g., `rx`, `fill`, `strokeWidth`, `fontWeight`).
* [x] **Verification:** Run `npx tsc --noEmit` to ensure the new `defaultParts` array perfectly satisfies the `HardwareComponent[]` type.

#### Phase 3: Bounding Box Engine in CustomNode

* [x] **Step 3.1:** Open `src/components/Canvas/CustomNode.tsx`.
* [x] **Step 3.2:** Implement rigorous min/max bounding box calculations before the `return` statement. Iterate through `data.shapes` to find `minX`, `minY`, `maxX`, and `maxY` based on shape geometry (accounting for stroke width) and through `data.pins` (accounting for a 5px pin radius).
* [x] **Step 3.3:** Apply a uniform padding of `2` to the calculated min/max values. Calculate `width = maxX - minX` and `height = maxY - minY`.
* [x] **Step 3.4:** Update the wrapper `div` to explicitly use the calculated `width` and `height` in its `style` prop, and update the SVG `viewBox` attribute to `viewBox={`${minX} ${minY} ${width} ${height}`}`.
* [x] **Step 3.5:** Adjust the `Handle` absolute positioning logic so that pins are placed relative to the new `minX` and `minY` offsets (`left: pin.x - minX`, `top: pin.y - minY`).
* [ ] **Verification:** Start the dev server (`npm run dev`). Place a component on the canvas and click it. Verify the blue selection ring tightly hugs the component rather than being massively oversized.

#### Phase 4: Modal Preview Bounding Box Sync

* [ ] **Step 4.1:** Open `src/components/UI/ComponentModal.tsx`.
* [ ] **Step 4.2:** Locate the `renderPreview` function.
* [ ] **Step 4.3:** Replicate the exact min/max bounding box math from Phase 3 into the `renderPreview` function to calculate `minX`, `minY`, `width`, and `height` for the preview SVG.
* [ ] **Step 4.4:** Apply the calculated `viewBox` to the preview `<svg>` element.
* [ ] **Verification:** Open the application, trigger the Component Modal, and verify that all complex components (like the 9V battery and ICs) render centered and fully visible within their preview boxes without getting cropped.

#### Phase 5: App Initialization Sync

* [ ] **Step 5.1:** Open `src/App.tsx`.
* [ ] **Step 5.2:** Ensure the initial `useEffect` that populates the canvas uses `defaultParts[0].shapes` and `defaultParts[0].pins` if the canvas is empty.
* [ ] **Verification:** Clear local storage/state, refresh the app, and verify that the default component (Resistor) loads cleanly onto the canvas.

---

## 3. Global Testing Strategy

* **Visual Fidelity Test:** Spawn every single component from the modal onto the canvas. Verify colors, borders, and text labels (e.g., "NE555", "9V", "+", "-") render correctly.
* **Pin Routing Test:** Enter drawing mode and attempt to draw a wire from the anode of an LED to the pin of a 555 Timer. Verify the exact anchor points align with the visible grey pin circles.
* **Transform & Rotation Test:** Select an asymmetrical component (like the 9V battery). Verify that the bounding box and selection ring remain perfectly aligned when the component is rotated.

```

```