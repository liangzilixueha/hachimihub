/**
 * video.js - 视频相关API请求
 */

// API基础URL
const VIDEO_API_BASE_URL = '/api';

// 视频API对象
window.videoAPI = {
    /**
     * 获取视频列表
     * @param {Object} options - 请求选项
     * @param {number} options.page - 页码，默认1
     * @param {number} options.pageSize - 每页数量，默认10
     * @param {string} options.category - 视频分类，可选
     * @param {string} options.sort - 排序方式，'latest'最新或'popular'最热，默认为'latest'
     * @param {string} options.keyword - 搜索关键词，可选
     * @returns {Promise<Object>} 视频列表数据
     */
    async getVideoList(options) {
        const { page = 1, pageSize = 10, category, sort = 'latest', keyword } = options;
        
        // 模拟API请求延时
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // 模拟API响应数据
        const totalCount = 100;
        const totalPages = Math.ceil(totalCount / pageSize);
        
        // 生成模拟视频列表
        const videos = Array.from({ length: pageSize }, (_, index) => {
            const videoId = `video_${(page - 1) * pageSize + index + 1}`;
            const randomDate = new Date();
            randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 30));
            
            return {
                videoId,
                title: keyword
                    ? `${keyword}相关视频 ${(page - 1) * pageSize + index + 1}`
                    : `测试视频 ${(page - 1) * pageSize + index + 1}`,
                coverUrl: `https://picsum.photos/480/272?random=${(page - 1) * pageSize + index + 1}`,
                duration: `${Math.floor(Math.random() * 10) + 1}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
                uploadTime: randomDate.toISOString(),
                viewCount: Math.floor(Math.random() * 100000),
                uploader: {
                    userId: `user_${Math.floor(Math.random() * 100) + 1}`,
                    username: `用户${Math.floor(Math.random() * 1000) + 1}`,
                    avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70) + 1}`
                }
            };
        });
        
        return {
            videos,
            pagination: {
                currentPage: page,
                pageSize,
                totalPages,
                totalCount
            }
        };
    },
    
    /**
     * 获取当前登录用户上传的视频列表
     * @param {Object} options - 请求选项
     * @param {number} options.page - 页码，默认1
     * @param {number} options.pageSize - 每页数量，默认10
     * @param {string} options.sort - 排序方式：'latest'(最新)或'popular'(最热)
     * @returns {Promise<Object>} 包含视频列表和分页信息的对象
     */
    async getMyVideos(options = {}) {
        try {
            const { page = 1, pageSize = 10, sort = 'latest' } = options;
            
            // 获取当前用户
            const currentUser = window.authAPI.getCurrentUser();
            if (!currentUser) {
                throw new Error('未登录');
            }
            
            // 模拟API请求
            console.log(`获取我的视频，页码: ${page}，排序: ${sort}`);
            
            // 模拟延迟
            await new Promise(resolve => setTimeout(resolve, 800));
            
            // 模拟数据
            const totalVideos = 23;
            const totalPages = Math.ceil(totalVideos / pageSize);
            
            // 生成模拟视频数据
            const videos = [];
            const videosPerPage = Math.min(pageSize, totalVideos - (page - 1) * pageSize);
            
            for (let i = 0; i < videosPerPage; i++) {
                const videoIndex = (page - 1) * pageSize + i;
                const date = new Date();
                date.setDate(date.getDate() - videoIndex * (sort === 'latest' ? 1 : Math.random() * 30));
                
                videos.push({
                    videoId: `vid_my_${videoIndex}`,
                    title: `我的视频 ${videoIndex + 1} - ${['动画解说', '游戏实况', '美食分享', '生活日常', '科技评测'][Math.floor(Math.random() * 5)]}`,
                    coverUrl: `https://picsum.photos/400/225?random=${videoIndex + 100}`,
                    duration: `${Math.floor(Math.random() * 10) + 1}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
                    uploadTime: date.toISOString(),
                    viewCount: sort === 'popular' ? 
                        Math.floor(50000 / (videoIndex + 1)) + 300 : 
                        Math.floor(Math.random() * 5000) + 50,
                    likeCount: Math.floor(Math.random() * 500) + 10,
                    status: Math.random() > 0.1 ? 'published' : 'processing' // 90%已发布，10%处理中
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
                    page,
                    pageSize,
                    totalPages,
                    totalVideos
                }
            };
        } catch (error) {
            console.error('获取我的视频失败:', error);
            throw new Error('获取视频列表失败，请稍后重试');
        }
    },
    
    /**
     * 更新视频封面
     * @param {string} videoId - 视频ID
     * @param {File} coverFile - 封面图片文件
     * @returns {Promise<Object>} 更新结果
     */
    async updateVideoCover(videoId, coverFile) {
        try {
            // 获取当前用户
            const currentUser = window.authAPI.getCurrentUser();
            if (!currentUser) {
                throw new Error('未登录');
            }
            
            // 验证文件类型
            if (!coverFile.type.match('image/*')) {
                throw new Error('请上传图片文件');
            }
            
            // 验证文件大小 (最大2MB)
            if (coverFile.size > 2 * 1024 * 1024) {
                throw new Error('图片大小不能超过2MB');
            }
            
            // 模拟API请求
            console.log(`更新视频封面，视频ID: ${videoId}`);
            
            // 模拟文件上传
            console.log('上传文件:', coverFile.name);
            
            // 模拟延迟
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // 模拟成功响应
            return {
                success: true,
                message: '封面更新成功',
                data: {
                    videoId,
                    coverUrl: URL.createObjectURL(coverFile)
                }
            };
        } catch (error) {
            console.error('更新视频封面失败:', error);
            throw error;
        }
    },
    
    /**
     * 删除视频
     * @param {string} videoId - 视频ID
     * @returns {Promise<Object>} 删除结果
     */
    async deleteVideo(videoId) {
        try {
            // 获取当前用户
            const currentUser = window.authAPI.getCurrentUser();
            if (!currentUser) {
                throw new Error('未登录');
            }
            
            // 模拟API请求
            console.log(`删除视频，视频ID: ${videoId}`);
            
            // 模拟延迟
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // 模拟成功响应
            return {
                success: true,
                message: '视频删除成功'
            };
        } catch (error) {
            console.error('删除视频失败:', error);
            throw error;
        }
    },
    
    /**
     * 获取视频详情
     * @param {string} videoId - 视频ID
     * @returns {Promise<Object>} 视频详情数据
     */
    async getVideoDetail(videoId) {
        if (!videoId) {
            throw new Error('视频ID不能为空');
        }
        
        // 模拟API请求延时
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // 获取当前用户
        const currentUser = window.authAPI.getCurrentUser();
        const isLoggedIn = !!currentUser;
        
        // 模拟API响应数据
        const videoDetail = {
            videoId,
            title: `测试视频 ${videoId.replace('video_', '')}`,
            description: '这是一个测试视频描述。这个视频展示了一些有趣的内容，希望大家喜欢！这只是一个模拟的视频描述，实际内容会根据视频不同而变化。',
            coverUrl: `https://picsum.photos/1280/720?random=${videoId.replace('video_', '')}`,
            videoUrl: 'https://artplayer.org/assets/sample/video.mp4', // 使用ArtPlayer示例视频
            duration: `${Math.floor(Math.random() * 10) + 1}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
            uploadTime: new Date(Date.now() - Math.floor(Math.random() * 30) * 86400000).toISOString(),
            viewCount: Math.floor(Math.random() * 100000),
            likeCount: Math.floor(Math.random() * 10000),
            uploader: {
                userId: `user_${Math.floor(Math.random() * 100) + 1}`,
                username: `用户${Math.floor(Math.random() * 1000) + 1}`,
                avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70) + 1}`
            },
            // 如果已登录，随机设置点赞和关注状态
            isLiked: isLoggedIn ? Math.random() > 0.5 : false,
            isFollowing: isLoggedIn ? Math.random() > 0.5 : false
        };
        
        return videoDetail;
    },
    
    /**
     * 点赞视频
     * @param {string} videoId - 视频ID
     * @returns {Promise<Object>} 点赞结果
     */
    async likeVideo(videoId) {
        // 检查用户是否登录
        const currentUser = window.authAPI.getCurrentUser();
        if (!currentUser) {
            throw new Error('请先登录');
        }
        
        if (!videoId) {
            throw new Error('视频ID不能为空');
        }
        
        // 模拟API请求延时
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 模拟API响应数据
        // 假设每次调用都会切换点赞状态
        const isLiked = Math.random() > 0.5;
        
        return {
            success: true,
            isLiked,
            likeCount: Math.floor(Math.random() * 10000) + (isLiked ? 1 : 0)
        };
    },
    
    /**
     * 获取推荐视频
     * @param {string} videoId - 当前视频ID
     * @param {number} limit - 获取数量，默认为5
     * @returns {Promise<Object>} 推荐视频列表
     */
    async getRecommendedVideos(videoId, limit = 5) {
        if (!videoId) {
            throw new Error('视频ID不能为空');
        }
        
        // 模拟API请求延时
        await new Promise(resolve => setTimeout(resolve, 600));
        
        // 生成模拟推荐视频列表
        const videos = Array.from({ length: limit }, (_, index) => {
            const recVideoId = `video_${Math.floor(Math.random() * 100) + 1}`;
            const randomDate = new Date();
            randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 30));
            
            return {
                videoId: recVideoId,
                title: `推荐视频 ${index + 1}`,
                coverUrl: `https://picsum.photos/320/180?random=${index + 1 + 200}`,
                duration: `${Math.floor(Math.random() * 10) + 1}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
                uploadTime: randomDate.toISOString(),
                viewCount: Math.floor(Math.random() * 100000),
                uploader: {
                    userId: `user_${Math.floor(Math.random() * 100) + 1}`,
                    username: `用户${Math.floor(Math.random() * 1000) + 1}`,
                    avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70) + 1}`
                }
            };
        });
        
        return {
            videos
        };
    },

    /**
     * 搜索视频
     * @param {string} keyword - 搜索关键词
     * @param {number} page - 页码，从1开始
     * @param {number} pageSize - 每页视频数量
     * @param {string} sort - 排序方式，可选值：'newest', 'oldest', 'popular'
     * @returns {Promise<Object>} 包含视频列表和分页信息的对象
     */
    async searchVideos(keyword, page = 1, pageSize = 10, sort = 'newest') {
        try {
            // 构建查询参数
            const queryParams = new URLSearchParams({
                keyword: keyword,
                page: page,
                pageSize: pageSize,
                sort: sort
            });
            
            // 发送GET请求
            const response = await fetch(`/api/video/searchVideos?${queryParams.toString()}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            // 解析响应
            const result = await response.json();
            
            // 检查响应状态
            if (result.code === 200) {
                return {
                    success: true,
                    videos: result.data.videos || [],
                    pagination: result.data.pagination || {
                        currentPage: page,
                        pageSize: pageSize,
                        totalPages: 0,
                        totalVideos: 0
                    }
                };
            } else {
                return {
                    success: false,
                    error: result.message || '搜索视频失败'
                };
            }
        } catch (error) {
            console.error('搜索视频请求失败:', error);
            return {
                success: false,
                error: '网络请求失败，请检查网络连接'
            };
        }
    }
}; 