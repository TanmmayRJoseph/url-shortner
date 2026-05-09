import { IAuth } from "./authTypes";

declare global {
  namespace Express {
    export interface Request {
      user?: IAuth;
    }
  }
}
