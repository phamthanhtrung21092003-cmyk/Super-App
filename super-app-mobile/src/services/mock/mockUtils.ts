export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const simulateLatency = async (min = 300, max = 1500) => {
  const ms = Math.floor(Math.random() * (max - min + 1) + min);
  await delay(ms);
};

export const simulateNetworkError = (probability = 0.05) => {
  if (Math.random() < probability) {
    const errType = Math.random();
    if (errType < 0.33) {
      throw new Error('Network Error: Không thể kết nối máy chủ.');
    } else if (errType < 0.66) {
      const err: any = new Error('Unauthorized');
      err.response = { status: 401, data: { message: 'Phiên đăng nhập hết hạn.' } };
      throw err;
    } else {
      const err: any = new Error('Internal Server Error');
      err.response = { status: 500, data: { message: 'Lỗi hệ thống phía máy chủ.' } };
      throw err;
    }
  }
};
