let log = console.log;

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

// handle auth 

import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    sendEmailVerification
} from "https://www.gstatic.com/firebasejs/10.7.2/firebase-auth.js";
import {
    getDatabase,
    get,
    set,
    ref
} from "https://www.gstatic.com/firebasejs/10.7.2/firebase-database.js";
import {
    getStorage,
    ref as sref,
    uploadBytesResumable,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.7.2/firebase-storage.js";

const auth = getAuth(app);
const storage = getStorage(app);
const db = getDatabase(app);

onAuthStateChanged(auth, user => {
    if (user) {
        if (!user.emailVerified) {
            const warnMessage = document.querySelector(".inp + h3");
            sendEmailVerification(auth.currentUser).then(() => {
                if(warnMessage) {
                    warnMessage.innerHTML = "Varification Code Has Been Sent..";
                }
            }).catch(err => {
                if (err.message.includes("too-many-requests")) {
                    if(warnMessage) {
                        warnMessage.innerHTML = "too many requests has been sent. Please Try again leter..";
                    }
                }
            })
            if(warnMessage) {
                Object.assign(warnMessage?.style, {
                opacity: 1,
            })
            }
        }
        sessionStorage.setItem(btoa("userExists"), btoa(true));
    }
    else {
        sessionStorage.setItem(btoa("userExists"), btoa(false));
    }
})

// show hide password

const seePass = document.querySelectorAll(".seePass");

const passwordField = ["password", "crtpassword", "confmpass"];

seePass.forEach((eye, index) => {
    eye.addEventListener("click", function () {
        const pass = document.getElementById(passwordField[this.dataset.id]);

        if (pass.type.includes("password")) {
            pass.type = "text";
            this.classList.replace("fa-eye-slash", "fa-eye");
        }
        else {
            pass.type = "password";
            this.classList.replace("fa-eye", "fa-eye-slash");
        }
    })
})

// upload profile picture

const profile = document.querySelector(".profile");
const profileInp = profile?.querySelector("input");
const profileImg = profile?.querySelector("img");
let file = null;

profile?.addEventListener("click", function () {
    profileInp?.click();
})

profileInp?.addEventListener("change", e => {
    file = e.target.files[0];
    if (!file) return;
    profileImg.src = URL.createObjectURL(file);
    Object.assign(profileImg.style, {
        width: "100%",
        height: "100%",
        margin: "0"
    })
})



// Validation check
const form = document.querySelector('form');
const warnMessage = form?.querySelector(".inp + h3");
const username = form?.querySelector("#name");
const useremail = form?.querySelector("#email");
const userpassword = form?.querySelector("#crtpassword");
const userconfmpass = form?.querySelector("#confmpass");
const logPassword = form?.querySelector("#password");
const submitBtn = form?.querySelector("button");


form?.addEventListener("submit", validationCheck)

function validationCheck(e) {
    e.preventDefault();

    loading(submitBtn, true, `<i class="spin"></i>`);

    let profile = this.querySelector(".profile");

    if (this.className.includes("signup")) {
        const usernameValue = username.value.trim();
        const useremailValue = useremail.value.trim();
        const userpasswordValue = userpassword.value.trim();
        const userconfmpassValue = userconfmpass.value.trim();
        if (!file || !usernameValue || !useremailValue || !userpasswordValue || !userconfmpassValue) {
            if (!file) {
                showWarning(profile, "All Field's are Required!");
            }
            if (!usernameValue) {
                showWarning(username, "All Field's are Required!");
            }
            if (!useremailValue) {
                showWarning(useremail, "All Field's are Required!");
            }
            if (!userpasswordValue) {
                showWarning(userpassword, "All Field's are Required!");
            }
            if (!userconfmpassValue) {
                showWarning(userconfmpass, "All Field's are Required!");
            }
            loading(submitBtn, false, "SIGN UP");
        }
        else {
            createUserWithEmailAndPassword(auth, useremailValue, userpasswordValue).then(credential => {
                const storageRef = sref(storage, file.name);
                const uploadTask = uploadBytesResumable(storageRef, file);

                uploadTask.on("state-changed", () => { }, err => {
                    log(err)
                }, () => {
                    getDownloadURL(uploadTask.snapshot.ref).then(DownloadURL => {
                        set(ref(db, credential.user.uid), {
                            name: usernameValue,
                            email: useremailValue,
                            profile: DownloadURL
                        }).then(() => {
                            if(location.pathname != "/components/htmls/interface.html") {
                                location.assign(`/components/htmls/interface.html`);
                            }
                            loading(submitBtn, false, "SIGN UP");
                        }).catch(err => {
                            log(err)
                        })
                    })
                })
            }).catch(err => {
                log(err)
            })
        }


    }
    else if (this.className.includes("login")) {
        const useremailValue = useremail.value.trim();
        const logPasswordValue = logPassword.value.trim();
        if (!useremailValue || !logPasswordValue) {
            if(!useremailValue) {
                showWarning(useremail, "All Field's are Required!");
            }
            if(!logPasswordValue) {
                showWarning(logPassword, "All Field's are Required!");
            }
            loading(submitBtn, false, "LOGIN");
        }
        else {
            signInWithEmailAndPassword(auth, useremailValue, logPasswordValue).then(() => {
                if(location.pathname != "/components/htmls/interface.html") {
                    location.assign(`/components/htmls/interface.html`);
                }
                loading(submitBtn, false, "LOGIN");
            }).catch(err => {
                if (err.message.includes("invalid-credential")) {
                    warnMessage.innerHTML = "Email of Password was incorrect!"
                    Object.assign(warnMessage.style, {
                        opacity: 1,
                        color: "red"
                    })
                }
                loading(submitBtn, false, "LOGIN");
            })
        }
    }
}

function showWarning(element, message) {
    element.style.borderColor = "red";
    warnMessage.innerHTML = message;
    Object.assign(warnMessage.style, {
        opacity: 1,
        pointerEvents: "all",
        color: "red"
    })
}




// match user password and confirm user password

userconfmpass?.addEventListener("input", function () {
    const userpasswordValue = userpassword.value.trim();

    if (userpasswordValue != this.value.trim()) {
        Object.assign(warnMessage.style, {
            opacity: 1,
            pointerEvents: "all"
        })
        warnMessage.innerHTML = "Don't match";
    }
    else {
        Object.assign(warnMessage.style, {
            opacity: 1,
            pointerEvents: "all",
            color: "green"
        })
        warnMessage.innerHTML = "match";
    }
})

// loading animation

export function loading(element, disabled, content) {
    disabled ? element.setAttribute("disabled", true) : element.removeAttribute("disabled");
    element.innerHTML = content;
}








// shotcut

const shotcut = document.querySelectorAll(".shotcut li input");

shotcut.forEach(shotcut => {
    shotcut.addEventListener("click", function() {
        let shotcutEmail = this.previousElementSibling.previousElementSibling.innerHTML.trim();
        let shotcutPassword = this.previousElementSibling.innerHTML.trim();

        useremail.value = shotcutEmail;
        logPassword.value = shotcutPassword;
    })
})