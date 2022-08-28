import { initializeApp } from "https://www.gstatic.com/firebasejs/9.9.3/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signOut,
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.9.3/firebase-auth.js";

import {
  getFirestore,
  collection,
  query,
  addDoc,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/9.9.3/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAxta0d9ZgyOC0CTHink3__o23SzL-iUZc",
  authDomain: "nn-game-guide-9ac12.firebaseapp.com",
  projectId: "nn-game-guide-9ac12",
  storageBucket: "nn-game-guide-9ac12.appspot.com",
  messagingSenderId: "50791067282",
  appId: "1:50791067282:web:a451c937dd55273ed7804b",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

//make auth and firestore references
const auth = getAuth(app);
const db = getFirestore(app);

//listen for changes to the auth state
onAuthStateChanged(auth, (user) => {
  if (user) {
    //account info
    const docRef = doc(db, "users", user.uid);
    const docSnap = getDoc(docRef).then((dataSnap) => {
      onSnapshot(
        query(collection(db, "guides")),
        (snapshot) => {
          setupGuides(snapshot.docs);
          setupUI(user, dataSnap.data().bio);
        },
        //error catch.. not then .error but with , important
        (error) => {
          console.log(error);
        }
      );
    });
  } else {
    setupGuides([]);
    setupUI();
  }
});

//creat new guide
const createForm = document.querySelector("#create-form");
createForm.addEventListener("submit", (e) => {
  e.preventDefault();
  addDoc(collection(db, "guides"), {
    title: createForm["title"].value,
    content: createForm["content"].value,
  })
    .then(() => {
      //close modal and reset form
      const modal = document.querySelector("#modal-create");
      M.Modal.getInstance(modal).close();
      loginForm.reset();
    })
    .catch((err) => console.log(err));
  //
});

//signup
const signupForm = document.querySelector("#signup-form");
signupForm.addEventListener("submit", (e) => {
  e.preventDefault();
  //get user info
  const email = signupForm[`signup-email`].value;
  const password = signupForm[`signup-password`].value;
  //signup the user
  createUserWithEmailAndPassword(auth, email, password)
    .then((cred) => {
      return setDoc(doc(db, "users", cred.user.uid), {
        bio: signupForm[`signup-bio`].value,
      });
    })
    .then(() => {
      const modal = document.querySelector("#modal-signup");
      M.Modal.getInstance(modal).close();
      signupForm.reset();
      signupForm.querySelector(".error").innerHTML = "";
    })
    .catch((error) => {
      signupForm.querySelector(".error").innerHTML = error.message;
    });
});

//logout
const logout = document.querySelector("#logout");
logout.addEventListener("click", (e) => {
  e.preventDefault();
  signOut(auth);
});

//login
const loginForm = document.querySelector("#login-form");
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();

  //get user information
  const email = loginForm["login-email"].value;
  const password = loginForm["login-password"].value;
  //sign in
  signInWithEmailAndPassword(auth, email, password)
    .then((cred) => {
      //console.log(cred.user);
      const modal = document.querySelector("#modal-login");
      M.Modal.getInstance(modal).close();
      loginForm.reset();
      loginForm.querySelector(".error").innerHTML = "";
    })
    .catch((error) => {
      loginForm.querySelector(".error").innerHTML = error.message;
    });
});
