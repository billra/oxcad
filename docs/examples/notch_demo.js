// demo notch smoothness range
const edges = ox.callRange(6, ox.makeEdge, 0, 40);
const notches = ox.callRange(5, ox.makeNotch, 90, 20, 200, { first: 0, last: 1 });
const le = edges.interleave(notches);
svg.render(le.svgPath(10, 50));
log.print("done.");
