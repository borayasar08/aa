'use client';

import { useEffect, useRef } from 'react';

const Game = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Canvas boyutlarını ayarla
    canvas.width = 800;
    canvas.height = 600;

    // Oyun değişkenleri
    const CENTER_X = canvas.width / 2;
    const CENTER_Y = canvas.height / 2;
    const ROTATION_SPEED = 0.02;
    let currentAngle = 0;
    let sticks: Stick[] = [];
    let currentStick: Stick | null = null;
    let gameOver = false;
    let currentLevel = 1;
    let remainingSticks = 1;

    // Merkez daire
    const centerCircle = {
      radius: 20,
      color: "#333"
    };

    // Çubuk sınıfı
    class Stick {
      length: number;
      width: number;
      color: string;
      angle: number;
      isRotating: boolean;
      x: number;
      y: number;
      speed: number;
      isAttached: boolean;
      initialAngle: number;

      constructor() {
        this.length = 100;
        this.width = 4;
        this.color = "#333";
        this.angle = 0;
        this.isRotating = false;
        this.x = CENTER_X;
        this.y = canvas.height - 50;
        this.speed = 10;
        this.isAttached = false;
        this.initialAngle = 0;
      }

      update() {
        if (this.isRotating && !this.isAttached) {
          this.y -= this.speed;
          
          const distanceToCenter = Math.sqrt(
            Math.pow(CENTER_X - this.x, 2) + 
            Math.pow(CENTER_Y - this.y, 2)
          );
          
          if (distanceToCenter <= centerCircle.radius + 5) {
            this.isAttached = true;
            this.initialAngle = currentAngle;
            this.angle = Math.atan2(CENTER_Y - this.y, CENTER_X - this.x) + Math.PI / 2;
            sticks.push(this);
            currentStick = null;
            remainingSticks--;
            
            if (checkCollision()) {
              gameOver = true;
              return;
            }
            
            if (remainingSticks === 0) {
              currentLevel++;
              remainingSticks = currentLevel;
              sticks = [];
              createNewStick();
            } else {
              createNewStick();
            }
          }
        }
      }

      draw() {
        ctx.save();
        if (this.isAttached) {
          const rotationAngle = currentAngle - this.initialAngle + this.angle;
          ctx.translate(CENTER_X, CENTER_Y);
          ctx.rotate(rotationAngle);
          ctx.translate(0, -centerCircle.radius);
          ctx.fillStyle = this.color;
          ctx.fillRect(-this.width / 2, 0, this.width, this.length);
        } else {
          ctx.translate(this.x, this.y);
          ctx.rotate(this.angle);
          ctx.fillStyle = this.color;
          ctx.fillRect(-this.width / 2, -this.length / 2, this.width, this.length);
        }
        ctx.restore();
      }
    }

    // Yeni çubuk oluştur
    function createNewStick() {
      if (!gameOver && remainingSticks > 0) {
        currentStick = new Stick();
      }
    }

    // Merkez daireyi çiz
    function drawCenterCircle() {
      ctx.save();
      ctx.beginPath();
      ctx.arc(CENTER_X, CENTER_Y, centerCircle.radius, 0, Math.PI * 2);
      ctx.fillStyle = centerCircle.color;
      ctx.fill();
      ctx.closePath();
      ctx.restore();
    }

    // Çarpışma kontrolü
    function checkCollision() {
      for (let i = 0; i < sticks.length; i++) {
        for (let j = i + 1; j < sticks.length; j++) {
          const angle1 = (currentAngle - sticks[i].initialAngle + sticks[i].angle) % (Math.PI * 2);
          const angle2 = (currentAngle - sticks[j].initialAngle + sticks[j].angle) % (Math.PI * 2);
          const angleDiff = Math.abs(angle1 - angle2);
          
          if (angleDiff < 0.1 || angleDiff > Math.PI * 2 - 0.1) {
            return true;
          }
        }
      }
      return false;
    }

    // Oyun döngüsü
    function gameLoop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      currentAngle += ROTATION_SPEED;
      
      drawCenterCircle();

      for (const stick of sticks) {
        stick.draw();
      }

      if (currentStick) {
        currentStick.update();
        currentStick.draw();
      }

      // Bilgileri göster
      ctx.font = "24px Arial";
      ctx.fillStyle = "black";
      ctx.fillText(`Seviye: ${currentLevel}`, 20, 40);
      ctx.fillText(`Kalan Çubuk: ${remainingSticks}`, 20, 70);
      ctx.fillText(`Skor: ${currentLevel - 1}`, 20, 100);

      if (gameOver) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "white";
        ctx.font = "48px Arial";
        ctx.fillText("Oyun Bitti!", CENTER_X - 120, CENTER_Y);
        ctx.font = "24px Arial";
        ctx.fillText(`Final Skor: ${currentLevel - 1}`, CENTER_X - 70, CENTER_Y + 40);
        return;
      }

      requestAnimationFrame(gameLoop);
    }

    // Boşluk tuşu ile çubuk fırlatma
    function handleKeyDown(e: KeyboardEvent) {
      if (e.code === "Space" && currentStick && !currentStick.isRotating) {
        currentStick.isRotating = true;
      }
    }

    // Event listener'ları ekle
    document.addEventListener("keydown", handleKeyDown);

    // İlk çubuğu oluştur ve oyunu başlat
    createNewStick();
    gameLoop();

    // Cleanup
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="border-2 border-black bg-white"
    />
  );
};

export default Game; 