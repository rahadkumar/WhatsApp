let log = console.log;


// creating firebase

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js";
const apiKey = "AIzaSyC2tyr2TwnOTsT6HzhX-4FeJjYugqHJbRk";

const firebaseConfig = {
    apiKey,
    authDomain: "shop-com2.firebaseapp.com",
    databaseURL: "https://shop-com2-default-rtdb.firebaseio.com",
    projectId: "shop-com2",
    storageBucket: "shop-com2.appspot.com",
    messagingSenderId: "124251492278",
    appId: "1:124251492278:web:b52d58b8d7abed78a07b17"
};

const app = initializeApp(firebaseConfig);

import {
    getAuth,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.7.2/firebase-auth.js";
import {
    getDatabase,
    get,
    ref
} from "https://www.gstatic.com/firebasejs/10.7.2/firebase-database.js";
import {
    getFirestore,
    collection,
    doc,
    setDoc,
    getDocs,
    getDoc,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/10.7.2/firebase-firestore.js"


const auth = getAuth(app);
const db = getDatabase(app);
const store = getFirestore(app);

const myName = document.querySelector(".profile .myName h3");
const myProfile = document.querySelector(".profile img");
let myUID = null;

onAuthStateChanged(auth, user => {
    if (user) {
        myUID = user.uid;
        get(ref(db, user.uid)).then(snapshot => {
            myName.innerHTML = snapshot.val().name;
            myProfile.src = snapshot.val().profile;
        })
        fetchFriend();
    }
    else {
        sessionStorage.setItem(btoa("userExists"), btoa(false));
    }
})



// addFriend

const addFriendIcon = document.querySelector(".add.fa-solid.fa-plus");
const addFriendCard = document.querySelector(".addFriend");
const addFriendEmail = addFriendCard.querySelector("input");
const addFriendBtn = addFriendCard.querySelector("button");
const addFriendClose = document.querySelector(".addFriend .fa-x");


addFriendIcon.addEventListener("click", function() {
    addFriendCard.style.transform = addFriendCard.style.transform == "translate(-50%, -50%) scale(1)" ? "translate(-50%, -50%) scale(0)" : "translate(-50%, -50%) scale(1)";

    addFriendClose.addEventListener("click", function() {
        addFriendCard.style.transform = "translate(-50%, -50%) scale(0)";
    })
})

let originPath = null;

addFriendBtn.addEventListener("click", function() {
    const emailValue = addFriendEmail.value.trim();

    if (!emailValue) {
        addFriendEmail.style.borderColor = "red";
        addFriendEmail.focus();
        return;
    };

    get(ref(db)).then(snapshot => {
        for (let i in snapshot.val()) {
            if (emailValue == snapshot.val()[i].email) {
                originPath = [myUID, i].sort().join("-");
                const storeRef = doc(collection(store, originPath), "AConnected1");
                setDoc(storeRef, {
                    value: 'You Both Are Connected.'
                }).then(() => {
                    log("user added successfull")
                })
                setDoc(doc(store, "allConnection", originPath), {
                    value: "reverse mail"
                })
            }
        }
    })
})

let path1 = null;
let path2 = null;

function fetchFriend() {
    getDocs(collection(store, "allConnection")).then(snapshot => {
        snapshot.docs.forEach(doc => {
            get(ref(db)).then(snapshot => {
                for (let i in snapshot.val()) {
                    if (doc.id.includes(myUID) && doc.id.includes(i) && i != myUID) {
                        originPath = [myUID, i].sort().join("-");
                        addItemInUserInterface(snapshot.val()[i]);
                        
                    }
                }
            })
        })
    })
}

// all Friends list

const allFriends = document.querySelector(".friendsList");

function addItemInUserInterface(id) {
    const li = document.createElement("li");
    const img = document.createElement("img");
    const friendName = document.createElement("div");
    const h3 = document.createElement("h3");
    const p = document.createElement("p");

    h3.textContent = id.name.toLocaleLowerCase();
    p.textContent = "Leave my bag in the car ok?";
    img.src = id.profile;

    friendName.append(h3.cloneNode(true));
    friendName.append(p.cloneNode(true));
    li.append(img.cloneNode(true));
    li.append(friendName.cloneNode(true));

    
    li.addEventListener('click', letsChat);
    allFriends.appendChild(li);
}

const allMessages = document.querySelector(".allMessages .message");
const sendMessage = document.querySelector(".sendMessage");
const load = document.querySelector(".allMessages .load");
import { loading } from "./login.js";
import { swap } from "./dsa.js";
let oldMessageCount = 0;

function letsChat() {
    
    if (this.className.includes("active")) return;
    loading(load, false, `<i class="spin"></i>`);

   /* getDocs(collection(store, originPath)).then(credential => {
       
        credential.docs.forEach((doc, index) => {
            if (oldMessageCount != credential.docs.length -1) {
                putInUserInterface(doc.id, doc.data(), this);
            }
        })
    }).then(() => {
        loading(load, false, "");
        load.style.transform = `scale(0)`;
    }) */
    onSnapshot(collection(store, originPath), (credential) => {
        let sortRequired = [];
        allMessages.innerHTML = "";

        credential.docs.forEach(doc => {
            sortRequired.push(doc);
        })
        swap(sortRequired)
        sortRequired.forEach(sort => {
            putInUserInterface(sort.id, sort.data(), this)
        })

        allFriends.querySelectorAll("li").forEach(list => {
            list.classList.remove("active");
        })
        this.classList.add("active");

        loading(load, false, "");
        load.style.transform = `scale(0)`;
    })
}


function putInUserInterface(id, data, element) {
    oldMessageCount = id.replaceAll(/\D/g, "");

    let p = document.createElement("p");
    p.textContent = data.value;
    if (id.includes("Connected")) {
        p.classList.add("connected");
    }
    else if (id.toLocaleLowerCase().includes(element.querySelector("h3").innerHTML)) {
        p.classList.add("another");
    }
    else {
        p.classList.add("myself");
    }

 
    allMessages.appendChild(p.cloneNode(true));
    sendMessage.style.opacity = 1;
    sendMessage.style.pointerEvents = "all";
}


const sendMessageInput = document.querySelector(".sendMessage textarea");
const sendMessageBtn = document.querySelector(".sendMessage .fa-solid");

sendMessageBtn.addEventListener("click", function() {
    const message = sendMessageInput.value.trim();
    const currentUserName = myName.innerText.trim();
    if (!message) {
        sendMessageInput.style.borderColor = "red";
        sendMessageInput.focus();
        return;
    };

    sendMessageInput.style.borderColor = "transparent";
    const storeRef = doc(store, originPath, `A${currentUserName}${++oldMessageCount}`)
    setDoc(storeRef, {
        value: message
    }).then(() => {
        sendMessageInput.value = "";
    })
})


if (atob(sessionStorage.getItem(btoa("userExists"))).includes(false)) {
    location.assign(`../../login.html`);
}


const profileContainer = document.querySelector(".allFriends");
const profileSettings = document.querySelector(".settings");
const signOutClose = document.querySelector(".settings .fa-x");
const signOutButton = document.querySelector(".settings .signOut");

const resize = e => {
    profileSettings.style.left = "-" + getComputedStyle(profileContainer).width;
    profileSettings.style.width = getComputedStyle(profileContainer).width;
    profileSettings.style.height = getComputedStyle(profileContainer).height;
};

resize();

addEventListener("resize", resize)

signOutButton.addEventListener("click", function() {
    loading(this, true, `<i class="spin"></i>`);
    
    signOut(auth).then(() => {
        loading(this, true, `Succenss`);
        sessionStorage.setItem(btoa("userExists"), btoa(false));
        history.go(0);
    })
})

signOutClose.addEventListener("click", function() {
    profileSettings.style.left = "-" + getComputedStyle(profileContainer).width;
})

myProfile.addEventListener("click", function() {
    profileSettings.style.left = 0;
})