import React, { useState } from 'react';
import ReviewForm from './ReviewForm';
import { CheckCircle } from 'lucide-react';

export default function SubmitReview({ boardingId, onReviewAdded }) {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitted = (review) => {
    sessionStorage.setItem('myReview', JSON.stringify(review));
    setSubmitted(true);
    onReviewAdded && onReviewAdded(review);
  };

  if (submitted) {
    return (
      <div className="text-center py-6">
        <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <CheckCircle size={28} className="text-emerald-600" />
        </div>
        <p className="font-black text-slate-800 mb-1">Thank you!</p>
        <p className="text-slate-500 text-sm">Your review has been submitted.</p>
        <button
          onClick={() => setSubmitted(false)}
          className="mt-4 text-blue-600 text-sm font-bold hover:underline"
        >
          Write another review
        </button>
      </div>
    );
  }

  return (
    <div className="page" style={{ maxWidth: 680 }}>
      <ReviewForm boardingId={boardingId} onSubmitted={handleSubmitted} />
    </div>
  );
}