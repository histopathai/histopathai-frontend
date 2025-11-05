export class AnnotationType {
    constructor({
        id,
        creatorId,
        name,
        description,
        scoreEnabled,
        classificationEnabled,
        classList,
        ScoreName,
        ScoreMin,
        ScoreMax,
        createdAt,
        updatedAt
    }) {
        this._id = id
        this._creatorId = creatorId
        this._name = name
        this._description = description || null
        this._scoreEnabled = scoreEnabled ?? false
        this._classificationEnabled = classificationEnabled ?? false
        this._classList = classList || []
        this._createdAt = new Date(createdAt) || null
        this._updatedAt = new Date(updatedAt) || null
        this._ScoreName = ScoreName || null
        this._ScoreMin = ScoreMin !== undefined ? ScoreMin : null
        this._ScoreMax = ScoreMax !== undefined ? ScoreMax : null
    }

    get id() { return this._id }
    get creatorId() { return this._creatorId }
    get name() { return this._name }
    get description() { return this._description }
    get scoreEnabled() { return this._scoreEnabled }
    get classificationEnabled() { return this._classificationEnabled }
    get classList() { return [...this._classList] }
    get createdAt() { return this._createdAt }
    get updatedAt() { return this._updatedAt }
    get ScoreName() { return this._ScoreName }
    get ScoreMin() { return this._ScoreMin }
    get ScoreMax() { return this._ScoreMax }

    hasDescription() {
        return this._description !== null && this._description.trim() !== ''
    }

    hasClassification() {
        return this._classificationEnabled && this._classList.length > 0
    }

    hasScoring() {
        return this._scoreEnabled && this._ScoreName !== null
    }

    isValidClass(className) {
        return this._classList.includes(className)
    }

    getClassCount() {
        return this._classList.length
    }

    toJSON() {
        return {
            id: this._id,
            creatorId: this._creatorId,
            name: this._name,
            description: this._description,
            scoreEnabled: this._scoreEnabled,
            classificationEnabled: this._classificationEnabled,
            classList: [...this._classList],
            createdAt: this._createdAt ? this._createdAt.toISOString() : null,
            updatedAt: this._updatedAt ? this._updatedAt.toISOString() : null,
            ScoreName: this._ScoreName,
            ScoreMin: this._ScoreMin,
            ScoreMax: this._ScoreMax
        }
    }

    static create(data) {
        return new AnnotationType(data)
    }
}

