import { useState, useEffect } from "react";
import { BottomNav } from "../components/BottomNav";
import { UserSwitcher } from "../components/UserSwitcher";
import { useUser } from "../context/UserContext";
import { PlaceCard } from "../components/PlaceCard";
import { X, Heart, RotateCcw, Trash2, MapPin, Plus, Upload } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Button } from "../components/ui/button";

interface Place {
  id: number;
  name: string;
  location: string;
  image: string;
  description: string;
  rating: number;
  isCustom?: boolean;
  likes?: number;
}

export default function Favorites() {
  const { currentUser } = useUser();
  const [customPlaces, setCustomPlaces] = useState<Place[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showSwipeView, setShowSwipeView] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  // Changed: placeLikes now stores arrays of user IDs instead of counts
  const [placeLikes, setPlaceLikes] = useState<Record<number, string[]>>({});
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
  const [selectedPlaceForDetail, setSelectedPlaceForDetail] = useState<Place | null>(null);
  
  const MAX_DESCRIPTION_CHARS = 100;
  
  // Form state for adding a new place
  const [newPlace, setNewPlace] = useState({
    name: "",
    location: "",
    image: "",
    description: "",
  });

  useEffect(() => {
    // Load custom places
    const storedCustom = localStorage.getItem("customPlaces");
    if (storedCustom) {
      const places = JSON.parse(storedCustom);
      setCustomPlaces(places);
    }

    // Load swipe progress
    const swipeProgress = localStorage.getItem("swipeProgress");
    if (swipeProgress) {
      const progress = parseInt(swipeProgress);
      setCurrentIndex(progress);
    }

    // Load likes count and migrate old format to new format
    const storedLikes = localStorage.getItem("placeLikes");
    if (storedLikes) {
      const parsed = JSON.parse(storedLikes);
      // Check if we need to migrate from old format (numbers) to new format (arrays)
      const needsMigration = Object.values(parsed).some(val => typeof val === 'number');
      
      if (needsMigration) {
        // Migration: convert old numeric counts to empty arrays
        // (we can't recover which users liked what, so reset to empty)
        const migratedLikes: Record<number, string[]> = {};
        Object.keys(parsed).forEach(key => {
          migratedLikes[parseInt(key)] = [];
        });
        setPlaceLikes(migratedLikes);
        localStorage.setItem("placeLikes", JSON.stringify(migratedLikes));
      } else {
        setPlaceLikes(parsed);
      }
    }

    // Determine if we should show swipe view
    const stored = localStorage.getItem("customPlaces");
    const storedProgress = localStorage.getItem("swipeProgress");
    if (stored && storedProgress) {
      const places = JSON.parse(stored);
      const progress = parseInt(storedProgress);
      setShowSwipeView(progress < places.length);
    }
  }, []);

  const handleSwipe = (direction: "left" | "right") => {
    const currentPlace = customPlaces[currentIndex];
    
    if (direction === "right") {
      // Only add like if this place hasn't been liked yet by the current user
      const likes = placeLikes[currentPlace.id] || [];
      if (!likes.includes(currentUser)) {
        const updatedLikes = { ...placeLikes };
        updatedLikes[currentPlace.id] = [...likes, currentUser];
        setPlaceLikes(updatedLikes);
        localStorage.setItem("placeLikes", JSON.stringify(updatedLikes));
      }
    } else if (direction === "left") {
      // Remove like if the user previously liked this place
      const likes = placeLikes[currentPlace.id] || [];
      if (likes.includes(currentUser)) {
        const updatedLikes = { ...placeLikes };
        updatedLikes[currentPlace.id] = likes.filter(id => id !== currentUser);
        setPlaceLikes(updatedLikes);
        localStorage.setItem("placeLikes", JSON.stringify(updatedLikes));
      }
    }

    const nextIndex = currentIndex + 1;
    setTimeout(() => {
      setCurrentIndex(nextIndex);
      localStorage.setItem("swipeProgress", nextIndex.toString());
      
      if (nextIndex >= customPlaces.length) {
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
    // Keep existing likes and place likes intact
  };

  const removePlace = (id: number) => {
    const updatedCustom = customPlaces.filter((place) => place.id !== id);
    setCustomPlaces(updatedCustom);
    localStorage.setItem("customPlaces", JSON.stringify(updatedCustom));

    // Remove likes
    const updatedLikes = { ...placeLikes };
    delete updatedLikes[id];
    setPlaceLikes(updatedLikes);
    localStorage.setItem("placeLikes", JSON.stringify(updatedLikes));

    // Reset swipe if needed
    if (currentIndex > updatedCustom.length) {
      setCurrentIndex(0);
      localStorage.setItem("swipeProgress", "0");
    }
  };

  const handleAddPlace = () => {
    if (!newPlace.name || !newPlace.location || !newPlace.description) {
      return;
    }

    const newId = Date.now();
    const placeToAdd: Place = {
      id: newId,
      name: newPlace.name,
      location: newPlace.location,
      image: newPlace.image || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmF2ZWwlMjBkZXN0aW5hdGlvbnxlbnwxfHx8fDE3NzI1NzIwODR8MA&ixlib=rb-4.1.0&q=80&w=1080",
      description: newPlace.description,
      rating: 0,
      isCustom: true,
    };

    const updatedCustom = [...customPlaces, placeToAdd];
    setCustomPlaces(updatedCustom);
    localStorage.setItem("customPlaces", JSON.stringify(updatedCustom));

    setNewPlace({
      name: "",
      location: "",
      image: "",
      description: "",
    });
    setIsAddDialogOpen(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("Image must be smaller than 2MB. Please choose a smaller image.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setNewPlace({ ...newPlace, image: base64String });
    };
    reader.readAsDataURL(file);
  };

  const startSwiping = () => {
    setCurrentIndex(0);
    setShowSwipeView(true);
    setPlaceLikes({});
    localStorage.setItem("swipeProgress", "0");
    localStorage.setItem("placeLikes", JSON.stringify({}));
  };

  // Swipe View
  if (showSwipeView && currentIndex < customPlaces.length) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 pb-24">
        <div className="max-w-md mx-auto p-5">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Places</h1>
            <p className="text-gray-600 text-lg">
              Swipe right to like, left to pass
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-4">
            <button
              onClick={() => setIsAddDialogOpen(true)}
              className="flex-1 bg-purple-600 text-white py-4 rounded-2xl text-lg font-semibold hover:bg-purple-700 transition shadow-md flex items-center justify-center gap-2"
            >
              <Plus size={24} strokeWidth={2.5} />
              Add Place
            </button>
            <button
              onClick={() => {
                setCurrentIndex(customPlaces.length);
                setShowSwipeView(false);
                localStorage.setItem("swipeProgress", customPlaces.length.toString());
              }}
              className="flex-1 bg-white text-purple-600 border-2 border-purple-600 py-4 rounded-2xl text-lg font-semibold hover:bg-purple-50 transition shadow-md flex items-center justify-center gap-2"
            >
              Show Results
            </button>
          </div>

          {/* Card Stack */}
          <div className="relative h-[500px] -mb-4">
            <AnimatePresence>
              {customPlaces.map(
                (place, index) =>
                  index >= currentIndex &&
                  index < currentIndex + 3 && (
                    <PlaceCard
                      key={place.id}
                      place={place}
                      onSwipe={handleSwipe}
                      style={{
                        zIndex: customPlaces.length - index,
                        scale: 1 - (index - currentIndex) * 0.05,
                        y: (index - currentIndex) * 10,
                      }}
                    />
                  )
              )}
            </AnimatePresence>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-6 mb-4">
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
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-200">
            <p className="text-lg font-semibold text-gray-900">
              {currentIndex} / {customPlaces.length} <span className="text-gray-500">viewed</span>
            </p>
            <p className="text-sm text-gray-600 mt-1">{Object.values(placeLikes).flat().length} places liked</p>
          </div>
        </div>
        <BottomNav />

        {/* Add Place Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-md bg-white rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Add a New Place</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="name" className="text-base font-semibold">
                  Place Name *
                </Label>
                <Input
                  id="name"
                  value={newPlace.name}
                  onChange={(e) => setNewPlace({ ...newPlace, name: e.target.value })}
                  placeholder="e.g., Grand Canyon"
                  className="mt-2 rounded-xl border-gray-300"
                />
              </div>
              <div>
                <Label htmlFor="location" className="text-base font-semibold">
                  Location *
                </Label>
                <Input
                  id="location"
                  value={newPlace.location}
                  onChange={(e) => setNewPlace({ ...newPlace, location: e.target.value })}
                  placeholder="e.g., Arizona, USA"
                  className="mt-2 rounded-xl border-gray-300"
                />
              </div>
              <div>
                <Label className="text-base font-semibold">
                  Image
                </Label>
                <div className="mt-2 space-y-3">
                  {newPlace.image && (
                    <div className="relative w-full h-40 rounded-xl overflow-hidden border border-gray-300">
                      <img
                        src={newPlace.image}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => setNewPlace({ ...newPlace, image: "" })}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                  
                  <label
                    htmlFor="image-upload"
                    className="flex items-center justify-center gap-2 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-xl cursor-pointer transition border border-gray-300"
                  >
                    <Upload size={18} />
                    {newPlace.image ? "Change Image" : "Upload Image"}
                  </label>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <p className="text-xs text-gray-500">Max 2MB • JPG, PNG, or GIF</p>
                </div>
              </div>
              <div>
                <Label htmlFor="description" className="text-base font-semibold">
                  Description *
                </Label>
                <Textarea
                  id="description"
                  value={newPlace.description}
                  onChange={(e) => setNewPlace({ ...newPlace, description: e.target.value })}
                  placeholder="Tell your group why you want to visit this place..."
                  className="mt-2 rounded-xl border-gray-300 min-h-24"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    setNewPlace({ name: "", location: "", image: "", description: "" });
                  }}
                  className="flex-1 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddPlace}
                  disabled={!newPlace.name || !newPlace.location || !newPlace.description}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white rounded-xl"
                >
                  Add Place
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Summary View (Main Screen)
  const sortedPlaces = [...customPlaces].sort((a, b) => (placeLikes[b.id]?.length || 0) - (placeLikes[a.id]?.length || 0));
  const hasSwipedThrough = currentIndex >= customPlaces.length && customPlaces.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-24">
      <div className="max-w-md mx-auto p-5">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Places</h1>
          <p className="text-gray-600 text-lg">
            {customPlaces.length === 0 
              ? "Add places your group wants to explore"
              : hasSwipedThrough
                ? "Here's what your group likes"
                : "Your saved places"
            }
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setIsAddDialogOpen(true)}
            className="flex-1 bg-purple-600 text-white py-4 rounded-2xl text-lg font-semibold hover:bg-purple-700 transition shadow-md flex items-center justify-center gap-2"
          >
            <Plus size={24} strokeWidth={2.5} />
            Add Place
          </button>
          {customPlaces.length > 0 && (
            <>
              {hasSwipedThrough ? (
                <button
                  onClick={resetCards}
                  className="flex-1 bg-white text-purple-600 border-2 border-purple-600 py-4 rounded-2xl text-lg font-semibold hover:bg-purple-50 transition shadow-md flex items-center justify-center gap-2"
                >
                  <RotateCcw size={20} />
                  Swipe Again
                </button>
              ) : (
                <button
                  onClick={startSwiping}
                  className="flex-1 bg-white text-purple-600 border-2 border-purple-600 py-4 rounded-2xl text-lg font-semibold hover:bg-purple-50 transition shadow-md flex items-center justify-center gap-2"
                >
                  <Heart size={20} />
                  Start Swiping
                </button>
              )}
            </>
          )}
        </div>

        {/* Empty State */}
        {customPlaces.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl p-8 border border-gray-200 shadow-sm">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin size={40} className="text-purple-600" />
            </div>
            <p className="text-2xl mb-3 font-bold">No places yet</p>
            <p className="text-gray-600 mb-6">
              Click "Add Place" above to get started
            </p>
          </div>
        ) : (
          <>
            {/* Places List */}
            <div className="space-y-4">
              {sortedPlaces.map((place) => {
                const likes = placeLikes[place.id]?.length || 0;
                const isLiked = placeLikes[place.id]?.includes(currentUser) || false;
                
                return (
                  <div
                    key={place.id}
                    className={`bg-white rounded-2xl overflow-hidden border-2 shadow-sm transition relative ${
                      isLiked ? 'border-purple-300 bg-purple-50/30' : 'border-gray-200'
                    }`}
                  >
                    <button
                      onClick={() => removePlace(place.id)}
                      className="absolute top-2 right-2 z-10 w-6 h-6 bg-gray-400/80 hover:bg-red-500 text-white rounded-full flex items-center justify-center transition shadow-sm"
                    >
                      <Trash2 size={12} />
                    </button>
                    <div className="flex gap-3 p-3">
                      <img
                        src={place.image}
                        alt={place.name}
                        className="w-20 h-20 object-cover rounded-xl flex-shrink-0"
                      />
                      <div className="flex-1 pr-6 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="text-lg font-bold break-words leading-tight flex-1 line-clamp-2" style={{ overflowWrap: 'anywhere' }}>{place.name}</h3>
                          <button
                            onClick={() => {
                              if (isLiked) {
                                // Unlike: remove from likedPlaces and decrement count
                                const updatedLikes = { ...placeLikes };
                                updatedLikes[place.id] = updatedLikes[place.id]?.filter(id => id !== currentUser) || [];
                                setPlaceLikes(updatedLikes);
                                localStorage.setItem("placeLikes", JSON.stringify(updatedLikes));
                              } else {
                                // Like: add to likedPlaces and increment count
                                const updatedLikes = { ...placeLikes };
                                updatedLikes[place.id] = [...(updatedLikes[place.id] || []), currentUser];
                                setPlaceLikes(updatedLikes);
                                localStorage.setItem("placeLikes", JSON.stringify(updatedLikes));
                              }
                            }}
                            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold shadow-sm flex-shrink-0 transition ${
                              isLiked 
                                ? 'bg-purple-600 text-white hover:bg-purple-700' 
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            <Heart size={12} fill={isLiked ? "white" : "none"} />
                            {likes}
                          </button>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600 text-xs mb-2">
                          <MapPin size={12} />
                          <span className="break-words line-clamp-1" style={{ overflowWrap: 'anywhere' }}>{place.location}</span>
                        </div>
                        <p className="text-gray-700 text-xs leading-relaxed break-words line-clamp-1 mb-1" style={{ overflowWrap: 'anywhere' }}>
                          {place.description}
                        </p>
                        <button
                          onClick={() => setSelectedPlaceForDetail(place)}
                          className="text-purple-600 hover:text-purple-700 text-xs font-semibold transition"
                        >
                          see more
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
      <BottomNav />

      {/* Place Detail Modal */}
      {selectedPlaceForDetail && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPlaceForDetail(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full max-h-[80vh] overflow-y-auto shadow-2xl hide-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <img
                src={selectedPlaceForDetail.image}
                alt={selectedPlaceForDetail.name}
                className="w-full h-64 object-cover"
              />
              <button
                onClick={() => setSelectedPlaceForDetail(null)}
                className="absolute top-4 right-4 bg-white/90 hover:bg-white text-gray-900 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <h2 className="text-3xl font-bold mb-2 break-words" style={{ overflowWrap: 'anywhere' }}>{selectedPlaceForDetail.name}</h2>
              <p className="text-gray-600 text-lg mb-4 break-words" style={{ overflowWrap: 'anywhere' }}>{selectedPlaceForDetail.location}</p>
              {selectedPlaceForDetail.rating > 0 && (
                <div className="flex items-center mb-6">
                  <span className="text-2xl">⭐</span>
                  <span className="ml-2 text-xl font-semibold">{selectedPlaceForDetail.rating}</span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="font-semibold text-lg mb-2">Description</h3>
                <p className="text-gray-700 text-base leading-relaxed break-words" style={{ overflowWrap: 'anywhere' }}>
                  {selectedPlaceForDetail.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Place Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md bg-white rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Add a New Place</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="name" className="text-base font-semibold">
                Place Name *
              </Label>
              <Input
                id="name"
                value={newPlace.name}
                onChange={(e) => setNewPlace({ ...newPlace, name: e.target.value })}
                placeholder="e.g., Grand Canyon"
                className="mt-2 rounded-xl border-gray-300"
              />
            </div>
            <div>
              <Label htmlFor="location" className="text-base font-semibold">
                Location *
              </Label>
              <Input
                id="location"
                value={newPlace.location}
                onChange={(e) => setNewPlace({ ...newPlace, location: e.target.value })}
                placeholder="e.g., Arizona, USA"
                className="mt-2 rounded-xl border-gray-300"
              />
            </div>
            <div>
              <Label className="text-base font-semibold">
                Image
              </Label>
              <div className="mt-2 space-y-3">
                {newPlace.image && (
                  <div className="relative w-full h-40 rounded-xl overflow-hidden border border-gray-300">
                    <img
                      src={newPlace.image}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => setNewPlace({ ...newPlace, image: "" })}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
                
                <label
                  htmlFor="image-upload"
                  className="flex items-center justify-center gap-2 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-xl cursor-pointer transition border border-gray-300"
                >
                  <Upload size={18} />
                  {newPlace.image ? "Change Image" : "Upload Image"}
                </label>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <p className="text-xs text-gray-500">Max 2MB • JPG, PNG, or GIF</p>
              </div>
            </div>
            <div>
              <Label htmlFor="description" className="text-base font-semibold">
                Description *
              </Label>
              <Textarea
                id="description"
                value={newPlace.description}
                onChange={(e) => setNewPlace({ ...newPlace, description: e.target.value })}
                placeholder="Tell your group why you want to visit this place..."
                className="mt-2 rounded-xl border-gray-300 min-h-24"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddDialogOpen(false);
                  setNewPlace({ name: "", location: "", image: "", description: "" });
                }}
                className="flex-1 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddPlace}
                disabled={!newPlace.name || !newPlace.location || !newPlace.description}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white rounded-xl"
              >
                Add Place
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}