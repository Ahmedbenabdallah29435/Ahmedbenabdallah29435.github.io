import kaboom from 'kaboom'; // Importing Kaboom from the installed npm package
import { scaleFactor } from "./constants";

export const k = kaboom({
  global: false,
  touchToMouse: true,
  canvas: document.getElementById("game"),
  debug: false, // set to false once ready for production
});
