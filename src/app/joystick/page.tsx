'use client'
import { Joystick } from 'react-joystick-component';
import { useState } from 'react';

interface JoystickEvent {
    x?: number;
    y?: number;
    direction?: string;
}

export default function JoystickComp() {
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleMove = (event: JoystickEvent) => {
        const x = event.x ?? 0;  
        const y = event.y ?? 0;  
        const direction = event.direction ?? "CENTER";  

        setPosition({ x, y });

        console.log(`Direction: ${direction}, X: ${x}, Y: ${y}`);
    };

    return (
        <div className="flex flex-col items-center space-y-4">
            <Joystick 
                start={() => console.log("Joystick Started")} 
                move={handleMove}  
                stop={() => console.log("Joystick Stopped")} 
            />

            {/* 
            <div className="text-white text-lg">
                X: {position.x}, Y: {position.y}
            </div>*/}
        </div>
    );
}
