export class GetUserProfileUseCase {
  /**
   * @param {IAuthRepository} authRepository
   */
  constructor(authRepository) {
    this.authRepository = authRepository;
  }

  async execute() {
    // Token veya ID olmadan çağrılır, çünkü token interceptor'dadır.
    return this.authRepository.getProfile();
  }
}
