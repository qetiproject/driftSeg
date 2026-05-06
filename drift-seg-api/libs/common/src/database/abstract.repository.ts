import { Model, QueryFilter, Types, UpdateQuery } from 'mongoose';

export abstract class AbstractRepository<TDocument> {
  constructor(protected readonly model: Model<TDocument>) {}

  async create(document: Omit<TDocument, '_id'>): Promise<TDocument> {
    const createdDocument = new this.model({
      ...document,
      _id: new Types.ObjectId(),
    });
    return (await createdDocument.save()).toJSON();
  }

  async findOne(
    filterQuery: QueryFilter<TDocument>,
  ): Promise<TDocument | null> {
    const document = await this.model
      .findOne(filterQuery)
      .lean<TDocument>(true);
    return document;
  }

  async findOneAndUpdate(
    filterQuery: QueryFilter<TDocument>,
    update: UpdateQuery<TDocument>,
  ): Promise<TDocument | null> {
    const document = await this.model
      .findOneAndUpdate(filterQuery, update, {
        new: true,
      })
      .lean<TDocument>(true);
    return document;
  }

  async find(filter: QueryFilter<TDocument>): Promise<TDocument[]> {
    return this.model.find(filter).lean<TDocument[]>(true);
  }

  async findOneAndDelete(
    filterQuery: QueryFilter<TDocument>,
  ): Promise<TDocument | null> {
    return this.model.findOneAndDelete(filterQuery).lean<TDocument>(true);
  }
}
