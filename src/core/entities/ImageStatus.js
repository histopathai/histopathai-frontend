import { ImageStatus } from '..value-objects/ImageStatus.vo.js';

export class Image {
    constructor({
        id,
        patientId,
        creatorId,
        name,
        format,
        width,
        height,
        size,
        originPath,
        processedPath,
        status,
        failureReason,
        retryCount,
        lastProcessedAt,
        createdAt,
        updatedAt
    }) {
        // Non-nullable fields
        this._id            = id;
        this._patientId     = patientId;
        this._creatorId     = creatorId;
        this._name          = name;
        this._format        = format;
        this._originPath    = originPath;

        // Nullable fields
        this._width         = width ?? null;
        this._height        = height ?? null;
        this._size          = size ?? null;
        this._processedPath = processedPath ?? null;
        this._failureReason = failureReason ?? null;
        
        this._retryCount    = retryCount ?? 0;
        this._status        = new ImageStatus(status);

        this._lastProcessedAt = (lastProcessedAt && !isNaN(new Date(lastProcessedAt))) 
            ? new Date(lastProcessedAt) 
            : null;
        
        this._createdAt = (createdAt && !isNaN(new Date(createdAt))) 
            ? new Date(createdAt) 
            : null;
        this._updatedAt = (updatedAt && !isNaN(new Date(updatedAt))) 
            ? new Date(updatedAt) 
            : null;
    }

    // Getters
    get id() { return this._id }
    get patientId() { return this._patientId }
    get creatorId() { return this._creatorId }
    get name() { return this._name }
    get format() { return this._format }
    get width() { return this._width }
    get height() { return this._height }
    get size() { return this._size }
    get originPath() { return this._originPath }
    get processedPath() { return this._processedPath }
    get status() { return this._status } 
    get failureReason() { return this._failureReason }
    get retryCount() { return this._retryCount }
    get lastProcessedAt() { return this._lastProcessedAt }
    get createdAt() { return this._createdAt }
    get updatedAt() { return this._updatedAt }


    isRetryable(maxRetries) {
        return this._status.isFailed() && this._retryCount < maxRetries;
    }

    
    toJSON() {
        return {
            id: this._id,
            patientId: this._patientId,
            creatorId: this._creatorId,
            name: this._name,
            format: this._format,
            width: this._width,
            height: this._height,
            size: this._size,
            originPath: this._originPath,
            processedPath: this._processedPath,
            status: this._status.value, // VO'yu string'e çevirir
            failureReason: this._failureReason,
            retryCount: this._retryCount,
            lastProcessedAt: this._lastProcessedAt?.toISOString() ?? null,
            createdAt: this._createdAt?.toISOString() ?? null,
            updatedAt: this._updatedAt?.toISOString() ?? null
        };
    }
}