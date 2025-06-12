// demo raw svg usage
svg.render('<circle id="yellowCircle1" style="stroke:blue;stroke-width:4;fill:yellow;" cx="170" cy="200" r="20"/>');
svg.render('<circle id="orangeCircle1" style="stroke:blue;stroke-width:4;fill:darkorange;" cx="230" cy="200" r="20"/>');
svg.render('<g transform="scale(5)"><path id="testPath" d="M10,10 l20,10 l-10,10" style="stroke: #0000cc; stroke-width: 2px; fill:#ccccff;"/></g>');
const curve = document.getElementById('testPath');
const len = curve.getTotalLength();
const pos = curve.getPointAtLength(len);
const bbox = curve.getBBox();
// note that properties ignores surrounding transform
log.print('path len', len, 'end xy', pos.x, pos.y, 'bbox:', bbox.x, bbox.y, bbox.x + bbox.width, bbox.y + bbox.height, bbox.style);
