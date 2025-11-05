export class Patient {
    constructor({
        id,
        creatorId,
        workspaceId,
        name,
        age,
        gender,
        race,
        disease,
        subtype,
        grade,
        history,
        createdAt,
        updatedAt
    }) {
        // Non-nullable fields
        this._id            = id;
        this._creatorId     = creatorId;
        this._workspaceId   = workspaceId;
        this._name          = name;


        // Nullable fields
        this._age          = age ?? null; 
        this._gender       = gender ?? null;
        this._race         = race ?? null;
        this._disease      = disease ?? null;
        this._subtype      = subtype ?? null;
        this._grade        = grade ?? null;
        this._history      = history ?? null;

        // Date fields with validation
        const createdDate   = new Date(createdAt);
        this._createdAt     = (createdAt && !isNaN(createdDate)) ? createdDate : null;

        const updatedDate   = new Date(updatedAt);
        this._updatedAt     = (updatedAt && !isNaN(updatedDate)) ? updatedDate : null;
    }

    // Getters...
    get id() { return this._id }
    get creatorId() { return this._creatorId }
    get workspaceId() { return this._workspaceId }
    get name() { return this._name }
    get age() { return this._age }
    get gender() { return this._gender }
    get race() { return this._race }
    get disease() { return this._disease }
    get subtype() { return this._subtype }
    get grade() { return this._grade }
    get history() { return this._history }
    get createdAt() { return this._createdAt } 
    get updatedAt() { return this._updatedAt }

    
    hasHistory() {
        return this._history && this._history.trim() !== '';
    }

    toJSON() {
        return {
            id              : this._id,
            creatorId       : this._creatorId,
            workspaceId     : this._workspaceId,
            name            : this._name,
            age             : this._age,
            gender          : this._gender,
            race            : this._race,
            disease         : this._disease,
            subtype         : this._subtype,
            grade           : this._grade,
            history         : this._history,

            createdAt       : this._createdAt?.toISOString() ?? null,
            updatedAt       : this._updatedAt?.toISOString() ?? null
        };
    }

}