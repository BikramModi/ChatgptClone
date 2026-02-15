



import { Router } from "express";

import {
  createReviewService,
  getProductReviewsService,
  updateReviewService,
  deleteReviewService
} from "../services/Review.js";


const REVIEW_ROUTER = Router({ mergeParams: true });



REVIEW_ROUTER.post("/createReview", 
    
    async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;

    const review = await createReviewService({
      userId: req.user.userId,
      productId,
      rating,
      comment
    });

    res.status(201).json(review);

  } catch (error) {
    if (error.message === "NOT_PURCHASED") {
      return res.status(403).json({ message: "Purchase required" });
    }

    if (error.message === "ALREADY_REVIEWED") {
      return res.status(400).json({ message: "Already reviewed" });
    }

    res.status(500).json({ message: "Server error" });
  }
}

);


REVIEW_ROUTER.get("/:productId/getallReviews", 
    
    async (req, res) => {
  try {
    const reviews = await getProductReviewsService(req.params.productId);
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}

);


 

/**
 * UPDATE review (USER – owner only)
 */
REVIEW_ROUTER.patch("/:id/updateReview/useronly", 

async (req, res) => {
  try {
    const updatedReview = await updateReviewService(
      req.params.id,
      req.user.userId,
      req.body
    );

    res.json({
      message: "Review updated successfully",
      review: updatedReview
    });

  } catch (error) {
    res.status(403).json({
      message: error.message
    });
  }
}

);



/**
 * DELETE review (ADMIN)
 */

REVIEW_ROUTER.delete("/:id/deleteReview/adminonly", 

async (req, res) => {
  try {
    await deleteReviewService(req.params.id, req.user.role);

    res.json({
      message: "Review deleted successfully"
    });

  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
}

);









export default REVIEW_ROUTER;




