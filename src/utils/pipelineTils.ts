export const pipelineMaker = {
  splitter: function (text: string) {
    return text.split(',').filter((el) => el.length > 0);
  },
  RegExpGenerator: function (text: string) {
    return new RegExp(text.trim(), 'i');
  },
  makePagination: function (page: string, limit: string) {
    const pageNumber = parseInt(page) || 1;
    const limitNumber = parseInt(limit) || 10;

    return {
      $facet: {
        meta: [{ $count: 'total' }, { $addFields: { page: pageNumber } }],
        data: [
          { $skip: (pageNumber - 1) * limitNumber },
          { $limit: limitNumber },
        ],
      },
    };
  },
  makeSort: function (
    sortBy: string,
    sortOrder: 'asc' | 'desc' = 'asc',
    sortList: string[],
  ) {
    const sorts = sortBy?.split(',') || [];
    const sortResult: Record<string, 1 | -1> = {};
    if (sorts.length > 0) {
      sorts.forEach((el) => {
        if (sortList.includes(el)) {
          sortResult[el] = sortOrder === 'desc' ? -1 : 1;
        }
      });
    } else {
      sortResult.updatedAt = sortOrder === 'desc' ? -1 : 1;
    }

    return { $sort: { ...sortResult } };
  },
  makeProject: function (fieldsQuery: string, isPagination = false) {
    const fields = fieldsQuery?.split(',') || [];

    // since we always need meta data we can't exclude field, only can select
    const result: Record<string, number> = {};
    fields.forEach((el: string) => {
      const key = el.startsWith('-') ? el.slice(1) : el;
      result[key] = 1;
    });

    if (isPagination) {
      return {
        $project: {
          meta: 1,
          data: fields.length === 0 ? 1 : { ...result },
        },
      };
    }

    return { $project: { ...result } };
  },
  makeMatch: function (query: Record<string, unknown>, searchList: string[]) {
    const { search, ...resrQuery } = query;
    const result: Record<string, unknown> = { ...resrQuery };
    if (search) {
      const conditions = searchList.map((field) => {
        return { [field]: { $regex: new RegExp(search as string, 'i') } };
      });
      result.$or = conditions;
    }
    return {
      $match: {
        ...result,
      },
    };
  },
  makeRangeFilter: function (
    propertyName: string,
    maxRange: number,
    minRange: number,
  ) {
    const rangeFilter: Record<string, unknown> = {};
    if (!isNaN(minRange)) {
      rangeFilter['$gte'] = minRange;
    }
    if (!isNaN(maxRange)) {
      rangeFilter['$lte'] = maxRange;
    }
    return {
      $match: {
        [propertyName]: {
          ...rangeFilter,
        },
      },
    };
  },
};
