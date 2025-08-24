const USER_NAMES = ["alpha123", "blueTiger", "novaSky", "echoFox", "pixelBee"];

export const pickRandomName = () =>
  USER_NAMES[Math.floor(Math.random() * USER_NAMES.length)];
