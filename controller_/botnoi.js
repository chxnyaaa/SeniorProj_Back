// controllers/botnoiController.js
export const callBotNoiAPIHandler = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return ApiResponse.error(res, "Content is required", 400, 'error');
    }

    const audioUrl = await callBotNoiAPI(content);
    return ApiResponse.success(res, { audioUrl });
  } catch (error) {
    console.error(error);
    return ApiResponse.error(res, "Failed to generate audio", 500, 'error');
  }
};
