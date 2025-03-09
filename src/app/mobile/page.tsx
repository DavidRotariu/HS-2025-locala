/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Joystick } from "react-joystick-component";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface JoystickEvent {
  type: "move" | "stop" | "start";
  x: number | null;
  y: number | null;
  direction: "FORWARD" | "RIGHT" | "LEFT" | "BACKWARD" | null;
  distance: number | null;
}

export default function JoystickComp() {
  const [ws, setWs] = useState<WebSocket | null>(null);
    const [leftImage, setLeftImage] = useState<string | null>("leftdrone");
    const [rightImage, setRightImage] = useState<string | null>("rightdrone");
    const lastSentTime = useRef(0);
    const sendInterval = 100;
  
    const connectWebSocket = () => {
      if (!ws || ws.readyState !== WebSocket.OPEN) {
        const websocket = new WebSocket("ws://192.168.0.105:8000/ws/2");
  
        websocket.onopen = () => {
          console.log("Connected to WebSocket");
          websocket.send(JSON.stringify({ command: "ARM", value: 1500 }));
        };
  
        websocket.onclose = () => {
          console.log("WebSocket Disconnected");
        };
        websocket.onerror = (error) => console.error("WebSocket Error:", error);
  
        setWs(websocket);
      }
    };
  
    const startCommand = () => {
      connectWebSocket();
    };
  
    const stopCommand = () => {
      if (ws) {
        ws.send(JSON.stringify({ command: "ARM", value: 1000 }));
        ws.close();
        setWs(null);
      }
      setLeftImage("leftdrone");
      setRightImage("rightdrone");
    };
  
    const mapJoystickToPWM = (joystickValue: number): number => {
      return Math.round(1500 + joystickValue * 500); // Map -1 to 1 -> 1000 to 2000
    };
  
    const sendCommand = (command: string, value: number | null) => {
      if (ws && ws.readyState === WebSocket.OPEN && value != null) {
        const joystickValue = mapJoystickToPWM(value);
        ws.send(JSON.stringify({ command, value: joystickValue }));
        console.log(`Sent: ${command} -> ${joystickValue}`);
      } else {
        console.error("WebSocket not connected.");
      }
    };
  
    const sendCommandThrottled = (command: string, value: number | null) => {
      const now = Date.now();
      if (now - lastSentTime.current > sendInterval) {
        sendCommand(command, value);
        lastSentTime.current = now;
      }
    };
  
    const handleLeftJoystick = (event: JoystickEvent) => {
      if (!event.direction) return;
  
      // Mapping for LEFT joystick (Throttle & Yaw)
      const leftJoystickMap: Record<string, string> = {
        FORWARD: "THROTTLE", // Increase altitude
        BACKWARD: "THROTTLE", // Decrease altitude
        LEFT: "YAW", // Rotate left
        RIGHT: "YAW", // Rotate right
      };
  
      const value =
        event.direction == "FORWARD" || event.direction == "BACKWARD"
          ? event.y
          : event.x;
  
      const command = leftJoystickMap[event.direction] || "HOVER";
      if (command == "TAKEOFF" || command == "LAND") {
        setRightImage("rightdrone");
        setLeftImage(command);
      } else {
        setLeftImage("leftdrone");
        setRightImage(command);
      }
      sendCommandThrottled(command, value);
    };
  
    const handleRightJoystick = (event: JoystickEvent) => {
      if (!event.direction) return;
  
      // Mapping for RIGHT joystick (Pitch & Roll)
      const rightJoystickMap: Record<string, string> = {
        FORWARD: "PITCH", // Move forward
        BACKWARD: "PITCH", // Move backward
        LEFT: "ROLL", // Strafe left
        RIGHT: "ROLL", // Strafe right
      };
  
      const value =
        event.direction == "FORWARD" || event.direction == "BACKWARD"
          ? event.y
          : event.x;
  
      const command = rightJoystickMap[event.direction] || "HOVER";
      setRightImage(command);
      sendCommandThrottled(command, value);
    };
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4">
      <h1 className="absolute top-20 text-center text-4xl font-bold text-gray-800">
        {`Mobile Joystick`}
      </h1>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-20 md:gap-20 w-full mt-[5rem]">     
        {/* Left Joystick (Throttle & Yaw) */}
        <div className="z-1 max-w-xs w-full flex justify-center mx-[3rem]">
        <Button
        className="absolute top-4 left-4 bg-green-500 text-white font-bold py-2 px-4 rounded-lg shadow-lg"
        onClick={startCommand}
      >
        ARM
      </Button>
      <Button
        className="absolute top-4 right-4 bg-red-500 text-white font-bold py-2 px-4 rounded-lg shadow-lg"
        onClick={stopCommand}
      >
        DISARM
      </Button>
          <Joystick
            size={200}
            start={startCommand}
            move={handleLeftJoystick}
            stop={stopCommand}
          />
        </div>

        {/* Right Joystick (Pitch & Roll) */}
        <div className="z-1 max-w-xs w-full flex justify-center mx-[3rem]">
          <Joystick
            size={200}
            start={startCommand}
            move={handleRightJoystick}
            stop={stopCommand}
          />
        </div>
      </div>
    </div>
  );
}
