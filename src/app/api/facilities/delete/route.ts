import { NextRequest, NextResponse } from 'next/server';
import { verifyFirebaseToken } from '@/lib/api-auth';
import { adminDb } from '@/lib/firebase-admin';
import {
  FacilityDeletionContext,
  getFacilityReferenceReasons,
} from '@/lib/facility-deletion';

const MAX_ID_LENGTH = 200;
const MAX_DELETE_WRITES = 450;
const MAX_SCANNED_RECORDS = 2_500;

type LinkedRecord = {
  path: string;
  type: 'event' | 'league';
  label: string;
  reasons: string[];
};

function cleanId(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const cleaned = value.trim();
  if (!cleaned || cleaned.length > MAX_ID_LENGTH || cleaned.includes('/')) return undefined;
  return cleaned;
}

function cleanName(value: unknown): string {
  return typeof value === 'string' ? value.trim().slice(0, 120) : '';
}

function addSnapshotDocs(target: Map<string, any>, snapshot: any) {
  snapshot.docs.forEach((document: any) => target.set(document.ref.path, document));
}

function describeDependencies(records: LinkedRecord[]) {
  const events = records.filter(record => record.type === 'event').length;
  const leagues = records.filter(record => record.type === 'league').length;
  const examples = records.slice(0, 3).map(record => record.label);
  return { events, leagues, total: records.length, examples };
}

export async function POST(req: NextRequest) {
  const auth = await verifyFirebaseToken(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const contentLength = Number(req.headers.get('content-length') || 0);
    if (contentLength > 2_048) {
      return NextResponse.json({ error: 'Request body is too large.' }, { status: 413 });
    }

    const body = await req.json();
    const facilityId = cleanId(body?.facilityId);
    const fieldId = cleanId(body?.fieldId);

    if (!facilityId) {
      return NextResponse.json({ error: 'A valid facility ID is required.' }, { status: 400 });
    }

    // Global superadmin authority must come from the verified token custom
    // claim, never from a browser-writable profile document.
    const isSuperAdmin = auth.role === 'superadmin';

    const result = await adminDb.runTransaction(async transaction => {
      const facilityRef = adminDb.collection('facilities').doc(facilityId);
      const facilitySnap = await transaction.get(facilityRef);

      if (!facilitySnap.exists) return { status: 404 as const };

      const facility = facilitySnap.data() || {};
      if (!isSuperAdmin && facility.clubId !== auth.uid) {
        return { status: 403 as const };
      }
      const facilityOwnerId = cleanId(facility.clubId);
      if (!facilityOwnerId) return { status: 409 as const, invalidOwner: true };

      const fieldsQuery = facilityRef.collection('fields');
      const fieldsSnap = await transaction.get(fieldsQuery);
      const allFields = fieldsSnap.docs.map(document => ({
        id: document.id,
        name: cleanName(document.data().name),
        ref: document.ref,
      }));

      const targetField = fieldId
        ? allFields.find(field => field.id === fieldId)
        : undefined;
      if (fieldId && !targetField) return { status: 404 as const, missingField: true };
      if (targetField && !targetField.name) {
        return { status: 409 as const, invalidField: true };
      }

      const targetFields = targetField ? [targetField] : allFields;
      const context: FacilityDeletionContext = {
        facilityId,
        facilityName: cleanName(facility.name) || 'Facility',
        fieldName: targetField?.name,
        facilityFieldNames: targetField
          ? undefined
          : allFields.map(field => field.name).filter(Boolean),
      };

      const eventDocs = new Map<string, any>();
      const leagueDocs = new Map<string, any>();

      addSnapshotDocs(
        eventDocs,
        await transaction.get(
          adminDb.collectionGroup('events').where('facilityId', '==', facilityId)
        )
      );

      const ownerTeams = new Map<string, any>();
      addSnapshotDocs(
        ownerTeams,
        await transaction.get(
          adminDb.collection('teams').where('ownerUserId', '==', facilityOwnerId)
        )
      );
      addSnapshotDocs(
        ownerTeams,
        await transaction.get(
          adminDb.collection('teams').where('schoolAdminIds', 'array-contains', facilityOwnerId)
        )
      );
      addSnapshotDocs(
        ownerTeams,
        await transaction.get(
          adminDb.collection('teams').where('clubId', '==', facilityOwnerId)
        )
      );

      for (const teamDoc of ownerTeams.values()) {
        addSnapshotDocs(
          eventDocs,
          await transaction.get(teamDoc.ref.collection('events'))
        );
      }

      addSnapshotDocs(
        leagueDocs,
        await transaction.get(
          adminDb.collection('leagues').where('creatorId', '==', facilityOwnerId)
        )
      );

      for (const field of targetFields) {
        if (!field.name) continue;
        const qualifiedName = `${facilityId}:${field.name}`;
        addSnapshotDocs(
          eventDocs,
          await transaction.get(
            adminDb
              .collectionGroup('events')
              .where('selectedFields', 'array-contains', qualifiedName)
          )
        );
        addSnapshotDocs(
          leagueDocs,
          await transaction.get(
            adminDb
              .collection('leagues')
              .where('schedulerConfig.selectedFields', 'array-contains', qualifiedName)
          )
        );
      }

      if (eventDocs.size + leagueDocs.size > MAX_SCANNED_RECORDS) {
        return { status: 409 as const, scanLimit: true };
      }

      const linkedRecords: LinkedRecord[] = [];
      eventDocs.forEach(document => {
        const reasons = getFacilityReferenceReasons(document.data(), context);
        if (reasons.length === 0) return;
        linkedRecords.push({
          path: document.ref.path,
          type: 'event',
          label: cleanName(document.data().title) || `Event ${document.id}`,
          reasons,
        });
      });
      leagueDocs.forEach(document => {
        const reasons = getFacilityReferenceReasons(document.data(), context);
        if (reasons.length === 0) return;
        linkedRecords.push({
          path: document.ref.path,
          type: 'league',
          label: cleanName(document.data().name) || `League ${document.id}`,
          reasons,
        });
      });

      if (linkedRecords.length > 0) {
        return {
          status: 409 as const,
          dependencies: describeDependencies(linkedRecords),
        };
      }

      if (targetField) {
        transaction.delete(targetField.ref);
        return { status: 200 as const, deleted: 'field' as const };
      }

      if (allFields.length + 1 > MAX_DELETE_WRITES) {
        return { status: 409 as const, deleteLimit: true };
      }
      allFields.forEach(field => transaction.delete(field.ref));
      transaction.delete(facilityRef);
      return {
        status: 200 as const,
        deleted: 'facility' as const,
        deletedFields: allFields.length,
      };
    });

    if (result.status === 404) {
      return NextResponse.json(
        { error: result.missingField ? 'Facility resource not found.' : 'Facility not found.' },
        { status: 404 }
      );
    }
    if (result.status === 403) {
      return NextResponse.json(
        { error: 'Only the facility owner can delete this facility or its resources.' },
        { status: 403 }
      );
    }
    if (result.status === 409) {
      if (result.dependencies) {
        return NextResponse.json(
          {
            error:
              'This resource is still in use. Reassign or remove it from the linked schedules before deleting it.',
            dependencies: result.dependencies,
          },
          { status: 409 }
        );
      }
      if (result.invalidField || result.invalidOwner) {
        return NextResponse.json(
          {
            error:
              'This facility has invalid legacy data and cannot be deleted safely. No records were changed.',
          },
          { status: 409 }
        );
      }
      return NextResponse.json(
        {
          error: result.scanLimit
            ? 'This facility has too many linked records to verify safely. No records were changed.'
            : 'This facility contains too many resources to delete safely in one operation. No records were changed.',
        },
        { status: 409 }
      );
    }

    return NextResponse.json({
      ok: true,
      deleted: result.deleted,
      deletedFields: result.deletedFields || 0,
    });
  } catch (error: any) {
    console.error('[facilities/delete] Error:', error?.message || error);
    return NextResponse.json(
      { error: 'Unable to verify and delete this facility resource. No records were changed.' },
      { status: 500 }
    );
  }
}
