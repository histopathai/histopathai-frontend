
export class Email {
  constructor(value) {
    if (!value || typeof value !== 'string') {
      throw new Error('Email cannot be null or empty')
    }
    
    const trimmed = value.toLowerCase().trim()
    
    if (!this._isValid(trimmed)) {
      throw new Error(`Invalid email format: ${value}`)
    }
    
    this._value = trimmed
  }

  get value() {
    return this._value
  }

  getDomain() {
    return this._value.split('@')[1]
  }

  getUsername() {
    return this._value.split('@')[0]
  }

  _isValid(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  equals(other) {
    return other instanceof Email && this._value === other._value
  }

  toString() {
    return this._value
  }
}