import { RouterProvider } from "react-router-dom";
import router from "./app/router"; // Import your router configuration

export default function App() {
  // Pass your router to the RouterProvider
  return <RouterProvider router={router} />;
}