import ms from "ms";

const isProduction = process.env.NODE_ENV === "production";

export const accessCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  maxAge: ms(process.env.ACCESS_TOKEN_EXPIRES_IN), 
  path: "/",
};

export const refreshCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  maxAge: ms(process.env.REFRESH_TOKEN_EXPIRES_IN), 
  path: "/",
};