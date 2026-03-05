import {
  motion,
  useMotionValue,
  useTransform,
} from "motion/react";
import { X, Heart } from "lucide-react";
import { useState } from "react";

interface PlaceCardProps {
  place: {
    id: number;
    name: string;
    location: string;
    image: string;
    description: string;
  };
  onSwipe: (direction: "left" | "right") => void;
  style?: React.CSSProperties;
}

export function PlaceCard({
  place,
  onSwipe,
  style,
}: PlaceCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(
    x,
    [-200, -100, 0, 100, 200],
    [0, 1, 1, 1, 0],
  );
  const [showDetailModal, setShowDetailModal] = useState(false);

  const handleDragEnd = (_: any, info: any) => {
    if (Math.abs(info.offset.x) > 100) {
      onSwipe(info.offset.x > 0 ? "right" : "left");
    }
  };

  const MAX_DESCRIPTION_CHARS = 120;
  const needsTruncation =
    place.description.length > MAX_DESCRIPTION_CHARS;
  const displayDescription = needsTruncation
    ? place.description.slice(0, MAX_DESCRIPTION_CHARS) + "..."
    : place.description;

  return (
    <>
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
        <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-200 flex flex-col">
          <div className="relative h-80 flex-shrink-0">
            <img
              src={place.image}
              alt={place.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-10">
              <h3
                className="text-3xl font-bold mb-2 break-words leading-tight"
                style={{
                  overflowWrap: "anywhere",
                  wordBreak: "break-word",
                }}
              >
                {place.name}
              </h3>
              <p
                className="text-lg break-words"
                style={{
                  overflowWrap: "anywhere",
                  wordBreak: "break-word",
                }}
              >
                {place.location}
              </p>
            </div>
          </div>
          <div className="p-6">
            <p
              className="text-gray-700 text-base leading-relaxed break-words line-clamp-1 mb-3"
              style={{ overflowWrap: "anywhere" }}
            >
              {place.description}
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDetailModal(true);
              }}
              className="text-purple-600 hover:text-purple-700 font-semibold transition text-base"
            >
              see more
            </button>
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

      {/* Detail Modal */}
      {showDetailModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowDetailModal(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full max-h-[80vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <img
                src={place.image}
                alt={place.name}
                className="w-full h-64 object-cover"
              />
              <button
                onClick={() => setShowDetailModal(false)}
                className="absolute top-4 right-4 bg-white/90 hover:bg-white text-gray-900 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <h2
                className="text-3xl font-bold mb-2 break-words"
                style={{ overflowWrap: "anywhere" }}
              >
                {place.name}
              </h2>
              <p
                className="text-gray-600 text-lg mb-4 break-words"
                style={{ overflowWrap: "anywhere" }}
              >
                {place.location}
              </p>

              <div className="border-t border-gray-200 pt-4">
                <h3 className="font-semibold text-lg mb-2">
                  Description
                </h3>
                <p
                  className="text-gray-700 text-base leading-relaxed break-words"
                  style={{ overflowWrap: "anywhere" }}
                >
                  {place.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}