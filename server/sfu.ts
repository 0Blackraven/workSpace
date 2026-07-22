import mediasoup from "mediasoup";
import { io } from "./index.js";
import type { DefaultEventsMap, Namespace } from "socket.io";



let router: mediasoup.types.Router<mediasoup.types.AppData>;
let producerTransport:
  | mediasoup.types.WebRtcTransport<mediasoup.types.AppData>
  | undefined;
let consumerTransport:
  | mediasoup.types.WebRtcTransport<mediasoup.types.AppData>
  | undefined;
let producer: mediasoup.types.Producer<mediasoup.types.AppData> | undefined;
let consumer: mediasoup.types.Consumer<mediasoup.types.AppData> | undefined;

export async function createWorker() {
  const newWorker = await mediasoup.createWorker();

  newWorker.on("died", (err) => {
    console.log("worker has died : " + newWorker.pid);
    console.log(err);

    setTimeout(() => {
      process.exit();
    }, 2000);
  });

  return newWorker;
}

const worker: mediasoup.types.Worker<mediasoup.types.AppData> =
  await createWorker();

export const mediaCodecs: mediasoup.types.RouterRtpCodecCapability[] = [
  {
    kind: "audio",
    mimeType: "audio/opus",
    clockRate: 48000,
    channels: 2,
    rtcpFeedback: [{ type: "nack" }, { type: "nack", parameter: "pli" }],
  },
  {
    kind: "video",
    mimeType: "video/VP8",
    clockRate: 90000,
    parameters: {
      "x-google-start-bitrate": 1000,
    },
    rtcpFeedback: [
      { type: "nack" },
      { type: "ccm", parameter: "fir" },
      { type: "goog-remb" },
    ],
  },
];

export function handleMedia(peer: Namespace<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) {
  peer.on("connection", async (mediaSocket) => {
    console.log(`Peer connected: ${mediaSocket.id}`);
    mediaSocket.emit("Connection Success", { mediaSocket: mediaSocket.id });

    mediaSocket.on("disconnect", () => {
      console.log("Peer disconnected");
    });

    router = await worker.createRouter({
      mediaCodecs: mediaCodecs,
    });

    mediaSocket.on("getRtpCapabilities", (callback) => {
      const routerRtpCapabilities = router.rtpCapabilities;
      callback({ routerRtpCapabilities });
    });

    mediaSocket.on("createTransport", async ({ sender }, callback) => {
      if (sender) {
        producerTransport = await createWebRtcTransport(callback);
      } else {
        consumerTransport = await createWebRtcTransport(callback);
      }
    });

    mediaSocket.on("connectProducerTransport", async ({ dtlsParameters }) => {
      await producerTransport?.connect({ dtlsParameters });
    });

    mediaSocket.on(
      "transport-produce",
      async ({ kind, rtpParameters }, callback) => {
        producer = await producerTransport?.produce({
          kind,
          rtpParameters,
        });

        producer?.on("transportclose", () => {
          console.log("Producer transport closed");
          producer?.close();
        });

        callback({ id: producer?.id });
      },
    );

    mediaSocket.on("connectConsumerTransport", async ({ dtlsParameters }) => {
      await consumerTransport?.connect({ dtlsParameters });
    });

    mediaSocket.on("consumeMedia", async ({ rtpCapabilities }, callback) => {
      try {
        if (producer) {

          if (
            !router.canConsume({ producerId: producer?.id, rtpCapabilities })
          ) {
            console.error("Cannot consume");
            return;
          }
          console.log("-------> consume");

          consumer = await consumerTransport?.consume({
            producerId: producer?.id,
            rtpCapabilities,

            paused: producer?.kind === "video",
          });

          consumer?.on("transportclose", () => {
            console.log("Consumer transport closed");
            consumer?.close();
          });

          consumer?.on("producerclose", () => {
            console.log("Producer closed");
            consumer?.close();
          });

          callback({
            params: {
              producerId: producer?.id,
              id: consumer?.id,
              kind: consumer?.kind,
              rtpParameters: consumer?.rtpParameters,
            },
          });
        }
      } catch (error) {

        console.error("Error consuming:", error);
        callback({
          params: {
            error,
          },
        });
      }
    });

    mediaSocket.on("resumePausedConsumer", async () => {
        console.log("consume-resume");
        await consumer?.resume();
    });
  });
}

async function createWebRtcTransport(
  callback: (arg0: {
    params:
      | {
          id: string;
          iceParameters: mediasoup.types.IceCandidate;
          iceCandidates: mediasoup.types.IceCandidate;
          dtlsParameters: mediasoup.types.DtlsParameters;
        }
      | {};
  }) => void,
) {
  try {
    const webRtcTransportOptions = {
      listenIps: [{ ip: "127.0.0.1" }],
      enableUdp: true,
      enableTcp: true,
      preferUdp: true,
    };

    const transport = await router.createWebRtcTransport(
      webRtcTransportOptions,
    );

    console.log(`Transport created: ${transport.id}`);

    transport.on("dtlsstatechange", (dtlsState) => {
      if (dtlsState === "closed") {
        transport.close();
      }
    });

    transport.on("@close", () => {
      console.log("Transport closed");
    });

    callback({
      params: {
        id: transport.id,
        iceParameters: transport.iceParameters,
        iceCandidates: transport.iceCandidates,
        dtlsParameters: transport.dtlsParameters,
      },
    });

    return transport;
  } catch (error) {
    console.log(error);
    callback({
      params: {
        error,
      },
    });
  }
}
