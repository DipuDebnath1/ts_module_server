/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Model,
  Document,
  FilterQuery,
  PopulateOptions,
  SortOrder,
  PipelineStage,
} from 'mongoose';

interface PaginationResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface QueryObject<T> {
  page?: number;
  limit?: number;
  filters?: FilterQuery<T>;
  sort?: Record<string, SortOrder>;
  select?: string | string[] | Record<string, 0 | 1 | boolean | object>;
  populate?: PopulateOptions | PopulateOptions[];
}

export default class QueryService<T extends Document> {
  private model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  /**
   * 🔹 Find with structured query object
   */

  async findWithQueryParams(
    queryObj: QueryObject<T>,
  ): Promise<PaginationResult<T>> {
    const {
      page = 1,
      limit = 10,
      filters = {},
      sort = { createdAt: -1 },
      select,
      populate,
    } = queryObj;

    const skip = (page - 1) * limit;

    let query = this.model.find(filters).skip(skip).limit(limit).sort(sort);

    if (select) query = query.select(select);
    if (populate) query = query.populate(populate);

    const [data, total] = await Promise.all([
      query.exec(),
      this.model.countDocuments(filters),
    ]);

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

  /**
   * 🔹 Aggregation with pagination
   */
  async aggregateWithPagination(
    pipeline: PipelineStage[],
    page = 1,
    limit = 10,
  ): Promise<PaginationResult<any>> {
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
