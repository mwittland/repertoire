import { redirect } from "next/navigation";

export default function ShotsPage() {
  redirect("/library?kind=shots");
}
