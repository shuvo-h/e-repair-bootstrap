import jwt, { JwtPayload } from 'jsonwebtoken';

export const createJwtToken = (
  tokenPayload: Record<string, unknown>,
  token_secret: string,
  expiresIn: string,
) => {
  const token = jwt.sign(tokenPayload, token_secret, {
    expiresIn: expiresIn,
  });
  return token;
};

export const verifyJwtToken = (
  token: string,
  sign_secret: string,
): JwtPayload => {
  const decoded = jwt.verify(token, sign_secret);

  return decoded as JwtPayload;
};
