
export class UserStatus {
  static PENDING = 'pending'
  static ACTIVE = 'active'
  static SUSPENDED = 'suspended'

  static VALID_STATUSES = [
    UserStatus.PENDING,
    UserStatus.ACTIVE,
    UserStatus.SUSPENDED
  ]

  constructor(value) {
    if (!UserStatus.VALID_STATUSES.includes(value)) {
      throw new Error(`Invalid status: ${value}. Must be one of: ${UserStatus.VALID_STATUSES.join(', ')}`)
    }
    this._value = value
  }

  get value() {
    return this._value
  }

  isPending() {
    return this._value === UserStatus.PENDING
  }

  isActive() {
    return this._value === UserStatus.ACTIVE
  }

  isSuspended() {
    return this._value === UserStatus.SUSPENDED
  }

  equals(other) {
    return other instanceof UserStatus && this._value === other._value
  }

  toString() {
    return this._value
  }
}