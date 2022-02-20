import { useEffect, useState } from "react";
import { useRouter } from "next/router";

const ConnectPage = () => {
  const router = useRouter();
  const { me, target } = router.query;
  const [mePeer, setMePeer] = useState<any>(null);
  const [conn, setConn] = useState<any>(null);
  const [messages, setMessages] = useState<string[]>(["defa"]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!(me && target)) {
      return;
    }
    import("peerjs").then((peerjs) => {
      console.log("me", me);
      console.log("target", target);
      const peer = new peerjs.default(me as string, {
        host: "localhost",
        port: 9000,
        path: "/myapp",
      });

      peer.on("connection", (conn) => {
        conn.on("data", (data) => {
          // Will print 'hi!'
          setMessages((messages) => [...messages, data]);
          console.log(data);
        });
        conn.on("error", (err) => {
          setMessages((messages) => [...messages, `ERROR: ${err}`]);
          console.error(err);
        });
      });
      setMePeer(peer);

      const conn = peer.connect(target as string);
      conn.on("open", () => {
        console.log("open");
        conn.send("hi!");
      });
      setConn(conn);
    });
  }, [me, target]);

  function sendMessage(message: string) {
    conn.send(message);
  }

  return (
    <div>
      <p>details: {JSON.stringify(router.query)}</p>
      <input type="text" onChange={(e) => setMessage(e.target.value)}></input>
      <button onClick={() => sendMessage(message)}>send</button>

      {messages.map((message, idx) => (
        <p key={idx}>{message}</p>
      ))}
    </div>
  );
};

export default ConnectPage;
