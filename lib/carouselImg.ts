import { collection, getDocs } from "firebase/firestore";
import { firestore } from "./firebaseConfig";

const LOCAL_STORAGE_KEY = "carousel_images";

export const getCarouselImages = async () => {
  try {
    // Step 1: Clear localStorage on every load
    localStorage.removeItem(LOCAL_STORAGE_KEY);

    // Step 2: Fetch images from Firestore
    const carouselCollection = collection(firestore, "carousel");
    const snapshot = await getDocs(carouselCollection);

    const images = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Step 3: Store fetched images in localStorage
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(images));

    // Step 4: Return the images
    return images;
  } catch (error) {
    console.error("Error fetching carousel images:", error);
    throw error;
  }
};
