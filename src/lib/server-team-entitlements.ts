import { adminDb } from '@/lib/firebase-admin';

const PAID_PLAN_TYPES = new Set([
  'team',
  'elite',
  'league',
  'school',
  'squad_pro',
  'squad_pro_demo',
]);
const ENTITLED_SUBSCRIPTION_STATUSES = new Set(['active', 'trialing']);

export type TeamFinanceAccess = {
  allowed: boolean;
  paid: boolean;
  status: number;
  error?: string;
  team?: FirebaseFirestore.DocumentData;
  user?: FirebaseFirestore.DocumentData;
};

function includesUser(value: unknown, userId: string): boolean {
  return Array.isArray(value) && value.includes(userId);
}

export async function getTeamFinanceAccess(
  userId: string,
  teamId: string,
  isSuperAdmin: boolean,
  requirePaid: boolean
): Promise<TeamFinanceAccess> {
  const [teamSnapshot, userSnapshot, memberSnapshot] = await Promise.all([
    adminDb.collection('teams').doc(teamId).get(),
    adminDb.collection('users').doc(userId).get(),
    adminDb.collection('teams').doc(teamId).collection('members').doc(userId).get(),
  ]);
  if (!teamSnapshot.exists) {
    return { allowed: false, paid: false, status: 404, error: 'Team not found.' };
  }

  const team = teamSnapshot.data() || {};
  const user = userSnapshot.data() || {};
  let authority =
    isSuperAdmin ||
    team.ownerUserId === userId ||
    includesUser(team.financeAdminIds, userId) ||
    includesUser(team.schoolAdminIds, userId) ||
    (memberSnapshot.exists && memberSnapshot.data()?.role === 'Admin');

  let entitlementOwnerId =
    typeof team.ownerUserId === 'string' ? team.ownerUserId : userId;
  const hubTeamId =
    typeof team.schoolId === 'string' && team.schoolId
      ? team.schoolId
      : typeof team.clubId === 'string' && team.clubId
        ? team.clubId
        : null;

  if (hubTeamId) {
    const hubSnapshot = await adminDb.collection('teams').doc(hubTeamId).get();
    if (hubSnapshot.exists) {
      const hub = hubSnapshot.data() || {};
      authority =
        authority ||
        hub.ownerUserId === userId ||
        includesUser(hub.financeAdminIds, userId) ||
        includesUser(hub.schoolAdminIds, userId);
      if (typeof hub.ownerUserId === 'string' && hub.ownerUserId) {
        entitlementOwnerId = hub.ownerUserId;
      }
    }
  }

  if (!authority) {
    return {
      allowed: false,
      paid: false,
      status: 403,
      error: 'You do not have finance permission for this squad.',
    };
  }

  if (isSuperAdmin) {
    return { allowed: true, paid: true, status: 200, team, user };
  }

  const entitlementUserSnapshot =
    entitlementOwnerId === userId
      ? userSnapshot
      : await adminDb.collection('users').doc(entitlementOwnerId).get();
  const entitlementUser = entitlementUserSnapshot.data() || {};
  const paid =
    team.isPro === true &&
    PAID_PLAN_TYPES.has(team.planId || '') &&
    PAID_PLAN_TYPES.has(entitlementUser.plan_type || '') &&
    ENTITLED_SUBSCRIPTION_STATUSES.has(entitlementUser.subscription_status || '');

  if (requirePaid && !paid) {
    return {
      allowed: false,
      paid: false,
      status: 403,
      error: 'Online payments require an active paid seat for this squad.',
    };
  }

  return { allowed: true, paid, status: 200, team, user };
}

export function isEntitledSubscriptionStatus(status: unknown): boolean {
  return typeof status === 'string' && ENTITLED_SUBSCRIPTION_STATUSES.has(status);
}

export function isPaidPlanType(planType: unknown): boolean {
  return typeof planType === 'string' && PAID_PLAN_TYPES.has(planType);
}
