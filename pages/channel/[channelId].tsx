import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useLocalStorage } from "../../lib/useLocalStorage";

const ChannelPage = () => {
  const router = useRouter();
  const { channelId } = router.query;
  const [mePeer, setMePeer] = useState<any>(null);
  const [messages, setMessages] = useState<string[]>(["defa"]);

  const [peers, setPeers] = useLocalStorage<string[]>("channel-peers", []);

  useEffect(() => {
    if (!channelId) {
      return;
    }
    import("peerjs").then((peerjs) => {
      const peer = new peerjs.default(channelId as string, {
        host: "localhost",
        port: 9000,
        path: "/myapp",
      });

      peer.on("connection", (conn) => {
        // TODO: channel close
        conn.on("open", (...args) => {
          const peerKeys = Object.keys(peer.connections);
          console.log("channel open", args, peerKeys);
          setPeers(Array.from(new Set([...peers, ...peerKeys])));
        });
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
    });
  }, [channelId]);

  const requestReconToPeers = () => {
    console.log("reconn");
    peers.forEach((peerId) => {
      console.log("reconn", peerId);
      const conn = mePeer.connect(peerId);
      conn.on("open", () => {
        conn.send("reconn");
      });
    });
  };

  console.log("pp", mePeer);
  return (
    <div>
      <p>details: {JSON.stringify(router.query)}</p>
      <button onClick={() => requestReconToPeers()}>reconn</button>

      {messages.map((message, idx) => (
        <p key={idx}>{message}</p>
      ))}

      {mePeer && mePeer.connections && (
        <p>{JSON.stringify(Object.keys(mePeer.connections))}</p>
      )}
    </div>
  );
};

export default ChannelPage;
