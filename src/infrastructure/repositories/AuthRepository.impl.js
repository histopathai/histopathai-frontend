import { IAuthRepository } from '@/core/repositories/IAuthRepository.js';
import authAPI from '@/infrastructure/http/auth.http-client.js';

// main.js'den Firebase auth'u import ediyoruz
import { auth } from '@/main.js';
import { signInWithEmailAndPassword } from 'firebase/auth';

// Bu sınıf, sözleşmeyi (IAuthRepository) uygular.
export class AuthRepositoryImpl extends IAuthRepository {

  async register(userData) {
    try {
      const response = await authAPI.user.register(userData);
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Kayıt başarısız (AuthRepository)');
    }
  }

  /**
   * Firebase ile giriş yap (Sözleşmeyi uygulama)
   * @param {string} email
   * @param {string} password
   * @returns {Promise<string>} Firebase ID Token
   */
  async login(email, password) {
    try {
      // LoginForm.vue içindeki Firebase mantığı buraya taşındı
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();
      return idToken;
    } catch (error) {
      // Firebase hatalarını yakala
      let errorMessage = 'Giriş başarısız oldu. Lütfen bilgilerinizi kontrol edin.';
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          errorMessage = 'Geçersiz e-posta veya şifre.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Geçersiz e-posta formatı.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'Hesabınız devre dışı bırakılmış.';
          break;
      }
      throw new Error(errorMessage);
    }
  }

  /**
   * Token'ı backend'de doğrula (Sözleşmeyi uygulama)
   * @param {string} token
   * @returns {Promise<object>} Kullanıcı verisi
   */
  async verifyToken(token) {
    try {
      // auth.store.js içindeki mantık buraya taşındı
      const response = await authAPI.user.verifyToken(token);
      return response.data.user; // Sadece kullanıcı verisini döndür
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Token doğrulanamadı (AuthRepository)');
    }
  }

  /**
   * Profil bilgisini backend'den al (Sözleşmeyi uygulama)
   * @returns {Promise<object>} Kullanıcı profili
   */
  async getProfile() {
    try {
      // auth.store.js içindeki mantık buraya taşındı
      const response = await authAPI.user.getProfile();
      return response.data.user;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Profil alınamadı (AuthRepository)');
    }
  }
}
