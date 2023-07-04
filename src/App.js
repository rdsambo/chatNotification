import { useState, useEffect, memo } from 'react';
import db, { auth } from './firebase';
import Cookies from 'js-cookie';

function App() {
  const [user, setUser] = useState(null);
  const [chats, setChats] = useState(null);
  const [unreadMessages, setUnreadMessages] = useState(0);

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
        console.log("value.user.email");
        console.log();
        firebase.user.updateProfile({
            displayName: username
        }).then(function() {
            console.log("username atualizado com sucesso!");
            signIn(email, pass);
        }, function(error) {
            console.log("Erro ao atulizar username!\nErro:"+error);
        });
        console.log("usuario criado com sucesso!");
      },
      (reason) => {
          console.log("Erro ao criar usuario usuario! /nErro:"+reason);
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
      db.collection("users").doc(user.uid).collection("chats").orderBy("timestamp", "desc")
      .onSnapshot({ includeMetadataChanges: true }, snap => {
        if (snap.docs?.length > 0) {
          if (!snap.metadata.fromCache) {
            const chts = snap.docs.map(cur => ({
              ...cur.data(),
              id: cur.id
            }));
            let quantUnr = 0
            chts.forEach(cur =>
              {
                quantUnr += cur?.unreadMessages !=null? cur?.unreadMessages : 0; 
              });
            setUnreadMessages(quantUnr);
            setChats(chts);
          };
        } else {
          setChats([]);
        };
      });
    };
  }, [user]);

  return (
    <div id='notfication_counter'>chats:{chats!=null?unreadMessages:0}</div>
  );
}

export default memo(App);
