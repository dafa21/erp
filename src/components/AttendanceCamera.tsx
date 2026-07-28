import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, MapPin, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import * as faceapi from '@vladmandic/face-api';

interface AttendanceCameraProps {
  type: 'Masuk' | 'Keluar';
  onClose: () => void;
  userId: number;
}

export default function AttendanceCamera({ type, onClose, userId }: AttendanceCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locError, setLocError] = useState<string>('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFaceModelLoaded, setIsFaceModelLoaded] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errMsg, setErrMsg] = useState('');

  // Load Face API model
  useEffect(() => {
    const loadModel = async () => {
      try {
        await faceapi.nets.ssdMobilenetv1.loadFromUri('https://raw.githubusercontent.com/vladmandic/face-api/master/model/');
        setIsFaceModelLoaded(true);
      } catch (err) {
        console.error("Failed to load face-api model", err);
        setErrMsg("Gagal memuat sistem deteksi wajah. Pastikan koneksi internet stabil.");
      }
    };
    loadModel();
  }, []);

  // Setup camera
  useEffect(() => {
    let stream: MediaStream | null = null;
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user' } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera access denied:", err);
        setErrMsg('Akses kamera ditolak atau tidak tersedia.');
      }
    };
    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  // Setup location
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Location error:", error);
          let errStr = 'Gagal mengambil lokasi (GPS).';
          if (error.code === error.PERMISSION_DENIED) errStr = "Izin lokasi ditolak.";
          setLocError(errStr);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setLocError("Perangkat ini tidak mendukung GPS.");
    }
  }, []);

  const takePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Set target size
    canvas.width = 400;
    canvas.height = 300;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      setPhotoData(dataUrl);
    }
  }, []);

  const retakePhoto = () => {
    setPhotoData(null);
  };

  const submitAttendance = async () => {
    if (!photoData || !location) {
      setErrMsg('Foto dan Lokasi wajib ada.');
      return;
    }
    
    setIsSubmitting(true);
    setErrMsg('');
    try {
      // Validate Face First
      if (imageRef.current) {
         const detections = await faceapi.detectAllFaces(imageRef.current, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.1 }));
         if (detections.length === 0) {
            throw new Error('Sistem mendeteksi bahwa foto ini tidak menampilkan wajah manusia dengan jelas. Mohon foto ulang dengan memperlihatkan wajah Anda!');
         }
      }

      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          type,
          photo_url: photoData,
          latitude: location.lat,
          longitude: location.lng
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mengirim absen');
      
      setSuccessMsg(`Berhasil Absen ${type}! Status: ${data.status}`);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (e: any) {
      setErrMsg(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 transition-all flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className={`flex justify-between items-center p-6 border-b ${type === 'Masuk' ? 'border-emerald-100 dark:border-emerald-900/20 bg-emerald-600 dark:bg-emerald-900' : 'border-amber-100 dark:border-amber-900/20 bg-amber-600 dark:bg-amber-900'} text-white shrink-0`}>
          <h3 className="font-black uppercase tracking-widest text-sm flex items-center gap-2">
            <Camera className="w-4 h-4" /> Absen {type}
          </h3>
          <button onClick={onClose} className="text-white hover:text-white/70 transition-colors focus:outline-none"><X className="w-5 h-5" /></button>
        </div>
        
        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
          {successMsg ? (
            <div className="flex flex-col items-center justify-center py-12">
              <CheckCircle className="w-16 h-16 text-emerald-500 mb-4 animate-bounce" />
              <p className="text-lg font-bold text-slate-800 dark:text-slate-100 text-center">{successMsg}</p>
            </div>
          ) : (
            <>
              {errMsg && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold rounded-xl border border-red-200 dark:border-red-800/30 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errMsg}</span>
                </div>
              )}

              {/* Location Status */}
              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl flex items-center gap-3 border border-slate-100 dark:border-slate-700">
                <div className={`p-2 rounded-lg ${location ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600'}`}>
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Deteksi Lokasi GPS</p>
                  {location ? (
                    <p className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 truncate">
                      {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                    </p>
                  ) : locError ? (
                    <p className="text-xs font-bold text-red-500">{locError}</p>
                  ) : (
                    <p className="text-xs font-medium text-amber-500 flex items-center gap-2">
                       <Loader2 className="w-3 h-3 animate-spin"/> Mencari lokasi...
                    </p>
                  )}
                </div>
              </div>

              {/* Camera Preview */}
              <div className="relative bg-black rounded-2xl overflow-hidden aspect-video border-2 border-slate-800 flex items-center justify-center">
                {!photoData ? (
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img ref={imageRef} src={photoData} alt="Captured" className="w-full h-full object-cover" crossOrigin="anonymous" />
                )}
                
                {/* Overlay guides */}
                {!photoData && (
                   <div className="absolute inset-0 border-[4px] border-dashed border-white/30 rounded-xl m-8 pointer-events-none box-border" />
                )}
              </div>
              
              {/* Hidden Canvas for capture */}
              <canvas ref={canvasRef} className="hidden" />
              
              {/* Actions */}
              <div className="flex flex-col gap-3 pt-2">
                {!photoData ? (
                  <button 
                    onClick={takePhoto}
                    disabled={!isFaceModelLoaded}
                    className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold uppercase tracking-widest hover:opacity-90 transition-all flex justify-center items-center gap-2 disabled:opacity-50"
                  >
                    {isFaceModelLoaded ? <><Camera className="w-5 h-5"/> Ambil Foto Wajah</> : <><Loader2 className="w-5 h-5 animate-spin" /> Memuat Sistem Wajah...</>}
                  </button>
                ) : (
                  <>
                    <button 
                      onClick={submitAttendance}
                      disabled={isSubmitting || !location}
                      className={`w-full py-4 text-white rounded-xl font-bold uppercase tracking-widest transition-all flex justify-center items-center gap-2 shadow-lg hover:shadow-none ${type === 'Masuk' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200 dark:shadow-none' : 'bg-amber-600 hover:bg-amber-700 shadow-amber-200 dark:shadow-none'} disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />} 
                      Kirim Absensi {type}
                    </button>
                    <button 
                      onClick={retakePhoto}
                      disabled={isSubmitting}
                      className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-bold uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex justify-center items-center gap-2 disabled:opacity-50"
                    >
                      Ulangi Foto
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
