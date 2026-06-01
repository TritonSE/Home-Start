import { cleanEnv, str } from "envalid";
import { json } from "envalid/dist/validators";

/**
 * NextJS only allows the frontend to access environment variables if they start with
 * "NEXT_PUBLIC", so we have to manually acccess attributes of process.env here.
 */
export default cleanEnv(
  {
    NEXT_PUBLIC_FIREBASE: process.env.NEXT_PUBLIC_FIREBASE,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_MS_CLIENT_ID: process.env.NEXT_PUBLIC_MS_CLIENT_ID,
    NEXT_PUBLIC_MS_REDIRECT_URI: process.env.NEXT_PUBLIC_MS_REDIRECT_URI,
  },
  {
    NEXT_PUBLIC_FIREBASE: json(),
    NEXT_PUBLIC_API_URL: str({ default: "http://localhost:4000" }),
    NEXT_PUBLIC_MS_CLIENT_ID: str({ default: "" }),
    NEXT_PUBLIC_MS_REDIRECT_URI: str({ default: "" }),
  },
);
