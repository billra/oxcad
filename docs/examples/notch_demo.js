// demo notch smoothness range
const edges = ox.callRange(6, ox.makeEdge, 0, 40);
const notches = ox.callRange(5, ox.makeNotch, 90, 20, 200, { first: 0, last: 1 });
const le = edges.interleave(notches);
svg.render(le.svgPath(10, 50));
const points = [ox.makePoint(10, 70, 'random point'), ox.makePoint(20, 180, 'another point')];
svg.render(ox.svgPoints(points));
log.print('done.');
