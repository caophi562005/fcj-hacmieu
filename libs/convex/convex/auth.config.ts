import type { AuthConfig } from 'convex/server';

const userPoolId = process.env.USER_POOL_ID;
const customerClientId = process.env.CUSTOMER_CLIENT_ID;
const sellerClientId = process.env.SELLER_CLIENT_ID;
const adminClientId = process.env.ADMIN_CLIENT_ID;

if (!userPoolId || !customerClientId || !sellerClientId || !adminClientId) {
  throw new Error(
    'Convex auth requires USER_POOL_ID and all three Cognito client IDs',
  );
}

const region = userPoolId.split('_')[0];
const issuer = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`;

export default {
  providers: [customerClientId, sellerClientId, adminClientId].map(
    (applicationID) => ({ domain: issuer, applicationID }),
  ),
} satisfies AuthConfig;
