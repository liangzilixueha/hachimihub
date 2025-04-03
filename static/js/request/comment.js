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
        
        // 模拟API请求延时
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // 模拟API响应数据
        const totalCount = Math.floor(Math.random() * 50) + 10;
        const totalPages = Math.ceil(totalCount / pageSize);
        
        // 生成模拟评论列表
        const comments = Array.from({ length: Math.min(pageSize, totalCount - (page - 1) * pageSize) }, (_, index) => {
            const commentId = `comment_${(page - 1) * pageSize + index + 1}`;
            const randomDate = new Date(Date.now() - Math.floor(Math.random() * 30) * 86400000);
            
            return {
                commentId,
                videoId,
                content: [
                    '这个视频太棒了！制作非常精良。',
                    '我已经看了五遍了，每次都有新发现。',
                    '这个主题很有趣，希望能看到更多相关内容。',
                    '我觉得这个视频可以做得更好，有些地方可以优化。',
                    '哈哈哈，笑死我了，太有意思了！',
                    '学习了很多，谢谢分享！',
                    '期待下一期，已经关注了！',
                    '这个视频有点短，希望能更详细一些。',
                    '画面很美，音乐也很配，赞！',
                    '认真看完了，内容很充实，给个赞。'
                ][Math.floor(Math.random() * 10)],
                user: {
                    userId: `user_${Math.floor(Math.random() * 100) + 1}`,
                    username: [
                        '快乐旅行者',
                        '科技达人',
                        '美食爱好者',
                        '游戏玩家',
                        '音乐发烧友',
                        '电影控',
                        '摄影师',
                        '程序员',
                        '艺术家',
                        '健身达人'
                    ][Math.floor(Math.random() * 10)] + Math.floor(Math.random() * 1000),
                    avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70) + 1}`
                },
                createTime: randomDate.toISOString(),
                likeCount: Math.floor(Math.random() * 50)
            };
        });
        
        return {
            comments,
            pagination: {
                currentPage: page,
                pageSize,
                totalPages,
                totalCount
            }
        };
    },
    
    /**
     * 提交评论
     * @param {Object} commentData - 评论数据
     * @param {string} commentData.videoId - 视频ID
     * @param {string} commentData.content - 评论内容
     * @returns {Promise<Object>} 提交结果
     */
    async submitComment(commentData) {
        const { videoId, content } = commentData;
        
        // 检查用户是否登录
        const currentUser = window.userAPI.getCurrentUser();
        if (!currentUser) {
            throw new Error('请先登录');
        }
        
        if (!videoId) {
            throw new Error('视频ID不能为空');
        }
        
        if (!content || content.trim() === '') {
            throw new Error('评论内容不能为空');
        }
        
        // 模拟API请求延时
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // 模拟API响应数据
        const newComment = {
            commentId: `comment_new_${Date.now()}`,
            videoId,
            content,
            user: {
                userId: currentUser.userId,
                username: currentUser.username,
                avatar: currentUser.avatar
            },
            createTime: new Date().toISOString(),
            likeCount: 0
        };
        
        return {
            success: true,
            comment: newComment
        };
    },
    
    /**
     * 点赞评论
     * @param {string} commentId - 评论ID
     * @returns {Promise<Object>} 点赞结果
     */
    async likeComment(commentId) {
        // 检查用户是否登录
        const currentUser = window.userAPI.getCurrentUser();
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