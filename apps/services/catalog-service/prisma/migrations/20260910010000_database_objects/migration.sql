-- View used by ProductRepository.validateProducts().
CREATE VIEW `vw_active_products` AS
SELECT
    `id`, `name`, `shopId`, `basePrice`, `virtualPrice`, `images`,
    `averageRate`, `soldCount`, `viewCount`, `createdAt`
FROM `Product`
WHERE `status` = 'ACTIVE'
  AND `isApproved` = TRUE
  AND `isHidden` = FALSE
  AND `deletedAt` IS NULL;
