import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  "projectId": "studio-6850142148-fe343",
  "appId": "1:61782012212:web:8913d2b40fd9843148f561",
  "apiKey": "AIzaSyA8G2_7gu0WK8efQ9sl7UJG6tsrC7iOCdU",
  "authDomain": "studio-6850142148-fe343.firebaseapp.com",
  "storageBucket": "studio-6850142148-fe343.firebasestorage.app",
  "messagingSenderId": "61782012212"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function run() {
  const email = 'example@gmail.com';
  const password = 'password123';

  let user;
  try {
    console.log("Creating Auth user...");
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    user = cred.user;
    console.log("Created new user:", user.uid);
  } catch (e: any) {
    if (e.code === 'auth/email-already-in-use') {
      console.log("User already exists in Auth. Logging in...");
      const cred = await signInWithEmailAndPassword(auth, email, password);
      user = cred.user;
      console.log("Logged in user:", user.uid);
    } else {
      console.error("Failed to create/login user:", e);
      return;
    }
  }

  try {
    console.log("Writing user document...");
    await setDoc(doc(db, 'users', user.uid), {
      id: user.uid,
      fullName: "QA Tester",
      email: email,
      role: "coach",
      activePlanId: "elite_league",
      plan_type: "elite",
      subscription_status: "active",
      proTeamLimit: 20,
      createdAt: new Date().toISOString()
    });

    console.log("Writing team document...");
    const teamId = `team_${user.uid}`;
    await setDoc(doc(db, 'teams', teamId), {
      id: teamId,
      name: "Example Elite Team",
      ownerUserId: user.uid,
      planId: "elite_league",
      isPro: true,
      sport: "Soccer",
      createdAt: new Date().toISOString()
    });

    console.log("Writing team membership...");
    await setDoc(doc(db, 'teams', teamId, 'members', user.uid), {
      id: user.uid,
      name: "QA Tester",
      email: email,
      role: "Admin",
      status: "accepted",
      ownerUserId: user.uid
    });

    console.log("Writing user team memberships index...");
    await setDoc(doc(db, 'users', user.uid, 'teamMemberships', teamId), {
      teamId: teamId,
      role: "Admin",
      status: "accepted"
    });

    console.log("Successfully seeded test user!");
  } catch (e) {
    console.error("Failed to write Firestore documents:", e);
  }
}

run();
