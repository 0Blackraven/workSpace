import { mediaSocket } from "@/socket";
import { motion } from "motion/react";
import { useEffect, useRef } from "react";
import { Device } from "mediasoup-client";
import {
    types
} from "mediasoup-client";

const VideoCallElement = () => {
    const localRef = useRef<HTMLVideoElement | null>(null);
    const remoteRef = useRef<HTMLVideoElement | null>(null);
    
    const localStreamRef = useRef<MediaStream | null>(null);
    const deviceRef = useRef<Device | null>(null);
    const producerTransportRef = useRef<types.Transport | null>(null);
    const consumerTransportRef = useRef<types.Transport | null>(null);
    const producerRef = useRef<types.Producer | null>(null);
    const consumerRef = useRef<types.Consumer | null>(null);

    const startCamera = async (): Promise<MediaStream | null> => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            localStreamRef.current = stream;
            if (localRef.current) {
                localRef.current.srcObject = stream;
            }
            return stream;
        } catch (e) {
            console.error(`Camera/Microphone could not be accessed. Reason: ${e}`);
            return null;
        }
    }

    const initMediasoup = async (stream: MediaStream): Promise<void> => {
        try {
            // 1. Get Router RTP Capabilities from the server
            mediaSocket.emit("getRtpCapabilities", async (data: { routerRtpCapabilities: types.RtpCapabilities }) => {
                const { routerRtpCapabilities } = data;
                
                // 2. Create and load the Device
                const device = new Device();
                await device.load({ routerRtpCapabilities });
                deviceRef.current = device;

                // 3. Create Producer (Send) Transport
                createSendTransport(device, stream);

                // 4. Create Consumer (Receive) Transport
                createRecvTransport(device);
            });
        } catch (error) {
            console.error("Error during Mediasoup initialization:", error);
        }
    };

    const createSendTransport = (device: Device, stream: MediaStream): void => {
        mediaSocket.emit("createTransport", { sender: true }, async ({ params }: { params: types.TransportOptions & { error?: string } }) => {
            if (!params || params.error) {
                console.error("Failed to create send transport:", params?.error);
                return;
            }

            try {
                const transport = device.createSendTransport(params);
                producerTransportRef.current = transport;

                transport.on("connect", async ({ dtlsParameters }, callback: () => void, errback: (error: Error) => void) => {
                    try {
                        mediaSocket.emit("connectProducerTransport", { dtlsParameters });
                        callback();
                    } catch (error: unknown) {
                        errback(error instanceof Error ? error : new Error(String(error)));
                    }
                });

                transport.on("produce", async ({ kind, rtpParameters }, callback: (res: { id: string }) => void, errback: (error: Error) => void) => {
                    try {
                        mediaSocket.emit("transport-produce", { kind, rtpParameters }, ({ id }: { id: string }) => {
                            callback({ id });
                        });
                    } catch (error: unknown) {
                        errback(error instanceof Error ? error : new Error(String(error)));
                    }
                });

                // Produce video track
                const videoTrack = stream.getVideoTracks()[0];
                if (videoTrack) {
                    const producer = await transport.produce({ track: videoTrack });
                    producerRef.current = producer;
                }

                // Optionally produce audio track
                const audioTrack = stream.getAudioTracks()[0];
                if (audioTrack) {
                    await transport.produce({ track: audioTrack });
                }

            } catch (error) {
                console.error("Error setting up send transport / producing media:", error);
            }
        });
    };

    const createRecvTransport = (device: Device): void => {
        mediaSocket.emit("createTransport", { sender: false }, async ({ params }: { params: types.TransportOptions & { error?: string } }) => {
            if (!params || params.error) {
                console.error("Failed to create receive transport:", params?.error);
                return;
            }

            try {
                const transport = device.createRecvTransport(params);
                consumerTransportRef.current = transport;

                transport.on("connect", async ({ dtlsParameters }, callback: () => void, errback: (error: Error) => void) => {
                    try {
                        mediaSocket.emit("connectConsumerTransport", { dtlsParameters });
                        callback();
                    } catch (error: unknown) {
                        errback(error instanceof Error ? error : new Error(String(error)));
                    }
                });

                // Start consuming media from the server
                consumeMedia(device, transport);

            } catch (error) {
                console.error("Error setting up receive transport:", error);
            }
        });
    };

    const consumeMedia = (device: Device, transport: types.Transport): void => {
        mediaSocket.emit("consumeMedia", { rtpCapabilities: device.rtpCapabilities }, async ({ params }: { params: { id: string; producerId: string; kind: types.MediaKind; rtpParameters: types.RtpParameters; error?: string } }) => {
            if (!params || params.error) {
                console.warn("Failed to consume media (possibly no producer yet):", params?.error);
                return;
            }

            try {
                const consumer = await transport.consume({
                    id: params.id,
                    producerId: params.producerId,
                    kind: params.kind,
                    rtpParameters: params.rtpParameters,
                });

                consumerRef.current = consumer;

                // Resume the consumer on the server as it starts in a paused state
                mediaSocket.emit("resumePausedConsumer");

                const remoteStream = new MediaStream([consumer.track]);
                if (remoteRef.current) {
                    remoteRef.current.srcObject = remoteStream;
                }
            } catch (error) {
                console.error("Error consuming remote track:", error);
            }
        });
    };

    useEffect(() => {
        mediaSocket.connect();
        
        mediaSocket.on("Connection Success", async () => {
            const stream = await startCamera();
            if (stream) {
                await initMediasoup(stream);
            }
        });

        return () => {
            if (producerRef.current) producerRef.current.close();
            if (consumerRef.current) consumerRef.current.close();
            if (producerTransportRef.current) producerTransportRef.current.close();
            if (consumerTransportRef.current) consumerTransportRef.current.close();
            
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach((track) => track.stop());
            }
            
            mediaSocket.off("Connection Success");
            mediaSocket.disconnect();
        };
    }, []);

    return (
        <div className="absolute z-20 top-0 left-0 h-screen w-screen pointer-events-none">
            <div className="flex justify-evenly items-center h-[90%] overflow-hidden pointer-events-none">
                <motion.video
                    autoPlay
                    playsInline
                    className="h-[55dvh] w-[40dvw] bg-[#deb88790] rounded-xl overflow-hidden object-cover p-1 pointer-events-auto"
                    initial={{ x: '-100vw', opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 60, damping: 15 }}
                    ref={localRef}
                >

                </motion.video>
                <motion.video
                    autoPlay
                    playsInline
                    className="h-[55dvh] w-[40dvw] bg-[#deb88790] rounded-xl overflow-hidden object-cover p-1 pointer-events-auto"
                    initial={{ x: '100vw', opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 60, damping: 15 }}
                    ref={remoteRef}
                >

                </motion.video>
            </div>
        </div>
    )
}

export default VideoCallElement