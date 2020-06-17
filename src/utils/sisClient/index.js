import { isArray, get } from 'lodash';

class SisClient {
  constructor({ importerClient, graphqlClient }) {
    this.importerClient = importerClient;
    this.graphqlClient = graphqlClient;
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

    const { data } = await this.importerClient.get('/course_units', {
      params,
    });

    return data;
  }

  getCourseUnitsByCodes(codes) {
    return this.getCourseUnits({ codes });
  }

  async getCourseUnitsByProgramme(programme) {
    if (!programme) {
      throw new Error('Programme is required');
    }

    const { data } = await this.importerClient.get(
      `/course_units/${programme}`,
    );

    return data && data.course_units ? data.course_units : [];
  }

  async getCourseUnitRealisationsByCode(code) {
    if (!code) {
      throw new Error('Course code is required');
    }

    const { data } = await this.importerClient.get(
      `/course_unit_realisations`,
      {
        params: { code },
      },
    );

    return data;
  }

  async getCourseUnitRealisationResponsibilityInfos(id) {
    const query = `
      query getCourseUnitRealisation($id: ID!) {
        course_unit_realisation(id: $id) {
          responsibilityInfos {
            role {
              urn
            }
            person {
              id
              firstName
              lastName
            }
          }
        }
      }
    `;

    const result = await this.graphqlClient.query(query, { id });

    return (
      get(result, 'data.course_unit_realisation.responsibilityInfos') || []
    );
  }

  async getCourseUnitRealisationStudyGroupSets(id) {
    const query = `
      query getCourseUnitRealisation($id: ID!) {
        studyGroupSets {
          studySubGroups {
            id
            name { 
              fi
            }
             teachers {
              id
              firstName
              lastName
            }
          }
        }
      }
    `;

    const result = await this.graphqlClient.query(query, { id });

    return get(result, 'data.course_unit_realisation.studyGroupSets') || [];
  }
}

export default SisClient;
