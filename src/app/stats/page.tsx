'use client';

import { useEffect, useState } from 'react';

const colors = [
  'bg-red-500', 'bg-purple-500', 'bg-blue-500', 'bg-teal-500', 'bg-green-500',
  'bg-yellow-500', 'bg-orange-500', 'bg-pink-500', 'bg-indigo-500', 'bg-cyan-500'
];

const StatsComp = () => {
  const [data, setData] = useState({
    Roll: 1500,
    Pitch: 1500,
    Yaw: 1500,
    Throttle: 1000,
    'AUX 1': 1500,
    'AUX 2': 750,
    'AUX 3': 750,
    'AUX 4': 750,
    'AUX 5': 750,
    'AUX 6': 750
  });

  useEffect(() => {
    const ws = new WebSocket('ws://192.168.0.105:8000/ws/2');

    ws.onopen = () => {
      console.log('Connected to WebSocket');
      ws.send(JSON.stringify({ command: 'ARM', value: 1500 }));
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        setData((prevData) => ({ ...prevData, ...message }));
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = () => console.log('WebSocket Disconnected');
    ws.onerror = (error) => console.error('WebSocket Error:', error);

    return () => ws.close();
  }, []);

  return (
    <div className="w-full max-w-md mx-auto p-4">
      {Object.entries(data).map(([key, value], index) => (
        <div key={key} className="mb-2">
          <div className="flex justify-between text-sm font-medium">
            <span>{key}</span>
            <span>{value}</span>
          </div>
          <div className="w-full h-4 bg-gray-200 rounded-md overflow-hidden">
            <div
              className={`h-full transition-all ${colors[index % colors.length]}`}
              style={{ width: `${(value / 2000) * 100}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsComp;