import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = (await cookies()).get("__session");

  if (session) {
    redirect("/dashboard");
  }

  redirect("/login");
}
