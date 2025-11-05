import { Point } from '../value-objects/Point.vo.js';

export class Annotation {
    constructor({
        id,
        imageId,
        annotatorId,
        polygon,
        scoreValue, 
        className,
        description,
        createdAt,
        updatedAt
    }) {
        // Non-nullable fields
        this._id            = id;
        this._imageId       = imageId;
        this._annotatorId   = annotatorId;
        this._polygon = (polygon || []).map(p => new Point(p.x, p.y));

        // Nullable fields with proper handling
        this._scoreValue    = scoreValue ?? null;
        this._className     = className ?? null;
        this._description   = description ?? null;
        const createdDate   = new Date(createdAt);
        this._createdAt     = (createdAt && !isNaN(createdDate)) ? createdDate : null;
        const updatedDate   = new Date(updatedAt);
        this._updatedAt     = (updatedAt && !isNaN(updatedDate)) ? updatedDate : null;
    }

    get id() { return this._id }
    get imageId() { return this._imageId }
    get annotatorId() { return this._annotatorId }
    get polygon() { return this._polygon }
    get scoreValue() { return this._scoreValue } 
    get className() { return this._className }
    get description() { return this._description }
    get createdAt() { return this._createdAt }
    get updatedAt() { return this._updatedAt }

    hasScoreValue() {
        return this._scoreValue !== null;
    }

    hasClassName() {
        return this._className && this._className.trim() !== '';
    }

    hasDescription() {
        return this._description && this._description.trim() !== '';
    }

    isValidForType(annotationType) {
        if (annotationType.classificationEnabled && !this.hasClassName()) {
            return false;
        }
        if (annotationType.scoreEnabled && !this.hasScoreValue()) {
            return false;
        }
        if (this._className && !annotationType.isValidClass(this._className)) {
            return false;
        }
        if (this._scoreValue !== null) {
            if (annotationType.ScoreMin !== null && this._scoreValue < annotationType.ScoreMin) {
                return false;
            }
            if (annotationType.ScoreMax !== null && this._scoreValue > annotationType.ScoreMax) {
                return false;
            }
        }
        return true;
    }

    toJSON() {
        return {
            id          : this._id,
            imageId     : this._imageId,
            annotatorId : this._annotatorId,
            polygon     : this._polygon.map(p => p.toJSON()),            
            scoreValue  : this._scoreValue,
            className   : this._className,
            description : this._description,
            createdAt   : this._createdAt?.toISOString() ?? null,
            updatedAt   : this._updatedAt?.toISOString() ?? null
        };
    }
}