import {
    TErrorSource,
    TGenericErrorResponse,
  } from '../interface/error.interface';
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleDuplicateError = (err: any): TGenericErrorResponse => {
    const statusCode = 400;
  
    const match = err?.message?.match(/"([^"])"/);
    const extractedMessage = match && match[1];
  
    const errorSources: TErrorSource[] = [
      { path: '', message: extractedMessage },
    ];
  
    return {
      statusCode,
      message: `${extractedMessage} is already exist`,
      errorSources,
    };
  };
  
  export default handleDuplicateError;
  