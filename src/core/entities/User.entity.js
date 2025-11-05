import { UserStatus } from '../value-objects/UserStatus.vo.js'
import { UserRole } from '../value-objects/UserRole.vo.js'
import { Email } from '../value-objects/Email.vo.js'


export class User {
    constructor({
        uid,
        email,
        displayName,
        role,
        status,
        adminApproved,
        approvalDate,
        createdAt,
        updatedAt
    }) {
        this._uid = uid
        this._email = new Email(email)
        this._displayName = displayName
        this._role = new UserRole(role)
        this._status = new UserStatus(status)
        this._adminApproved = adminApproved ?? false
        this._approvalDate = approvalDate ? new Date(approvalDate) : null
        this._createdAt = new Date(createdAt)
        this._updatedAt = new Date(updatedAt)
    }

    // Getters (read-only access)
    get uid() { return this._uid }
    get email() { return this._email.value }
    get displayName() { return this._displayName }
    get role() { return this._role.value }
    get status() { return this._status.value }
    get adminApproved() { return this._adminApproved }
    get approvalDate() { return this._approvalDate }
    get createdAt() { return this._createdAt }
    get updatedAt() { return this._updatedAt }

    // Domain Logic (Business Rules)
    isActive() {
        return this._status.isActive()
    }

    isPending() {
        return this._status.isPending()
    }

    isSuspended() {
        return this._status.isSuspended()
    }

    isAdmin() {
        return this._role.isAdmin()
    }

    isViewer() {
        return this._role.isViewer()
    }

    canAccessFeature() {
        return this.isActive() && this._adminApproved
    }

    needsApproval() {
        return this.isPending() && !this._adminApproved
    }

    getInitials() {
        if (!this._displayName) return ''
        return this._displayName
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    getStatusLabel() {
        const labels = {
            [UserStatus.PENDING]: 'pending',
            [UserStatus.ACTIVE]: 'active',
            [UserStatus.SUSPENDED]: 'suspended',
        }
        return labels[this._status.value] || 'unknown'
    }

    getRoleLabel() {
        const labels = {
            [UserRole.ADMIN]: 'admin',
            [UserRole.USER]: 'user',
            [UserRole.VIEWER]: 'viewer',
            [UserRole.UNASSIGNED]: 'unassigned',
        }
        return labels[this._role.value] || 'unknown'
    }

    getID() {
        return this._uid
    }

    // Serialization
    toJSON() {
        return {
            uid: this._uid,
            email: this._email.value,
            displayName: this._displayName,
            role: this._role.value,
            status: this._status.value,
            adminApproved: this._adminApproved,
            approvalDate: this._approvalDate?.toISOString() || null,
            createdAt: this._createdAt.toISOString(),
            updatedAt: this._updatedAt.toISOString(),
        }
    }

    //Factory Method
    static create(data) {
        return new User(data)
    }
}

