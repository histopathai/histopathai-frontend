export class Point {
    constructor(x, y) {
        this._x = Number(x) || 0;
        this._y = Number(y) || 0;

        Object.freeze(this);
    }

    get x() {
        return this._x;
    }

    get y() {
        return this._y;
    }

    equals(otherPoint) {
        return otherPoint instanceof Point &&
               this._x === otherPoint._x &&
               this._y === otherPoint._y;
    }

    toJSON() {
        return {
            x: this._x,
            y: this._y
        };
    }
}