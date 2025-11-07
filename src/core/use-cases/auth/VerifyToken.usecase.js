export class VerifyTokenUseCase {
  /**
   * @param {IAuthRepository} authRepository
   */
  constructor(authRepository) {
    this.authRepository = authRepository;
  }

  /**
   * @param {string} token
   */
  async execute(token) {
    if (!token) {
      throw new Error('Token zorunludur');
    }
    return this.authRepository.verifyToken(token);
  }
}
