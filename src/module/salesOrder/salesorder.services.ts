/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { ProductModel } from '../product/product.model';
import { TSalesOrder } from './salesorder.interface';
import { SalesOrderModel } from './salesorder.model';
import mongoose from 'mongoose';

const createOrderIntoDb = async (payload: TSalesOrder) => {
  const quantity = parseInt(payload.quantity.toString());
  const newOrder: TSalesOrder = { ...payload, quantity };
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

    await ProductModel.findByIdAndUpdate(
      payload.product,
      {
        // quantity: { $inc: Number(payload.quantity)},
        $inc: {
          quantity: -Number(payload.quantity),
        },
      },
      { new: true, upsert: false, runValidators: true },
    );

    newOrder.soldDate = payload.soldDate
      ? new Date(payload.soldDate)
      : new Date();
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

const getSalesQuantityFromDb = async (query: Record<string, unknown>) => {
  const { period, startDate, endDate } = query;

  const productLookupPipeline = [
    {
      $lookup: {
        from: 'products',
        localField: 'product',
        foreignField: '_id',
        as: 'productDetails',
      },
    },
    {
      $unwind: '$productDetails', // Unwind the productDetails array
    },
  ];

  const matchPipeline = [
    {
      $match: {
        soldDate: {
          $gte: new Date(startDate as string),
          $lte: new Date(endDate as string),
        },
      },
    },
  ];
  // without product populate
  const yearlyPipeline = [
    ...productLookupPipeline,
    {
      $group: {
        _id: { $year: '$soldDate' },
        totalCount: { $sum: 1 },
        totalAmount: { $sum: '$totalAmount' },
        data: { $push: '$$ROOT' },
      },
    },
    {
      $project: {
        _id: 0,
        year: '$_id',
        totalCount: 1,
        totalAmount: 1,
        data: 1,
      },
    },
    {
      $sort: { year: 1 } as any,
    },
  ];
  // without product populate
  const monthlyPipeline = [
    ...productLookupPipeline,
    {
      $group: {
        _id: {
          year: { $year: '$soldDate' },
          month: { $month: '$soldDate' },
        },
        totalCount: { $sum: 1 },
        totalAmount: { $sum: '$totalAmount' },
        data: { $push: '$$ROOT' },
      },
    },
    {
      $project: {
        _id: 0, // Exclude _id field
        year: '$_id.year',
        month: '$_id.month',
        totalCount: 1,
        totalAmount: 1,
        data: 1,
      },
    },
    {
      $sort: { year: 1, month: 1 }, // Sorting the data by year and month in ascending order
    },
  ];

  // without product populate
  const weeklyPipeline = [
    ...productLookupPipeline,
    {
      $group: {
        _id: {
          year: { $year: '$soldDate' },
          month: { $month: '$soldDate' },
          week: { $isoWeek: '$soldDate' },
        },
        totalCount: { $sum: 1 },
        totalAmount: { $sum: '$totalAmount' },
        data: { $push: '$$ROOT' },
      },
    },
    {
      $project: {
        _id: 0, // Exclude _id field
        year: '$_id.year',
        month: '$_id.month',
        week: '$_id.week',
        totalCount: 1,
        totalAmount: 1,
        data: 1,
      },
    },
    {
      $sort: { year: 1, month: 1, week: 1 },
    },
  ];

  /*
   // without product populate
  const dailyPipeline = [
    {
      $group: {
        _id: {
          year: { $year: '$soldDate' },
          month: { $month: '$soldDate' },
          week: { $isoWeek: '$soldDate' },
          day: { $dayOfMonth: '$soldDate' },
        },
        totalCount: { $sum: 1 },
        totalAmount: { $sum: '$totalAmount' },
        data: { $push: '$$ROOT' },
      },
    },
    {
      $project: {
        _id: 0, // Exclude _id field
        year: '$_id.year',
        month: '$_id.month',
        week: '$_id.week',
        day: '$_id.day',
        totalCount: 1,
        totalAmount: 1,
        data: 1,
      },
    },
    {
      $sort: { year: 1, month: 1, week: 1, day: 1 }, // Sorting the data by year, month, week, and day in ascending order
    },
  ];
  */

  // with product populate
  const dailyPipeline = [
    ...productLookupPipeline,
    {
      $group: {
        _id: {
          year: { $year: '$soldDate' },
          month: { $month: '$soldDate' },
          week: { $isoWeek: '$soldDate' },
          day: { $dayOfMonth: '$soldDate' },
        },
        totalCount: { $sum: 1 },
        totalAmount: { $sum: '$totalAmount' },
        data: { $push: '$$ROOT' },
      },
    },
    {
      $project: {
        _id: 0, // Exclude _id field
        year: '$_id.year',
        month: '$_id.month',
        week: '$_id.week',
        day: '$_id.day',
        totalCount: 1,
        totalAmount: 1,
        data: 1,
      },
    },
    {
      $sort: { year: 1, month: 1, week: 1, day: 1 }, // Sorting the data by year, month, week, and day in ascending order
    },
  ];

  const pipeline: any = [...matchPipeline];
  if (period === 'daily') {
    pipeline.push(...dailyPipeline);
  } else if (period === 'weekly') {
    pipeline.push(...weeklyPipeline);
  } else if (period === 'monthly') {
    pipeline.push(...monthlyPipeline);
  } else {
    // yearly
    console.log('year');

    pipeline.push(...yearlyPipeline);
  }

  const result = await SalesOrderModel.aggregate(pipeline);

  // console.log(result);
  return result;
};

export const salesOrderServices = {
  createOrderIntoDb,
  getSalesQuantityFromDb,
};

/*
By Yearly:
 const pipeline = [
   {
    $match: {
      soldDate: {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string),
      },
    },
   },
    {
      $group: {
        _id: { $year: "$soldDate" }, 
        totalCount: { $sum: 1 }, 
        totalAmount: { $sum: "$totalAmount" }, 
        data: { $push: "$$ROOT" } 
      }
    },
    {
      $project: {
        _id: 0, 
        year: "$_id",
        totalCount: 1,
        totalAmount: 1,
        data: 1
      }
    },
    {
      $sort: { year: 1 } as any
    }
  ];

*/

/*
By Monthly:

  const pipeline = [
    {
      $match: {
        soldDate: {
          $gte: new Date(startDate as string),
          $lte: new Date(endDate as string),
        },
      },
     },
    {
      $group: {
        _id: {
          year: { $year: "$soldDate" }, // Extract year
          month: { $month: "$soldDate" } // Extract month
        },
        totalCount: { $sum: 1 }, // Counting the documents for each month
        totalAmount: { $sum: "$totalAmount" }, // Summing up the total amount for each month
        data: { $push: "$$ROOT" } // Storing all the data for each month
      }
    },
    {
      $project: {
        _id: 0, // Exclude _id field
        year: "$_id.year",
        month: "$_id.month",
        totalCount: 1,
        totalAmount: 1,
        data: 1
      }
    },
    {
      $sort: { year: 1, month: 1 } // Sorting the data by year and month in ascending order
    }
  ];


*/

/*
weekly pipeline:

  const pipeline: any[] = [
    {
      $match: {
        soldDate: {
          $gte: new Date(startDate as string),
          $lte: new Date(endDate as string),
        },
      },
     },
    {
      $group: {
        _id: {
          year: { $year: "$soldDate" }, // Extract year
          month: { $month: "$soldDate" }, // Extract month
          week: { $isoWeek: "$soldDate" } // Extract ISO week
        },
        totalCount: { $sum: 1 }, // Counting the documents for each week
        totalAmount: { $sum: "$totalAmount" }, // Summing up the total amount for each week
        data: { $push: "$$ROOT" } // Storing all the data for each week
      }
    },
    {
      $project: {
        _id: 0, // Exclude _id field
        year: "$_id.year",
        month: "$_id.month",
        week: "$_id.week",
        totalCount: 1,
        totalAmount: 1,
        data: 1
      }
    },
    {
      $sort: { year: 1, month: 1, week: 1 } // Sorting the data by year, month, and week in ascending order
    }
  ];
 
  

*/

/*
Daily pipeline

const pipeline: any[] = [
    {
      $match: {
        soldDate: {
          $gte: new Date(startDate as string),
          $lte: new Date(endDate as string),
        },
      },
     },
    {
      $group: {
        _id: {
          year: { $year: "$soldDate" }, // Extract year
          month: { $month: "$soldDate" }, // Extract month
          week: { $isoWeek: "$soldDate" }, // Extract ISO week
          day: { $dayOfMonth: "$soldDate" } // Extract day of the month
        },
        totalCount: { $sum: 1 }, // Counting the documents for each day
        totalAmount: { $sum: "$totalAmount" }, // Summing up the total amount for each day
        data: { $push: "$$ROOT" } // Storing all the data for each day
      }
    },
    {
      $project: {
        _id: 0, // Exclude _id field
        year: "$_id.year",
        month: "$_id.month",
        week: "$_id.week",
        day: "$_id.day",
        totalCount: 1,
        totalAmount: 1,
        data: 1
      }
    },
    {
      $sort: { year: 1, month: 1, week: 1, day: 1 } // Sorting the data by year, month, week, and day in ascending order
    }
  ];


*/
