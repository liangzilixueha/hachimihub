/**
 * user.js - 用户相关API请求
 */

// API基础URL
const API_BASE_URL = '/api';

// 用户API对象
window.authAPI = {
    /**
     * 获取用户信息
     * @returns {Promise<Object>} - 返回用户信息对象，如果未登录则返回null
     */
    async getUserInfo() {
        try {
            const response = await fetch(`${API_BASE_URL}/user/info`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include' // 包含Cookie
            });

            if (!response.ok) {
                if (response.status === 401) {
                    // 未登录
                    return null;
                }
                throw new Error('获取用户信息失败');
            }

            return await response.json();
        } catch (error) {
            console.error('获取用户信息错误:', error);
            return null;
        }
    },

    /**
     * 获取验证码
     * @param {string} type - 验证码类型：'login' 或 'register'
     * @returns {Promise<Object>} 验证码数据
     */
    async getCaptcha(type) {
        try {
            // 模拟API请求
            // 实际项目中应该替换为真实的API调用
            console.log(`获取${type}验证码`);
            
            // 模拟延迟
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // 返回模拟的验证码数据
            return {
                captchaBase64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAAAoCAYAAAAIeF9DAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAHzSURBVGhD7ZnRccIwDIb/MgAjMAIjMAIjMAIjdISO0BEYgRE6QkdgBEZgA/wnWSnUDjSlSK2su7v8CZZlW5adpmleiiIYQQkRjKCECEZQQgQjKCGCEZQQwQhKiGAEJUQwghIiGEEJEYyghAhGUEIEIyghghGUEMEISohgBCVEMIISIhjBS8jpdHrLwZcZ7s5v2TtDeK6urrZ4Bpd/RWE7IkYPRkLI5zjtgb5OhJTIZ/zP1dScz+egdejBSEhZllNTVdUW9Ntwwi3xVVVQCGvAmtAD+hNhVVWF7+wf4ckOj1B8piwsV8CNq3FT07YtPj6Tl3ViCJmb4XBYUyy94wRnJ6QoChwPx9oS8gStOXOdzEoIVgTI2ObV1lQUfQTH2i9ESn88HgmTMwkh4/F4XIgUB2E+8Nt5e3tzE9I0Dft1j4+PSehwrVAo9Mfj3d3d6ESnMWQO+m6lEMLl8jGIlARhJbLIZ2RLCP0Ij3mAZCLFnRWyKyH9mDEHnLMxkjIgNDs/ESM7YchFQr7zHSE9wqnKTpZkhYRCSohgBCVEMIISIhhBCRGMoIQIRlBCBCMoIYIRlBDBCEqIYAQlRDCCEiIYQQkRjKCECEZQQgQjKCGCEZQQwQhKiGAEJUQwghIiGEEJEYyghAhGUEIEIyghQjE1X3nUdyVnTXjaAAAAAElFTkSuQmCC',
                captchaId: '12345'
            };
        } catch (error) {
            console.error('获取验证码失败:', error);
            throw error;
        }
    },

    /**
     * 用户登录
     * @param {Object} loginData - 登录数据
     * @param {string} loginData.account - 用户账号
     * @param {string} loginData.password - 用户密码
     * @param {string} loginData.captcha - 验证码
     * @returns {Promise<Object>} 登录结果
     */
    async login(loginData) {
        try {
            // 模拟API请求
            console.log('登录请求:', loginData);
            
            // 模拟延迟
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // 验证模拟
            if (loginData.captcha !== '1234') {
                throw new Error('验证码错误');
            }
            
            // 登录成功，保存用户信息到本地存储
            const userData = {
                userId: '123456',
                username: '哈吉米用户',
                avatar: '/img/default-avatar.png',
                token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM0NTYiLCJpYXQiOjE2MDAwMDAwMDAsImV4cCI6MTYwMDAwMDAwMH0'
            };
            
            localStorage.setItem('hachimihub_user', JSON.stringify(userData));
            
            return {
                success: true,
                message: '登录成功',
                data: userData
            };
        } catch (error) {
            console.error('登录失败:', error);
            throw error;
        }
    },

    /**
     * 用户注册
     * @param {Object} registerData - 注册数据
     * @param {string} registerData.account - 用户账号
     * @param {string} registerData.username - 用户名
     * @param {string} registerData.password - 用户密码
     * @param {string} registerData.captcha - 验证码
     * @returns {Promise<Object>} 注册结果
     */
    async register(registerData) {
        try {
            // 模拟API请求
            console.log('注册请求:', registerData);
            
            // 模拟延迟
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // 验证模拟
            if (registerData.captcha !== '1234') {
                throw new Error('验证码错误');
            }
            
            return {
                success: true,
                message: '注册成功，请登录',
                data: {
                    userId: 'new123456',
                    username: registerData.username
                }
            };
        } catch (error) {
            console.error('注册失败:', error);
            throw error;
        }
    },

    /**
     * 退出登录
     * @returns {Promise<boolean>} - 返回是否成功退出
     */
    async logout() {
        try {
            const response = await fetch(`${API_BASE_URL}/logout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include' // 包含Cookie
            });

            if (!response.ok) {
                throw new Error('退出登录失败');
            }
            
            // 清除本地存储中的用户信息
            localStorage.removeItem('hachimihub_user');
            
            return true;
        } catch (error) {
            console.error('退出登录错误:', error);
            return false;
        }
    },

    /**
     * 获取当前登录用户信息
     * @returns {Object|null} 用户信息或null（未登录）
     */
    getCurrentUser() {
        try {
            const userStr = localStorage.getItem('hachimihub_user');
            if (!userStr) return null;
            
            return JSON.parse(userStr);
        } catch (error) {
            console.error('获取用户信息失败:', error);
            return null;
        }
    },

    /**
     * 检查用户是否已登录
     * @returns {boolean} 是否已登录
     */
    isLoggedIn() {
        return !!this.getCurrentUser();
    },
    
    /**
     * 获取指定用户的详细信息
     * @param {string} userId - 用户ID
     * @returns {Promise<Object>} 用户详细信息
     */
    async getUserDetails(userId) {
        try {
            // 模拟API请求
            console.log(`获取用户信息，ID: ${userId}`);
            
            // 模拟延迟
            await new Promise(resolve => setTimeout(resolve, 800));
            
            // 返回模拟的用户数据
            // 通常这里会从后端API获取真实数据
            
            // 为了演示，这里根据不同userId返回不同模拟数据
            const userData = {
                userId: userId,
                username: `用户_${userId.slice(0, 4)}`,
                avatar: '/img/default-avatar.png',
                bio: '这是一个充满活力的创作者，喜欢分享有趣的视频内容。喜欢动漫、游戏和美食，希望通过视频和大家分享生活中的乐趣。',
                registerTime: '2023-01-15 12:30:45',
                stats: {
                    videoCount: Math.floor(Math.random() * 50) + 1,
                    likeCount: Math.floor(Math.random() * 10000) + 100,
                    viewCount: Math.floor(Math.random() * 100000) + 1000
                }
            };
            
            // 特殊ID展示
            if (userId === '12345') {
                userData.username = 'HachimiHub官方';
                userData.avatar = '/img/manbo.png';
                userData.bio = '哈吉米视频网站官方账号，负责发布网站公告、更新信息和精选内容推荐。关注我们获取第一手资讯！';
                userData.stats.videoCount = 120;
                userData.stats.likeCount = 58792;
                userData.stats.viewCount = 982547;
            } else if (userId === '54321') {
                userData.username = '动漫达人';
                userData.bio = '专注动漫视频分享10年，超过500部作品解析。每周固定更新，欢迎动漫爱好者关注！';
                userData.stats.videoCount = 532;
                userData.stats.likeCount = 243567;
                userData.stats.viewCount = 3752140;
            }
            
            return userData;
        } catch (error) {
            console.error('获取用户详情失败:', error);
            throw new Error('获取用户信息失败，请稍后重试');
        }
    },
    
    /**
     * 获取用户发布的视频列表
     * @param {string} userId - 用户ID
     * @param {Object} options - 请求选项
     * @param {number} options.page - 页码，默认1
     * @param {number} options.pageSize - 每页数量，默认10
     * @param {string} options.sort - 排序方式：'latest'(最新)或'popular'(最热)
     * @returns {Promise<Object>} 包含视频列表和分页信息的对象
     */
    async getUserVideos(userId, options = {}) {
        try {
            const { page = 1, pageSize = 10, sort = 'latest' } = options;
            
            // 模拟API请求
            console.log(`获取用户视频，用户ID: ${userId}，页码: ${page}，排序: ${sort}`);
            
            // 模拟延迟
            await new Promise(resolve => setTimeout(resolve, 1200));
            
            // 为了演示，生成不同数量的模拟视频数据
            const totalVideos = userId === '12345' ? 120 : 
                               userId === '54321' ? 532 : 
                               Math.floor(Math.random() * 50) + 1;
                               
            const totalPages = Math.ceil(totalVideos / pageSize);
            
            // 如果用户没有视频，返回空数组
            if (totalVideos === 0) {
                return {
                    videos: [],
                    pagination: {
                        page,
                        pageSize,
                        totalPages: 0,
                        totalVideos: 0
                    }
                };
            }
            
            // 如果请求的页码超出范围，返回最后一页
            const currentPage = page > totalPages ? totalPages : page;
            
            // 生成模拟视频数据
            const videos = [];
            const videosPerPage = Math.min(pageSize, totalVideos - (currentPage - 1) * pageSize);
            
            for (let i = 0; i < videosPerPage; i++) {
                const videoIndex = (currentPage - 1) * pageSize + i;
                const date = new Date();
                date.setDate(date.getDate() - videoIndex * (sort === 'latest' ? 1 : Math.random() * 30));
                
                videos.push({
                    videoId: `vid_${userId}_${videoIndex}`,
                    title: `视频标题 ${videoIndex + 1} - ${['动画解说', '游戏实况', '美食分享', '生活日常', '科技评测'][Math.floor(Math.random() * 5)]}`,
                    coverUrl: `https://picsum.photos/400/225?random=${videoIndex}`,
                    duration: `${Math.floor(Math.random() * 10) + 1}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
                    uploadTime: date.toISOString(),
                    viewCount: sort === 'popular' ? 
                        Math.floor(100000 / (videoIndex + 1)) + 500 : 
                        Math.floor(Math.random() * 10000) + 100,
                    likeCount: Math.floor(Math.random() * 1000) + 10
                });
            }
            
            // 根据排序方式排序
            if (sort === 'latest') {
                // 已经按最新排序
            } else if (sort === 'popular') {
                videos.sort((a, b) => b.viewCount - a.viewCount);
            }
            
            return {
                videos,
                pagination: {
                    page: currentPage,
                    pageSize,
                    totalPages,
                    totalVideos
                }
            };
        } catch (error) {
            console.error('获取用户视频失败:', error);
            throw new Error('获取视频列表失败，请稍后重试');
        }
    },

    /**
     * 关注/取消关注用户
     * @param {string} userId - 要关注/取消关注的用户ID
     * @returns {Promise<Object>} 关注结果
     */
    async followUser(userId) {
        // 检查用户是否登录
        const currentUser = this.getCurrentUser();
        if (!currentUser) {
            throw new Error('请先登录');
        }
        
        if (!userId) {
            throw new Error('用户ID不能为空');
        }
        
        // 模拟API请求延时
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 模拟API响应数据
        // 假设每次调用都会切换关注状态
        const isFollowing = Math.random() > 0.5;
        
        return {
            success: true,
            isFollowing
        };
    }
};

// 暴露全局API
window.userAPI = window.authAPI; 