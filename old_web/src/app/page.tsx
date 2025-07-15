import Image from "next/image";
import Keyboard from "@/components/keyboard-buttons";
export default function Home() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Virtual Keyboard</h1>
      <Keyboard />
    </div>
  );
}
