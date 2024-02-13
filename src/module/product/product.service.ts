import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { TProduct } from './product.interface';
import { ProductModel } from './product.model';
import { pipelineMaker } from '../../utils/pipelineTils';
import { JwtPayload } from 'jsonwebtoken';
import { USER_ROLE } from '../user/user.constant';
import mongoose from 'mongoose';

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

const getAllProductsFromDb = async (
  query: Record<string, unknown>,
  user: JwtPayload,
) => {
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
  const pertialRegexSearchList = [
    'name',
    'brand',
    'model',
    'category',
    'operatingSystem',
    'connectivity',
    'powerSource',
  ];
  excludeFields.forEach((key) => {
    delete tempQuery[key];
  });
  // compulsory filters
  // never receive deleted products
  tempQuery.isDeleted = false;

  // filter products based on role, user can only access the products they added
  if (user.role === USER_ROLE.USER) {
    tempQuery.user_id = new mongoose.Types.ObjectId(user._id);
  }

  // set default limit
  if (!query.limit) {
    query.limit = 10;
  }
  // set default quantity
  if (query.quantity) {
    tempQuery.quantity = Number(query.quantity);
  } else {
    tempQuery.quantity = {
      $gt: 0,
    };
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
      query.sortOrder as 'desc',
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
  user: JwtPayload,
) => {
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  const { user_id, features, dimension, ...productRemainingData } = payload;

  const isproductExist = await ProductModel.findById(productId);
  if (!isproductExist || isproductExist.isDeleted) {
    throw new AppError(httpStatus.UNPROCESSABLE_ENTITY, "Product Didn't found");
  }
  // if 'not Manager', only can update the product created by self
  if (
    user.role === USER_ROLE.USER &&
    isproductExist.user_id.toString() !== user._id
  ) {
    throw new AppError(
      httpStatus.UNPROCESSABLE_ENTITY,
      'You are not owner of this product',
    );
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

const deleteProductByIdFromDb = async (productId: string, user: JwtPayload) => {
  const existProduct = await ProductModel.findById(productId);
  if (!existProduct) {
    throw new AppError(httpStatus.UNPROCESSABLE_ENTITY, "Product Didn't found");
  }
  // if 'not Manager', only can delete the product created by self
  if (
    user.role === USER_ROLE.USER &&
    existProduct.user_id.toString() !== user._id
  ) {
    throw new AppError(
      httpStatus.UNPROCESSABLE_ENTITY,
      'You are not owner of this product',
    );
  }
  const result = await ProductModel.findByIdAndUpdate(
    productId,
    { isDeleted: true },
    { upsert: false, runValidators: true, new: true },
  );
  return result;
};

const deleteProductsByIdsFromDb = async (
  productIds: string[],
  user: JwtPayload,
) => {
  // if 'not Manager', only can update the product created by self
  const query:Record<string,unknown> = {
    _id: { $in: productIds },
  }
  if (user.role === USER_ROLE.USER) {
    query.user_id = new mongoose.Types.ObjectId(user._id)
  }
  
  const existingProducts = await ProductModel.find(query);


  if (existingProducts.length !== productIds.length) {
    const foundProductIds = existingProducts.map((product) =>
      product._id.toString(),
    );
    const notFoundProductIds = productIds.filter(
      (id) => !foundProductIds.includes(id),
    );
    throw new AppError(
      httpStatus.UNPROCESSABLE_ENTITY,
      `Products not found or not permitted: ${notFoundProductIds.join(', ')}`,
    );
  }
  
  const result = await ProductModel.updateMany(
    { _id: { $in: productIds } },
    { isDeleted: true },
  );

  return result;
};

const getProductFilterOptionsFromDb = async () => {
  const [
    brand,
    model,
    category,
    operatingSystem,
    connectivity,
    powerSource,
    cameraResolution,
    storageCapacity,
    screenSize,
  ] = await Promise.all([
    ProductModel.distinct('brand'),
    ProductModel.distinct('model'),
    ProductModel.distinct('category'),
    ProductModel.distinct('operatingSystem'),
    ProductModel.distinct('connectivity'),
    ProductModel.distinct('powerSource'),
    ProductModel.distinct('features.cameraResolution'),
    ProductModel.distinct('features.storageCapacity'),
    ProductModel.distinct('features.screenSize'),
  ]);

  const result = {
    brand,
    modelNumber: model,
    category,
    operatingSystem,
    connectivity,
    powerSource,
    features: {
      cameraResolution,
      storageCapacity,
      screenSize,
    },
  };

  return result;
};

export const productServices = {
  createProductIntoDb,
  getAllProductsFromDb,
  updateProductByIdIntoDb,
  deleteProductByIdFromDb,
  deleteProductsByIdsFromDb,
  getProductFilterOptionsFromDb,
};
