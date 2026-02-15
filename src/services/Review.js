import Review from "../models/Review.js";
import OrderItem from "../models/OrderItems.js";
import Order from "../models/Order.js";

export const createReviewService = async ({
  userId,
  productId,
  rating,
  comment
}) => {
  // 1. Check user purchased product
  const hasPurchased = await OrderItem.exists({
    product: productId,
    order: {
      $in: await Order.find({ user: userId }).distinct("_id")
    }
  });

  if (!hasPurchased) {
    throw new Error("NOT_PURCHASED");
  }

  // 2. Prevent duplicate review
  const existingReview = await Review.findOne({
    user: userId,
    product: productId
  });

  if (existingReview) {
    throw new Error("ALREADY_REVIEWED");
  }

  // 3. Create review
  return await Review.create({
    user: userId,
    product: productId,
    rating,
    comment
  });
};

export const getProductReviewsService = async (productId) => {
  const data = await Review.find({ product: productId })
    .populate("user", "name")
    .sort({ created_at: -1 });
  return {data};
};




/**
 * UPDATE review (Review owner only)
 */
export const updateReviewService = async (reviewId, userId, data) => {
  const review = await Review.findById(reviewId);

  if (!review) {
    throw new Error("Review not found");
  }

  // Ensure ownership
  if (review.user.toString() !== userId) {
    throw new Error("Not authorized to update this review");
  }

  if (data.rating !== undefined) {
    review.rating = data.rating;
  }

  if (data.comment !== undefined) {
    review.comment = data.comment;
  }

  await review.save();
  return review;
};

/**
 * DELETE review (ADMIN only)
 */
export const deleteReviewService = async (reviewId, adminRole) => {

    console.log("Admin role for deleting review:", adminRole); // Debugging line

  // 🔐 Admin check
  if (adminRole !== "admin") {
    const error = new Error("Access denied");
    error.statusCode = 403;
    throw error;
  }

  const review = await Review.findById(reviewId);

  if (!review) {
    throw new Error("Review not found");
  }

  await review.deleteOne();
};
