import { Types } from 'mongoose';

type TProductFeatures = {
  cameraResolution?: string;
  storageCapacity?: string;
  screenSize?: string;
};

type TProductDimensions = {
  height?: number;
  width?: number;
  depth?: number;
};

export type TProduct = {
  user_id: Types.ObjectId;
  name: string;
  slug: string;
  price: number;
  quantity: number;
  isAvailable: boolean;
  releaseDate: Date;
  brand: string;
  model: string;
  category: string;
  operatingSystem: string;
  connectivity: string;
  powerSource: string;
  features: TProductFeatures[];
  dimension: TProductDimensions;
};
