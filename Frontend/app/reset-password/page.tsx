import { Suspense } from "react";
import ResetPasswordClient from "./ResetPasswordClient";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-center py-10 text-gray-600">Loading reset form...</div>}>
      <ResetPasswordClient />
    </Suspense>
  );
}
