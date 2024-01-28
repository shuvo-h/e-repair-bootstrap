import { Schema, model } from 'mongoose';
import { TSalesOrder } from './salesorder.interface';

const salesOrderSchema = new Schema<TSalesOrder>(
  {
    product: {
      type: Schema.ObjectId,
      required: [true, 'Product Id is required'],
      ref: 'Product',
    },
    seller: {
      type: Schema.ObjectId,
      required: [true, 'Seller Id is required'],
      ref: 'User',
    },
    quantity: {
      type: Number,
      required: [true, 'quantity is required'],
      min: 1,
    },
    buyerName: {
      type: String,
      required: [true, 'Buyer name is required'],
    },
    soldDate: {
      type: Date,
      required: [true, 'Selling Date is required'],
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
    },
  },
  {
    timestamps: true,
  },
);

export const SalesOrderModel = model<TSalesOrder>(
  'salesOrder',
  salesOrderSchema,
);
