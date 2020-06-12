import { isArray } from 'lodash';

class SisClient {
  constructor({ httpClient, token }) {
    this.httpClient = httpClient;
    this.token = token;
  }

  getAuthorizedRequestOptions(options) {
    const normalizedOptions = options ? options : {};

    const { params } = normalizedOptions;

    return {
      ...normalizedOptions,
      params: { token: this.token, ...params },
    };
  }

  getRequest(url, options) {
    return this.httpClient.get(url, this.getAuthorizedRequestOptions(options));
  }

  async getCourseUnits(options = {}) {
    const { codes } = options;

    if (!isArray(codes) || codes.length === 0) {
      // At the moment codes array is required
      throw new Error('At least one course code is required');
    }

    const params = {
      codes: codes.join(','),
    };

    const { data } = await this.getRequest('/course_units', { params });

    return data;
  }

  async getCourseUnitRealisationsByCode(code) {
    if (!code) {
      throw new Error('Course code is required');
    }

    const { data } = await this.getRequest(`/course_unit_realisations`, {
      params: { code },
    });

    return data;
  }
}

export default SisClient;
