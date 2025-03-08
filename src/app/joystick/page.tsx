/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Joystick } from "react-joystick-component";
import { useEffect, useState } from "react";
import Image from "next/image";

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
  const maxSpeed = 100;

  useEffect(() => {
    const websocket = new WebSocket("ws://192.168.0.117:8000/ws/123");

    websocket.onopen = () => console.log("Connected to WebSocket");
    websocket.onclose = () => console.log("WebSocket Disconnected");
    websocket.onerror = (error) => console.error("WebSocket Error:", error);

    setWs(websocket);

    return () => websocket.close();
  }, []);

  const calculateSpeed = (x: number, y: number): number => {
    const magnitude = Math.sqrt(x * x + y * y); // Normalize joystick input
    return Math.round(magnitude * maxSpeed); // Scale speed to maxSpeed
  };

  const sendCommand = (command: string, x: number, y: number) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      const speed = calculateSpeed(x, y);
      ws.send(JSON.stringify({ command, speed }));
      console.log(`Sent: ${command}, Speed: ${speed}`);
    } else {
      console.error("WebSocket not connected.");
    }
  };

  const handleLeftJoystick = (event: JoystickEvent) => {
    if (!event.direction) return;

    // Mapping for LEFT joystick (Throttle & Yaw)
    const leftJoystickMap: Record<string, string> = {
      FORWARD: "TAKEOFF", // Increase altitude
      BACKWARD: "LAND", // Decrease altitude
      LEFT: "TURN_LEFT", // Rotate left
      RIGHT: "TURN_RIGHT", // Rotate right
    };

    const command = leftJoystickMap[event.direction] || "HOVER";
    if (command == "TAKEOFF" || command == "LAND") {
      setRightImage("rightdrone");
      setLeftImage(command);
    } else {
      setLeftImage("leftdrone");
      setRightImage(command);
    }
    sendCommand(command, event.x ?? 0, event.y ?? 0);
  };

  const handleRightJoystick = (event: JoystickEvent) => {
    if (!event.direction) return;

    // Mapping for RIGHT joystick (Pitch & Roll)
    const rightJoystickMap: Record<string, string> = {
      FORWARD: "MOVE_FWD", // Move forward
      BACKWARD: "MOVE_BWD", // Move backward
      LEFT: "MOVE_LEFT", // Strafe left
      RIGHT: "MOVE_RIGHT", // Strafe right
    };

    const command = rightJoystickMap[event.direction] || "HOVER";
    setRightImage(command);
    sendCommand(command, event.x ?? 0, event.y ?? 0);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4">
      <h1 className="absolute top-20 text-center text-7xl font-bold text-gray-800">
        {`Drone Joystick Controller`}
      </h1>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-20 sm:gap-20 w-full mt-[5rem]">
        {/* Left Joystick (Throttle & Yaw) */}
        <div className="z-1 max-w-xs w-full flex justify-center mx-[3rem]">
          <Joystick
            size={250}
            start={() => console.log("Left Joystick Started")}
            move={handleLeftJoystick}
            stop={() => {
              sendCommand("HOVER", 0, 0);
              setLeftImage("leftdrone");
              setRightImage("rightdrone");
            }}
          />
        </div>

        {/* Right Joystick (Pitch & Roll) */}
        <div className="z-1 max-w-xs w-full flex justify-center mx-[3rem]">
          <Joystick
            size={250}
            start={() => console.log("Right Joystick Started")}
            move={handleRightJoystick}
            stop={() => {
              sendCommand("HOVER", 0, 0);
              setRightImage("rightdrone");
            }}
          />
        </div>
      </div>
      <div className="z-0 absolute bottom-4 left-4">
        <Image
          src={`/${leftImage}.png`}
          alt="Left Icon"
          width={376}
          height={311}
          priority
        />
      </div>

      <div className="z-0 absolute bottom-4 right-4">
        <Image
          src={`/${rightImage}.png`}
          alt="Right Icon"
          width={376}
          height={311}
          priority
        />
      </div>
    </div>
  );
}
