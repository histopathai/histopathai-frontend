import { useAuthStore } from '@/application/state/auth.store.js';

export class AuthService {
  constructor(registerUserUseCase, verifyTokenUseCase, authRepository, getUserProfileUseCase) { // <-- YENİ
    this.registerUserUseCase = registerUserUseCase;
    this.verifyTokenUseCase = verifyTokenUseCase;
    this.authRepository = authRepository;
    this.getUserProfileUseCase = getUserProfileUseCase; // <-- YENİ
    this.authStore = useAuthStore();
  }

  async handleRegistration(userData) {
    this.authStore.setLoading(true);
    this.authStore.setError(null);

    try {
      // 1. İşi "core" katmanındaki use case'e yönlendir
      const result = await this.registerUserUseCase.execute(userData);

      // 2. Başarılı sonucu "state"e yansıt
      this.authStore.setRegistrationSuccess(result.user);

      return { success: true, message: result.message || 'Kayıt başarılı' };

    } catch (err) {
      // 3. Hata sonucunu "state"e yansıt
      this.authStore.setError(err.message);
      return { success: false, message: err.message };
    } finally {
      // 4. Yüklenme durumunu bitir
      this.authStore.setLoading(false);
    }
  }
  /**
   * Giriş işlemini yönetir.
   * @param {string} email
   * @param {string} password
   */
  async handleLogin(email, password) {
    this.authStore.setLoading(true);
    this.authStore.setError(null);

    try {
      // 1. Firebase'e giriş yap ve token al (Infrastructure)
      const idToken = await this.authRepository.login(email, password);

      // 2. Token'ı alıp backend'de doğrula (Core)
      const user = await this.verifyTokenUseCase.execute(idToken);

      // 3. Başarılı sonucu state'e yansıt (Application)
      this.authStore.setAuthData(idToken, user);

      return { success: true, user };

    } catch (err) {
      this.authStore.setError(err.message);
      this.authStore.clearAuth(); // Hata durumunda state'i temizle
      return { success: false, message: err.message };
    } finally {
      this.authStore.setLoading(false);
    }
  }

  /**
   * Çıkış işlemini yönetir.
   */
  handleLogout() {
    // Logout için logic gerekmiyorsa direkt store'u temizle
    this.authStore.clearAuth();
  }

  /**
   * Profil alma işlemini yönetir.
   */
  async handleGetProfile() {
    this.authStore.setLoading(true);
    this.authStore.setError(null);

    try {
      // 1. Core'dan profili iste
      const user = await this.getUserProfileUseCase.execute();

      // 2. State'i güncelle
      this.authStore.setUserProfile(user);
      return { success: true, user };

    } catch (err) {
      this.authStore.setError(err.message);
      return { success: false, message: err.message };
    } finally {
      this.authStore.setLoading(false);
    }
  }
}
