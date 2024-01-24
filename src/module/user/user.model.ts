import { model, Schema } from 'mongoose';
import { TUser, TUserModel } from './user.interface';
import bcrypt from 'bcrypt';
import { env } from '../../config/config';
import { USER_STATUS, USER_ROLE } from './user.constant';

const userSchema = new Schema<TUser, TUserModel>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      select: 0, // never return on find method or populate method
    },
    passwordChangedAt: {
      // optional
      type: Date,
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLE),
    },
    status: {
      type: String,
      // enum: ['in-progress', 'blocked'],
      enum: Object.values(USER_STATUS),
      default: USER_STATUS['in-progress'],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    // _id: false, // don't create mongoose _id in doc
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  },
);

// pre-save middleware/hook will work on .save() / .create()
userSchema.pre('save', async function (next) {
  // // 'this' -> refer to the current _doc
  // make password hash before save/create
  this.password = await bcrypt.hash(
    this.password,
    Number(env.BCRYPT_SALT_ROUNDS),
  );
  next();
});
// post-save middleware/hook will work on .save() / .create()
userSchema.post('save', function (doc, next) {
  doc.password = '';
  next();
});

// static methods
userSchema.statics.isPasswordMatched = async function (
  plain_password: string,
  hash_password: string,
) {
  const isMatched = await bcrypt.compare(plain_password, hash_password);
  return isMatched;
};
userSchema.statics.isJwtIssuedBeforePasswordChanged = function (
  passwordChangedTimestamp: Date,
  jwtIssuedTimestamp: number,
) {
  const passwordChangedTime =
    new Date(passwordChangedTimestamp).getTime() / 1000;
  return passwordChangedTime > jwtIssuedTimestamp;
};

export const UserModel = model<TUser, TUserModel>('User', userSchema);
