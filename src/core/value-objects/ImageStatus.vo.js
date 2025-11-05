export class ImageStatus {
  static UPLOADED = 'UPLOADED'
  static PROCESSING = 'PROCESSING'
  static PROCESSED = 'PROCESSED'
  static FAILED = 'FAILED'

  static VALID_STATUSES = [
    ImageStatus.UPLOADED,
    ImageStatus.PROCESSING,
    ImageStatus.PROCESSED,
    ImageStatus.FAILED
  ]

  constructor(value) {
    if (!ImageStatus.VALID_STATUSES.includes(value)) {
      throw new Error(`Invalid status: ${value}. Must be one of: ${ImageStatus.VALID_STATUSES.join(', ')}`)
    }
    this._value = value
  }

  get value() {
    return this._value
  }

  isUploaded() {
    return this._value === ImageStatus.UPLOADED
  }

  isProcessing() {
    return this._value === ImageStatus.PROCESSING
  }

  isProcessed() {
    return this._value === ImageStatus.PROCESSED
  }

  isFailed() {
    return this._value === ImageStatus.FAILED
  }

  equals(other) {
    return other instanceof ImageStatus && this._value === other._value
  }

  toString() {
    return this._value
  }
}