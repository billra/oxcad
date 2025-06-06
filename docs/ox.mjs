// ['a', 'b', 'c'], [1, 2] -> ['a', 1, 'b', 2, 'c']
export function interleave(a, b) {
    return a.flatMap((x, i) => i < b.length ? [x, b[i]] : [x]);
}

// Call function with a range of values, produce an array of results. Each parameter
// is either a fixed value, or an object with 'first' and 'last' numeric values.
// Example: callRange(5, (a, b) => [a, b], 'x', { first: 0, last: 10 });
// Result: [['x', 0], ['x', 2.5], ['x', 5], ['x', 7.5], ['x', 10]]
export function callRange(count, func, ...rest) {
    return Array.from({ length: count }, (_, i) =>
        func(...rest.map(arg => {
            const { first, last } = typeof arg === "object" ? arg : { first: arg, last: arg };
            return count === 1 ? first : first + (last - first) * (i / (count - 1));
        }))
    );
}

export function surface(x, y, edge1, edge2, color = 'var(--svg-stroke)', width = '1pt') {
    // todo: center drawing on nearest major grid line
    const fill = 'var(--svg-fill)';
    const opacity = 'var(--svg-fill-opacity)';
    const outline = edge1.concat(edge2);
    const str = outline.reduce(function (x, elem) { return x + elem.part; }, `<path d="M${x},${y}`) +
        `Z" stroke="${color}" stroke-width="${width}" fill="${fill}" fill-opacity="${opacity}"/>`;
    return str;
}

export function path(x, y, objs, color = 'var(--svg-stroke)', width = '1pt') {
    const str = objs.reduce(function (x, elem) { return x + elem.part; }, `<path d="M${x},${y}`) +
        `" stroke="${color}" stroke-width="${width}" fill="none"/>`;
    return str;
}

// return the entire edge length of the drawing element
export function edgeLength(objs) {
    return objs.reduce((sum, obj) => sum + obj.edgeLen, 0);
}

// return the end position of the drawing element relative to the start
export function endPoint(objs) {
    return objs.reduce(
        (sum, obj) => ({ x: sum.x + obj.x, y: sum.y + obj.y }),
        { x: 0, y: 0 }
    );
}

export function reflect(objs, mirrorAngleDeg = 90) { // mirror default Y axis
    const tail = clone(objs.slice(0, -1).reverse(), 1, mirrorAngleDeg); // no reflection on center item
    return objs.concat(tail);
}

// mirror angle across axis
function mirror(angle, axis) {
  return 2 * axis - angle;
}

function radians(degrees) {
    return degrees * Math.PI / 180;
}

function move(angleDeg, length, from = { x: 0, y: 0 }) {
    const angleRad = radians(angleDeg);
    return {
        x: length * Math.cos(angleRad) + from.x,
        y: length * Math.sin(angleRad) + from.y
    };
}

class Edge {
    constructor(angleDeg, length) {
        const end = move(angleDeg, length);
        this.part = `l${end.x},${end.y}`;
        this.edgeLen = length;
        this.scale = factor => new Edge(angleDeg, length * factor);
        this.mirror = axis => new Edge(mirror(angleDeg, axis), length);
        this.x = end.x;
        this.y = end.y;
    }
}

export function makeEdge(
    angleDeg = required('angleDeg'),
    length = required('length')) {
    return new Edge(angleDeg, length);
}

// todo: special case smooth <= 0 and smooth >=1 with fewer segments
class Notch {
    constructor(angleDeg, angleOpenDeg, length, smooth) {
        const resLen = length / (1 + smooth); // make overall length the same for straight and smooth notches
        const halfAngleOpenDeg = angleOpenDeg / 2;
        const a12 = angleDeg - halfAngleOpenDeg;
        const a56 = angleDeg + halfAngleOpenDeg - 180;
        const lenV = resLen * (1 - smooth);
        const lenB = resLen * smooth;
        const m1 = move(a12, lenV);
        const m2 = move(a12, lenB);
        const m3 = move(angleDeg, lenB, m2);
        const m4 = move(angleDeg - 180, lenB);
        const m5 = move(a56, lenB, m4);
        const m6 = move(a56, lenV);
        const end = endPoint([m1, m3, m5, m6]);
        this.part =
            `l${m1.x},${m1.y}` +
            `q${m2.x},${m2.y} ${m3.x},${m3.y}` +
            `q${m4.x},${m4.y} ${m5.x},${m5.y}` +
            `l${m6.x},${m6.y}`;
        this.edgeLen = 0;
        this.scale = factor => new Notch(angleDeg, angleOpenDeg, length * factor, smooth);
        this.mirror = axis => new Notch(mirror(angleDeg, axis), angleOpenDeg, length, smooth);
        this.x = end.x;
        this.y = end.y;
    }
}

export function makeNotch(
    angleDeg = required('angleDeg'),
    angleOpenDeg = required('angleOpenDeg'),
    length = required('length'),
    smooth = required('smooth')) {
    return new Notch(angleDeg, angleOpenDeg, length, smooth);
}

// JavaScript silently accepts missing parameters.
// Use default parameters to throw required parameter errors.
function required(name) {
    throw new Error(`missing '${name}' parameter`);
}

class Container {
    #items;
    constructor(items) {
        this.#items = items;
    }
    scale(factor) {
        return new Container(this.#items.map(item => item.scale(factor)));
    }
    mirror(axis) {
        return new Container(this.#items.map(item => item.mirror(axis)));
    }
}
