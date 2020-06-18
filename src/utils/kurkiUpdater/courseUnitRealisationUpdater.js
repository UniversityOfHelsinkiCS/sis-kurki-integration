import { isNumber } from 'lodash';

import getKurssiByCourseUnitRealisation from './getKurssiByCourseUnitRealisation';
import getCourseUnitRealisationOwner from './getCourseUnitRealisationOwner';
import getOpetusByStudyGroupSets from './getOpetusByStudyGroupSets';

class CourseUnitRealisationUpdater {
  constructor({
    courseUnitRealisation,
    courseUnit,
    models,
    sisClient,
    logger,
    fallbackKurssiOmistaja,
  }) {
    this.courseUnitRealisation = courseUnitRealisation;
    this.courseUnit = courseUnit;
    this.models = models;
    this.sisClient = sisClient;
    this.logger = logger;
    this.fallbackKurssiOmistaja = fallbackKurssiOmistaja;
  }

  async getPeriods() {
    const { activityPeriod } = this.courseUnitRealisation;
    const { startDate, endDate } = activityPeriod || {};

    const periods = await Promise.all([
      this.models.Periodi.query().findPnumeroByDate(startDate),
      this.models.Periodi.query().findPnumeroByDate(endDate),
    ]);

    return periods;
  }

  getKurssi() {
    return this.models.Kurssi.query().findOne({
      sisId: this.courseUnitRealisation.id,
    });
  }

  async update() {
    const courseUnitRealisationLogPayload = {
      courseUnitRealisationId: this.courseUnitRealisation.id,
    };

    const responsibilityInfos = await this.sisClient.getCourseUnitRealisationResponsibilityInfos(
      this.courseUnitRealisation.id,
    );

    const owner = getCourseUnitRealisationOwner(responsibilityInfos);

    const ownerHenkilo = owner
      ? await this.models.Henkilo.query().findOneByPerson(owner)
      : undefined;

    if (!owner) {
      this.logger.info(
        `Course unit realisation's responsibility information is not found. Setting course unit realisation owner as ${this.fallbackKurssiOmistaja}`,
        courseUnitRealisationLogPayload,
      );
    } else if (!ownerHenkilo) {
      this.logger.info(
        `Could not find person. Setting course unit realisation owner as ${this.fallbackKurssiOmistaja}`,
        courseUnitRealisationLogPayload,
      );
    }

    const baseKurssi = getKurssiByCourseUnitRealisation(
      this.courseUnitRealisation,
      this.courseUnit,
    );

    const [periodi, periodi2] = await this.getPeriods();

    const kurssi = {
      ...baseKurssi,
      periodi,
      periodi2,
      omistaja: ownerHenkilo
        ? ownerHenkilo.htunnus
        : this.fallbackKurssiOmistaja,
    };

    await this.models.Kurssi.query().patchOrInsertWithKurssiNro(kurssi);

    await this.updateStudyGroups();
  }

  async updateStudyGroups() {
    const kurssi = await this.getKurssi();

    const groupSets = await this.sisClient.getCourseUnitRealisationStudyGroupSets(
      this.courseUnitRealisation.id,
    );

    const opetusArr = getOpetusByStudyGroupSets(groupSets, kurssi);

    const opetusRows = opetusArr.map((opetus) => ({
      ...opetus,
      kurssikoodi: kurssi.kurssikoodi,
      lukukausi: kurssi.lukukausi,
      lukuvuosi: kurssi.lukuvuosi,
      tyyppi: kurssi.tyyppi,
      kurssiNro: kurssi.kurssiNro,
      ilmo: 'K',
      opetustehtava: isNumber(opetus.ilmoJnro) ? 'LH' : 'LU',
    }));

    for (let opetus of opetusRows) {
      const { teacher, ...restOpetus } = opetus;

      await this.updateStudyGroup(restOpetus, teacher).catch((error) => {
        this.logger.error('Failed to update study group', {
          studyGroup: opetus,
        });

        this.logger.error(error);
      });
    }
  }

  async updateStudyGroup(opetus) {
    await this.models.Opetus.query().patchOrInsertById(
      [
        opetus.kurssikoodi,
        opetus.lukukausi,
        opetus.lukuvuosi,
        opetus.tyyppi,
        opetus.kurssiNro,
        opetus.ryhmaNro,
      ],
      opetus,
    );
  }
}

export default CourseUnitRealisationUpdater;
