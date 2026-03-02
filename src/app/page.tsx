import { redirect } from "next/navigation";

// Fallback: redirect root to default locale
export default function RootPage() {
  redirect("/en");
}
