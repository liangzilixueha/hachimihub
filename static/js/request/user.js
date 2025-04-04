/**
 * user.js - 用户相关API请求
 */

// API基础URL
/**
 * 获取指定用户的详细信息
 * @param {string} userId - 用户ID
 * @returns {Promise<Object>} 用户详细信息
 */
async function getUserDetails(userId) {
    try {
        const response = await fetch(`/api/user?id=${userId}`);
        const result = await response.json();
        
        if (result.code !== 200) {
            throw new Error(result.message || '获取用户信息失败');
        }
        
        return result.data;
    } catch (error) {
        console.error('获取用户详情失败:', error);
        throw new Error('获取用户信息失败，请稍后重试');
    }
}

/**
 * 获取用户发布的视频列表
 * @param {string} userId - 用户ID
 * @param {Object} options - 请求选项
 * @param {number} options.page - 页码，默认1
 * @param {number} options.pageSize - 每页数量，默认10
 * @param {string} options.sort - 排序方式：'latest'(最新)或'popular'(最热)
 * @returns {Promise<Object>} 包含视频列表和分页信息的对象
 */
async function getUserVideos(userId, options = {}) {
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
}

/**
 * 关注/取消关注用户
 * @param {string} userId - 要关注/取消关注的用户ID
 * @returns {Promise<Object>} 关注结果
 */
async function followUser(userId) {
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

/**
 * 更新用户的基本信息
 * @param {int} userId -用户的id
 * @param {string} boi -用户的个人简介
 * @param {string} username -用户的用户名
 * @returns {Promise<Object>} 更新的结果
 */
async function editUserBaseInfo(userId, boi, username) {
    try {
        // 构建请求数据
        const requestData = {
            userId: userId,
            bio: boi,
            username: username
        };
        console.log(requestData)
        // 发送POST请求
        const response = await fetch('/api/user/userinfoEdit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });
        
        // 解析响应
        const result = await response.json();
        
        // 检查响应状态
        if (response.ok) {
            return {
                success: true,
                data: result
            };
        } else {
            return {
                success: false,
                error: result.message || '更新用户信息失败'
            };
        }
    } catch (error) {
        console.error('更新用户信息请求失败:', error);
        return {
            success: false,
            error: '网络请求失败，请检查网络连接'
        };
    }
}

// 导出为全局变量，方便在浏览器环境中使用
window.userAPI = {
    getUserDetails,
    getUserVideos,
    followUser,
    editUserBaseInfo
};