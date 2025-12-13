import { useState, useRef, useCallback, useEffect, useMemo } from "react";

interface IWindow extends Window {
  webkitSpeechRecognition: any;
  SpeechRecognition: any;
}

interface UseVoiceChatOptions {
  onTranscript?: (transcript: string) => void;
  onError?: (error: string) => void;
  continuous?: boolean;
  language?: string;
}

interface VoiceState {
  isListening: boolean;
  isSpeaking: boolean;
  isSupported: boolean;
  transcript: string;
  error: string | null;
}

export function useVoiceChat(options: UseVoiceChatOptions = {}) {
  const {
    onTranscript,
    onError,
    continuous = false,
    language = "en-US",
  } = options;

  const [state, setState] = useState<VoiceState>({
    isListening: false,
    isSpeaking: false,
    isSupported: false,
    transcript: "",
    error: null,
  });

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const onTranscriptRef = useRef(onTranscript);
  const onErrorRef = useRef(onError);
  
  useEffect(() => {
    onTranscriptRef.current = onTranscript;
    onErrorRef.current = onError;
  });

  useEffect(() => {
    const win = window as unknown as IWindow;
    const SpeechRecognitionAPI = win.SpeechRecognition || win.webkitSpeechRecognition;
    
    if (SpeechRecognitionAPI) {
      recognitionRef.current = new SpeechRecognitionAPI();
      recognitionRef.current.continuous = continuous;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = language;

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = "";
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        const currentTranscript = finalTranscript || interimTranscript;
        setState((prev) => ({ ...prev, transcript: currentTranscript }));
        
        if (finalTranscript && onTranscriptRef.current) {
          onTranscriptRef.current(finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        const errorMessage = `Speech recognition error: ${event.error}`;
        setState((prev) => ({ ...prev, error: errorMessage, isListening: false }));
        if (onErrorRef.current) onErrorRef.current(errorMessage);
      };

      recognitionRef.current.onend = () => {
        setState((prev) => ({ ...prev, isListening: false }));
      };

      setState((prev) => ({ ...prev, isSupported: true }));
    }

    if (typeof window !== "undefined" && window.speechSynthesis) {
      synthRef.current = window.speechSynthesis;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, [continuous, language]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      const error = "Speech recognition not supported";
      setState((prev) => ({ ...prev, error }));
      if (onErrorRef.current) onErrorRef.current(error);
      return;
    }

    setState((prev) => ({ ...prev, isListening: true, error: null, transcript: "" }));
    try {
      recognitionRef.current.start();
    } catch (e) {
      console.error("Failed to start speech recognition:", e);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setState((prev) => ({ ...prev, isListening: false }));
  }, []);

  const toggleListening = useCallback(() => {
    if (state.isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [state.isListening, startListening, stopListening]);

  const speak = useCallback((text: string, rate = 0.9, pitch = 1) => {
    if (!synthRef.current) {
      const error = "Speech synthesis not supported";
      setState((prev) => ({ ...prev, error }));
      if (onErrorRef.current) onErrorRef.current(error);
      return;
    }

    synthRef.current.cancel();
    
    utteranceRef.current = new SpeechSynthesisUtterance(text);
    utteranceRef.current.rate = rate;
    utteranceRef.current.pitch = pitch;
    utteranceRef.current.lang = language;

    utteranceRef.current.onstart = () => {
      setState((prev) => ({ ...prev, isSpeaking: true }));
    };

    utteranceRef.current.onend = () => {
      setState((prev) => ({ ...prev, isSpeaking: false }));
    };

    utteranceRef.current.onerror = (event) => {
      const errorMessage = `Speech synthesis error: ${event.error}`;
      setState((prev) => ({ ...prev, error: errorMessage, isSpeaking: false }));
      if (onErrorRef.current) onErrorRef.current(errorMessage);
    };

    synthRef.current.speak(utteranceRef.current);
  }, [language]);

  const stopSpeaking = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setState((prev) => ({ ...prev, isSpeaking: false }));
  }, []);

  const startRecording = useCallback(async (): Promise<void> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.start();
    } catch (e) {
      const error = "Failed to access microphone";
      setState((prev) => ({ ...prev, error }));
      if (onErrorRef.current) onErrorRef.current(error);
    }
  }, []);

  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current) {
        resolve(null);
        return;
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        audioChunksRef.current = [];
        
        mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
        
        resolve(audioBlob);
      };

      mediaRecorderRef.current.stop();
    });
  }, []);

  const blobToBase64 = useCallback((blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }, []);

  return {
    ...state,
    startListening,
    stopListening,
    toggleListening,
    speak,
    stopSpeaking,
    startRecording,
    stopRecording,
    blobToBase64,
  };
}
