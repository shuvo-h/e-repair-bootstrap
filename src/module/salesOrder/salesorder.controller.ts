import httpStatus from 'http-status';
import { ExpressMiddleware } from '../../interface';
import { sendRes } from '../../utils/sendRes';
import { catchAsync } from '../../utils/catchAsync';
import { salesOrderServices } from './salesorder.services';

const createSaleOrder: ExpressMiddleware = async (req, res) => {
  const newOrder = {
    ...req.body,
    seller: req.user._id,
  };
  const result = await salesOrderServices.createOrderIntoDb(newOrder);
  sendRes(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Order is Created successfully',
    data: result,
  });
};
const getSalesQuantity: ExpressMiddleware = async (req, res) => {
  const result = await salesOrderServices.getSalesQuantityFromDb(req.query);
  sendRes(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Orders are retrived successfully',
    data: result,
  });
};

export const SalesOrderControllers = {
  createSaleOrder: catchAsync(createSaleOrder),
  getSalesQuantity: catchAsync(getSalesQuantity),
};
