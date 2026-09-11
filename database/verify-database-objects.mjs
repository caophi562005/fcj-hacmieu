import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import mariadb from 'mariadb';

const envPath = resolve(process.cwd(), '.env');
if (!existsSync(envPath))
  throw new Error('Không tìm thấy .env ở workspace root');
process.loadEnvFile(envPath);

const DATABASES = {
  catalog: 'CATALOG_SERVICE_MYSQL_DATABASE_URL',
  order: 'ORDER_SERVICE_MYSQL_DATABASE_URL',
  payment: 'PAYMENT_SERVICE_MYSQL_DATABASE_URL',
  wallet: 'WALLET_SERVICE_MYSQL_DATABASE_URL',
  promotion: 'PROMOTION_SERVICE_MYSQL_DATABASE_URL',
  utility: 'UTILITY_SERVICE_MYSQL_DATABASE_URL',
};

const EXPECTED_OBJECTS = {
  catalog: { views: ['vw_active_products'], routines: [], triggers: [] },
  wallet: {
    views: [
      'vw_pending_payouts',
      'vw_shop_credit_revenue',
      'vw_wallet_transaction_history',
    ],
    routines: [
      'fn_wallet_available_balance',
      'sp_adjust_wallet',
      'sp_create_payout_request',
    ],
    triggers: [
      'trg_credit_non_negative_before_insert',
      'trg_credit_non_negative_before_update',
      'trg_wallet_non_negative_before_insert',
      'trg_wallet_non_negative_before_update',
    ],
  },
  order: {
    views: [],
    routines: [
      'fn_calculate_discount',
      'fn_order_grand_total',
      'sp_change_order_status',
    ],
    triggers: [
      'trg_order_item_total_before_insert',
      'trg_order_item_total_before_update',
    ],
  },
  payment: {
    views: [],
    routines: ['sp_process_bank_transaction'],
    triggers: ['trg_payment_success_immutable'],
  },
  promotion: {
    views: [],
    routines: ['fn_is_promotion_active', 'sp_use_promotion'],
    triggers: [],
  },
  utility: {
    views: ['vw_product_rating_summary'],
    routines: ['fn_average_rating'],
    triggers: [
      'trg_review_rating_range_before_insert',
      'trg_review_rating_range_before_update',
    ],
  },
};

function connectionOptions(envName) {
  const raw = process.env[envName];
  if (!raw) throw new Error(`Thiếu biến ${envName}`);
  const url = new URL(raw);
  const sslMode = url.searchParams.get('ssl-mode')?.toUpperCase();
  return {
    host: url.hostname,
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: decodeURIComponent(url.pathname.replace(/^\//, '')),
    ssl: sslMode ? { rejectUnauthorized: sslMode !== 'REQUIRED' } : undefined,
    bigIntAsNumber: true,
    connectTimeout: 15_000,
  };
}

async function expectDatabaseError(action, token) {
  let received;
  try {
    await action();
  } catch (error) {
    received = error;
  }
  assert(received, `Mong đợi database từ chối với lỗi ${token}`);
  assert.match(String(received), new RegExp(token));
}

async function verifyDefinitions(name, conn) {
  const expected = EXPECTED_OBJECTS[name];
  const views = await conn.query(
    `SELECT TABLE_NAME AS name FROM information_schema.VIEWS
      WHERE TABLE_SCHEMA = DATABASE() ORDER BY TABLE_NAME`,
  );
  const routines = await conn.query(
    `SELECT ROUTINE_NAME AS name FROM information_schema.ROUTINES
      WHERE ROUTINE_SCHEMA = DATABASE() ORDER BY ROUTINE_NAME`,
  );
  const triggers = await conn.query(
    `SELECT TRIGGER_NAME AS name FROM information_schema.TRIGGERS
      WHERE TRIGGER_SCHEMA = DATABASE() ORDER BY TRIGGER_NAME`,
  );
  assert.deepEqual(
    views.map((row) => row.name),
    expected.views,
  );
  assert.deepEqual(
    routines.map((row) => row.name),
    expected.routines,
  );
  assert.deepEqual(
    triggers.map((row) => row.name),
    expected.triggers,
  );
}

async function verifyCatalog(conn) {
  const [row] = await conn.query(
    'SELECT COUNT(*) AS total FROM vw_active_products',
  );
  assert(Number.isInteger(row.total));
}

async function verifyWallet(conn, suffix) {
  const userId = `DB_OBJECT_USER_${suffix}`;
  const walletId = `DB_OBJECT_WALLET_${suffix}`;
  const shopId = `DB_OBJECT_SHOP_${suffix}`;
  const creditId = `DB_OBJECT_CREDIT_${suffix}`;
  const payoutId = randomUUID();
  try {
    await conn.query('CALL sp_adjust_wallet(?, ?, ?, ?, ?, ?)', [
      userId,
      'CREDIT',
      'SYSTEM',
      `VERIFY_${suffix}`,
      250,
      'Verify database objects',
    ]);
    const [balance] = await conn.query(
      'SELECT fn_wallet_available_balance(?) AS value',
      [userId],
    );
    assert.equal(balance.value, 250);
    const [history] = await conn.query(
      'SELECT amount, balanceAfter FROM vw_wallet_transaction_history WHERE userId = ?',
      [userId],
    );
    assert.deepEqual(
      { amount: history.amount, balanceAfter: history.balanceAfter },
      { amount: 250, balanceAfter: 250 },
    );
    await expectDatabaseError(
      () =>
        conn.query('UPDATE Wallet SET balance = -1 WHERE userId = ?', [userId]),
      'WALLET_BALANCE_NEGATIVE',
    );

    await conn.query(
      `INSERT INTO Credit (id, shopId, balance, createdAt, updatedAt)
       VALUES (?, ?, 500, NOW(3), NOW(3))`,
      [creditId, shopId],
    );
    await conn.query('CALL sp_create_payout_request(?, ?, ?, ?, ?, ?, ?)', [
      payoutId,
      shopId,
      200,
      'Test Bank',
      '0000000000',
      'DATABASE OBJECT TEST',
      'Temporary verification row',
    ]);
    const [payout] = await conn.query(
      'SELECT amount FROM vw_pending_payouts WHERE id = ?',
      [payoutId],
    );
    assert.equal(payout.amount, 200);
    const [credit] = await conn.query(
      'SELECT balance FROM Credit WHERE id = ?',
      [creditId],
    );
    assert.equal(credit.balance, 300);

    await conn.query(
      `INSERT INTO CreditTransaction
       (id, creditId, shopId, type, source, referenceId, amount,
        balanceAfter, description, createdAt)
       VALUES (?, ?, ?, 'CREDIT', 'ORDER_REVENUE', ?, 100, 400, 'Verify view', NOW(3))`,
      [randomUUID(), creditId, shopId, `ORDER_${suffix}`],
    );
    const [revenue] = await conn.query(
      'SELECT creditedRevenue FROM vw_shop_credit_revenue WHERE shopId = ?',
      [shopId],
    );
    assert.equal(Number(revenue.creditedRevenue), 100);
  } finally {
    await conn.query('DELETE FROM PayoutRequest WHERE id = ?', [payoutId]);
    await conn.query('DELETE FROM CreditTransaction WHERE shopId = ?', [
      shopId,
    ]);
    await conn.query('DELETE FROM Credit WHERE id = ?', [creditId]);
    await conn.query('DELETE FROM WalletTransaction WHERE userId = ?', [
      userId,
    ]);
    await conn.query('DELETE FROM Wallet WHERE userId = ? OR id = ?', [
      userId,
      walletId,
    ]);
  }
}

async function verifyOrder(conn, suffix) {
  const orderId = `DB_OBJECT_ORDER_${suffix}`;
  const itemId = `DB_OBJECT_ITEM_${suffix}`;
  const [discount] = await conn.query(
    "SELECT fn_calculate_discount('PERCENT', 1000, 500000, 30000) AS value",
  );
  assert.equal(discount.value, 30000);
  const [total] = await conn.query(
    'SELECT fn_order_grand_total(200000, 50000, -20000) AS value',
  );
  assert.equal(total.value, 230000);
  try {
    await conn.query(
      `INSERT INTO \`Order\`
       (id, code, userId, shopId, status, itemTotal, shippingFee, discount,
        grandTotal, receiver, paymentMethod, paymentStatus, paymentId,
        timeline, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, 'PENDING', 100, 0, 0, 100, ?, 'COD', 'PENDING',
               ?, JSON_ARRAY(), NOW(3), NOW(3))`,
      [
        orderId,
        `DBOBJ${suffix}`,
        `USER_${suffix}`,
        `SHOP_${suffix}`,
        JSON.stringify({ name: 'DB test', phone: '0', address: 'DB test' }),
        `PAYMENT_${suffix}`,
      ],
    );
    await conn.query(
      `INSERT INTO OrderItem
       (id, orderId, productId, skuId, shopId, productName, skuValue,
        quantity, price, total, productImage, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, 'DB test', 'DB test', 2, 100, 0, '', NOW(3), NOW(3))`,
      [itemId, orderId, `PRODUCT_${suffix}`, `SKU_${suffix}`, `SHOP_${suffix}`],
    );
    const [item] = await conn.query(
      'SELECT total FROM OrderItem WHERE id = ?',
      [itemId],
    );
    assert.equal(item.total, 200);
    await conn.query('CALL sp_change_order_status(?, ?, ?, ?)', [
      orderId,
      `SHOP_${suffix}`,
      'CONFIRMED',
      `USER_${suffix}`,
    ]);
    const [order] = await conn.query(
      'SELECT status FROM `Order` WHERE id = ?',
      [orderId],
    );
    assert.equal(order.status, 'CONFIRMED');
  } finally {
    await conn.query('DELETE FROM `Order` WHERE id = ?', [orderId]);
  }
}

async function verifyPromotion(conn, suffix) {
  const promotionId = `DB_OBJECT_PROMO_${suffix}`;
  const userId = `DB_OBJECT_USER_${suffix}`;
  try {
    await conn.query(
      `INSERT INTO Promotion
       (id, code, name, status, scope, minOrderSubtotal, discountType,
        discountValue, totalLimit, usedCount, createdAt, updatedAt)
       VALUES (?, ?, 'DB object test', 'ACTIVE', 'ORDER', 0, 'AMOUNT',
               100, 5, 0, NOW(3), NOW(3))`,
      [promotionId, `DBOBJ${suffix}`],
    );
    const [active] = await conn.query(
      'SELECT fn_is_promotion_active(?, NOW(3)) AS value',
      [promotionId],
    );
    assert.equal(active.value, 1);
    const args = [
      randomUUID(),
      promotionId,
      userId,
      JSON.stringify(['ORDER-1']),
    ];
    await conn.query('CALL sp_use_promotion(?, ?, ?, ?)', args);
    await conn.query('CALL sp_use_promotion(?, ?, ?, ?)', args);
    const [promotion] = await conn.query(
      'SELECT usedCount FROM Promotion WHERE id = ?',
      [promotionId],
    );
    assert.equal(promotion.usedCount, 1);
  } finally {
    await conn.query('DELETE FROM Redemption WHERE promotionId = ?', [
      promotionId,
    ]);
    await conn.query('DELETE FROM Promotion WHERE id = ?', [promotionId]);
  }
}

async function verifyPayment(conn, suffix) {
  const paymentId = `DB_OBJECT_PAYMENT_${suffix}`;
  const paymentCode = `DBOBJ${suffix}`;
  const transactionId = 2_000_000_000 + Math.floor(Math.random() * 100_000_000);
  try {
    await conn.query(
      `INSERT INTO Payment
       (id, code, userId, orderId, method, status, amount, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, 'ONLINE', 'PENDING', 500, NOW(3), NOW(3))`,
      [paymentId, paymentCode, `USER_${suffix}`, JSON.stringify(['ORDER-1'])],
    );
    await conn.query(
      'CALL sp_process_bank_transaction(?, ?, NOW(3), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        transactionId,
        'DB-TEST',
        '0000000000',
        null,
        500,
        0,
        500,
        paymentCode,
        paymentCode,
        paymentCode,
        `REF_${suffix}`,
        'Temporary verification row',
      ],
    );
    const [payment] = await conn.query(
      'SELECT status FROM Payment WHERE id = ?',
      [paymentId],
    );
    assert.equal(payment.status, 'SUCCESS');
    await expectDatabaseError(
      () =>
        conn.query('UPDATE Payment SET amount = 1 WHERE id = ?', [paymentId]),
      'PAYMENT_SUCCESS_IMMUTABLE',
    );
  } finally {
    await conn.query('DELETE FROM `Transaction` WHERE id = ?', [transactionId]);
    await conn.query('DELETE FROM Payment WHERE id = ?', [paymentId]);
  }
}

async function verifyUtility(conn, suffix) {
  const aggregateId = `DB_OBJECT_RATING_${suffix}`;
  const productId = `DB_OBJECT_PRODUCT_${suffix}`;
  const reviewId = `DB_OBJECT_REVIEW_${suffix}`;
  const [average] = await conn.query(
    'SELECT fn_average_rating(18, 4) AS value',
  );
  assert.equal(Number(average.value), 4.5);
  try {
    await conn.query(
      `INSERT INTO RatingAggregate
       (id, productId, averageRating, totalReviews, star1Count, star2Count,
        star3Count, star4Count, star5Count, updatedAt)
       SELECT ?, ?, fn_average_rating(COALESCE(SUM(rating), 0), COUNT(*)),
              COUNT(*),
              COALESCE(SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END), 0),
              COALESCE(SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END), 0),
              COALESCE(SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END), 0),
              COALESCE(SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END), 0),
              COALESCE(SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END), 0), NOW(3)
         FROM Review WHERE productId = ? AND deletedAt IS NULL`,
      [aggregateId, productId, productId],
    );
    const [summary] = await conn.query(
      'SELECT totalReviews FROM vw_product_rating_summary WHERE productId = ?',
      [productId],
    );
    assert.equal(summary.totalReviews, 0);
    await expectDatabaseError(
      () =>
        conn.query(
          `INSERT INTO Review
           (id, userId, sellerId, productId, orderId, orderItemId, rating,
            mediaUrls, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, 6, ?, NOW(3), NOW(3))`,
          [
            reviewId,
            `USER_${suffix}`,
            `SELLER_${suffix}`,
            productId,
            `ORDER_${suffix}`,
            `ITEM_${suffix}`,
            JSON.stringify([]),
          ],
        ),
      'REVIEW_RATING_OUT_OF_RANGE',
    );
  } finally {
    await conn.query('DELETE FROM Review WHERE id = ?', [reviewId]);
    await conn.query('DELETE FROM RatingAggregate WHERE id = ?', [aggregateId]);
  }
}

const tests = {
  catalog: verifyCatalog,
  wallet: verifyWallet,
  order: verifyOrder,
  promotion: verifyPromotion,
  payment: verifyPayment,
  utility: verifyUtility,
};
const suffix = `${Date.now()}`;

for (const [name, envName] of Object.entries(DATABASES)) {
  const conn = await mariadb.createConnection(connectionOptions(envName));
  try {
    await verifyDefinitions(name, conn);
    await tests[name](conn, suffix);
    console.log(`PASS ${name}`);
  } finally {
    await conn.end();
  }
}

console.log('PASS: 5 views, 5 functions, 5 procedures và 9 triggers.');
