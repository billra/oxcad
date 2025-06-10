// --- Alfa ---
// leading edge
const leEdges = ox.callRange(3, ox.makeEdge, { first: -20, last: 0 }, 180);
const leNotches = ox.callRange(2, ox.makeNotch, { first: 75, last: 85 }, 20, { first: 100, last: 140 }, 2 / 3);
const leSide = leEdges.interleave(leNotches);
const le = leSide.reflect(90);
// trailing edge
const teEdges = ox.callRange(2, ox.makeEdge, { first: 135, last: 180 }, 100);
const teNotches = ox.callRange(1, ox.makeNotch, 255, 30, 50, 2 / 3);
const teSide = teEdges.interleave(teNotches);
const te = teSide.reflect(90);
// scale trailing edge to match leading edge width
const factor = le.end.x / -te.end.x;
log.print("trailing edge scale factor:", factor);
const teScaled = te.scale(factor);
log.print(`le end: ${le.end.x},${le.end.y}`);
log.print(`te end: ${teScaled.end.x},${teScaled.end.y}`);
// draw canopy
const outline = le.concat(teScaled);
const xMid = 600;
const xpos = xMid - le.end.x / 2; // center at major grid line
svg.render(outline.svgSurface(xpos, 110));
svg.render(ox.svgText(xMid - 18, 200, 'Alfa', 20));
//svg.printPlans();
log.print("done.");
