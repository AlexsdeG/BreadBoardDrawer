import { toPng } from 'html-to-image';

export const exportCanvasToPng = async () => {
  const node = document.querySelector('.react-flow__renderer') as HTMLElement;
  if (!node) {
    console.error('Canvas element not found');
    return;
  }

  try {
    const dataUrl = await toPng(node, {
      backgroundColor: '#f8fafc', // slate-50
    });
    
    const link = document.createElement('a');
    link.download = 'schematic.png';
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error('Error exporting canvas:', error);
  }
};