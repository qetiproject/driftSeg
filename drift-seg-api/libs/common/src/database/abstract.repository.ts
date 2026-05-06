import { Model, QueryFilter, SortOrder, Types, UpdateQuery } from 'mongoose';

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

  async findById(id: string): Promise<TDocument | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    return this.model.findById(id).lean<TDocument>();
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

  async find(
    filter: QueryFilter<TDocument>,
    options?: {
      skip?: number;
      limit?: number;
      sort?: Record<string, SortOrder>;
      projection?: any;
    },
  ): Promise<TDocument[]> {
    return this.model
      .find(filter, options?.projection)
      .sort(options?.sort ?? { createdAt: -1 })
      .skip(options?.skip ?? 0)
      .limit(options?.limit ?? 10)
      .lean<TDocument[]>()
      .exec();
  }

  async findOneAndDelete(
    filterQuery: QueryFilter<TDocument>,
  ): Promise<TDocument | null> {
    return this.model.findOneAndDelete(filterQuery).lean<TDocument>(true);
  }

  async findByIdAndDelete(id: string): Promise<TDocument | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    const deleted = await this.model.findByIdAndDelete(id).lean<TDocument>();

    return deleted;
  }
}
