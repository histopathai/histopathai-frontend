export class Workspace {
    constructor({
        id,
        creatorId,
        annotationTypeId,
        name,
        organType,
        description,
        organization,
        license,
        resourceURL,
        releaseYear,
        createdAt,
        updatedAt
    }) {
        // Non-nullable fields
        this._id                = id;
        this._creatorId         = creatorId;
        this._name              = name;
        this._organType         = organType;
        this._organization      = organization;
        this._license           = license;


        // Nullable fields with proper handling
        this._annotationTypeId  = annotationTypeId ?? null;
        this._resourceURL       = resourceURL ?? null;
        this._releaseYear       = releaseYear ?? null;
        this._description       = description ?? ""; 

        const createdDate   = new Date(createdAt);
        this._createdAt     = (createdAt && !isNaN(createdDate)) ? createdDate : null;

        const updatedDate   = new Date(updatedAt);
        this._updatedAt     = (updatedAt && !isNaN(updatedDate)) ? updatedDate : null;
    }

    // Getters...
    get id() { return this._id }
    get creatorId() { return this._creatorId }
    get annotationTypeId() { return this._annotationTypeId } 
    get name() { return this._name }
    get organType() { return this._organType }
    get description() { return this._description }
    get organization() { return this._organization }
    get license() { return this._license }
    get resourceURL() { return this._resourceURL }
    get releaseYear() { return this._releaseYear }
    get createdAt() { return this._createdAt }
    get updatedAt() { return this._updatedAt }

    hasDescription() {
        return this._description.trim() !== '';
    }

    hasResourceURL() {
        return this._resourceURL && this._resourceURL.trim() !== '';
    }

    hasAnnotationType() {
        return this._annotationTypeId && this._annotationTypeId.trim() !== '';
    }

    toJSON() {
        return {
            id                  : this._id,
            creatorId           : this._creatorId,
            annotationTypeId    : this._annotationTypeId,
            name                : this._name,
            organType           : this._organType,
            description         : this._description,
            organization        : this._organization,
            license             : this._license,
            resourceURL         : this._resourceURL,
            releaseYear         : this._releaseYear,
            createdAt           : this._createdAt?.toISOString() ?? null,
            updatedAt           : this._updatedAt?.toISOString() ?? null
        };
    }
}