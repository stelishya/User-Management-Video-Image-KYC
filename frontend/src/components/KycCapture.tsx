
import React, { useState, useRef, useEffect } from 'react';
import Button from './Button';
import { Camera, Video, StopCircle, RefreshCcw, Save } from 'lucide-react';
import toast from 'react-hot-toast';

interface KycCaptureProps {
    onCapture: (file: File, type: 'image' | 'video') => void;
    isImageUploaded?: boolean;
    isVideoUploaded?: boolean;
}

const KycCapture: React.FC<KycCaptureProps> = ({ onCapture, isImageUploaded = false, isVideoUploaded = false }) => {
    const [mode, setMode] = useState<'image' | 'video' | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [mediaBlob, setMediaBlob] = useState<Blob | null>(null);

    const videoRef = useRef<HTMLVideoElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<number | null>(null);

    // Cleanup stream on unmount 
    useEffect(() => {
        return () => {
            stopStream();
        };
    }, []);

    const stopStream = () => {
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };

    const startCamera = async (newMode: 'image' | 'video') => {
        try {
            stopStream(); // Ensure previous stream is stopped
            setPreviewUrl(null);
            setMediaBlob(null);
            setMode(newMode);
            setRecordingDuration(0);

            const constraints = {
                video: { facingMode: 'user' },
                audio: newMode === 'video'
            };

            const newStream = await navigator.mediaDevices.getUserMedia(constraints);
            setStream(newStream);

            if (videoRef.current) {
                videoRef.current.srcObject = newStream;
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            toast.error("Could not access camera/microphone. Please check permissions.");
            setMode(null);
        }
    };

    const captureImage = () => {
        if (!videoRef.current) return;

        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(videoRef.current, 0, 0);
            canvas.toBlob((blob) => {
                if (blob) {
                    setMediaBlob(blob);
                    setPreviewUrl(URL.createObjectURL(blob));
                    stopStream(); // Stop stream after capture
                }
            }, 'image/jpeg');
        }
    };

    const startRecording = () => {
        if (!stream) return;

        chunksRef.current = [];//stores the video data while recording 
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        //collect the data while recording
        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
                console.log("Data available", e.data.size);
                chunksRef.current.push(e.data);
            }
        };
        //when recording stops
        mediaRecorder.onstop = () => {
            console.log("Recorder stopped, chunks:", chunksRef.current.length);
            const blob = new Blob(chunksRef.current, { type: 'video/webm' });
            console.log("Blob created:", blob.size, blob.type);

            const url = URL.createObjectURL(blob);
            setMediaBlob(blob);
            setPreviewUrl(url);

            stopStream();
        };

        mediaRecorder.start();
        setIsRecording(true);

        // Timer
        timerRef.current = window.setInterval(() => {
            setRecordingDuration(prev => prev + 1);
        }, 1000);
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }
    };

    const handleSave = () => {
        if (mediaBlob && mode) {
            const extension = mode === 'image' ? 'jpg' : 'webm';
            const file = new File([mediaBlob], `kyc_${Date.now()}.${extension}`, { type: mediaBlob.type });
            onCapture(file, mode);

            setMode(null);
            setPreviewUrl(null);
            setMediaBlob(null);
        }
    };

    const handleRetake = () => {
        if (mode) {
            startCamera(mode);
        }
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div style={{ border: '1px solid #444', borderRadius: '8px', padding: '1rem', marginTop: '1rem', textAlign: 'center' }}>
            {!mode ? (
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Button disabled={isImageUploaded} onClick={() => startCamera('image')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1 1 auto', justifyContent: 'center' }}>
                        <Camera size={20} /> {isImageUploaded ? 'Image Submitted' : 'Capture Image'}
                    </Button>
                    <Button disabled={isVideoUploaded} onClick={() => startCamera('video')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1 1 auto', justifyContent: 'center' }}>
                        <Video size={20} /> {isVideoUploaded ? 'Video Submitted' : 'Record Video'}
                    </Button>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ position: 'relative', width: '100%', maxWidth: '500px', backgroundColor: '#000', borderRadius: '8px', overflow: 'hidden', aspectRatio: '16/9' }}>
                        {previewUrl ? (
                            mode === 'image' ? (
                                <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            ) : (
                                <video
                                    src={previewUrl}
                                    controls
                                    autoPlay
                                    playsInline
                                    style={{ width: '100%', height: '100%', backgroundColor: 'black' }}
                                />
                            )
                        ) : (
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                // ={mode === 'image'} // Mute preview for image, keep audio for video recording setup
                                style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
                            />
                        )}

                        {isRecording && (
                            <div style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: 'rgba(255,0,0,0.7)', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>
                                {formatDuration(recordingDuration)}
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                        {!previewUrl ? (
                            <>
                                {mode === 'image' ? (
                                    <Button onClick={captureImage} style={{ width: '60px', height: '60px', borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <div style={{ width: '50px', height: '50px', borderRadius: '50%', border: '2px solid white' }}></div>
                                    </Button>
                                ) : (
                                    !isRecording ? (
                                        <Button onClick={startRecording} style={{ width: '60px', height: '60px', borderRadius: '50%', padding: 0, backgroundColor: '#ff4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <div style={{ width: '20px', height: '20px', backgroundColor: 'white', borderRadius: '4px' }}></div>
                                        </Button>
                                    ) : (
                                        <Button onClick={stopRecording} style={{ width: '60px', height: '60px', borderRadius: '50%', padding: 0, backgroundColor: '#ff4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <StopCircle size={32} color="white" />
                                        </Button>
                                    )
                                )}
                                <Button onClick={() => setMode(null)} variant="secondary">Cancel</Button>
                            </>
                        ) : (
                            <>
                                <Button onClick={handleRetake} variant="secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <RefreshCcw size={18} /> Retake
                                </Button>
                                <Button onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#4caf50', color: 'white' }}>
                                    <Save size={18} /> Save {mode === 'image' ? 'Image' : 'Video'}
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default KycCapture;
