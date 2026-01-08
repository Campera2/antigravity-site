"use client";

import React, { useEffect, useRef, useState } from "react";
import { useScroll, useMotionValueEvent, motion, useTransform, MotionValue } from "framer-motion";

const FRAME_COUNT = 120;

export default function CarScroll() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [images, setImages] = useState<HTMLImageElement[]>([]);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"],
    });

    // Preload images
    useEffect(() => {
        let loadedCount = 0;
        const imgArray: HTMLImageElement[] = [];

        const loadImages = async () => {
            for (let i = 0; i < FRAME_COUNT; i++) {
                const img = new Image();
                const strIndex = i.toString().padStart(3, "0");
                img.src = `/images/car-sequence/frame_${strIndex}_delay-0.04s.webp`;

                await new Promise((resolve) => {
                    img.onload = () => {
                        loadedCount++;
                        setLoadingProgress(Math.round((loadedCount / FRAME_COUNT) * 100));
                        resolve(true);
                    };
                    img.onerror = () => {
                        console.warn(`Failed to load frame ${i}`);
                        resolve(true); // Continue anyway
                    };
                });
                imgArray[i] = img;
            }
            setImages(imgArray);
            setIsLoading(false);
        };

        loadImages();
    }, []);

    // Draw frame logic
    const renderFrame = (index: number) => {
        const canvas = canvasRef.current;
        if (!canvas || images.length === 0) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const img = images[index];
        if (!img) return;

        // Handle high DPI
        const dpr = window.devicePixelRatio || 1;
        // Set internal dimensions
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;

        // Scale context to match dpr
        ctx.scale(dpr, dpr);

        // "Contain" fit math
        const canvasWidth = window.innerWidth;
        const canvasHeight = window.innerHeight;
        const imgRatio = img.width / img.height;
        const canvasRatio = canvasWidth / canvasHeight;

        let renderWidth, renderHeight, offsetX, offsetY;

        if (canvasRatio > imgRatio) {
            // Canvas is wider than image -> fit by height
            renderHeight = canvasHeight;
            renderWidth = canvasHeight * imgRatio;
            offsetX = (canvasWidth - renderWidth) / 2;
            offsetY = 0;
        } else {
            // Canvas is taller than image -> fit by width
            renderWidth = canvasWidth;
            renderHeight = canvasWidth / imgRatio;
            offsetX = 0;
            offsetY = (canvasHeight - renderHeight) / 2;
        }

        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        ctx.drawImage(img, offsetX, offsetY, renderWidth, renderHeight);
    };

    // Initial draw when loaded
    useEffect(() => {
        if (!isLoading && images.length > 0) {
            renderFrame(0);
        }
    }, [isLoading, images]);

    // Update on scroll
    useMotionValueEvent(scrollYProgress, "change", (latest) => {
        if (images.length === 0 || isLoading) return;
        const frameIndex = Math.min(
            FRAME_COUNT - 1,
            Math.floor(latest * FRAME_COUNT)
        );
        requestAnimationFrame(() => renderFrame(frameIndex));
    });

    // Resize handler
    useEffect(() => {
        const handleResize = () => {
            if (images.length === 0) return;
            const currentScroll = scrollYProgress.get();
            const frameIndex = Math.min(
                FRAME_COUNT - 1,
                Math.floor(currentScroll * FRAME_COUNT)
            );
            renderFrame(frameIndex);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [scrollYProgress, images, isLoading]);


    return (
        <div ref={containerRef} className="relative h-[400vh] bg-[#050505]">

            {/* Loading Screen */}
            {isLoading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050505] text-white">
                    <div className="flex flex-col items-center gap-4">
                        <div className="size-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                        <p className="font-mono text-xs md:text-sm text-white/60 tracking-widest">LOADING VYRONYX SYSTEM... {loadingProgress}%</p>
                    </div>
                </div>
            )}

            {/* Sticky Canvas */}
            <div className="sticky top-0 h-screen w-full overflow-hidden">
                <canvas ref={canvasRef} className="block size-full" />
            </div>

            {/* Text Overlays */}
            <Overlay scrollYProgress={scrollYProgress} start={0} end={0.15} className="items-center justify-center text-center">
                <motion.div initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ duration: 0.8 }}>
                    <h1 className="text-6xl md:text-9xl font-bold tracking-tighter text-white/90">
                        VYRONYX<span className="text-red-600">.</span>
                    </h1>
                    <p className="mt-4 text-xl md:text-2xl text-white/60 font-light tracking-wide uppercase">
                        Apex Velocity
                    </p>
                </motion.div>
            </Overlay>

            <Overlay scrollYProgress={scrollYProgress} start={0.25} end={0.45} className="items-center justify-start pl-8 md:pl-32">
                <div className="max-w-xl">
                    <h2 className="text-4xl md:text-7xl font-semibold tracking-tighter text-white/90 leading-tight">
                        Aero-Formed<br />Precision.
                    </h2>
                    <p className="mt-4 text-white/50 text-lg md:text-xl font-light">
                        Wind tunnel sculpted bodywork delivering zero-drag coefficients at terminal velocity.
                    </p>
                </div>
            </Overlay>

            <Overlay scrollYProgress={scrollYProgress} start={0.55} end={0.75} className="items-center justify-end pr-8 md:pr-32 text-right">
                <div className="max-w-xl ml-auto">
                    <h2 className="text-4xl md:text-7xl font-semibold tracking-tighter text-white/90 leading-tight">
                        Carbon Core.<br />Titanium Nerve.
                    </h2>
                    <p className="mt-4 text-white/50 text-lg md:text-xl font-light">
                        Ultra-lightweight chassis geometry fused with F1-grade propulsion systems.
                    </p>
                </div>
            </Overlay>

            <Overlay scrollYProgress={scrollYProgress} start={0.85} end={1.0} className="items-center justify-center text-center">
                <div className="flex flex-col items-center gap-8">
                    <h2 className="text-5xl md:text-8xl font-bold tracking-tighter text-white/90">
                        DRIVE THE<br />IMPOSSIBLE.
                    </h2>
                    <button className="group relative px-8 py-4 bg-white text-black font-bold tracking-widest text-sm hover:scale-105 transition-transform overflow-hidden uppercase">
                        <span className="relative z-10">Configure Model-X</span>
                        <div className="absolute inset-0 bg-red-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 -z-0" />
                        <span className="absolute inset-0 z-10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">Configure Model-X</span>
                    </button>
                </div>
            </Overlay>

        </div>
    );
}

interface OverlayProps {
    scrollYProgress: MotionValue<number>;
    start: number;
    end: number;
    children: React.ReactNode;
    className?: string;
}

function Overlay({ scrollYProgress, start, end, children, className }: OverlayProps) {
    // Opacity: 0 -> 1 -> 1 -> 0 based on scroll range
    // Fade in takes 5% of scroll, hold, Fade out takes 5%
    const fadeInStart = start;
    const fadeInEnd = Math.min(start + 0.1, end);
    const fadeOutStart = Math.max(end - 0.1, start);
    const fadeOutEnd = end;

    const opacity = useTransform(scrollYProgress,
        [0, fadeInStart, fadeInEnd, fadeOutStart, fadeOutEnd, 1],
        [0, 0, 1, 1, 0, 0]
    );

    // Also add a slight scale/y transform for effect
    const y = useTransform(scrollYProgress,
        [fadeInStart, fadeInEnd, fadeOutStart, fadeOutEnd],
        [50, 0, 0, -50]
    );

    return (
        <motion.div
            className={`pointer-events-none fixed inset-0 flex flex-col ${className}`}
            style={{ opacity, y }}
        >
            {children}
        </motion.div>
    );
}
