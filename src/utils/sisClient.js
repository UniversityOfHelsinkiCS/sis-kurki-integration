class SisClient {
  constructor({ httpClient, token }) {
    this.httpClient = httpClient;
    this.token = token;
  }

  getAuthorizedRequestOptions(options) {
    const normalizedOptions = options || {};

    const { params } = normalizedOptions;

    return {
      ...normalizedOptions,
      params: { token: this.token, ...params },
    };
  }

  getRequest(url, options) {
    return this.httpClient.get(url, this.getAuthorizedRequestOptions(options));
  }

  async getCourseUnitRealisationByCode(code) {
    if (!code) {
      throw new Error('Course code is required');
    }

    const { data } = await this.getRequest('/courses', { params: { code } });

    return data;
  }
}

export default SisClient;
