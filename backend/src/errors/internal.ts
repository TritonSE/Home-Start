import { CustomError } from "./errors";

const NO_APP_PORT = "Could not find app port env variable";

export class InternalError extends CustomError {
  static NO_APP_PORT = new InternalError(0, 500, NO_APP_PORT);
}
