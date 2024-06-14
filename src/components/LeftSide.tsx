import { useEffect, useState, memo, useRef } from "react";
import NotificationSound from "./notification-sound.mp3";
import { db } from "../core/firebaseConfig";
import {
  collection,
  DocumentData,
  onSnapshot,
  orderBy,
  query,
  QueryDocumentSnapshot,
  QuerySnapshot,
  where,
} from "firebase/firestore";
import { chatRoom } from "../core/types";
import "reactjs-popup/dist/index.css";
type Props = {
  picture?: string;
  userId?: string;
  displayName: string;
  selectedChatRoom: string;
  setSelectedChatRoom: (a: string) => void;
  // setOpen: (b: boolean) => void;
};

export default memo(function LeftSide({
  picture,
  userId,
  selectedChatRoom,
  setSelectedChatRoom,
  // setOpen,
  displayName,
}: Props) {
  const [chatRooms, setChatRooms] = useState<chatRoom[]>();
  const audioPlayer = useRef(null);

  function playAudio() {
    // @ts-ignore
    audioPlayer.current.play().catch((error) => {
      console.error("Falha ao tocar o som:", error);
    });
  }
  
  useEffect(() => {
    if (userId) {
      const q = query(
        collection(db, "chats"),
        where("userIds", "array-contains", userId),
        orderBy("updatedAt")
      );
      const unsubscribe = onSnapshot(
        q,
        (querySnapshot: QuerySnapshot<DocumentData>) => {
          const chatRooms: chatRoom[] = [];
          querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
            let chatRoom = doc.data();
            const unreadCount: number[] = [0];
            const q = query(
              collection(db, "messages"),
              where("chatId", "==", chatRoom.id),
              orderBy("createdAt")
            );
            onSnapshot(
              q,
              (querySnapshot: QuerySnapshot<DocumentData>) => {
                querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
                  let message = doc.data();
                  if (message.sender !== userId && !message.isRead){
                    unreadCount[0] = unreadCount[0] + 1;
                  }
                  console.log('unreadCount[0]');
                  console.log(unreadCount[0]);
                  let newChatRooms = chatRooms.map(item => item.id === chatRoom.id ? {...item, unreadCount: unreadCount[0]} : item);
                  if(unreadCount[0] > 0){
                    playAudio()
                  }
                  setChatRooms(newChatRooms);
                });
                // setMessages(messages);
              }
            );

            chatRooms.push({...chatRoom, unreadCount: unreadCount[0]} as chatRoom);
          });
          setChatRooms(chatRooms.reverse());
        }
      );
      return unsubscribe;
    }
  }, [userId]);

  useEffect(() => {
    let unreadCount = 0;
    if(chatRooms)
    chatRooms.forEach(room => unreadCount += room.unreadCount);
    console.log("unreadCount");
    console.log(unreadCount);
    const badge = document.getElementById("chat_notification_counter");
    if (badge){
      badge.innerHTML = unreadCount+"";
      // if(quantUnr == 0){}
      //   // badge.className = "display-none badge"
      // else{
      //   // badge.className = "badge"
      //   // playAudio();
      // }
    }
  }, [chatRooms])

  return (<>
    <audio ref={audioPlayer} src={NotificationSound} />
    <>some thing is happen</>
  </>
  );
});
