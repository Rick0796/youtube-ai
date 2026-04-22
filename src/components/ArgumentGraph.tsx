import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { LogicNode } from '../types';

interface ArgumentGraphProps {
  nodes: LogicNode[];
}

export function ArgumentGraph({ nodes }: ArgumentGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || !nodes || nodes.length === 0) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = 400;

    // Clear previous
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height]);

    // Prepare links
    const links: any[] = [];
    nodes.forEach(node => {
      if (node.connectsTo) {
        node.connectsTo.forEach(targetId => {
          if (nodes.find(n => n.id === targetId)) {
            links.push({ source: node.id, target: targetId });
          }
        });
      }
    });

    const simulation = d3.forceSimulation(nodes as any)
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(120))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('x', d3.forceX(width / 2).strength(0.1))
      .force('y', d3.forceY(height / 2).strength(0.1));

    // Arrowhead definition
    svg.append('defs').append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '-0 -5 10 10')
      .attr('refX', 22)
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('xoverflow', 'visible')
      .append('svg:path')
      .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
      .attr('fill', 'rgba(255,255,255,0.2)')
      .style('stroke', 'none');

    const link = svg.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', 'rgba(255,255,255,0.1)')
      .attr('stroke-opacity', 1)
      .attr('stroke-width', 1.5)
      .attr('marker-end', 'url(#arrowhead)');

    const node = svg.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .call(d3.drag<any, any>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

    // Glow effect
    const filter = svg.append('defs').append('filter')
      .attr('id', 'glow');
    filter.append('feGaussianBlur')
      .attr('stdDeviation', '2.5')
      .attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    node.append('circle')
      .attr('r', 10)
      .attr('fill', (d: any) => {
        switch (d.type) {
          case 'conclusion': return '#ffffff';
          case 'evidence': return 'rgba(255,255,255,0.6)';
          case 'premise': return 'rgba(255,255,255,0.4)';
          case 'counterargument': return '#f43f5e';
          default: return 'rgba(255,255,255,0.2)';
        }
      })
      .attr('stroke', 'rgba(255,255,255,0.2)')
      .attr('stroke-width', 2)
      .style('filter', 'url(#glow)');

    const labels = node.append('foreignObject')
      .attr('width', 140)
      .attr('height', 60)
      .attr('x', 15)
      .attr('y', -10);

    labels.append('xhtml:div')
      .style('color', 'white')
      .style('font-size', '10px')
      .style('font-weight', '500')
      .style('line-height', '1.2')
      .style('text-shadow', '0 1px 4px rgba(0,0,0,0.8)')
      .style('background', 'rgba(0,0,0,0.4)')
      .style('backdrop-filter', 'blur(4px)')
      .style('padding', '4px 8px')
      .style('border-radius', '8px')
      .style('border', '1px solid rgba(255,255,255,0.1)')
      .style('display', 'inline-block')
      .style('max-width', '120px')
      .html((d: any) => {
        const typeLabel = {
          premise: '前提',
          evidence: '论据',
          conclusion: '结论',
          counterargument: '反面'
        }[d.type as keyof typeof typeLabel] || '';
        return `<div><span style="opacity: 0.5; font-size: 8px; text-transform: uppercase; font-weight: 700; display: block; margin-bottom: 2px">${typeLabel}</span>${d.content}</div>`;
      });

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node
        .attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    // Resize observer
    const resizeObserver = new ResizeObserver(() => {
      const newWidth = container.clientWidth;
      svg.attr('width', newWidth).attr('viewBox', [0, 0, newWidth, height]);
      simulation.force('center', d3.forceCenter(newWidth / 2, height / 2)).alpha(0.3).restart();
    });
    resizeObserver.observe(container);

    return () => {
      simulation.stop();
      resizeObserver.disconnect();
    };
  }, [nodes]);

  return (
    <div ref={containerRef} className="w-full h-[400px] relative overflow-hidden rounded-2xl bg-black/20 border border-white/5">
      <div className="absolute top-4 left-4 z-10 flex gap-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-white/40" />
          <span className="text-[10px] text-white/50 uppercase font-bold tracking-widest">前提</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-white/60" />
          <span className="text-[10px] text-white/50 uppercase font-bold tracking-widest">论据</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-white" />
          <span className="text-[10px] text-white/50 uppercase font-bold tracking-widest">结论</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-rose-500" />
          <span className="text-[10px] text-white/50 uppercase font-bold tracking-widest">可能的反驳</span>
        </div>
      </div>
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  );
}
