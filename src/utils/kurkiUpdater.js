import promiseMap from 'p-map';

import getOpintojaksoByCourseUnit from './getOpintojaksoByCourseUnit';
import getDistinctCourseUnits from './getDistinctCourseUnits';
import getKurssiByCourseUnitRealisation from './getKurssiByCourseUnitRealisation';
import getCourseUnitRealisationOwner from './getCourseUnitRealisationOwner';
import getHenkiloByPerson from './getHenkiloByPerson';

class KurkiUpdater {
  constructor({ models, sisClient, logger, fallbackKurssiOmistaja }) {
    this.models = models;
    this.sisClient = sisClient;
    this.logger = logger;
    this.fallbackKurssiOmistaja = fallbackKurssiOmistaja;
  }

  async updateCourseUnitsByCodes(codes) {
    const allCourseUnits = await this.sisClient.getCourseUnitsByCodes(codes);
    const courseUnits = getDistinctCourseUnits(allCourseUnits);

    return this.updateCourseUnits(courseUnits);
  }

  async updateCourseUnitsByProgamme(programme) {
    const allCourseUnits = await this.sisClient.getCourseUnitsByProgramme(
      programme,
    );

    const courseUnits = getDistinctCourseUnits(allCourseUnits);

    return this.updateCourseUnits(courseUnits);
  }

  async updateCourseUnits(courseUnits) {
    const courseUnitCodes = courseUnits.map(({ code }) => code);

    this.logger.info(`Starting to update ${courseUnits.length} courses`, {
      courseUnitCodes,
    });

    await promiseMap(
      courseUnits,
      (courseUnit) => {
        return this.updateCourseUnit(courseUnit).catch((error) => {
          this.logger.error('Failed to update course unit', {
            courseUnit,
          });

          this.logger.error(error);
        });
      },
      { concurrency: 1, stopOnError: false },
    );

    this.logger.info(
      `Done updating ${courseUnits.length} courses. Check logs for possible errors`,
      { courseUnitCodes },
    );
  }

  async updateCourseUnit(courseUnit) {
    const opintojakso = getOpintojaksoByCourseUnit(courseUnit);

    await this.models.Opintojakso.query().patchOrInsertById(
      courseUnit.code,
      opintojakso,
    );

    await this.updateCourseUnitRealisations(courseUnit);
  }

  async updateCourseUnitRealisations(courseUnit) {
    const courseUnitRealisations = await this.sisClient.getCourseUnitRealisationsByCode(
      courseUnit.code,
    );

    await promiseMap(
      courseUnitRealisations,
      (realisation) => {
        return this.updateCourseUnitRealisation(realisation, courseUnit).catch(
          (error) => {
            this.logger.error('Failed to update course unit realisation', {
              courseUnit,
              courseUnitRealisation: realisation,
            });

            this.logger.error(error);
          },
        );
      },
      { concurrency: 10, stopOnError: false },
    );
  }

  async updateCourseUnitRealisation(courseUnitRealisation, courseUnit) {
    const owner = getCourseUnitRealisationOwner(courseUnit);
    const ownerHenkilo = owner ? getHenkiloByPerson(owner) : undefined;

    if (ownerHenkilo) {
      await this.models.Henkilo.query().patchOrInsertById(
        ownerHenkilo.htunnus,
        ownerHenkilo,
      );
    }

    const baseKurssi = getKurssiByCourseUnitRealisation(
      courseUnitRealisation,
      courseUnit,
    );

    const kurssi = {
      ...baseKurssi,
      omistaja: ownerHenkilo
        ? ownerHenkilo.htunnus
        : this.fallbackKurssiOmistaja,
    };

    const id = [
      kurssi.kurssikoodi,
      kurssi.lukukausi,
      kurssi.lukuvuosi,
      kurssi.tyyppi,
      kurssi.kurssiNro,
    ];

    await this.models.Kurssi.query().patchOrInsertById(id, kurssi);
  }
}

export default KurkiUpdater;
