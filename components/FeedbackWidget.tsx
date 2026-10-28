
"use client";

import { FormEvent, useState } from "react";

type FeedbackType = "COMPLAINT" | "SUGGESTION";

export default function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<FeedbackType>("SUGGESTION");
  const [anonymous, setAnonymous] = useState(true);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess(false);

    if (!message.trim()) {
      setError("Please describe your complaint or suggestion.");
      return;
    }

    if (!anonymous && (!name.trim() || !phone.trim())) {
      setError("Please enter your name and phone number, or choose anonymous.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          anonymous,
          name: anonymous ? null : name.trim(),
          phone: anonymous ? null : phone.trim(),
          message: message.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not send your feedback.");
      }

      setSuccess(true);
      setName("");
      setPhone("");
      setMessage("");
      setAnonymous(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setError("");
          setSuccess(false);
        }}
        aria-label="Complaints and suggestions"
        className="fixed left-0 top-1/2 z-[70] -translate-y-1/2 rounded-r-xl bg-[#176b3a] px-3 py-3 text-xs font-bold text-white shadow-lg transition hover:bg-[#12552e] sm:px-4 sm:py-3"
      >
        <span className="block [writing-mode:vertical-rl] rotate-180">
          Feedback
        </span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-3 sm:p-5">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="feedback-title"
            className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between bg-[#176b3a] px-4 py-4 text-white sm:px-5">
              <div>
                <h2 id="feedback-title" className="text-lg font-black">
                  Send Feedback
                </h2>
                <p className="mt-1 text-xs text-white/80">
                  Help us improve GoBiz.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close feedback form"
                className="rounded-lg px-3 py-2 text-xl hover:bg-white/10"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-4 sm:p-5">
              {success ? (
                <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                  <p className="font-bold text-green-800">
                    Feedback sent successfully.
                  </p>
                  <p className="mt-1 text-sm text-green-700">
                    Thank you for helping us improve GoBiz.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSuccess(false);
                      setOpen(false);
                    }}
                    className="mt-3 rounded-lg bg-[#176b3a] px-4 py-2 text-sm font-bold text-white"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-800">
                      What would you like to share?
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setType("COMPLAINT")}
                        className={`rounded-xl border px-3 py-3 text-sm font-semibold ${
                          type === "COMPLAINT"
                            ? "border-[#b91c1c] bg-red-50 text-[#991b1b]"
                            : "border-gray-200 text-gray-600"
                        }`}
                      >
                        Complaint
                      </button>
                      <button
                        type="button"
                        onClick={() => setType("SUGGESTION")}
                        className={`rounded-xl border px-3 py-3 text-sm font-semibold ${
                          type === "SUGGESTION"
                            ? "border-[#176b3a] bg-green-50 text-[#176b3a]"
                            : "border-gray-200 text-gray-600"
                        }`}
                      >
                        Suggestion
                      </button>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="feedback-message"
                      className="mb-1 block text-sm font-semibold text-gray-800"
                    >
                      Details
                    </label>
                    <textarea
                      id="feedback-message"
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                      rows={4}
                      maxLength={3000}
                      required
                      placeholder="Tell us what happened or what we could improve..."
                      className="w-full rounded-xl border border-gray-300 px-3 py-3 text-sm outline-none focus:border-[#176b3a] focus:ring-2 focus:ring-green-100"
                    />
                  </div>

                  <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={anonymous}
                      onChange={(event) => setAnonymous(event.target.checked)}
                      className="h-4 w-4 accent-[#176b3a]"
                    />
                    Submit anonymously
                  </label>

                  {!anonymous && (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="feedback-name"
                          className="mb-1 block text-sm font-semibold text-gray-800"
                        >
                          Name
                        </label>
                        <input
                          id="feedback-name"
                          value={name}
                          onChange={(event) => setName(event.target.value)}
                          required
                          maxLength={100}
                          placeholder="Your name"
                          className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#176b3a]"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="feedback-phone"
                          className="mb-1 block text-sm font-semibold text-gray-800"
                        >
                          Phone
                        </label>
                        <input
                          id="feedback-phone"
                          type="tel"
                          value={phone}
                          onChange={(event) => setPhone(event.target.value)}
                          required
                          maxLength={30}
                          placeholder="07xx xxx xxx"
                          className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#176b3a]"
                        />
                      </div>
                    </div>
                  )}

                  {error && (
                    <p role="alert" className="text-sm text-red-700">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-[#176b3a] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#12552e] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "Sending..." : "Send to GoBiz"}
                  </button>

                  <p className="text-center text-xs text-gray-500">
                    Feedback is handled by the GoBiz team.
                  </p>
                </>
              )}
            </form>
          </section>
        </div>
      )}
    </>
  );
}
