import { useState, useEffect } from "react";
import { BottomNav } from "../components/BottomNav";
import { PlaceCard } from "../components/PlaceCard";
import { X, Heart, RotateCcw, Trash2, MapPin, Star } from "lucide-react";
import { AnimatePresence } from "motion/react";

interface Place {
  id: number;
  name: string;
  location: string;
  image: string;
  description: string;
  rating: number;
}

export default function Favorites() {
  const [places] = useState<Place[]>([
    {
      id: 1,
      name: "Eiffel Tower",
      location: "Champ de Mars, Paris",
      image: "https://images.unsplash.com/photo-1570097703229-b195d6dd291f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlaWZmZWwlMjB0b3dlciUyMHBhcmlzfGVufDF8fHx8MTc3MjUzMDAwNHww&ixlib=rb-4.1.0&q=80&w=1080",
      description: "Iconic iron lattice tower and global cultural icon of France",
      rating: 4.8,
    },
    {
      id: 2,
      name: "Louvre Museum",
      location: "Rue de Rivoli, Paris",
      image: "https://images.unsplash.com/photo-1567942585146-33d62b775db0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsb3V2cmUlMjBtdXNldW18ZW58MXx8fHwxNzcyNTcyMDgxfDA&ixlib=rb-4.1.0&q=80&w=1080",
      description: "World's largest art museum and historic monument in Paris",
      rating: 4.9,
    },
    {
      id: 3,
      name: "Montmartre",
      location: "18th arrondissement, Paris",
      image: "https://images.unsplash.com/photo-1623009070764-45002990256e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb250bWFydHJlJTIwcGFyaXN8ZW58MXx8fHwxNzcyNTcyMDgxfDA&ixlib=rb-4.1.0&q=80&w=1080",
      description: "Historic hilltop district known for its artistic history and Sacré-Cœur",
      rating: 4.7,
    },
    {
      id: 4,
      name: "Palace of Versailles",
      location: "Versailles, France",
      image: "https://images.unsplash.com/photo-1591828353335-197466da2a4e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2ZXJzYWlsbGVzJTIwcGFsYWNlfGVufDF8fHx8MTc3MjU3MjA4Mnww&ixlib=rb-4.1.0&q=80&w=1080",
      description: "Former royal residence with stunning gardens and Hall of Mirrors",
      rating: 4.8,
    },
    {
      id: 5,
      name: "Arc de Triomphe",
      location: "Place Charles de Gaulle, Paris",
      image: "https://images.unsplash.com/photo-1585831281105-1742c8c12bd8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcmMlMjB0cmlvbXBoZSUyMHBhcmlzfGVufDF8fHx8MTc3MjU3MjA4M3ww&ixlib=rb-4.1.0&q=80&w=1080",
      description: "Monumental arch honoring those who fought for France",
      rating: 4.6,
    },
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedPlaces, setLikedPlaces] = useState<number[]>([]);
  const [favorites, setFavorites] = useState<Place[]>([]);
  const [showSwipeView, setShowSwipeView] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("likedPlaces");
    if (stored) {
      const storedFavorites = JSON.parse(stored);
      setFavorites(storedFavorites);
      setLikedPlaces(storedFavorites.map((p: Place) => p.id));
    }

    // Check if all places have been swiped through
    const swipeProgress = localStorage.getItem("swipeProgress");
    if (swipeProgress) {
      const progress = parseInt(swipeProgress);
      setCurrentIndex(progress);
      if (progress >= places.length) {
        setShowSwipeView(false);
      }
    }
  }, [places.length]);

  const handleSwipe = (direction: "left" | "right") => {
    if (direction === "right") {
      const newLikedPlaces = [...likedPlaces, places[currentIndex].id];
      setLikedPlaces(newLikedPlaces);
      
      const existing = JSON.parse(localStorage.getItem("likedPlaces") || "[]");
      const updatedFavorites = [...existing, places[currentIndex]];
      localStorage.setItem("likedPlaces", JSON.stringify(updatedFavorites));
      setFavorites(updatedFavorites);
    }

    const nextIndex = currentIndex + 1;
    setTimeout(() => {
      setCurrentIndex(nextIndex);
      localStorage.setItem("swipeProgress", nextIndex.toString());
      
      if (nextIndex >= places.length) {
        setShowSwipeView(false);
      }
    }, 200);
  };

  const handleButtonSwipe = (direction: "left" | "right") => {
    handleSwipe(direction);
  };

  const resetCards = () => {
    setCurrentIndex(0);
    setShowSwipeView(true);
    localStorage.setItem("swipeProgress", "0");
  };

  const removeFromFavorites = (id: number) => {
    const updated = favorites.filter((place) => place.id !== id);
    setFavorites(updated);
    setLikedPlaces(updated.map(p => p.id));
    localStorage.setItem("likedPlaces", JSON.stringify(updated));
  };

  const viewResults = () => {
    setShowSwipeView(false);
  };

  if (showSwipeView && currentIndex < places.length) {
    // Swipe View
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 pb-24">
        <div className="max-w-md mx-auto p-5">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold mb-2">Discover Places</h1>
            <p className="text-gray-600 text-lg">
              Swipe right to like, left to pass
            </p>
          </div>

          {/* Card Stack */}
          <div className="relative h-[580px] mb-6">
            <AnimatePresence>
              {places.map(
                (place, index) =>
                  index >= currentIndex &&
                  index < currentIndex + 3 && (
                    <PlaceCard
                      key={place.id}
                      place={place}
                      onSwipe={handleSwipe}
                      style={{
                        zIndex: places.length - index,
                        scale: 1 - (index - currentIndex) * 0.05,
                        y: (index - currentIndex) * 10,
                      }}
                    />
                  )
              )}
            </AnimatePresence>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-6 mb-6">
            <button
              onClick={() => handleButtonSwipe("left")}
              className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition shadow-lg border-2 border-white"
            >
              <X size={32} className="text-white" strokeWidth={2.5} />
            </button>
            <button
              onClick={() => handleButtonSwipe("right")}
              className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center hover:bg-purple-700 transition shadow-lg border-2 border-white"
            >
              <Heart size={32} className="text-white" strokeWidth={2.5} />
            </button>
          </div>

          {/* Progress */}
          <div className="bg-white rounded-2xl p-4 mb-4 text-center shadow-sm border border-gray-200">
            <p className="text-lg font-semibold text-gray-900">
              {currentIndex} / {places.length} <span className="text-gray-500">viewed</span>
            </p>
            <p className="text-sm text-gray-600 mt-1">{likedPlaces.length} places liked</p>
          </div>

          {/* View Results Button */}
          {favorites.length > 0 && (
            <button
              onClick={viewResults}
              className="w-full bg-white text-purple-600 border-2 border-purple-600 font-semibold py-3 rounded-2xl text-lg hover:bg-purple-50 transition"
            >
              View Liked Places
            </button>
          )}
        </div>
        <BottomNav />
      </div>
    );
  }

  // Favorites List View
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-24">
      <div className="max-w-md mx-auto p-5">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Favorites</h1>
          <p className="text-gray-600 text-lg">
            Places your group wants to visit
          </p>
        </div>

        {/* Favorites List */}
        {favorites.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl p-8 border border-gray-200 shadow-sm">
            <p className="text-2xl mb-4 font-bold">No favorites yet</p>
            <p className="text-gray-600 mb-6">
              Start swiping to discover places you'd like to visit!
            </p>
            {currentIndex < places.length && (
              <button
                onClick={() => setShowSwipeView(true)}
                className="bg-purple-600 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-purple-700 transition shadow-md"
              >
                Start Swiping
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {favorites.map((place) => (
              <div
                key={place.id}
                className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm"
              >
                <div className="flex gap-4 p-4">
                  <img
                    src={place.image}
                    alt={place.name}
                    className="w-24 h-24 object-cover rounded-xl"
                  />
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-1">{place.name}</h3>
                    <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                      <MapPin size={14} />
                      <span>{place.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star size={16} className="text-purple-600" fill="rgb(147 51 234)" />
                      <span className="text-sm font-bold">{place.rating}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromFavorites(place.id)}
                    className="p-2 hover:bg-red-50 rounded-lg transition h-fit"
                  >
                    <Trash2 size={20} className="text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Group Voting Section */}
        {favorites.length > 0 && (
          <div className="mt-6 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-2xl font-bold mb-4 pb-3 border-b border-gray-100">Group Votes</h3>
            <p className="text-gray-600 mb-4">
              See which places everyone wants to visit
            </p>
            <div className="space-y-3">
              {favorites.slice(0, 3).map((place, index) => (
                <div key={place.id} className="flex items-center justify-between py-2">
                  <span className="text-lg font-semibold">{place.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="bg-purple-600 text-white px-4 py-2 rounded-full font-bold text-sm shadow-sm">
                      {index < 2 ? "2" : "1"} votes
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-5 space-y-3">
          {currentIndex < places.length && (
            <button
              onClick={() => setShowSwipeView(true)}
              className="w-full bg-purple-600 text-white font-semibold py-3 rounded-2xl text-lg hover:bg-purple-700 transition shadow-md"
            >
              Continue Swiping
            </button>
          )}
          {currentIndex >= places.length && (
            <button
              onClick={resetCards}
              className="w-full flex items-center justify-center gap-2 bg-white text-gray-900 border border-gray-300 font-semibold py-3 rounded-2xl text-lg hover:bg-gray-50 transition"
            >
              <RotateCcw size={20} />
              Start Over
            </button>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}