import { NextRequest, NextResponse } from 'next/server';
import { verifyFirebaseToken } from '@/lib/api-auth';
import { adminDb } from '@/lib/firebase-admin';
import {
  buildEventRenameUpdates,
  buildLeagueRenameUpdates,
  FacilityRenameContext,
} from '@/lib/facility-rename';

const MAX_ATOMIC_WRITES = 450;
const MAX_NAME_LENGTH = 120;
const MAX_ADDRESS_LENGTH = 300;
const MAX_NOTES_LENGTH = 1_000;

type PendingWrite = {
  ref: any;
  data: Record<string, any>;
};

function cleanText(value: unknown, maxLength: number): string | undefined {
  if (typeof value !== 'string') return undefined;
  return value.trim().slice(0, maxLength);
}

export async function POST(req: NextRequest) {
  const auth = await verifyFirebaseToken(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const facilityId = cleanText(body.facilityId, 200);
    const fieldId = cleanText(body.fieldId, 200);
    const fieldName = cleanText(body.fieldName, MAX_NAME_LENGTH);
    const requestedFacilityUpdates = body.facilityUpdates;

    if (!facilityId) {
      return NextResponse.json({ error: 'A facility ID is required.' }, { status: 400 });
    }
    if (!fieldId && !requestedFacilityUpdates) {
      return NextResponse.json({ error: 'No facility or resource update was supplied.' }, { status: 400 });
    }
    if (fieldId && !fieldName) {
      return NextResponse.json({ error: 'A resource name is required.' }, { status: 400 });
    }

    const facilityRef = adminDb.collection('facilities').doc(facilityId);
    const [facilitySnap, requesterSnap] = await Promise.all([
      facilityRef.get(),
      adminDb.collection('users').doc(auth.uid).get(),
    ]);

    if (!facilitySnap.exists) {
      return NextResponse.json({ error: 'Facility not found.' }, { status: 404 });
    }

    const facility = facilitySnap.data() || {};
    const isSuperAdmin =
      auth.role === 'superadmin' || requesterSnap.data()?.role === 'superadmin';
    if (!isSuperAdmin && facility.clubId !== auth.uid) {
      return NextResponse.json(
        { error: 'Only the facility owner can change this facility or its resources.' },
        { status: 403 }
      );
    }

    const oldFacilityName = cleanText(facility.name, MAX_NAME_LENGTH) || 'Facility';
    const facilityUpdates: Record<string, string> = {};
    if (requestedFacilityUpdates && typeof requestedFacilityUpdates === 'object') {
      if (Object.prototype.hasOwnProperty.call(requestedFacilityUpdates, 'name')) {
        const name = cleanText(requestedFacilityUpdates.name, MAX_NAME_LENGTH);
        if (!name) {
          return NextResponse.json({ error: 'Facility name cannot be empty.' }, { status: 400 });
        }
        facilityUpdates.name = name;
      }
      if (Object.prototype.hasOwnProperty.call(requestedFacilityUpdates, 'address')) {
        facilityUpdates.address =
          cleanText(requestedFacilityUpdates.address, MAX_ADDRESS_LENGTH) || '';
      }
      if (Object.prototype.hasOwnProperty.call(requestedFacilityUpdates, 'notes')) {
        facilityUpdates.notes =
          cleanText(requestedFacilityUpdates.notes, MAX_NOTES_LENGTH) || '';
      }
    }

    const pendingWrites = new Map<string, PendingWrite>();
    const addWrite = (ref: any, data: Record<string, any>) => {
      if (Object.keys(data).length === 0) return;
      const existing = pendingWrites.get(ref.path);
      pendingWrites.set(ref.path, {
        ref,
        data: { ...(existing?.data || {}), ...data },
      });
    };

    if (Object.keys(facilityUpdates).length > 0) {
      addWrite(facilityRef, facilityUpdates);
    }

    const eventDocs = new Map<string, any>();
    const collectEvents = (snapshot: any) => {
      snapshot.docs.forEach((eventDoc: any) => eventDocs.set(eventDoc.ref.path, eventDoc));
    };

    let context: FacilityRenameContext = {
      facilityId,
      oldFacilityName,
    };

    const newFacilityName = facilityUpdates.name;
    if (newFacilityName && newFacilityName !== oldFacilityName) {
      context = { ...context, newFacilityName };

      const [directEvents, fieldsSnap] = await Promise.all([
        adminDb.collectionGroup('events').where('facilityId', '==', facilityId).get(),
        facilityRef.collection('fields').get(),
      ]);
      collectEvents(directEvents);

      for (const fieldDoc of fieldsSnap.docs) {
        const existingFieldName = cleanText(fieldDoc.data().name, MAX_NAME_LENGTH);
        if (!existingFieldName) continue;
        const selectedEvents = await adminDb
          .collectionGroup('events')
          .where('selectedFields', 'array-contains', `${facilityId}:${existingFieldName}`)
          .get();
        collectEvents(selectedEvents);
      }
    }

    if (fieldId) {
      const fieldRef = facilityRef.collection('fields').doc(fieldId);
      const fieldSnap = await fieldRef.get();
      if (!fieldSnap.exists) {
        return NextResponse.json({ error: 'Facility resource not found.' }, { status: 404 });
      }

      const oldFieldName = cleanText(fieldSnap.data()?.name, MAX_NAME_LENGTH);
      if (!oldFieldName) {
        return NextResponse.json({ error: 'Facility resource has no valid name.' }, { status: 409 });
      }

      if (fieldName !== oldFieldName) {
        const duplicateSnap = await facilityRef
          .collection('fields')
          .where('name', '==', fieldName)
          .get();
        const hasDuplicate = duplicateSnap.docs.some(doc => doc.id !== fieldId);
        if (hasDuplicate) {
          return NextResponse.json(
            { error: 'Another resource in this facility already uses that name.' },
            { status: 409 }
          );
        }

        context = {
          ...context,
          oldFieldName,
          newFieldName: fieldName,
        };
        addWrite(fieldRef, { name: fieldName });

        const selectedEvents = await adminDb
          .collectionGroup('events')
          .where('selectedFields', 'array-contains', `${facilityId}:${oldFieldName}`)
          .get();
        collectEvents(selectedEvents);

        const leaguesSnap = await adminDb
          .collection('leagues')
          .where('creatorId', '==', facility.clubId)
          .get();

        for (const leagueDoc of leaguesSnap.docs) {
          const leagueUpdates = buildLeagueRenameUpdates(leagueDoc.data(), context);
          if (Object.keys(leagueUpdates).length === 0) continue;
          addWrite(leagueDoc.ref, leagueUpdates);

          const leagueEvents = await adminDb
            .collectionGroup('events')
            .where('leagueId', '==', leagueDoc.id)
            .get();
          collectEvents(leagueEvents);
        }
      }
    }

    for (const eventDoc of eventDocs.values()) {
      addWrite(eventDoc.ref, buildEventRenameUpdates(eventDoc.data(), context));
    }

    if (pendingWrites.size === 0) {
      return NextResponse.json({ ok: true, updatedRecords: 0 });
    }
    if (pendingWrites.size > MAX_ATOMIC_WRITES) {
      return NextResponse.json(
        {
          error:
            'This facility is linked to too many records for one safe rename. No records were changed.',
        },
        { status: 409 }
      );
    }

    const batch = adminDb.batch();
    pendingWrites.forEach(({ ref, data }) => batch.update(ref, data));
    await batch.commit();

    return NextResponse.json({
      ok: true,
      updatedRecords: pendingWrites.size,
      facilityName: newFacilityName || oldFacilityName,
      fieldName: fieldId ? fieldName : undefined,
    });
  } catch (error: any) {
    console.error('[facilities/update] Error:', error?.message || error);
    return NextResponse.json(
      { error: 'Unable to update the facility and its linked records.' },
      { status: 500 }
    );
  }
}
