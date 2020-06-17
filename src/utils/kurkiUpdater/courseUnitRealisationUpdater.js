import getKurssiByCourseUnitRealisation from './getKurssiByCourseUnitRealisation';
import getCourseUnitRealisationOwner from './getCourseUnitRealisationOwner';
import getHtunnusByFullName from './getHtunnusByFullName';
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

  async update() {
    const courseUnitRealisationLogPayload = {
      courseUnitRealisationId: this.courseUnitRealisation.id,
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
      this.courseUnitRealisation,
      this.courseUnit,
    );

    const kurssi = {
      ...baseKurssi,
      omistaja: ownerHenkilo
        ? ownerHenkilo.htunnus
        : this.fallbackKurssiOmistaja,
    };

    await this.models.Kurssi.query().patchOrInsertWithKurssiNro(kurssi);

    await this.updateStudyGroups();
  }

  async updateStudyGroups() {
    const kurssi = await this.models.Kurssi.query().findOne({
      sisId: this.courseUnitRealisation.id,
    });

    const groupSets = await this.sisClient.getCourseUnitRealisationStudyGroupSets(
      this.courseUnitRealisation.id,
    );

    const opetusList = getOpetusByStudyGroupSets(groupSets, kurssi);

    const opetusRows = opetusList.map((opetus) => ({
      ...opetus,
      kurssikoodi: kurssi.kurssikoodi,
      lukukausi: kurssi.lukukausi,
      lukuvuosi: kurssi.lukuvuosi,
      tyyppi: kurssi.tyyppi,
      kurssiNro: kurssi.kurssiNro,
    }));

    for (let opetus of opetusRows) {
      await this.updateStudyGroup(opetus).catch((error) => {
        this.logger.error('Failed to update study group', {
          studyGroup: opetus,
        });

        this.logger.error(error);
      });
    }
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

export default CourseUnitRealisationUpdater;
