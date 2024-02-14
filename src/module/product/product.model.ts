import { model, Schema } from 'mongoose';
import { TProduct } from './product.interface';

const productSchema = new Schema<TProduct>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      required: [true, 'User ID is required.'],
    },
    name: {
      type: String,
      required: [true, 'Product name is required.'],
    },
    slug: {
      type: String,
      required: [true, 'Slug is required.'],
      unique: true,
    },
    price: {
      type: Number,
      required: [true, 'Product price is required.'],
      min: [0, "Price can't be negative"],
    },
    quantity: {
      type: Number,
      required: [true, 'Product quantity is required.'],
      min: [0, "Quantity can't be negative"],
    },
    isAvailable: {
      type: Boolean,
      required: [true, 'Availability status is required.'],
      default: false,
    },
    releaseDate: {
      type: Date,
    },
    brand: {
      type: String,
    },
    model: {
      type: String,
    },
    category: {
      type: String,
    },
    operatingSystem: {
      type: String,
    },
    connectivity: {
      type: String,
    },
    powerSource: {
      type: String,
    },
    features: {
      cameraResolution: {
        type: String,
      },
      storageCapacity: {
        type: String,
      },
      screenSize: {
        type: String,
      },
      default: {},
    },

    dimension: {
      type: {
        height: Number,
        width: Number,
        depth: Number,
      },
      default: {},
    },
    weight: {
      type: String,
    },
    img: {
      type: String,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

export const ProductModel = model<TProduct>('Product', productSchema);
