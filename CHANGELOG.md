# Changelog

## [0.0.16] - 2026-03-15
- Fixed toolbar rotate controls visibility by tracking selected node ID from React Flow selection events.
- Rotate-left and rotate-right buttons now reliably appear when exactly one component is selected.

## [0.0.15] - 2026-03-15
- Added contextual rotate controls to the toolbar: rotate-left and rotate-right buttons appear only when a single component is selected.
- Extended node rotation logic to support both directions while preserving snap rotation steps.

## [0.0.14] - 2026-03-15
- Set startup default component to `Arduino Uno` (with fallback to the first library component).
- Updated `Arduino Uno` pin definitions to match official counts: 14 digital I/O + 6 analog inputs.
- Updated `Arduino Nano` pin definitions to match official counts: 22 digital I/O + 8 analog inputs.

## [0.0.13] - 2026-03-15
- Added component categories (`passive`, `diode-led`, `ic`, `transistor`, `switch`, `power`, `microcontroller`) and wired them into the component schema/library.
- Upgraded the Add Component modal with category tabs (including `All`) and a top-right search bar that filters within the selected category.
- Added two new microcontroller components to the default library: `Arduino Uno` and `Arduino Nano`.

## [0.0.12] - 2026-03-15
- Updated the initial app bootstrap to seed an empty canvas from `defaultParts[0]`, keeping the default node in sync with the component library.
- The first-load canvas component now uses the resistor's shared `shapes` and `pins` data instead of a hardcoded placeholder node.

## [0.0.11] - 2026-03-15
- Synced `ComponentModal` previews with the shared component bounds calculator so modal SVGs use the same exact rect, circle, path, text, pin, stroke, and padding math as canvas nodes.
- Applied the computed preview `viewBox` with centered aspect preservation so larger parts like ICs and batteries stay fully visible inside the modal cards.

## [0.0.10] - 2026-03-15
- Added a reusable component bounds calculator that accounts for rects, circles, paths, text, stroke width, pin radius, and padding.
- Updated `CustomNode` to use exact SVG bounds for its wrapper size, `viewBox`, and handle offsets so selection outlines fit components tightly.

## [0.0.9] - 2026-03-15
- Replaced the placeholder component library with rich SVG definitions for resistor, capacitors, LEDs, diode, 555 timer, transistor, push button, 9V battery, and inductor parts.
- Enabled rounded rectangle and text weight SVG attributes in node rendering and component previews.
- Verified the updated `defaultParts` library satisfies `HardwareComponent[]` with `tsc --noEmit`.

## [0.0.8] - 2026-03-15
- Extended `ShapeSchema` with optional `rx`, `ry`, and `fontWeight` properties for richer SVG component definitions.
- Verified the schema update preserves TypeScript inference with `tsc --noEmit`.

## [0.0.7] - 2026-03-14
- Implemented Save & Load State functionality.
- Added `getCanvasState` and `loadCanvasState` to the Zustand store.
- Added "Save" button to download the current canvas state as `schematic.json`.
- Added "Load" button to restore canvas state from a `.json` file.

## [0.0.6] - 2026-03-14
- Revamped the Toolbar with a more professional, polished UI.
- Added "Snap to Rotate" toggle to the toolbar (snaps node rotation to 90 degrees or 15 degrees).
- Made "Snap to Grid", "Snap to Rotate", and "Orthogonal Routing" toggles always visible in the toolbar.
- Fixed interaction: Clicking on an edge while a waypoint is selected now correctly deselects the waypoint and keeps the edge selected.

## [0.0.5] - 2026-03-14
- Switched to `EdgeLabelRenderer` for waypoints to ensure they are always visible and clickable above the canvas.
- Added "Add Bend" and "Remove Bend" buttons to the toolbar for explicit waypoint management.
- Implemented `AdvancedEdge` with orthogonal routing and `getSmoothStepPath`.
- Registered `AdvancedEdge` as the default edge type in the canvas.

## [0.0.4] - 2026-03-14
- Removed `ComponentLibrary` sidebar and drag-and-drop logic.
- Implemented `ComponentModal` for spawning new components.
- Added "Add Component" button to the Toolbar.
- Components now spawn exactly in the center of the current viewport.

## [0.0.3] - 2026-03-14
- Added `snapToGrid` and `snapGrid` to the React Flow canvas.
- Implemented node rotation (90 degrees) via the `R` key.
- Updated `CustomNode` to apply CSS rotation transforms.

## [0.0.2] - 2026-03-14
- Refactored Zod schemas to enforce strict separation of data.
- Updated component definitions to pure JSON, removing hardcoded React/JSX logic.
- Mapped SVG elements and React Flow Handles dynamically from JSON configuration in CustomNode.

## [0.0.1] - 2026-03-14
- Initialized Vite + React + TS project with required dependencies (reactflow, zustand, zod, html-to-image).
- Created directory structure for components, config, store, and utils.
- Defined Zod schemas for hardware components, shapes, and pins.
- Implemented Zustand store for managing nodes, edges, and component library.
- Built CustomNode component to render dynamic SVG shapes and React Flow handles based on JSON config.
- Implemented EditorCanvas using React Flow to display and connect components.
- Added ComponentLibrary sidebar with HTML5 drag-and-drop functionality to instantiate new components on the canvas.
- Configured orthogonal wire routing using smoothstep edges.
- Added export utility to download the canvas as a PNG image using html-to-image.
- Created Toolbar with an Export button.
