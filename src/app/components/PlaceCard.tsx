import { motion, useMotionValue, useTransform } from "motion/react";
import { X, Heart } from "lucide-react";

interface PlaceCardProps {
  place: {
    id: number;
    name: string;
    location: string;
    image: string;
    description: string;
    rating: number;
  };
  onSwipe: (direction: "left" | "right") => void;
  style?: React.CSSProperties;
}

export function PlaceCard({ place, onSwipe, style }: PlaceCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  const handleDragEnd = (_: any, info: any) => {
    if (Math.abs(info.offset.x) > 100) {
      onSwipe(info.offset.x > 0 ? "right" : "left");
    }
  };

  return (
    <motion.div
      className="absolute w-full"
      style={{
        x,
        rotate,
        opacity,
        cursor: "grab",
        ...style,
      }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      whileDrag={{ cursor: "grabbing" }}
    >
      <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-200">
        <div className="relative h-96">
          <img
            src={place.image}
            alt={place.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h3 className="text-3xl font-bold mb-1">{place.name}</h3>
            <p className="text-lg">{place.location}</p>
            <div className="flex items-center mt-2">
              <span className="text-2xl">⭐</span>
              <span className="ml-2 text-xl font-semibold">{place.rating}</span>
            </div>
          </div>
        </div>
        <div className="p-6">
          <p className="text-gray-700 text-lg">{place.description}</p>
        </div>
      </div>

      {/* Swipe indicators */}
      <motion.div
        className="absolute top-12 left-12 bg-red-500 text-white px-6 py-3 rounded-2xl text-2xl font-bold rotate-[-20deg] shadow-xl"
        style={{
          opacity: useTransform(x, [-100, 0], [1, 0]),
        }}
      >
        <X size={32} />
      </motion.div>
      <motion.div
        className="absolute top-12 right-12 bg-purple-600 text-white px-6 py-3 rounded-2xl text-2xl font-bold rotate-[20deg] shadow-xl"
        style={{
          opacity: useTransform(x, [0, 100], [0, 1]),
        }}
      >
        <Heart size={32} />
      </motion.div>
    </motion.div>
  );
}