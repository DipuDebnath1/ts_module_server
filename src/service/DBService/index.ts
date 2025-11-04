/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Model,
  Document,
  PipelineStage,
  FilterQuery,
  UpdateQuery,
  ClientSession,
  UpdateResult,
} from 'mongoose';
import {
  TPaginationResult,
  TPopulateAndSelect,
  TQueryFields,
  TQueryFieldsWithPagination,
} from './query.interface';

/***
 * 🔹 Generic Query Service for Mongoose Models
 */

export default class BaseService<T extends Document> {
  private model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  /**
   * 🔹 Create a new document
   */

  async create(data: Partial<T>, session?: ClientSession): Promise<T> {
    return await this.model.create([data], { session }).then((res) => res[0]);
  }

  /**
   * 🔹 Find by ID
   */

  async findById(id: string, options?: TPopulateAndSelect): Promise<T | null> {
    let query = this.model.findById(id);
    if (options?.select) query = query.select(options.select);
    if (options?.populate) query = query.populate(options.populate);
    return await query.exec();
  }

  /**
   * 🔹 Find one by filters
   */

  async findOne(queryFields: TQueryFields<T>): Promise<T | null> {
    let query = this.model.findOne(queryFields.filters || {});
    if (queryFields.select) query = query.select(queryFields.select);
    if (queryFields.populate) query = query.populate(queryFields.populate);

    return await query.exec();
  }

  /**
   * 🔹 Find many by filters
   */

  async findMany(queryItems: TQueryFields<T>): Promise<T[]> {
    let query = this.model.find(queryItems.filters || {});
    if (queryItems.select) query = query.select(queryItems.select);
    if (queryItems.sort) query = query.sort(queryItems.sort);
    if (queryItems.populate) query = query.populate(queryItems.populate);

    return await query.exec();
  }

  /**
   * 🔹 Update by ID
   */
  async updateById(
    id: string,
    updateData: UpdateQuery<T>,
    session?: ClientSession,
  ): Promise<T | null> {
    return await this.model
      .findByIdAndUpdate(id, updateData, { new: true, session })
      .exec();
  }

  /**
   * 🔹 find one and Update
   */

  async findOneAndUpdate(
    filters: FilterQuery<T>,
    updateData: UpdateQuery<T>,
    session?: ClientSession,
  ): Promise<T | null> {
    const res = await this.model
      .findOneAndUpdate(filters, updateData, { new: true, session })
      .exec();
    return res;
  }

  /**
   * 🔹 Update one by filter
   */

  async updateOne(
    filters: FilterQuery<T>,
    updateData: UpdateQuery<T>,
    session?: ClientSession,
  ): Promise<UpdateResult | null> {
    const res = await this.model
      .updateOne(filters, updateData, { session })
      .exec();
    return res;
  }

  /**
   * 🔹 Update many by filter
   */
  async updateMany(
    filters: FilterQuery<T>,
    updateData: UpdateQuery<T>,
    session?: ClientSession,
  ): Promise<UpdateResult | null> {
    return await this.model.updateMany(filters, updateData, { session }).exec();
  }

  /**
   * 🔹 Soft Delete by ID
   */

  async softDeleteById(id: string, session?: ClientSession): Promise<T | null> {
    return await this.model
      .findByIdAndUpdate(
        id,
        { $set: { isDeleted: true } },
        {
          new: true,
          session,
        },
      )
      .exec();
  }

  /**
   * 🔹 Hard Delete by ID
   */

  async hardDeleteById(id: string, session?: ClientSession): Promise<T | null> {
    return await this.model.findByIdAndDelete(id, { session }).exec();
  }

  /**
   * 🔹 Find with structured query object
   */

  async findWithPagination(
    queryObj: TQueryFieldsWithPagination<T>,
  ): Promise<TPaginationResult<T>> {
    let {
      page = 1,
      limit = 10,
      filters = {},
      sort = {},
      select,
      populate,
    } = queryObj;

    page = Number(page) < 1 ? 1 : Number(page);
    limit = Number(limit) < 1 ? 10 : Number(limit);

    const skip = (page - 1) * limit;
    sort = Object.keys(sort).length ? sort : { createdAt: -1 };

    let query = this.model.find(filters).skip(skip).limit(limit).sort(sort);

    if (select) query = query.select(select);
    if (populate) query = query.populate(populate);

    const [data, total] = await Promise.all([
      query.exec(),
      this.model.countDocuments(filters),
    ]);

    return {
      data: data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 🔹 Aggregation with pagination
   */
  async aggregateWithPagination<R = any>(
    pipeline: PipelineStage[],
    query?: { page?: number; limit?: number },
  ): Promise<TPaginationResult<R>> {
    const page = Number(query?.page) || 1;
    const limit = Number(query?.limit) || 10;
    const skip = (page - 1) * limit;

    const paginatedPipeline: PipelineStage[] = [
      ...pipeline,
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limit }],
          total: [{ $count: 'count' }],
        },
      },
    ];

    const result = await this.model.aggregate(paginatedPipeline);

    const data = result[0]?.data || [];
    const total = result[0]?.total[0]?.count || 0;

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
