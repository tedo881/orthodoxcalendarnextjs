"use client";
import { useEffect, useRef, useState } from "react";

/** iframe-ის სიმაღლე მიჰყვება ტიპიკონის გვერდის სიმაღლეს (postMessage {typikonHeight}).
 *  სანამ პასუხი არ მოსულა, iframe-ს შიდა გადაადგილება აქვს (resized=false), რომ ტექსტი არასოდეს მოიჭრას. */
export function useFrameHeight(initial: number) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(initial);
  const [resized, setResized] = useState(false);
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      // უსაფრთხოდ საკმარისია: შეტყობინება მოდის ზუსტად ჩვენი iframe-იდან
      if (!ref.current || e.source !== ref.current.contentWindow) return;
      const h = Number((e.data as { typikonHeight?: number } | null)?.typikonHeight);
      if (Number.isFinite(h) && h > 20 && h < 50000) {
        // ზუსტი სიმაღლე, მარაგის გარეშე (+px ციკლურ ზრდას იწვევდა); უცვლელზე აღარ ვაახლებთ
        setHeight((cur) => (Math.abs(cur - Math.ceil(h)) <= 1 ? cur : Math.ceil(h)));
        setResized(true);
      }
    };
    addEventListener("message", onMessage);
    return () => removeEventListener("message", onMessage);
  }, []);
  return { ref, height, resized };
}