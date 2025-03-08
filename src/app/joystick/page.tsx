'use client'
import { Joystick } from 'react-joystick-component';
import { JoystickShape } from 'react-joystick-component';
import { useState } from 'react';

interface JoystickEvent {
    x?: number;
    y?: number;
    direction?: string;
}

export default function JoystickComp() {
    const [position1, setPosition1] = useState({ x: 0, y: 0 });
    const [position2, setPosition2] = useState({ x: 0, y: 0 });

    const handleYMove = (event: JoystickEvent) => {
        const x = event.x ?? 0;  
        const y = event.y ?? 0;  
        let direction = event.direction ?? "CENTER";  

        if(direction === "RIGHT") direction = "FORWARD";
        if(direction === "LEFT") direction = "BACKWARD";

        setPosition1({ x, y });
        console.log(`Direction1: ${direction}, X: ${x}, Y: ${y}`);
    };

    const handleMove = (event: JoystickEvent) => {
        const x = event.x ?? 0;  
        const y = event.y ?? 0;  
        const direction = event.direction ?? "CENTER";  

        setPosition2({ x, y });
        console.log(`Direction2: ${direction}, X: ${x}, Y: ${y}`);
    };

    return (
        <div className="bg-gray-300 min-h-screen flex justify-center items-center p-4">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-50 sm:gap-20 w-full">
                
                <div className="max-w-xs w-full flex justify-center">
                    <Joystick
                        size={150} 
                        smSize={200} 
                        mdSize={250} 
                        controlPlaneShape={JoystickShape.AxisX}  
                        start={() => console.log("Joystick Started")} 
                        move={handleYMove}  
                        stop={() => console.log("Joystick Stopped")} 
                    />
                </div>

              
                <div className="max-w-xs w-full flex justify-center">
                    <Joystick 
                        size={150}  
                        smSize={200} 
                        mdSize={250} 
                        start={() => console.log("Joystick Started")} 
                        move={handleMove}  
                        stop={() => console.log("Joystick Stopped")} 
                    />
                </div>

                {/*
                    <div className="text-white text-lg">
                        X: {position.x}, Y: {position.y}
                    </div>
                */}
            </div>
        </div>
    );
}
