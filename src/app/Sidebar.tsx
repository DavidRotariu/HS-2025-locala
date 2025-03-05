import Image from "next/image";
import { Card } from "@/components/ui/card";

export default function Sidebar() {
  return (
    <div className="w-80 h-screen bg-gray-100 text-gray-900 p-4 flex flex-col gap-4 border-r border-gray-300">
      {/* Drone Info */}
      <Card className="p-4 flex items-center gap-3 bg-white shadow rounded-lg">
        <Image src="/drone.png" alt="Drone" width={40} height={40} />
        <div>
          <p className="text-lg font-semibold">Drone X1</p>
          <p className="text-sm text-gray-500">Active</p>
        </div>
      </Card>

      {/* Battery Status */}
      <Card className="p-4 flex items-center gap-3 bg-white shadow rounded-lg">
        <Image src="/battery.png" alt="Battery" width={30} height={30} />
        <p className="text-lg font-semibold text-gray-900">73%</p>
      </Card>

      {/* Position & Details */}
      <Card className="p-4 bg-white shadow rounded-lg">
        <p className="text-sm text-gray-500">Position:</p>
        <p className="text-lg font-semibold text-gray-900">
          Lat: 45.678, Lon: -123.456
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Speed: <span className="text-gray-900">12 m/s</span>
        </p>
        <p className="text-sm text-gray-500">
          Altitude: <span className="text-gray-900">50m</span>
        </p>
      </Card>
    </div>
  );
}
