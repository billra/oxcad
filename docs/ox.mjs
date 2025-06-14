// --- utility ---

// JavaScript silently accepts missing parameters.
// Use default parameters to throw required parameter errors.
function required(name) {
    throw new Error(`missing '${name}' parameter`);
}

function assert(
    condition = required('condition'),
    message = required('message')) {
    if (!condition) {
        throw new Error(message);
    }
}

// Call function with a range of values, produce an array of results. Each parameter
// is either a fixed value, or an object with 'first' and 'last' numeric values.
// Example: callRange(5, (a, b) => [a, b], 'x', { first: 0, last: 10 });
// Result: [['x', 0], ['x', 2.5], ['x', 5], ['x', 7.5], ['x', 10]]
export function callRange(count, func, ...rest) {
    const items = Array.from({ length: count }, (_, i) =>
        func(...rest.map(arg => {
            const { first, last } = typeof arg === 'object' ? arg : { first: arg, last: arg };
            return count === 1 ? first : first + (last - first) * (i / (count - 1));
        }))
    );
    return new Container(items);
}

export function svgText(x, y, text, size = 12, color = 'var(--svg-stroke)') {
    const str = `<text x="${x}" y="${y}" font-family="Verdana, sans-serif" font-size="${size}" fill="${color}">${text}</text>`;
    return str;
}

// --- classes ---

class Container {
    #items;
    constructor(items) {
        this.#items = items;
        // entire edge length of the drawing element
        this.edgeLength = this.#items.reduce((sum, obj) => sum + obj.edgeLen, 0);
        // end position of the drawing element relative to the start
        this.end = this.#items.reduce(
            (sum, item) => ({ x: sum.x + item.end.x, y: sum.y + item.end.y }),
            { x: 0, y: 0 }
        );
    }
    concat(rhs) {
        return new Container(this.#items.concat(rhs.#items));
    }
    // ['a', 'b', 'c'], [1, 2] -> ['a', 1, 'b', 2, 'c']
    interleave(rhs) {
        assert(this.#items.length - 1 === rhs.#items.length, `bad lengths: ${this.#items.length}, ${rhs.#items.length}`);
        const a = new Container(this.#items.flatMap((item, i) => i < rhs.#items.length ? [item, rhs.#items[i]] : [item]));
        return a;
    }
    scale(factor) {
        return new Container(this.#items.map(item => item.scale(factor)));
    }
    mirror(axis) {
        return new Container(this.#items.map(item => item.mirror(axis)));
    }
    reflect(axis) {
        // -1 -> last item is not reflected
        const items = this.#items.slice(0, -1).reverse(); // collect tail items
        const tail = items.map(item => item.mirror(axis)); // reverse each tail item
        return new Container(this.#items.concat(tail));
    }
    // SVG strings
    svgPath(x, y, color = 'var(--svg-stroke)', width = '1pt') {
        const str = this.#items.reduce(function (parts, item) { return parts + item.part; }, `<path d="M${x},${y}`) +
            `" stroke="${color}" stroke-width="${width}" fill="none"/>`;
        console.log('svgPath', str);
        return str;
    }
    svgSurface(x, y, color = 'var(--svg-stroke)', width = '1pt') {
        // todo: center drawing on nearest major grid line
        const fill = 'var(--svg-fill)';
        const opacity = 'var(--svg-fill-opacity)';
        const str = this.#items.reduce(function (parts, elem) { return parts + elem.part; }, `<path d="M${x},${y}`) +
            `Z" stroke="${color}" stroke-width="${width}" fill="${fill}" fill-opacity="${opacity}"/>`;
        console.log('svgSurface', str);
        return str;
    }
}

function radians(degrees) {
    return degrees * Math.PI / 180;
}

function move(angle, length, from = { x: 0, y: 0 }) {
    const rad = radians(angle);
    return {
        x: length * Math.cos(rad) + from.x,
        y: length * Math.sin(rad) + from.y
    };
}

// mirror angle across axis
function mirrorAngle(angle, axis) {
    return 2 * axis - angle;
}

class Edge {
    constructor(angle, length) {
        this.end = move(angle, length);
        this.part = `l${this.end.x},${this.end.y}`;
        this.edgeLen = length;
        this.scale = factor => new Edge(angle, length * factor);
        this.mirror = axis => new Edge(mirrorAngle(angle, axis - 90), length); // why -90?
    }
}

export function makeEdge(
    angle = required('angle'),
    length = required('length')) {
    return new Edge(angle, length);
}

// return the end position of the drawing element relative to the start
function xyEnd(items) {
    return items.reduce(
        (sum, item) => ({ x: sum.x + item.x, y: sum.y + item.y }),
        { x: 0, y: 0 }
    );
}

class NotchFlat {
    constructor(angle, openAngle, length) {
        const halfOpenAngle = openAngle / 2;
        const a12 = angle - halfOpenAngle;
        const a56 = angle + halfOpenAngle - 180;

        const m1 = move(a12, length); // bottom of notch
        const m6 = move(a56, length); // top end of notch
        this.end = xyEnd([m1, m6]);
        this.part =
            `l${m1.x},${m1.y}` +
            `l${m6.x},${m6.y}`;

        this.edgeLen = 0;
        this.scale = factor => new Notch(angle, openAngle, length * factor);
        this.mirror = axis => new Notch(mirrorAngle(angle, axis), openAngle, length);
    }
}

class NotchCurve {
    constructor(angle, openAngle, length) {
        const halfOpenAngle = openAngle / 2;
        const a12 = angle - halfOpenAngle;
        const a56 = angle + halfOpenAngle - 180;

        const resLen = length / 2;
        const m2 = move(a12, resLen);         // Bézier control point
        const m3 = move(angle, resLen, m2);   // bottom of notch, Bézier end and start point
        const m4 = move(angle - 180, resLen); // Bézier control point
        const m5 = move(a56, resLen, m4);     // top end of notch, Bézier end point
        this.end = xyEnd([m3, m5]);
        this.part =
            `q${m2.x},${m2.y} ${m3.x},${m3.y}` +
            `q${m4.x},${m4.y} ${m5.x},${m5.y}`;

        this.edgeLen = 0;
        this.scale = factor => new Notch(angle, openAngle, length * factor);
        this.mirror = axis => new Notch(mirrorAngle(angle, axis), openAngle, length);
    }
}

// todo: special case smooth <= 0 and smooth >=1 with fewer segments
class Notch {
    constructor(angle, openAngle, length, smooth) {
        const halfOpenAngle = openAngle / 2;
        const a12 = angle - halfOpenAngle;
        const a56 = angle + halfOpenAngle - 180;

        const resLen = length / (1 + smooth); // overall length similar for straight and smooth notches
        const lenV = resLen * (1 - smooth);
        const lenB = resLen * smooth;
        const m1 = move(a12, lenV);              // x,y: end of straight line segment
        const m2 = move(a12, lenB);              // x,y: quadratic Bézier control point
        const m3 = move(angle, lenB, m2);        // x,y: bottom of notch, end of old and start of new quadratic Bézier
        const m4 = move(angle - 180, lenB);      // x,y: quadratic Bézier control point
        const m5 = move(a56, lenB, m4);          // x,y: end of quadratic Bézier, start of straight line segment
        const m6 = move(a56, lenV);              // x,y: end of straight line segment
        this.end = xyEnd([m1, m3, m5, m6]);
        this.part =
            `l${m1.x},${m1.y}` +
            `q${m2.x},${m2.y} ${m3.x},${m3.y}` +
            `q${m4.x},${m4.y} ${m5.x},${m5.y}` +
            `l${m6.x},${m6.y}`;

        this.edgeLen = 0;
        this.scale = factor => new Notch(angle, openAngle, length * factor, smooth);
        this.mirror = axis => new Notch(mirrorAngle(angle, axis), openAngle, length, smooth);
    }
}

export function makeNotch(
    angle = required('angle'),
    openAngle = required('openAngle'),
    length = required('length'),
    smooth = required('smooth')) {
    return new Notch(angle, openAngle, length, smooth);
}
