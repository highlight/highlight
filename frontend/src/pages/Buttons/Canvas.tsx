import React, { useRef } from 'react';

const DO_NOT_USE_Canvas = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const onClick = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');

            if (ctx) {
                setTimeout(() => {
                    const randomColor = Math.floor(
                        Math.random() * 16777215
                    ).toString(16);

                    ctx.fillStyle = `#${randomColor}`;
                    ctx.beginPath();
                    ctx.arc(
                        Math.random() * 100,
                        Math.random() * 100,
                        20,
                        0,
                        2 * Math.PI
                    );
                    ctx.fill();
                }, 5000);
            }
        }
    };

    return (
        <div>
            <canvas ref={canvasRef}></canvas>
            <button onClick={onClick}>DRAW</button>
        </div>
    );
};

export default DO_NOT_USE_Canvas;
