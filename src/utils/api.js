import axios from 'axios';

export class APIClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.axios = axios.create({
      baseURL: baseUrl,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Dart/3.0 (dart:io)',
        'Accept-Encoding': 'gzip'
      }
    });
  }

  async login(nd, password) {
    try {
      const response = await this.axios.post('/auth/login_new', {
        nd,
        password,
        lang: 'fr'
      });
      return response.data;
    } catch (error) {
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  async getAccountInfo(token) {
    try {
      const response = await this.axios.get('/compte_augmentation_debit', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get account info: ${error.message}`);
    }
  }
}