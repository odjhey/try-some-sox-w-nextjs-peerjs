import { useEffect, useState } from "react";
import { useRouter } from "next/router";

const usePeerConn = (myId: string, peers: string | string[]) => {
  const [meAsPeer, setMeAsPeer] = useState<any>(null);
  const [conns, setConns] = useState<any[]>([]);

  useEffect(() => {
    console.log("try to init peer conn with my id");
    const lpeers = Array.isArray(peers) ? peers : [peers];

    if (!myId && lpeers.length) {
      return;
    }

    console.log("vali pass");

    import("peerjs").then((peerjs) => {
      const peer = new peerjs.default(myId as string, {
        host: "localhost",
        port: 9000,
        path: "/myapp",
      });

      peer.on("connection", (conn) => {
        conn.on("data", (data) => {
          // Will print 'hi!'
          console.log(data);
        });
        conn.on("error", (err) => {
          console.error(err);
        });
      });

      const conns = lpeers.map((p) => {
        const conn = peer.connect(p);
        conn.on("open", () => {
          console.log("open");
          conn.send("hi!");
        });
        return conn;
      });

      setMeAsPeer(peer);
      setConns(conns);
    });
  }, [myId, peers]);

  function sendToAll(message: string) {
    conns.forEach((conn) => {
      conn.send(message);
    });
  }
  return { sendToAll };
};

const ConnectPage = () => {
  const router = useRouter();
  const { me, target } = router.query;
  const [messages, setMessages] = useState<string[]>(["defa"]);
  const [message, setMessage] = useState("");

  const { sendToAll } = usePeerConn(me as string, target as string);

  function sendMessage(message: string) {
    sendToAll(message);
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
