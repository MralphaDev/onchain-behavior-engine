export function buildDefs(defs: d3.Selection<SVGDefsElement, unknown, null, undefined>, colors: string[]) {
  // ── radial overlay gradient per unique color (file 1 sheen) ───────────
  colors.forEach((color, i) => {
      const grad = defs.append('radialGradient')
        .attr('id', `nodeOverlay-${i}`)
        .attr('cx', '30%').attr('cy', '30%').attr('r', '80%');
      grad.append('stop').attr('offset', '0%')
        .attr('stop-color', color).attr('stop-opacity', 0.40);
      grad.append('stop').attr('offset', '40%')
        .attr('stop-color', color).attr('stop-opacity', 0.18);
      grad.append('stop').attr('offset', '75%')
        .attr('stop-color', color).attr('stop-opacity', 0.06);
      grad.append('stop').attr('offset', '100%')
        .attr('stop-color', color).attr('stop-opacity', 0);
    });

 // ── colored glow filter per unique color ──────────────────────────────
 /*
 this is very expensive to render
 Step-by-step per frame (important):
Take node pixels (SourceGraphic)
Extract alpha (SourceAlpha)
Flood-fill color (feFlood)
Mask it (feComposite)
Blur it (feGaussianBlur)
Merge layers (feMerge)
Composite back into SVG scene
 */
  colors.forEach((color, i) => {
      const f = defs.append('filter')
        .attr('id', `glow-${i}`)
        .attr('x', '-60%').attr('y', '-60%')
        .attr('width', '220%').attr('height', '220%');
      f.append('feFlood')
        .attr('flood-color', color).attr('flood-opacity', 0.3).attr('result', 'colorFlood');
      f.append('feComposite')
        .attr('in', 'colorFlood').attr('in2', 'SourceAlpha')
        .attr('operator', 'in').attr('result', 'colorGlow');
      f.append('feGaussianBlur')
        .attr('in', 'colorGlow').attr('stdDeviation', '5').attr('result', 'blur');
      const m = f.append('feMerge');
      m.append('feMergeNode').attr('in', 'blur');
      m.append('feMergeNode').attr('in', 'SourceGraphic');
    });

        // bow-shaped arrowhead (file 1)
    defs.append('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 -5 15 10')
      .attr('refX', 13)
      .attr('refY', 0)
      .attr('markerWidth', 14).attr('markerHeight', 14)
      .attr('orient', 'auto')
      .append('path')
        .attr('d', 'M0,-5 Q7,0 0,5 L15,0 Z')
        .attr('fill', 'rgba(192,192,192,0.55)');
}