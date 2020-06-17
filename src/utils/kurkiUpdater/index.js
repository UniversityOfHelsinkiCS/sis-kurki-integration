import promiseMap from 'p-map';

import getOpintojaksoByCourseUnit from './getOpintojaksoByCourseUnit';
import getDistinctCourseUnits from './getDistinctCourseUnits';
import getKurssiByCourseUnitRealisation from './getKurssiByCourseUnitRealisation';
import getCourseUnitRealisationOwner from './getCourseUnitRealisationOwner';
import getHtunnusByFullName from './getHtunnusByFullName';
import getOpetusByStudyGroupSets from './getOpetusByStudyGroupSets';

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
      { concurrency: 5, stopOnError: false },
    );
  }

  async updateCourseUnitRealisation(courseUnitRealisation, courseUnit) {
    const courseUnitRealisationLogPayload = {
      courseUnitRealisationId: courseUnitRealisation.id,
    };

    /*const responsibilityInfos = await this.sisClient.getCourseUnitRealisationResponsibilityInfos(
      courseUnitRealisation.id,
    );*/

    const responsibilityInfos = [];

    const owner = getCourseUnitRealisationOwner(responsibilityInfos);

    const ownerHtunnus = owner
      ? getHtunnusByFullName({
          firstName: owner.firstName,
          lastName: owner.lastName,
        })
      : undefined;

    const ownerHenkilo = ownerHtunnus
      ? await this.models.Henkilo.query().findById(ownerHtunnus)
      : undefined;

    if (!ownerHtunnus) {
      this.logger.info(
        `Course unit realisation's responsibility information is not found. Setting course unit realisation owner as ${this.fallbackKurssiOmistaja}`,
        courseUnitRealisationLogPayload,
      );
    } else if (!ownerHenkilo) {
      this.logger.info(
        `Could not find person with person id ${ownerHtunnus}. Setting course unit realisation owner as ${this.fallbackKurssiOmistaja}`,
        courseUnitRealisationLogPayload,
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

    await this.models.Kurssi.query().patchOrInsertWithKurssiNro(kurssi);

    await this.updateStudyGroups(
      courseUnitRealisation.id,
    );
  }

  async updateStudyGroups(id) {
    const kurssi = await this.models.Kurssi.query().findOne({ sisId: id });

    const groupSets = await this.sisClient.getCourseUnitRealisationStudyGroupSets(
      id,
    );

    const opetusList = getOpetusByStudyGroupSets(groupSets, kurssi);

    const opetusRows = opetusList.map(
      ({ sisId, ryhmaNro, ilmoJnro, teacher }) => ({
        sisId,
        ryhmaNro,
        ilmoJnro,
        kurssikoodi: kurssi.kurssikoodi,
        lukukausi: kurssi.lukukausi,
        lukuvuosi: kurssi.lukuvuosi,
        tyyppi: kurssi.tyyppi,
        kurssiNro: kurssi.kurssiNro,
        teacher,
      }),
    );

    await promiseMap(
      opetusRows,
      (opetus) => {
        this.updateStudyGroup(opetus).catch((error) => {
          this.logger.error('Failed to update study group', {
            studyGroup: opetus,
          });
          this.logger.error(error);
        });
      },
      { concurrency: 5, stopOnError: false },
    );
  }

  async updateStudyGroup(opetus) {
    const { teacher, ...restOpetus } = opetus;

    await this.models.Opetus.query().patchOrInsertById(
      [
        opetus.kurssikoodi,
        opetus.lukukausi,
        opetus.lukuvuosi,
        opetus.tyyppi,
        opetus.kurssiNro,
        opetus.ryhmaNro,
      ],
      restOpetus,
    );

    console.log(teacher);
  }
}

export default KurkiUpdater;
