import { useEditorStore } from './src/store/useEditorStore.js';

const store = useEditorStore.getState();
console.log('Initial nodes:', store.nodes.length);

store.addNode({ id: '1', position: { x: 0, y: 0 }, data: {} });

const updatedStore = useEditorStore.getState();
console.log('Updated nodes:', updatedStore.nodes.length);

if (updatedStore.nodes.length === 1) {
  console.log('Zustand store verification successful!');
} else {
  console.error('Zustand store verification failed!');
  process.exit(1);
}
