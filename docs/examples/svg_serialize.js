// demo SVG serialization
const svgXml = (new XMLSerializer).serializeToString(svg.getContainer());
log.print(svgXml);
