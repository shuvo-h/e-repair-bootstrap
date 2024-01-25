import { catchAsync } from '../../utils/catchAsync';
import { ExpressMiddleware } from '../../interface';
import { sendRes } from '../../utils/sendRes';
import httpStatus from 'http-status';
import { productServices } from './product.service';

const createProduct: ExpressMiddleware = async (req, res) => {
  const newProduct = {
    ...req.body,
    user_id: req.user._id,
  };
  const result = await productServices.createProductIntoDb(newProduct);
  sendRes(res, {
    statusCode: httpStatus.OK,
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

export const ProductControllers = {
  createProduct: catchAsync(createProduct),
  getProducts: catchAsync(getProducts),
};
