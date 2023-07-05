import { useState, useEffect, memo } from 'react';
import db, { auth } from './firebase';
import Cookies from 'js-cookie';
function App() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    const email = "rdsambo@gmail.zk";
    // const email = Cookies.get("userEmail");
    // const username = Cookies.get("userName");
    const pass = email;
    const username = email;
    if(user == null) {
      auth.createUserWithEmailAndPassword(email, pass).then(
      (firebase)=>
      {
        firebase.user.updateProfile({
            displayName: username
        }).then(function() {
            signIn(email, pass);
        });
      },
      (reason) => {
          signIn(email, pass);
      });
    }
  });
  const signIn = function (email, pass){
    auth.signInWithEmailAndPassword(email, pass).then(firebase =>{
      setUser(firebase.user);
      Cookies.set('User', JSON.stringify(firebase.user), { expires: 7, path: '' });
    });
  }
  useEffect(() => {
    if (user) {
      db.collection("users").doc(user.uid).collection("chats")
      .onSnapshot({ includeMetadataChanges: true }, snap => {
        if (snap.docs?.length > 0) {
          if (!snap.metadata.fromCache) {
            let quantUnr = 0
            snap.docs.forEach(cur => {
              quantUnr += cur.data()?.unreadMessages !=null? cur.data()?.unreadMessages : 0; 
            });
            const badge = document.getElementById("chat_notification_counter");
            console.log("quantUnr")
            console.log(quantUnr)
            if (badge){
              badge.innerHTML = quantUnr+"";
              if(quantUnr == 0)
                badge.className = "display-none badge"
              else
                badge.className = "badge"
            }
          };
        };
      });
    };
  }, [user]);

  return (
    <div></div>
  );
}
export default memo(App);
