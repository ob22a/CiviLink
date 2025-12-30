export const healthCheck = (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: "ok",
      uptime: process.uptime()
    },
    error: null
  });
};