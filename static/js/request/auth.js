/**
 * auth.js - 认证相关的网络请求函数
 */

// API基础URL，后续可根据环境配置修改
const API_BASE_URL = '/api';

/**
 * 登录请求
 * @param {Object} loginData - 登录表单数据
 * @param {string} loginData.account - 账号
 * @param {string} loginData.password - 密码
 * @param {string} loginData.captcha - 验证码
 * @returns {Promise<Object>} - 返回登录结果
 */
async function login(loginData) {
    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData),
            credentials: 'include' // 包含Cookie
        });

        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || '登录失败');
        }

        return result;
    } catch (error) {
        console.error('登录错误:', error);
        throw error;
    }
}

/**
 * 注册请求
 * @param {Object} registerData - 注册表单数据
 * @param {string} registerData.account - 账号
 * @param {string} registerData.username - 用户名
 * @param {string} registerData.password - 密码
 * @param {string} registerData.confirmPassword - 确认密码
 * @param {string} registerData.captcha - 验证码
 * @returns {Promise<Object>} - 返回注册结果
 */
async function register(registerData) {
    try {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(registerData),
            credentials: 'include' // 包含Cookie
        });

        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || '注册失败');
        }

        return result;
    } catch (error) {
        console.error('注册错误:', error);
        throw error;
    }
}

/**
 * 检查用户是否已登录
 * @returns {boolean} 是否已登录
 */
function isLoggedIn() {
    console.log('hachimitoken')
    return !!localStorage.getItem('hachimitoken');
}

/**
 * 获取当前登录用户信息
 * @returns {Object|null} 用户信息，未登录返回null
 */
function getCurrentUser() {
    if (!isLoggedIn()) {
        return null;
    }
    return {
        token: localStorage.getItem('hachimitoken'),
        user_id: localStorage.getItem('user_id'),
        username: localStorage.getItem('username')
    };
}

/**
 * 登出函数
 * @returns {boolean} 返回成功退出
 * 清除本地存储的用户信息和token
 */
function logout() {
    localStorage.removeItem('hachimitoken');
    localStorage.removeItem('user_id');
    localStorage.removeItem('username');
    return true
}

// 导出为全局变量，方便在浏览器环境中使用
window.authAPI = {
    login,
    logout,
    register,
    isLoggedIn,
    getCurrentUser
}; 