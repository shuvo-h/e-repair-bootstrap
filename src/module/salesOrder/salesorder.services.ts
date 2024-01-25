/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { ProductModel } from '../product/product.model';
import { TSalesOrder } from './salesorder.interface';
import { SalesOrderModel } from './salesorder.model';
import mongoose from 'mongoose';

const createOrderIntoDb = async (payload: TSalesOrder) => {
  const newOrder: TSalesOrder = { ...payload };
  const existProduct = await ProductModel.findById(payload.product);
  if (!existProduct || existProduct.isDeleted) {
    throw new AppError(
      httpStatus.UNPROCESSABLE_ENTITY,
      'Product does not exist',
    );
  }

  // useTransection to keep sync
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    // reduce the inventory as quantity
    if (existProduct.quantity < newOrder.quantity) {
      throw new AppError(
        httpStatus.UNPROCESSABLE_ENTITY,
        'Insufficient inventory',
      );
    }

    newOrder.soldDate = new Date();
    newOrder.totalAmount = newOrder.quantity * existProduct.price;

    const Order = await SalesOrderModel.create(newOrder);

    await session.commitTransaction();
    await session.endSession();

    return Order;
  } catch (error: any) {
    console.log(error);

    await session.abortTransaction();
    await session.endSession();
    throw new AppError(httpStatus.BAD_REQUEST, error.message);
  }
};

export const salesOrderServices = {
  createOrderIntoDb,
};
