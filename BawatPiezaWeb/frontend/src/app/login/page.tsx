import { redirect } from "next/navigation";

export default function LoginRedirect() {
  // The login UI lives at the root "/" landing page.
  redirect("/");
}