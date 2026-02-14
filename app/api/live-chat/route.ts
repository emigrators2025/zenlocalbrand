import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

interface ChatSession {
  id: string;
  userId: string;
  userName: string;
  userEmail?: string;
  status: 'waiting' | 'connected' | 'closed';
  adminId?: string;
  adminName?: string;
  createdAt: Date;
  lastActivity: Date;
}

// GET - Get chat session or all active sessions (for admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const admin = searchParams.get('admin');

    // Admin: Get all active chat sessions
    if (admin === 'true') {
      try {
        // First try to get all sessions and filter in memory (avoids index issues)
        const sessionsSnapshot = await adminDb
          .collection('live_chats')
          .orderBy('createdAt', 'desc')
          .limit(50)
          .get();

        const sessions: ChatSession[] = sessionsSnapshot.docs
          .map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              userId: data.userId || '',
              userName: data.userName || 'Guest',
              userEmail: data.userEmail,
              status: data.status || 'waiting',
              adminId: data.adminId,
              adminName: data.adminName,
              createdAt: data.createdAt?.toDate?.() || new Date(),
              lastActivity: data.lastActivity?.toDate?.() || new Date(),
            } as ChatSession;
          })
          .filter(session => session.status === 'waiting' || session.status === 'connected');

        return NextResponse.json({ sessions });
      } catch (indexError) {
        console.error('Index error, trying simple query:', indexError);
        // Fallback: get all and filter
        const allSnapshot = await adminDb.collection('live_chats').get();
        const sessions: ChatSession[] = allSnapshot.docs
          .map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              userId: data.userId || '',
              userName: data.userName || 'Guest',
              userEmail: data.userEmail,
              status: data.status || 'waiting',
              adminId: data.adminId,
              adminName: data.adminName,
              createdAt: data.createdAt?.toDate?.() || new Date(),
              lastActivity: data.lastActivity?.toDate?.() || new Date(),
            } as ChatSession;
          })
          .filter(session => session.status === 'waiting' || session.status === 'connected')
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return NextResponse.json({ sessions });
      }
    }

    // Get specific chat session
    if (sessionId) {
      const sessionDoc = await adminDb.collection('live_chats').doc(sessionId).get();
      
      if (!sessionDoc.exists) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }

      const sessionData = sessionDoc.data();
      
      // Get messages
      const messagesSnapshot = await adminDb
        .collection('live_chats')
        .doc(sessionId)
        .collection('messages')
        .orderBy('timestamp', 'asc')
        .get();

      const newMessages = messagesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate?.() || new Date(),
      }));

      return NextResponse.json({
        session: {
          id: sessionDoc.id,
          status: sessionData?.status,
          adminName: sessionData?.adminName,
        },
        newMessages,
      });
    }

    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  } catch (error) {
    console.error('Live chat GET error:', error);
    return NextResponse.json({ error: 'Failed to get chat data' }, { status: 500 });
  }
}

// POST - Start session, send message, or admin actions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;
    
    console.log('Live chat POST action:', action, body);

    switch (action) {
      case 'start': {
        // Start a new chat session
        const { userId, userName, userEmail } = body;
        
        const sessionData = {
          userId: userId || 'guest',
          userName: userName || 'Guest',
          userEmail: userEmail || null,
          status: 'waiting', // waiting, connected, closed
          adminId: null,
          adminName: null,
          createdAt: FieldValue.serverTimestamp(),
          lastActivity: FieldValue.serverTimestamp(),
        };
        
        console.log('Creating session with:', sessionData);
        
        const sessionRef = await adminDb.collection('live_chats').add(sessionData);
        
        console.log('Session created with ID:', sessionRef.id);

        return NextResponse.json({ 
          success: true, 
          sessionId: sessionRef.id 
        });
      }

      case 'message': {
        // Send a message in a chat session
        const { sessionId, content, type } = body;
        
        if (!sessionId || !content) {
          return NextResponse.json({ error: 'Missing sessionId or content' }, { status: 400 });
        }

        const messageRef = await adminDb
          .collection('live_chats')
          .doc(sessionId)
          .collection('messages')
          .add({
            content,
            type, // 'user' or 'admin'
            timestamp: FieldValue.serverTimestamp(),
          });

        // Update last activity
        await adminDb.collection('live_chats').doc(sessionId).update({
          lastActivity: FieldValue.serverTimestamp(),
        });

        return NextResponse.json({ 
          success: true, 
          messageId: messageRef.id 
        });
      }

      case 'join': {
        // Admin joins a chat session
        const { sessionId, adminId, adminName } = body;
        
        if (!sessionId) {
          return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
        }

        await adminDb.collection('live_chats').doc(sessionId).update({
          status: 'connected',
          adminId,
          adminName: adminName || 'Support Agent',
          lastActivity: FieldValue.serverTimestamp(),
        });

        return NextResponse.json({ success: true });
      }

      case 'close': {
        // Close a chat session
        const { sessionId } = body;
        
        if (!sessionId) {
          return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
        }

        // Add a system message that the chat was ended
        await adminDb
          .collection('live_chats')
          .doc(sessionId)
          .collection('messages')
          .add({
            content: 'Chat ended by support team. Thank you for contacting us!',
            type: 'system',
            timestamp: FieldValue.serverTimestamp(),
          });

        await adminDb.collection('live_chats').doc(sessionId).update({
          status: 'closed',
          closedAt: FieldValue.serverTimestamp(),
        });

        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Live chat POST error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
