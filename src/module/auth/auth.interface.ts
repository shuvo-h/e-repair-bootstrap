import { Types } from 'mongoose';
import { TUserRole, TUserStatus } from '../user/user.interface';

export type TLoginUser = {
  id: string;
  password: string;
};

export type TTokenUser = {
  _id: Types.ObjectId;
  email: string;
  role: TUserRole;
  status: TUserStatus;
};
