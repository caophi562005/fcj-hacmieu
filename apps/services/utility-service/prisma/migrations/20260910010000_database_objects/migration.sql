CREATE VIEW `vw_product_rating_summary` AS
SELECT
    `id`, `productId`, `averageRating`, `totalReviews`,
    `star1Count`, `star2Count`, `star3Count`, `star4Count`, `star5Count`,
    `updatedAt`
FROM `RatingAggregate`;

CREATE FUNCTION `fn_average_rating`(
    p_rating_sum INT,
    p_rating_count INT
)
RETURNS DECIMAL(3,2)
DETERMINISTIC
BEGIN
    IF p_rating_count IS NULL OR p_rating_count = 0 THEN
        RETURN 0.00;
    END IF;
    RETURN ROUND(p_rating_sum / p_rating_count, 2);
END;

CREATE TRIGGER `trg_review_rating_range_before_insert`
BEFORE INSERT ON `Review`
FOR EACH ROW
BEGIN
    IF NEW.`rating` < 1 OR NEW.`rating` > 5 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'REVIEW_RATING_OUT_OF_RANGE';
    END IF;
END;

CREATE TRIGGER `trg_review_rating_range_before_update`
BEFORE UPDATE ON `Review`
FOR EACH ROW
BEGIN
    IF NEW.`rating` < 1 OR NEW.`rating` > 5 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'REVIEW_RATING_OUT_OF_RANGE';
    END IF;
END;
