"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { createSupabasePublicClient } from "@/lib/supabase";

type OperationsPositionOption = "Chief Operations Officer" | "Vice Chief Operations Officer";

const OPERATIONS_POSITION_OPTIONS: readonly OperationsPositionOption[] = [
  "Chief Operations Officer",
  "Vice Chief Operations Officer",
];

const COOKIE_PREFIX = "registration_";

const getRegistrationCookieValue = (key: string) => {
  if (typeof document === "undefined") {
    return "";
  }

  const cookies = new Map(
    document.cookie
      .split("; ")
      .filter(Boolean)
      .map((cookieItem) => {
        const [rawName, ...rawValue] = cookieItem.split("=");
        return [decodeURIComponent(rawName), decodeURIComponent(rawValue.join("="))] as const;
      }),
  );

  return cookies.get(`${COOKIE_PREFIX}${key}`) ?? "";
};

export default function OperationsDepartmentPage() {
  const router = useRouter();
  const supabase = createSupabasePublicClient();
  const formRef = useRef<HTMLFormElement>(null);
  const [selectedPosition, setSelectedPosition] = useState<OperationsPositionOption | "">("");
  const [canSubmit, setCanSubmit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const refreshCanSubmit = () => {
    setTimeout(() => {
      setCanSubmit(formRef.current?.checkValidity() ?? false);
    }, 0);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!event.currentTarget.reportValidity()) {
      return;
    }

    const firstName = getRegistrationCookieValue("firstName");
    const lastName = getRegistrationCookieValue("lastName");
    const email = getRegistrationCookieValue("email");

    if (!firstName || !lastName || !email) {
      setSubmitError("Missing personal information. Please complete the Personal Information page first.");
      return;
    }

    if (!selectedPosition) {
      setSubmitError("Please select a position before submitting.");
      return;
    }

    setSubmitError(null);

    setIsSubmitting(true);

    const { error } = await supabase.from("registration_operations_department").insert({
      first_name: firstName,
      last_name: lastName,
      email,
      application_role: selectedPosition,
    });

    if (error) {
      setIsSubmitting(false);
      setSubmitError(error.message);
      return;
    }

    setIsSubmitting(false);

    router.push("/register/operations-department/submit");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100 px-4 py-6 font-sans text-zinc-900">
      <main className="mx-auto w-full max-w-3xl rounded-2xl border border-sky-100 bg-white/95 p-6 shadow-lg shadow-blue-100 sm:p-8">
        <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">Registration - Operations Department</h1>

        <p className="mt-4 text-sm leading-6 text-slate-700">
          The Operations Department is the backbone of organizational logistics and event execution. We oversee
          every step of the operational process, ensuring smooth planning and implementation of events conducted
          within the organization. This team ensures CNCP&apos;s events run efficiently, delivering a seamless,
          professional, and engaging experience for attendees and team members.
        </p>

        <section className="mt-6">
          <h2 className="text-base font-semibold text-slate-900">What&apos;s in it for you?</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-slate-700">
            <li>Hands-on experience in project and event operations</li>
            <li>Exposure to planning, coordination, and documentation workflows</li>
            <li>Opportunities to lead initiatives and improve team systems</li>
            <li>Development of communication and organizational skills</li>
          </ul>
        </section>

        <form
          ref={formRef}
          className="mt-6 space-y-4 text-sm"
          onSubmit={handleSubmit}
          onInput={refreshCanSubmit}
          onChange={refreshCanSubmit}
        >
          <fieldset className="space-y-3 rounded-xl border border-sky-200 bg-sky-50/70 p-4 sm:col-span-2">
            <legend className="px-2 text-sm font-semibold">
              Which position would you like to apply for? <span className="text-red-600">*</span>
            </legend>

            {OPERATIONS_POSITION_OPTIONS.map((position) => (
              <label key={position} className="flex items-start gap-3 text-sm">
                <input
                  type="radio"
                  name="operationsPosition"
                  value={position}
                  className="mt-1"
                  checked={selectedPosition === position}
                  onChange={() => setSelectedPosition(position)}
                  required
                />
                <span>{position}</span>
              </label>
            ))}
          </fieldset>

          <div className="mt-6 flex items-center justify-between">
            <button
              type="button"
              className="inline-flex h-11 items-center justify-center rounded-md border border-slate-300 bg-white px-5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              onClick={() => router.push("/register")}
            >
              Previous
            </button>

            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center rounded-md bg-sky-600 px-5 text-sm font-medium text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              disabled={!canSubmit || isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Submit"}
            </button>
          </div>

          {submitError && (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {submitError}
            </p>
          )}
        </form>
      </main>
    </div>
  );
}