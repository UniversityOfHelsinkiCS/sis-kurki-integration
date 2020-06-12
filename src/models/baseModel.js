import { Model, QueryBuilder, transaction } from 'objection';

class EnhancedQueryBuilder extends QueryBuilder {
  patchOrInsertById(id, data) {
    return transaction(this.modelClass(), async (Model) => {
      const nrUpdated = await Model.query().findById(id).patch(data);

      if (nrUpdated === 1) {
        return true;
      } else {
        await Model.query().insert(data);

        return false;
      }
    });
  }
}

export class BaseModel extends Model {
  static get QueryBuilder() {
    return EnhancedQueryBuilder;
  }
}

export default BaseModel;
