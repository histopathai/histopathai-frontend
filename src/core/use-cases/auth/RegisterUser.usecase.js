export class RegisterUserUseCase {
  /**
   * @param {IAuthRepository} authRepository - Sözleşmeyi uygulayan bir depo.
   */
  constructor(authRepository) {
    this.authRepository = authRepository;
  }

  /**
   * @param {object} userData - { email, password, displayName }
   */
  async execute(userData) {
    // Burada saf iş kuralları olabilir. Örneğin:
    if (!userData.email || !userData.password) {
      throw new Error('E-posta ve şifre zorunludur.');
    }

    // Asıl işi (kayıt) depoya (repository) yaptırır.
    // Bu use case, API'yi veya Firebase'i bilmez, sadece sözleşmeyi bilir.
    return this.authRepository.register(userData);
  }
}
