import { catchAsync } from '../../utils/catchAsync';
import { ExpressMiddleware } from '../../interface';
import { sendRes } from '../../utils/sendRes';
import httpStatus from 'http-status';
import { productServices } from './product.service';

const createProduct: ExpressMiddleware = async (req, res) => {
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  const {_id,...restBody} = req.body;
  const newProduct = {
    ...restBody,
    user_id: req.user._id,
  };
  const result = await productServices.createProductIntoDb(newProduct);
  sendRes(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Product is Created successfully',
    data: result,
  });
};

const getProducts: ExpressMiddleware = async (req, res) => {
  const result = await productServices.getAllProductsFromDb(req.query);
  sendRes(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Products are retrived successfully',
    data: result,
  });
};

const updateSingleProduct: ExpressMiddleware = async (req, res) => {
  const { productId } = req.params;
  const result = await productServices.updateProductByIdIntoDb(
    productId,
    req.body,
  );
  sendRes(res, {
    statusCode: httpStatus.ACCEPTED,
    success: true,
    message: 'Product is updated successfully',
    data: result,
  });
};

const deleteSingleProduct: ExpressMiddleware = async (req, res) => {
  const { productId } = req.params;
  await productServices.deleteProductByIdFromDb(productId);
  sendRes(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product is deleted successfully',
    data: null,
  });
};
const deleteMultipleProducts: ExpressMiddleware = async (req, res) => {
  const { productIds } = req.body;
  await productServices.deleteProductsByIdsFromDb(productIds);
  sendRes(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Products are deleted successfully',
    data: null,
  });
};

export const ProductControllers = {
  createProduct: catchAsync(createProduct),
  getProducts: catchAsync(getProducts),
  updateSingleProduct: catchAsync(updateSingleProduct),
  deleteSingleProduct: catchAsync(deleteSingleProduct),
  deleteMultipleProducts: catchAsync(deleteMultipleProducts),
};
