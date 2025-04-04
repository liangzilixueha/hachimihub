/**
 * comment.js - 评论相关API
 */

// API基础路径
const COMMENT_API_BASE_URL = '/api';

// 评论API
window.commentAPI = {
    /**
     * 获取视频评论列表
     * @param {Object} options - 请求选项
     * @param {string} options.videoId - 视频ID
     * @param {number} options.page - 页码，默认为1
     * @param {number} options.pageSize - 每页数量，默认为10
     * @param {string} options.sort - 排序方式，'latest'最新或'popular'最热，默认为'latest'
     * @returns {Promise<Object>} 评论列表数据
     */
    async getComments(options) {
        const { videoId, page = 1, pageSize = 10, sort = 'latest' } = options;
        
        if (!videoId) {
            throw new Error('视频ID不能为空');
        }

        try {
            const response = await fetch(`/api/videoComment?id=${videoId}&page=${page}&pageSize=${pageSize}&sort=${sort}`);
            if (!response.ok) {
                throw new Error('获取评论失败');
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('获取评论失败:', error);
            throw error;
        }
    },
    
    /**
     * 提交评论
     * @param {Object} commentData - 评论数据
     * @param {int} commentData.videoId - 视频ID
     * @param {int} commentData.userId - 用户ID
     * @param {string} commentData.content - 评论内容
     * @returns {Promise<Object>} 提交结果
     */
    async submitComment(commentData) {
        const { videoId, content, parentId = 0 } = commentData;
        
        // 检查用户是否登录
        const currentUser = window.authAPI.getCurrentUser();
        if (!currentUser) {
            throw new Error('请先登录');
        }
        
        if (!videoId) {
            throw new Error('视频ID不能为空');
        }
        
        if (!content || content.trim() === '') {
            throw new Error('评论内容不能为空');
        }

        try {
            const response = await fetch('/api/video/addComment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    videoId,
                    content,
                    userId: currentUser.user_id,
                    parentId
                })
            });

            if (!response.ok) {
                throw new Error('提交评论失败');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('提交评论失败:', error);
            throw error;
        }
    },
    
    /**
     * 点赞评论
     * @param {string} commentId - 评论ID
     * @returns {Promise<Object>} 点赞结果
     */
    async likeComment(commentId) {
        // 检查用户是否登录
        const currentUser = window.authAPI.getCurrentUser();
        if (!currentUser) {
            throw new Error('请先登录');
        }
        
        if (!commentId) {
            throw new Error('评论ID不能为空');
        }
        
        // 模拟API请求延时
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 模拟API响应数据
        const isLiked = Math.random() > 0.5;
        
        return {
            success: true,
            isLiked,
            likeCount: Math.floor(Math.random() * 50) + (isLiked ? 1 : 0)
        };
    }
}; 