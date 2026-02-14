import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

const CONTACTS_COLLECTION = 'contacts';

// GET - Get all contacts
export async function GET() {
  try {
    const snapshot = await adminDb
      .collection(CONTACTS_COLLECTION)
      .orderBy('createdAt', 'desc')
      .get();

    const contacts = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
      };
    });

    return NextResponse.json({ contacts });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contacts' },
      { status: 500 }
    );
  }
}

// POST - Create new contact message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message, phone } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Name, email, subject, and message are required' },
        { status: 400 }
      );
    }

    const contactData = {
      name,
      email,
      subject,
      message,
      phone: phone || null,
      status: 'unread',
      createdAt: FieldValue.serverTimestamp(),
    };

    const docRef = await adminDb.collection(CONTACTS_COLLECTION).add(contactData);
    await adminDb.collection(CONTACTS_COLLECTION).doc(docRef.id).update({ id: docRef.id });

    return NextResponse.json({ success: true, id: docRef.id });
  } catch (error) {
    console.error('Error creating contact:', error);
    return NextResponse.json(
      { error: 'Failed to create contact' },
      { status: 500 }
    );
  }
}

// PUT - Update contact status
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Contact id is required' },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (status) {
      updateData.status = status;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No update data provided' },
        { status: 400 }
      );
    }

    await adminDb.collection(CONTACTS_COLLECTION).doc(id).update(updateData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating contact:', error);
    return NextResponse.json(
      { error: 'Failed to update contact' },
      { status: 500 }
    );
  }
}

// DELETE - Delete contact
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Contact id is required' },
        { status: 400 }
      );
    }

    await adminDb.collection(CONTACTS_COLLECTION).doc(id).delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting contact:', error);
    return NextResponse.json(
      { error: 'Failed to delete contact' },
      { status: 500 }
    );
  }
}
