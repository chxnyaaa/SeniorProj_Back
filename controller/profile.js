import db from "../lib/db.js"
import constantProfile from "../lib/constantProfile.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import logger from '../utils/logger.js';
import ApiResponse from '../utils/response.js';

export const setPenName = async (req, res) => {
    try {
        const { pen_name, userId } = req.body;
        if (!pen_name) {
            return ApiResponse.error(res, 'Pen name is required', 400, 'error');
        }
        if (!userId) {
            return ApiResponse.error(res, 'User ID is required', 400, 'error');
        }
        //checkPenName
        const [existing] = await db.query(constantProfile.checkPenName, [pen_name, userId]);
        if (existing.length > 0) {
            return ApiResponse.error(res, 'Pen name already exists', 400, 'error');
        }
        await db.query(constantProfile.updateUserPenName, [pen_name, userId]);
        return ApiResponse.success(res, null, 200, 'Pen name updated successfully');
    } catch (err) {
        logger.error(`❌ Failed to update pen name: ${err.message}`);
        return ApiResponse.error(res, 'Server error', 500, 'error');
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { userId, username, role, pen_name } = req.body;

        if (!username) {
            return ApiResponse.error(res, 'Username is required', 400, 'error');
        }

        const [user] = await db.query(constantProfile.getUserById, [userId]);
        if (user.length === 0) {
            return ApiResponse.error(res, 'User not found', 404, 'error');
        }
        //checkPenName
        if (pen_name) {
            const [existing] = await db.query(constantProfile.checkPenName, [pen_name, userId]);
            if (existing.length > 0) {
                return ApiResponse.error(res, 'Pen name already exists', 400, 'error');
            }
        }

        const avatarFile = req.files?.avatar?.[0];
        const avatar = avatarFile ? avatarFile.filename : user[0].avatar;
        await db.query(constantProfile.updateUserProfile, [username, avatar, role, pen_name, userId]);

        return ApiResponse.success(res, null, 200, 'Profile updated successfully');
    } catch (err) {
        logger.error(`❌ Failed to update profile: ${err.message}`);
        return ApiResponse.error(res, 'Server error', 500, 'error');
    }
};



export const getUserProfile = async (req, res) => {
    try {
        const userId = req.params.id;
        const [user] = await db.query(constantProfile.getUserById, [userId]);
        if (user.length === 0) {
            return ApiResponse.error(res, 'User not found', 404, 'error');
        }
        return ApiResponse.success(res, user[0], 200, 'User profile retrieved successfully');
    } catch (err) {
        logger.error(`❌ Failed to get user profile: ${err.message}`);
        return ApiResponse.error(res, 'Server error', 500, 'error');
    }
};
