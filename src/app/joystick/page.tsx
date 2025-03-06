'use client'
import { Joystick } from 'react-joystick-component';

export default function JoystickComp() {
  return (
    <>
       <Joystick size={100} sticky={false} baseColor="lightblue" stickColor="blue" ></Joystick>
    </>
  );
}
