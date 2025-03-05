import Map from "./Map";

export default function Home() {
  return (
    <div className="w-screen h-screen flex items-center justify-center bg-white">
      <div className="h-[80vh] w-[80vh] bg-gray-200 border-2 border-gray-700 flex items-center justify-center">
        <Map />
      </div>
    </div>
  );
}
