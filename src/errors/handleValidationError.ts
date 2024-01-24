import mongoose from 'mongoose';
import {
  TErrorSource,
  TGenericErrorResponse,
} from '../interface/error.interface';

const handleValidationError = (
  err: mongoose.Error.ValidationError,
): TGenericErrorResponse => {
  const statusCode = 400;
  const errorSources: TErrorSource[] = Object.values(err.errors).map(
    (validateErr: mongoose.Error.ValidatorError | mongoose.Error.CastError) => {
      return {
        path: validateErr?.path,
        message: validateErr?.message,
      };
    },
  );

  return {
    statusCode,
    message: 'Validation Error',
    errorSources,
  };
};

export default handleValidationError;
