import { Model, QueryBuilder } from 'objection';

class EnhancedQueryBuilder extends QueryBuilder {
  async patchOrInsertById(id, data) {
    const nrUpdated = await this.clone().findById(id).patch(data);

    if (nrUpdated === 1) {
      return true;
    } else {
      await this.clone().insert(data);

      return false;
    }
  }
}

export class BaseModel extends Model {
  static get QueryBuilder() {
    return EnhancedQueryBuilder;
  }
}

export default BaseModel;
