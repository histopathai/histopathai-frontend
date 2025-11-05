export class Session {
    constructor({
        sessionId,
        userId,
        createdAt,
        expiresAt,
        lastUsedAt,
        requestCount,
        metadata
    }) {
        this._sessionId = sessionId
        this._userId = userId
        this._createdAt = new Date(createdAt)
        this._expiresAt = new Date(expiresAt)
        this._lastUsedAt = new Date(lastUsedAt)
        this._requestCount = requestCount || 0
        this._metadata = metadata || {}
    }

    get sessionId() { return this._sessionId }
    get userId() { return this._userId }
    get createdAt() { return this._createdAt }
    get expiresAt() { return this._expiresAt }
    get lastUsedAt() { return this._lastUsedAt }
    get requestCount() { return this._requestCount }
    get metadata() { return { ...this._metadata } }

    isExpired() {
        return new Date() > this._expiresAt
    }

    isValid() {
        return !this.isExpired()
    }

    getTimeLeft() {
        const now = newDate()
        const diff = this._expiresAt - now
        if(diff <= 0) return '0s'

        const minutes = Math.floor(diff / 60000)
        const seconds = Math.floor((diff % 60000) / 1000)
        
        return `${minutes}m ${seconds}s`
    }

    needsRefresh(thresholdMinutes = 5) {
        const now = new Date()
        const buffer = bufferMinutes * 60 * 1000
        return (this._expiresAt - now) <= buffer
    }

    getID() {
        return this._sessionId
    }

    toJSON() {
        return {
            sessionId: this._sessionId,
            userId: this._userId,
            createdAt: this._createdAt.toISOString(),
            expiresAt: this._expiresAt.toISOString(),
            lastUsedAt: this._lastUsedAt.toISOString(),
            requestCount: this._requestCount,
            metadata: { ...this._metadata }
        }
    }

    static create(data) {
        return new Session(data)
    }
}