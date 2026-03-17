
## 1. Project Context & Architecture
- **Goal:** Expand the breadboard schematic canvas to support dynamic component properties (e.g., adjustable resistor values), advanced pin metadata (PWM, Analog), multi-cable junction points, canvas hover tooltips, and a visual Component Builder for creating and modifying components.
- **Tech Stack & Dependencies:** Node.js, React 18, Vite, TypeScript, `reactflow`, `zustand`, `zod`, `tailwindcss`.
- **File Structure:**
  ```text
  ├── src/
  │   ├── components/
  │   │   ├── Builder/                 # NEW: Component editor modules
  │   │   │   ├── BuilderCanvas.tsx
  │   │   │   └── BuilderSidebar.tsx
  │   │   ├── Canvas/
  │   │   │   └── CustomNode.tsx       # Update for hover tooltips & dynamic text
  │   │   └── UI/
  │   │       └── PropertyPanel.tsx    # NEW: Edit node properties (e.g., Ohm values)
  │   ├── config/
  │   │   ├── schemas.ts               # Extend Pin and Component schemas
  │   │   └── defaultParts.ts          # Add junction point, property definitions
  │   └── store/
  │       └── useEditorStore.ts        # Add customValues state, Builder mode
  ```
- **Attention Points:**
  - **Dynamic Injection:** Text inside components (e.g., "1kΩ") must be dynamically injected via `{{propertyName}}` interpolation in `CustomNode.tsx` based on the node's `data.customValues`.
  - **Tooltips:** Use native `title` attributes on SVG elements and ReactFlow `<Handle>` components to satisfy hover requirements simply and reliably.
  - **Junctions:** A junction is treated as a zero-dimension or minimal-dimension component with a single pin that allows infinite connections. ReactFlow handles multi-connections by default if no `connectionLimit` is set.

## 2. Execution Phases

#### Phase 1: Schema Extension & Data Modeling
- [x] **Step 1.1:** In `src/config/schemas.ts`, add a `PropertySchema` using Zod: `z.object({ id: z.string(), label: z.string(), type: z.enum(['text', 'number', 'select']), options: z.array(z.string()).optional(), default: z.any() })`.
- [x] **Step 1.2:** In `src/config/schemas.ts`, update `ComponentSchema` to include `properties: z.array(PropertySchema).optional()`.
- [x] **Step 1.3:** In `src/config/schemas.ts`, update `PinSchema` to include `signalType: z.enum(['digital', 'analog', 'pwm', 'power', 'gnd', 'default']).default('default')`.
- [x] **Step 1.4:** In `src/store/useEditorStore.ts`, add a new action `updateNodeData(nodeId: string, customValues: Record<string, any>)` to modify a specific node's `data.customValues`.
- [x] **Step 1.5:** In `src/store/useEditorStore.ts`, add `appMode: 'editor' | 'builder'` to the `EditorState`, along with a `setAppMode` action.
- [x] **Verification:** Run `npx tsc --noEmit` and verify no TypeScript errors are present after schema and store modifications.

#### Phase 2: Dynamic Properties & Hover Tooltips
- [x] **Step 2.1:** In `src/config/defaultParts.ts`, update the `resistor` component: add `properties: [{ id: 'resistance', label: 'Resistance', type: 'select', options: ['220Ω', '330Ω', '1kΩ', '10kΩ'], default: '1kΩ' }]`.
- [x] **Step 2.2:** In `src/config/defaultParts.ts`, change the resistor's text shape `text` property from `'1kΩ'` to `'{{resistance}}'`. Update Arduino Uno/Nano pins to include appropriate `signalType` (e.g., `analog` for A0-A5, `pwm` for PWM pins).
- [x] **Step 2.3:** In `src/components/Canvas/CustomNode.tsx`, implement a helper function to parse `shape.text`. If the string contains `{{key}}`, replace it with `data.customValues?.[key] ?? componentDef.properties?.find(p => p.id === key)?.default`.
- [x] **Step 2.4:** In `src/components/Canvas/CustomNode.tsx`, modify the rendered `<text>` shape wrapper and `<Handle>` elements to include a `title` attribute. Set `title` to `data.customValues?.[key]` for text, and ``${pin.id} (${pin.signalType})`` for handles.
- [x] **Verification:** Run `npm run dev`. Spawn a resistor and hover over its text to see the tooltip. Hover over an Arduino Uno A0 pin to see the tooltip "a0 (analog)".

#### Phase 3: Junction Point & Property Panel UI
- [x] **Step 3.1:** In `src/config/defaultParts.ts`, add a new component `id: 'junction'`, category `passive`. Shape: a single black filled circle (`r: 4`). Pins: a single pin at `x:0, y:0` with `type: 'inout'`.
- [x] **Step 3.2:** Create `src/components/UI/PropertyPanel.tsx`. Retrieve `selectedNodeId` from the store. Find the matching node and its base definition in `library`.
- [x] **Step 3.3:** In `PropertyPanel.tsx`, iterate over the component's `properties` array. Render a `<select>` for type `select`. Bind the `onChange` event to call `updateNodeData(selectedNodeId, { [prop.id]: e.target.value })`.
- [x] **Step 3.4:** Mount `<PropertyPanel />` in `src/App.tsx` (or your main layout container) absolute positioned on the right side.
- [x] **Verification:** Spawn a resistor, select it, and use the Property Panel to change its value to "10kΩ". Verify the SVG text updates immediately on the canvas. Add a Junction point, connect three wires to it, and verify the UI handles it cleanly.

#### Phase 4: Component Builder Mode
- [x] **Step 4.1:** Create `src/components/Builder/BuilderCanvas.tsx` containing an isolated `<ReactFlow>` instance tailored for grid-snapping single SVG primitives (Rects, Circles).
- [x] **Step 4.2:** Create `src/components/Builder/BuilderSidebar.tsx` with inputs for Component Name, ID, Category, and buttons to "Add Pin", "Add Rect", etc., which add generic primitive nodes to the `BuilderCanvas`.
- [x] **Step 4.3:** Implement a "Save Component" button in `BuilderSidebar.tsx`. Write logic to calculate the bounding box of the drawn primitives, normalize their coordinates relative to the bounding box, and serialize them into a valid `HardwareComponent` JSON object.
- [x] **Step 4.4:** In `src/store/useEditorStore.ts`, modify the initialization of `library` to merge `defaultParts` with any custom components stored in `localStorage.getItem('customComponents')`.
- [x] **Step 4.5:** Update the main application routing/UI to conditionally render `EditorCanvas` or `BuilderCanvas` based on `appMode`.
- [x] **Verification:** Switch to Builder mode. Draw a basic square, add two pins, and fill out the category metadata. Click "Save Component". Switch to Editor mode, open the Component Modal, and verify the newly built component is spawnable.

## 3. Global Testing Strategy
- **Property Persistance:** Spawn a resistor, set it to "220Ω", save the canvas to JSON using the export utility, reload the page, and load the JSON. Verify the resistor retains its "220Ω" visual value and custom data.
- **Pin Routing on Custom Components:** Create an asymmetrical component in the Builder, save it, spawn it in the editor, and verify wires snap exactly to the custom pins without offset.
- **Multi-Node Junction:** Drop a Junction point and attach wires from an Arduino 5V pin, a resistor, and an LED anode. Rotate the Junction point and ensure all wires recalculate cleanly.
