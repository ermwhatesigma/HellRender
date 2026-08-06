import React, { useEffect, useState, useRef } from 'react';

interface DoomFaceProps {
  hp: number;
  maxHp: number;
  isGodMode?: boolean;
  damageFlash?: boolean;
  pickupFlash?: boolean;
}

export const DoomFace: React.FC<DoomFaceProps> = ({
  hp,
  maxHp,
  isGodMode = false,
  damageFlash = false,
  pickupFlash = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [lookDir, setLookDir] = useState<'center' | 'left' | 'right'>('center');

  // Random idle look left/right
  useEffect(() => {
    const interval = setInterval(() => {
      if (hp <= 0) return;
      const rnd = Math.random();
      if (rnd < 0.35) setLookDir('left');
      else if (rnd < 0.7) setLookDir('right');
      else setLookDir('center');
    }, 2200);

    return () => clearInterval(interval);
  }, [hp]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, 64, 72);
    ctx.imageSmoothingEnabled = false;

    const hpRatio = hp / maxHp;
    const isDead = hp <= 0;

    // Base face background skin
    const skinTone = isDead ? '#6b7280' : '#e0a87c';
    const shadowSkin = isDead ? '#4b5563' : '#b87856';

    // 1. Hair / Flat top marine buzzcut
    ctx.fillStyle = '#451a03';
    ctx.fillRect(16, 6, 32, 14);
    ctx.fillRect(12, 12, 40, 6);

    // 2. Face shape
    ctx.fillStyle = skinTone;
    ctx.fillRect(14, 18, 36, 34);
    // Jawline
    ctx.fillRect(18, 52, 28, 8);
    // Ears
    ctx.fillStyle = shadowSkin;
    ctx.fillRect(10, 24, 4, 16);
    ctx.fillRect(50, 24, 4, 16);

    // 3. Eyebrows
    ctx.fillStyle = '#291003';
    if (damageFlash) {
      ctx.fillRect(18, 20, 12, 5);
      ctx.fillRect(34, 20, 12, 5);
    } else if (pickupFlash || isGodMode) {
      ctx.fillRect(18, 20, 12, 4);
      ctx.fillRect(34, 18, 12, 4);
    } else {
      ctx.fillRect(18, 22, 12, 4);
      ctx.fillRect(34, 22, 12, 4);
    }

    // 4. Eyes
    if (isDead) {
      ctx.fillStyle = '#000000';
      ctx.fillRect(20, 28, 8, 2);
      ctx.fillRect(36, 28, 8, 2);
    } else if (isGodMode) {
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(20, 26, 8, 6);
      ctx.fillRect(36, 26, 8, 6);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(22, 28, 4, 2);
      ctx.fillRect(38, 28, 4, 2);
    } else {
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(20, 26, 8, 5);
      ctx.fillRect(36, 26, 8, 5);

      ctx.fillStyle = '#1e293b';
      const pupilOffset = lookDir === 'left' ? -2 : lookDir === 'right' ? 2 : 0;
      ctx.fillRect(23 + pupilOffset, 27, 3, 4);
      ctx.fillRect(39 + pupilOffset, 27, 3, 4);

      if (hpRatio < 0.4) {
        ctx.fillStyle = 'rgba(76, 29, 149, 0.6)';
        ctx.fillRect(18, 24, 12, 10);
      }
    }

    // 5. Nose
    ctx.fillStyle = shadowSkin;
    ctx.fillRect(29, 28, 6, 12);
    ctx.fillStyle = '#000000';
    ctx.fillRect(29, 39, 2, 2);
    ctx.fillRect(33, 39, 2, 2);

    if (hpRatio < 0.6 && !isDead) {
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(30, 41, 3, 6);
    }

    // 6. Mouth / Expression
    if (isDead) {
      ctx.fillStyle = '#000000';
      ctx.fillRect(24, 46, 16, 8);
    } else if (damageFlash) {
      ctx.fillStyle = '#450a0a';
      ctx.fillRect(22, 45, 20, 7);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(24, 46, 16, 3);
    } else if (pickupFlash) {
      ctx.fillStyle = '#450a0a';
      ctx.beginPath();
      ctx.moveTo(22, 45);
      ctx.lineTo(42, 45);
      ctx.lineTo(38, 51);
      ctx.lineTo(26, 51);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(24, 46, 16, 2);
    } else {
      ctx.fillStyle = '#450a0a';
      ctx.fillRect(24, 46, 16, 3);
    }

    // 7. Blood Splatters on Face based on HP
    if (hpRatio < 0.8 && !isDead) {
      ctx.fillStyle = '#991b1b';
      ctx.fillRect(16, 34, 6, 2);
      ctx.fillRect(18, 36, 4, 2);
    }
    if (hpRatio < 0.4 && !isDead) {
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(24, 14, 8, 3);
      ctx.fillRect(26, 17, 3, 5);
      ctx.fillRect(32, 50, 4, 6);
    }
    if (hpRatio < 0.2 && !isDead) {
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(40, 32, 6, 8);
      ctx.fillRect(16, 42, 6, 6);
    }
  }, [hp, maxHp, isGodMode, damageFlash, pickupFlash, lookDir]);

  return (
    <div className="hud-face-container w-10 h-12 sm:w-14 sm:h-16 bg-neutral-900 border-2 border-neutral-700 rounded overflow-hidden flex items-center justify-center shadow-inner relative select-none shrink-0">
      <canvas
        ref={canvasRef}
        width={64}
        height={72}
        className="w-full h-full object-contain pixelated"
      />
    </div>
  );
};
