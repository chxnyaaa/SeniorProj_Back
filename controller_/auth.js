import db from "../lib/db.js"
import constantAuth from "../lib/constantAuth.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import logger from '../utils/logger.js';
import ApiResponse from '../utils/response.js';


export const signup = async (req, res) => {
    try{
        const { username, email, password } = req.body
        if(!username || !email || !password){
            return ApiResponse.error(res, 'username, email, and password are required', 400, 'error');
        }
        const [reader] = await db.query(constantAuth.getUserByemail, [email])
        if(reader.length > 0){
            return ApiResponse.error(res, 'User already exists', 400, 'error');
        }
        const pen_name = null
        const Userrole = ""
        const hashedPassword = await bcrypt.hash(password, 10)
        await db.query(constantAuth.insertUsers, [username, email, hashedPassword, Userrole])
        return ApiResponse.success(res, null, 201, 'User created successfully');

    }catch(err){
        logger.error(`❌ Failed to create user: ${err.message}`);
        return ApiResponse.error(res, 'Server error', 500, 'error');
    }
};

export const login = async (req, res) => {
    try{
        const { email, password } = req.body
        if(!email || !password){
          return ApiResponse.error(res, 'Email or password is required', 400, 'error');
        }
        
        const [users] = await db.query(constantAuth.getUserByemail,[email]);
        const user = users[0];

        if (!user || user.status != "active") {
            return ApiResponse.error(res, 'User not found or inactive', 400, 'error');
        }

        const isMatch = await bcrypt.compare(password,user.password)
        if(!isMatch){
            return ApiResponse.error(res, 'Password invalid', 400, 'error');
        }

        const payload = {
            id: user.id,
            email : user.email,
            username: user.username,
            pen_name: user.pen_name || null, 
            role: user.role,
        }

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d'}, (err, token) => {
            if(err){
                return ApiResponse.error(res, 'JWT signing error', 500, 'error');
            }
            return ApiResponse.success(res, { payload, token }, 200, 'Login successful');
        })
    }catch(err){
        logger.error(`❌ Failed to login user: ${err.message}`);
        return ApiResponse.error(res, 'Server error', 500, 'error');
    }
};