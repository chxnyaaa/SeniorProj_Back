import db from "../lib/db.js"
import constantEpisode from "../lib/constantEpisode.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import logger from '../utils/logger.js';
import ApiResponse from '../utils/response.js';
import axios from "axios";
import fs from "fs";
import path from "path";

export const getEpisodeProduct = async (req, res) => {
    try {
        const { BookId } = req.params;
        const [rows] = await db.query(constantEpisode.getEpisodeByBookIdQuery, [BookId]);
        return ApiResponse.success(res, rows, 200, 'Episodes retrieved successfully');
    } catch (error) {
        logger.error("Error fetching episodes:", error);
        return ApiResponse.error(res, "Failed to fetch episodes", 500, 'error');
    }
}

export const getEpisodeID = async (req, res) => {
    try {
        const { BookId, EpisodeId } = req.params;
        const [rows] = await db.query(constantEpisode.getEpisodeByIdQuery, [BookId, EpisodeId]);
        if (rows.length === 0) {
            return ApiResponse.error(res, "Episode not found", 404, 'error');
        }
        // ต้องการแทนค่าตัวแปรที่ rows[0].audio_url เป็น sample.mp3
       rows[0].audio_id = 'sample.mp3';

        return ApiResponse.success(res, rows[0], 200, 'Episode retrieved successfully');
    } catch (error) {
        logger.error("Error fetching episode by ID:", error);
        return ApiResponse.error(res, "Failed to fetch episode", 500, 'error');
    }
}
export const CreateEpisode = async (req, res) => {
  try {
    // ดึงข้อมูลจาก body
    const { book_id, user_id, title, content, is_free, price, release_date, status, priority } = req.body;

    if (!book_id || !user_id || !title || !content) {
      return ApiResponse.error(res, "Book ID, User ID, Title, and Content are required", 400, 'error');
    }
    // ดึงไฟล์ cover จาก req.files (ถ้ามี)
    const coverFile = req.files?.cover?.[0];

    // ถ้าไม่มีไฟล์ cover ส่ง error กลับ
    if (!coverFile) {
      return ApiResponse.error(res, "Cover file is required", 400, 'error');
    }

    // ตั้งชื่อไฟล์ cover ที่จะใช้เก็บในฐานข้อมูล
    const cover = coverFile.filename;
    let  set_is_free = false;
    if(price == 0) {
      set_is_free = true;
    }


    // call API bot noi เพื่อแปลง เนื้อหาเป็นเสียง (content)
    // const audioResponse = await callBotNoiAPI(content);
    // return ApiResponse.success(res,'', 201, 'success');

    // เตรียม query และค่าที่จะใส่
    const query = constantEpisode.addEpisodeQuery;
    const values = [
      book_id,
      user_id,
      title,
      content,
      set_is_free,
      price || 0,
      cover,
      release_date,
      status || 'draft',
      priority || 1
    ];


    // รัน query insert
    const [result] = await db.query(query, values);
    //  call Bot Noi API to generate audio if content is provided
    if (content) {
      req.body.EpisodeId = result.insertId; // ส่ง EpisodeId ไปยัง API
      const audioResponse = await callBotNoiAPI(req, res);
      if (audioResponse.status !== 200) {
        return ApiResponse.error(res, "Failed to generate audio", audioResponse.status, 'error');
      }
    }

    // ส่ง response สำเร็จพร้อม id ที่สร้าง
    return ApiResponse.success(res, { id: result.insertId, message: "Episode created successfully" }, 201, 'success');
  } catch (error) {
    logger.error("Error creating episode:", error);
    return ApiResponse.error(res, "Failed to create episode", 500, 'error');
  }
}


export const UpdateEpisode = async (req, res) => {
    try {
        const { EpisodeId } = req.params;
        const { title, content, price, release_date, status, priority } = req.body;
        const episodeFile = req.files?.['cover']?.[0];

        let episodes;

        if (episodeFile) {
            // ถ้ามีไฟล์แนบมา ใช้ไฟล์ใหม่
            episodes = episodeFile.filename;
        } else {
            // ถ้าไม่มีไฟล์แนบมา ดึงชื่อไฟล์เดิมจากฐานข้อมูล
            const [existing] = await db.query('SELECT cover FROM episodes WHERE id = ?', [EpisodeId]);

            if (existing.length === 0) {
                return ApiResponse.error(res, "Episode not found", 404, 'error');
            }

            episodes = existing[0].cover;
        }

        const query = constantEpisode.updateEpisodeQuery;
        const values = [title, content, episodes, price, release_date, status, priority, EpisodeId];
        await db.query(query, values);


        //เช็คก่อนว่า content ซ้ำกับอันเดิมไหม ถ้า ซ้ำไม่ต้องทำ Bot Noi
        const [existingContent] = await db.query('SELECT content FROM episodes WHERE id = ?', [EpisodeId]);
        if (existingContent.length > 0 && existingContent[0].content === content) {
            logger.info(`✅ Content is duplicate → EpisodeId=${EpisodeId}, skipping Bot Noi API.`);
        } else {
            //  call Bot Noi API to generate audio if content is provided
            if (content) {
                req.body.EpisodeId = EpisodeId; // ส่ง EpisodeId ไปยัง API
                const audioResponse = await callBotNoiAPI(req, res);
                if (audioResponse.status !== 200) {
                    return ApiResponse.error(res, "Failed to generate audio", audioResponse.status, 'error');
                }
            }
        }

        return ApiResponse.success(res, { message: "Episode updated successfully" }, 200, 'success');
    } catch (error) {
        logger.error("Error updating episode:", error);
        return ApiResponse.error(res, "Failed to update episode", 500, 'error');
    }
};

export const callBotNoiAPI = async (req, res) => {
  try {
    const { EpisodeId, content, language = "en", speaker = "1" } = req.body

    if( !EpisodeId || !content) {
      return ApiResponse.error(res, "Episode ID and Content are required", 400, "error")
    }

    const urlBoyNoi = "https://api-voice.botnoi.ai/openapi/v1/generate_audio"
    // เรียก Bot Noi API
    const response = await axios.post(
      urlBoyNoi,
      {
        text: content,
        speaker,
        volume: 1,
        speed: 1,
        type_media: "mp3",
        save_file: "true",
        language,
        page: "user",
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Botnoi-Token": process.env.BOTNOI_API_KEY, // ใช้ ENV เก็บ token
        },
      }
    )

    const result = response.data
    // insert log API request
    await db.query(`
      INSERT INTO log_api_requests (api_endpoint, request_headers, request_payload, response_headers, response_payload, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      urlBoyNoi,
      JSON.stringify(req.headers),
      JSON.stringify(req.body),
      JSON.stringify(response.headers),
      JSON.stringify(result),
      response.status
    ]
    );

    // ✅ ตรวจว่ามี base64 หรือไม่
    if (!result.audio_url) {
      return ApiResponse.error(res, "Audio URL not found in response", 500, "error")
    }

    // update audio_url in table episodes 
    const resEpisode = await db.query( constantEpisode.updateAudioUrlQuery, 
      [result.audio_url, EpisodeId]
    );
    if (resEpisode[0].affectedRows === 0) {
      return ApiResponse.error(res, "Failed to update episode audio URL", 500, "error")
    }

    // ส่ง response กลับไป
    return ApiResponse.success(res, result, 200, "Audio generated successfully");

  } catch (error) {
    console.error("Bot Noi API error:", error.response?.data || error.message)
    return ApiResponse.error(res, "Failed to generate audio", 500, "error")
  }
}
