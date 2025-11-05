export class UserRole {

    static ADMIN = 'admin'
    static USER = 'user'
    static VIEWER = 'viewer'
    static UNASSIGNED = 'unassigned'

    static VALID_ROLES = [
        UserRole.ADMIN,
        UserRole.USER,
        UserRole.VIEWER,
        UserRole.UNASSIGNED
    ]

    constructor(value) {
        if (!UserRole.VALID_ROLES.includes(value)) {
            throw new Error(`Invalid role: ${value}. Must be one of: ${UserRole.VALID_ROLES.join(', ')}`)
        }
        this._value = value
    }
    
    get value() {
        return this._value
    }

    isAdmin() {
        return this._value === UserRole.ADMIN
    }

    isUser() {
        return this._value === UserRole.USER
    }

    isViewer() {
        return this._value === UserRole.VIEWER
    }

    isUnassigned() {
        return this._value === UserRole.UNASSIGNED
    }

    equals(other) {
        return other instanceof UserRole && this._value === other._value
    }
    
    toString() {
        return this._value
    }
}