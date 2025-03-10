/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Joystick } from "react-joystick-component";
import { useEffect, useRef, useState } from "react";
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
      const websocket = new WebSocket("ws://192.168.194.121:8000/ws/1");

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

  const armButton = () => {
    connectWebSocket();
  };

  const disarmButton = () => {
    if (ws) {
      ws.send(JSON.stringify({ command: "ARM", value: 1000 }));
      ws.close();
      setWs(null);
    }
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

  // Mapping for LEFT joystick (Throttle & Yaw)
  const handleLeftJoystick = (event: JoystickEvent) => {
    if (!event.direction) return;

    const leftJoystickMap: Record<string, string> = {
      FORWARD: "THROTTLE",
      BACKWARD: "THROTTLE",
      LEFT: "YAW",
      RIGHT: "YAW",
    };

    const value =
      event.direction == "FORWARD" || event.direction == "BACKWARD"
        ? event.y
        : event.x;

    const command = leftJoystickMap[event.direction] || "HOVER";

    setLeftImage("leftdrone");
    setRightImage("rightdrone");
    if (event.direction == "FORWARD") setLeftImage("TAKEOFF");
    else if (event.direction == "BACKWARD") setLeftImage("LAND");
    else if (event.direction == "LEFT") setRightImage("TURN_LEFT");
    else if (event.direction == "RIGHT") setRightImage("TURN_RIGHT");

    sendCommandThrottled(command, value);
  };

  // Mapping for RIGHT joystick (Pitch & Roll)
  const handleRightJoystick = (event: JoystickEvent) => {
    if (!event.direction) return;

    const rightJoystickMap: Record<string, string> = {
      FORWARD: "PITCH",
      BACKWARD: "PITCH",
      LEFT: "ROLL",
      RIGHT: "ROLL",
    };

    const value =
      event.direction == "FORWARD" || event.direction == "BACKWARD"
        ? event.y
        : event.x;

    const command = rightJoystickMap[event.direction] || "HOVER";

    setLeftImage("leftdrone");
    setRightImage("rightdrone");
    if (event.direction == "FORWARD") setRightImage("MOVE_FWD");
    else if (event.direction == "BACKWARD") setRightImage("MOVE_BWD");
    else if (event.direction == "LEFT") setRightImage("MOVE_LEFT");
    else if (event.direction == "RIGHT") setRightImage("MOVE_RIGHT");

    sendCommandThrottled(command, value);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4">
      <div
        className="absolute top-4 left-4 flex items-center justify-center cursor-pointer transition-all active:scale-90 hover:brightness-110"
        onClick={armButton}
      >
        <Image
          src="/arm.png"
          alt="arm button"
          width={200}
          height={200}
          className="drop-shadow-lg rounded-lg"
        />
      </div>

      <div
        className="absolute top-4 right-4 flex items-center justify-center cursor-pointer transition-all active:scale-90 hover:brightness-110"
        onClick={disarmButton}
      >
        <Image
          src="/disarm.png"
          alt="disarm button"
          width={200}
          height={200}
          className="drop-shadow-lg rounded-lg"
        />
      </div>

      <h1 className="absolute top-30 text-center text-7xl font-bold text-gray-800">
        {`Drone Controller`}
      </h1>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-20 sm:gap-20 w-full mt-[3rem]">
        {/* Left Joystick (Throttle & Yaw) */}
        <div className="z-1 max-w-xs w-full flex justify-center mx-[3rem]">
          <Joystick
            size={250}
            baseColor={"#323232"}
            stickColor={"#A0A0A0"}
            move={handleLeftJoystick}
            stop={() => {
              setLeftImage("leftdrone");
              setRightImage("rightdrone");
              sendCommand("HOVER", 0);
            }}
          />
        </div>
        {/* Right Joystick (Pitch & Roll) */}
        <div className="z-1 max-w-xs w-full flex justify-center mx-[3rem]">
          <Joystick
            size={250}
            baseColor={"#323232"}
            stickColor={"#A0A0A0"}
            move={handleRightJoystick}
            stop={() => {
              setLeftImage("leftdrone");
              setRightImage("rightdrone");
              sendCommand("HOVER", 0);
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
