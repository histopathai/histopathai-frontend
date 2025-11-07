export class IAuthRepository {
  async register(userData) {
    throw new Error('IAuthRepository.register metodu uygulanmalıdır');
  }

  /**
   * Firebase Auth ile giriş yapar.
   * @param {string} email
   * @param {string} password
   * @returns {Promise<string>} Firebase ID Token
   */
  async login(email, password) {
    throw new Error('IAuthRepository.login metodu uygulanmalıdır');
  }

  /**
   * Firebase token'ını bizim backend'imizde doğrular.
   * @param {string} token
   * @returns {Promise<object>} Kullanıcı verisi
   */
  async verifyToken(token) {
    throw new Error('IAuthRepository.verifyToken metodu uygulanmalıdır');
  }

  /**
   * Backend'den mevcut kullanıcının profil bilgilerini çeker.
   * @returns {Promise<object>} Kullanıcı profili verisi
   */
  async getProfile() {
    throw new Error('IAuthRepository.getProfile metodu uygulanmalıdır');
  }
}
