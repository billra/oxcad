// example using reflect
const edges = ox.callRange(3, ox.makeEdge, { first: -20, last: 0 }, 200);
const notches = ox.callRange(2, ox.makeNotch, { first: 75, last: 85 }, 20, 100, 2 / 3);
const side = edges.interleave(notches);
const le = side.reflect(90);
svg.render(le.svgPath(10, 200));
log.print('edge length:', le.edgeLength);
log.print('relative leading edge end:', le.end.x, le.end.y);
log.print('done.');
