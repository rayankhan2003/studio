import { Suspense } from "react";
import CustomTestClient from "./CustomTestClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Loading test builder…</div>}>
      <CustomTestClient />
    </Suspense>
  );
}
