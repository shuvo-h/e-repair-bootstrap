import { Types } from 'mongoose';

export type TSalesOrder = {
  product: Types.ObjectId;
  seller: Types.ObjectId;
  quantity: number;
  buyerName: string;
  contactNumber: string;
  soldDate: Date;
  totalAmount: number;
};
export type TSalesOrderPayload = {
  productList: {
    product: string;
    quantity: number;
  }[];
  seller: Types.ObjectId;
  buyerName: string;
  contactNumber: string;
  soldDate: Date;
  totalAmount: number;
};
