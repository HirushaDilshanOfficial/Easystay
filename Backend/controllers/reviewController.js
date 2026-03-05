import Review, { find, findByIdAndUpdate } from "../models/Review";

export async function submitReview(req, res) {
  try {

    const review = new Review(req.body);
    await review.save();

    res.status(201).json({
      message: "Review submitted successfully",
      review
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getReviews(req, res) {

  const reviews = await find({ approved: true });

  res.json(reviews);

}

export async function approveReview(req, res) {

  const review = await findByIdAndUpdate(
    req.params.id,
    { approved: true },
    { new: true }
  );

  res.json(review);
}