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
    const set_is_free = false;
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
        

        return ApiResponse.success(res, { message: "Episode updated successfully" }, 200, 'success');
    } catch (error) {
        logger.error("Error updating episode:", error);
        return ApiResponse.error(res, "Failed to update episode", 500, 'error');
    }
};


export const callBotNoiAPI = async (req, res) => {
  try {
    const { content, language = "th", speaker = "1" } = req.body

    if (!content) {
      return ApiResponse.error(res, "Content is required", 400, "error")
    }

    // เรียก Bot Noi API
    const response = await axios.post(
      "https://api.botnoi.ai/openapi/v1/generate_audio",
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
          "Botnoi-API-Key": process.env.BOTNOI_API_KEY,
        },
      }
    )

    const result = response.data

    return ApiResponse.success(res, {result}, 200, "success")

    // เช็คว่ามี base64 audio กลับมาหรือไม่
    // if (!result.audio_base64) {
    //   return ApiResponse.error(res, "No audio data returned from API", 500, "error")
    // }

    // สร้างโฟลเดอร์เก็บไฟล์ถ้ายังไม่มี
    // const audioDir = path.join(process.cwd(), "uploads", "audio")
    // if (!fs.existsSync(audioDir)) {
    //   fs.mkdirSync(audioDir, { recursive: true })
    // }

    // สร้างชื่อไฟล์แบบ unique
    const fileName = `tts_${Date.now()}.mp3`
    const filePath = path.join(audioDir, fileName)

    // เขียนไฟล์ mp3 จาก base64 ลงในโฟลเดอร์
    // fs.writeFileSync(filePath, Buffer.from(result.audio_base64, "base64"))

    // ตอบกลับข้อมูลให้ client
    // return ApiResponse.success(
    //   res,
    //   {
    //     text: result.text,
    //     file: `/uploads/audio/${fileName}`,
    //     audio_url: result.audio_url || null,
    //     language,
    //     speaker,
    //   },
    //   200,
    //   "success"
    // )
  } catch (error) {
    console.error("Bot Noi API error:", error)
    return ApiResponse.error(res, "Failed to generate audio", 500, "error")
  }
}
