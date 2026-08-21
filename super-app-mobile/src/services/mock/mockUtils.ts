export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const simulateLatency = async (min = 300, max = 1500) => {
  const ms = Math.floor(Math.random() * (max - min + 1) + min);
  await delay(ms);
};

export const simulateNetworkError = (probability = 0) => {
  // Disabled random simulated errors for smooth local development
  return;
};
