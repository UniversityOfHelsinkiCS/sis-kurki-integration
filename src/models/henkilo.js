import BaseModel, { QueryBuilder } from './baseModel';
import getHtunnusByFullName from '../utils/getHtunnusByFullName';

class EnhancedQueryBuilder extends QueryBuilder {
  async findOneByPerson(person) {
    const { firstName, lastName } = person;

    const htunnus = getHtunnusByFullName({
      firstName,
      lastName,
    });

    return this.findById(htunnus);
  }
}

class Henkilo extends BaseModel {
  static get QueryBuilder() {
    return EnhancedQueryBuilder;
  }

  static get idColumn() {
    return 'htunnus';
  }

  static get tableName() {
    return 'henkilo';
  }
}

export default Henkilo;
