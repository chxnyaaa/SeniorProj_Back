import db from "../lib/db.js";
import constantEpisode  from "../lib/constant_episode.js";
import logger from '../utils/logger.js';
import e from "express";

export const getEpisodeProduct = async (req, res) => {
  try {
    const { product } = req.params;
    const [result] = await db.query(constantEpisode.GetEpisodesByBookId, [product]);

    if (result.length === 0) {
        let set_res = {
            statusCode: 404,
            message: "No episodes found for this product.",
            data: null
        }
      return res.status(404).json(set_res);
    }

    let set_res = {
      statusCode: 200,
      message: "Episodes fetched successfully.",
      data: result
    }
    res.json(set_res);

  } catch (error) {
    let set_res = {
      statusCode: 500,
      message: "Internal server error.",
      data: null
    }
    logger.error("Error fetching episodes:", error);
    res.status(500).json(set_res);
  }
}
export const getEpisodeID = async (req, res) => {
  try {
    const { product, count } = req.params;
    
    const [rows] = await db.query(constantEpisode.GetEpisodesByBookIdWithLimit, [product, count]);

    if (rows.length === 0) {
        let set_res = {
            statusCode: 404,
            message: "No episodes found for this product.",
            data: null
        }
      return res.status(404).json(set_res);
    }

    let set_res = {
      statusCode: 200,
      message: "Episodes fetched successfully.",
      data: rows
    }
    res.json(set_res);
  } catch (error) {
    let set_res = {
      statusCode: 500,
      message: "Internal server error.",
      data: null
    }
    logger.error("Error fetching episodes by ID:", error);
    res.status(500).json(set_res);
  }
}
export const CreateEpisode = async (req, res) => {
    try {
        const { title, content_text, book_id, release_date, status, price } = req.body;
        const cover_url = req.files.cover ? `/uploads/episode_images/${req.files.cover[0].filename}` : null;
        const audio_url = req.files.audio ? `/uploads/episode_audio/${req.files.audio[0].filename}` : null;
        const file_url = req.files.file ? `/uploads/episode_documents/${req.files.file[0].filename}` : null;

        const [result] = await db.query(constantEpisode.CreateEpisode, [
            book_id, title, content_text, cover_url, audio_url, file_url, release_date, status, price
        ]);
        if (result.affectedRows === 0) {
            let set_res = {
                statusCode: 400,
                message: "Failed to create episode.",
                data: null
            }
            return res.status(400).json(set_res);
        }
        let set_res = {
            statusCode: 201,
            message: "Episode created successfully.",
            data: { id: result.insertId }
        }
        res.status(201).json(set_res);
    } catch (error) {
        let set_res = {
            statusCode: 500,
            message: "Internal server error.",
            data: null
        }
        logger.error("Error creating episode:", error);
        res.status(500).json(set_res);
    }
}
export const UpdateEpisode = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      content_text,
      book_id,
      release_date,
      status,
      price,
      cover_url: bodyCoverUrl,
      file_url: bodyFileUrl,
      audio_url: bodyAudioUrl,
    } = req.body;

    const cover_url = req.files?.cover
      ? `/uploads/episode_images/${req.files.cover[0].filename}`
      : bodyCoverUrl || null;

    const audio_url = req.files?.audio
      ? `/uploads/episode_audio/${req.files.audio[0].filename}`
      : bodyAudioUrl || null;

    const file_url = req.files?.file
      ? `/uploads/episode_documents/${req.files.file[0].filename}`
      : bodyFileUrl || null;

    const [result] = await db.query(constantEpisode.UpdateEpisode, [
      book_id,
      title,
      content_text,
      cover_url,
      audio_url,
      file_url,
      release_date,
      status,
      price,
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        statusCode: 404,
        message: "Episode not found or no changes made.",
        data: null,
      });
    }

    return res.status(200).json({
      statusCode: 200,
      message: "Episode updated successfully.",
      data: result,
    });
  } catch (error) {
    logger.error("Error updating episode:", error);
    return res.status(500).json({
      statusCode: 500,
      message: "Internal server error.",
      data: error.message,
    });
  }
};
