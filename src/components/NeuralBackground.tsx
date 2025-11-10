import React, { useRef, useEffect } from 'react';
import { useTheme } from '@/hooks/use-theme';
const NeuralBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isDark } = useTheme();
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animationFrameId: number;
    let nodes: any[] = [];
    const nodeCount = window.innerWidth < 768 ? 40 : 80;
    const maxDist = 150;
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    const createNodes = () => {
      nodes = [];
      for (let i = 0; i < nodeCount; i++) {
        nodes.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: Math.random() * 0.5 - 0.25,
          vy: Math.random() * 0.5 - 0.25,
          radius: Math.random() * 1.5 + 1,
        });
      }
    };
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const nodeColor = isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(10, 10, 10, 0.8)';
      const lineColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(10, 10, 10, 0.1)';
      nodes.forEach(node => {
        // Move
        node.x += node.vx;
        node.y += node.vy;
        // Bounce
        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;
        // Draw node
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = nodeColor;
        ctx.fill();
      });
      // Draw lines
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dist = Math.sqrt(Math.pow(nodes[i].x - nodes[j].x, 2) + Math.pow(nodes[i].y - nodes[j].y, 2));
          if (dist < maxDist) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = lineColor;
            ctx.lineWidth = 1 - dist / maxDist;
            ctx.stroke();
          }
        }
      }
      animationFrameId = requestAnimationFrame(draw);
    };
    const handleResize = () => {
      resizeCanvas();
      createNodes();
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    draw();
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isDark]);
  return <canvas id="neural-bg" ref={canvasRef} />;
};
export default NeuralBackground;