import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { TProduct } from './product.interface';
import { ProductModel } from './product.model';
import { pipelineMaker } from '../../utils/pipelineTils';

const createProductIntoDb = async (payload: TProduct) => {
  // generate slug
  let slug = payload.slug;
  if (slug) {
    const isSlugExist = await ProductModel.findOne({ slug });

    if (isSlugExist) {
      throw new AppError(httpStatus.UNPROCESSABLE_ENTITY, 'Slug already exist');
    }
  } else {
    // create new slug
    const mainSlug = payload.name
      ?.replace(/[^\w\s-]/g, '')
      ?.replace(/\s+/g, '-');

    const slugList = await ProductModel.find({
      slug: {
        $regex: `^${mainSlug}(-\\d+)?$`,
        $options: 'i',
      },
    }).select('slug');
    const countList: number[] = slugList
      .map((el) => el.slug)
      .map((slg) => {
        const words = slg.split('-');
        const lastWord = words[words.length - 1];
        const lastWordAsNumber = parseInt(lastWord, 10);
        return isNaN(lastWordAsNumber) ? null : lastWordAsNumber;
      })
      .filter((num): num is number => num !== null)
      .sort((a: number, b: number) => b - a);

    slug = countList.length
      ? `${mainSlug}-${countList[0] + 1}`
      : mainSlug.length
        ? `${mainSlug}-${1}`
        : mainSlug;
  }

  const result = await ProductModel.create({ ...payload, slug });
  return result;
};

const getAllProductsFromDb = async (query: Record<string, unknown>) => {
  const tempQuery = { ...query };
  const excludeFields = [
    'page',
    'limit',
    'fields',
    'sortBy',
    'sortOrder',
    'maxPrice',
    'minPrice',
    'maxQuantity',
    'minQuantity',
    'cameraResolution',
    'storageCapacity',
    'screenSize',
    'height',
    'width',
    'depth',
  ];
  const sortFieldList = [
    'name',
    'price',
    'quantity',
    'releaseDate',
    'brand',
    'model',
    'category',
    'operatingSystem',
    'connectivity',
  ];
  const pertialRegexSearchList = ['name', 'brand', 'model', 'category'];
  excludeFields.forEach((key) => {
    delete tempQuery[key];
  });
  // never receive deleted products
  tempQuery.isDeleted = false;

  // set default limit
  if (!query.limit) {
    query.limit = 10;
  }

  // set isAvailable boolean value
  if (tempQuery.isAvailable) {
    tempQuery.isAvailable = tempQuery.isAvailable === 'true';
  }

  // between today date range
  if (tempQuery.releaseDate) {
    const minDate = new Date(tempQuery.releaseDate as string);
    minDate.setUTCHours(0, 0, 0, 0);
    const maxDate = new Date(minDate);
    maxDate.setDate(maxDate.getDate() + 1);

    tempQuery.releaseDate = {
      $gte: minDate,
      $lt: maxDate,
    };
  }

  // nested query setup
  if (query.cameraResolution || query.storageCapacity || query.screenSize) {
    ['cameraResolution', 'storageCapacity', 'screenSize'].forEach((feature) => {
      if (query[feature]) tempQuery[`features.${feature}`] = query[feature];
    });
  }
  if (query.height || query.width || query.depth) {
    ['height', 'width', 'depth'].forEach((dimension) => {
      if (query[dimension])
        tempQuery[`dimension.${dimension}`] = Number(query[dimension]);
    });
  }

  // build query aggregate pipeline builder
  type TMatchPipeline = { $match: Record<string, unknown> };
  type TAddFieldsPipeline = { $addFields: Record<string, unknown> };
  type TSortPipeline = { $sort: Record<string, 1 | -1> };
  type TPipelineType = Array<
    TMatchPipeline | TAddFieldsPipeline | TSortPipeline
  >;

  // matches and sorting pipeline
  const pipelines: TPipelineType = [
    pipelineMaker.makeMatch(tempQuery, [...pertialRegexSearchList]),
    pipelineMaker.makeSort(
      query.sortBy as string,
      query.sortOrder as 'asc',
      sortFieldList,
    ),
  ];

  // maxPrice minPrice range filter pipeline
  const minPrice = parseFloat(query.minPrice as string);
  const maxPrice = parseFloat(query.maxPrice as string);
  if (!isNaN(minPrice) || !isNaN(maxPrice)) {
    const priceFilter = pipelineMaker.makeRangeFilter(
      'price',
      maxPrice,
      minPrice,
    );
    pipelines.push(priceFilter);
  }

  // maxQuantity minQuantity range filter pipeline
  const minQuantity = parseFloat(query.minQuantity as string);
  const maxQuantity = parseFloat(query.maxQuantity as string);
  if (!isNaN(minQuantity) || !isNaN(maxQuantity)) {
    const priceFilter = pipelineMaker.makeRangeFilter(
      'quantity',
      maxQuantity,
      minQuantity,
    );
    pipelines.push(priceFilter);
  }

  const [result] = await ProductModel.aggregate([
    ...pipelines,
    pipelineMaker.makePagination(query.page as string, query.limit as string),

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pipelineMaker.makeProject((query as any).fields, true),
  ]);
  const meta = {
    limit: Number(query.limit),
    page: result.meta.length
      ? result.meta[0]?.page || Number(query.page)
      : Number(query.page),
    total: result.meta.length ? result.meta[0]?.total || 0 : 0,
  };
  let data = [];
  // format data before send
  if (result?.data) {
    data = result?.data?.map((el: Partial<TProduct>) => {
      delete el.isDeleted;
      return el;
    });
  }
  return {
    meta,
    data,
  };
};

const updateProductByIdIntoDb = async (
  productId: string,
  payload: Partial<TProduct>,
) => {
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  const { user_id, features, dimension, ...productRemainingData } = payload;

  const isproductExist = await ProductModel.findById(productId);
  if (!isproductExist) {
    throw new AppError(httpStatus.UNPROCESSABLE_ENTITY, "Product Didn't found");
  }
  if (features) {
    for (const [key, value] of Object.entries(features)) {
      if (value)
        (productRemainingData as Record<string, unknown>)[`features.${key}`] =
          value;
    }
  }
  if (dimension) {
    for (const [key, value] of Object.entries(dimension)) {
      if (value)
        (productRemainingData as Record<string, unknown>)[`dimension.${key}`] =
          value;
    }
  }

  const updateResult = await ProductModel.findByIdAndUpdate(
    productId,
    { ...productRemainingData },
    { upsert: false, new: true, runValidators: true },
  );

  return updateResult;
};

export const productServices = {
  createProductIntoDb,
  getAllProductsFromDb,
  updateProductByIdIntoDb,
};
