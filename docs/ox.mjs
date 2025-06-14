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
    assert(length > 0, `length: ${length}, must be greater than zero`);
    return new Edge(angle, length);
}

// return the end position of the drawing element relative to the start
function xyEnd(items) {
    return items.reduce(
        (sum, item) => ({ x: sum.x + item.x, y: sum.y + item.y }),
        { x: 0, y: 0 }
    );
}

// for reference: same result as Notch where smooth = 0
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

// for reference: same result as Notch where smooth = 1
class NotchCurve {
    constructor(angle, openAngle, length) {
        const halfOpenAngle = openAngle / 2;
        const a12 = angle - halfOpenAngle;
        const a56 = angle + halfOpenAngle - 180;

        const af = length / 2;
        const m2 = move(a12, af);         // Bézier control point
        const m3 = move(angle, af, m2);   // bottom of notch, Bézier end and start point
        const m4 = move(angle - 180, af); // Bézier control point
        const m5 = move(a56, af, m4);     // top end of notch, Bézier end point
        this.end = xyEnd([m3, m5]);
        this.part =
            `q${m2.x},${m2.y} ${m3.x},${m3.y}` +
            `q${m4.x},${m4.y} ${m5.x},${m5.y}`;

        this.edgeLen = 0;
        this.scale = factor => new Notch(angle, openAngle, length * factor);
        this.mirror = axis => new Notch(mirrorAngle(angle, axis), openAngle, length);
    }
}

class Notch {
    constructor(angle, openAngle, length, smooth) {
        const halfOpenAngle = openAngle / 2;
        const a12 = angle - halfOpenAngle;
        const a56 = angle + halfOpenAngle - 180;

        // adjustment factor: straight and curved notches have similar length
        const af = length / (1 + smooth);
        const lenV = af * (1 - smooth);     // 0 when smooth = 1
        const lenB = af * smooth;           // 0 when smooth = 0
        const m1 = move(a12, lenV);         // end of line segment
        const m2 = move(a12, lenB);         // Bézier control point
        const m3 = move(angle, lenB, m2);   // bottom of notch, Bézier end and start point
        const m4 = move(angle - 180, lenB); // Bézier control point
        const m5 = move(a56, lenB, m4);     // end of Bézier, start of line segment
        const m6 = move(a56, lenV);         // end of line segment
        this.end = xyEnd([m1, m3, m5, m6]);
        this.part =                         // special case line only and curve only
            (lenV ? `l${m1.x},${m1.y}` : '') +
            (lenB ? `q${m2.x},${m2.y} ${m3.x},${m3.y}` : '') +
            (lenB ? `q${m4.x},${m4.y} ${m5.x},${m5.y}` : '') +
            (lenV ? `l${m6.x},${m6.y}` : '');

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
    assert(length > 0, `length: ${length}, must be greater than zero`);
    assert(0 <= smooth && smooth <= 1, `smooth: ${length}, must be in the range 0 to 1`);
    return new Notch(angle, openAngle, length, smooth);
}
