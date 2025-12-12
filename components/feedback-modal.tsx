"use client";

import { useState } from "react";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    rating: number,
    comment: string,
    feedbackType: string
  ) => Promise<void>;
}

export default function FeedbackModal({
  isOpen,
  onClose,
  onSubmit,
}: FeedbackModalProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [feedbackType, setFeedbackType] = useState("general");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;

    setIsSubmitting(true);
    try {
      await onSubmit(rating, comment, feedbackType);
      // Reset form
      setRating(0);
      setComment("");
      setFeedbackType("general");
    } catch (error) {
      console.error("Failed to submit feedback:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    // Reset form and close
    setRating(0);
    setComment("");
    setFeedbackType("general");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 relative">
        {/* Close button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
          disabled={isSubmitting}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Title */}
        <h2 className="text-2xl font-bold text-white mb-2">
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Jak se vám líbí Spotonaut?
          </span>
        </h2>

        {/* Helper text */}
        <p className="text-slate-400 text-sm mb-6">
          Vaše zpětná vazba nám pomáhá zlepšovat službu pro podnikatele jako vy.
        </p>

        <form onSubmit={handleSubmit}>
          {/* Star Rating */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Hodnocení
            </label>
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-all duration-200 hover:scale-110"
                >
                  <svg
                    className={`w-10 h-10 ${
                      star <= (hoveredRating || rating)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-slate-600 fill-slate-600"
                    }`}
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          {/* Feedback Type */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Kterou oblast chcete ohodnotit?
            </label>
            <div className="inline-flex rounded-lg shadow-sm" role="group">
              {[
                { value: "accuracy", label: "Přesnost", position: "first" },
                { value: "chat", label: "Chat", position: "middle" },
                { value: "general", label: "Obecné", position: "last" },
              ].map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFeedbackType(type.value)}
                  disabled={isSubmitting}
                  className={`px-4 py-2 text-sm font-medium border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    type.position === "first"
                      ? "rounded-s-lg border-r-0"
                      : type.position === "last"
                      ? "rounded-e-lg"
                      : "border-r-0"
                  } ${
                    feedbackType === type.value
                      ? "bg-purple-600 text-white border-purple-600 hover:bg-purple-700 shadow-lg"
                      : "bg-slate-800 text-slate-300 border-slate-600 hover:bg-slate-700 hover:text-white"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Komentář (nepovinné)
            </label>
            <textarea
              value={comment}
              onChange={(e) => {
                if (e.target.value.length <= 500) {
                  setComment(e.target.value);
                }
              }}
              placeholder="Co bychom mohli zlepšit?"
              rows={4}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <div className="text-right text-xs text-slate-500 mt-1">
              {comment.length}/500
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleSkip}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Možná později
            </button>
            <button
              type="submit"
              disabled={rating === 0 || isSubmitting}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isSubmitting ? "Odesílám..." : "Odeslat"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
