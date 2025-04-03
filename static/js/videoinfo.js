/**
 * videoinfo.js - 视频详情页交互逻辑
 */

// 页面元素 - 顶部导航
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const userMenuButton = document.getElementById('user-menu-button');
const userDropdown = document.getElementById('user-dropdown');
const userAvatar = document.getElementById('user-avatar');
const usernameDisplay = document.getElementById('username-display');
const logoutButton = document.getElementById('logout-button');
const notLoggedIn = document.getElementById('not-logged-in');
const loggedIn = document.getElementById('logged-in');

// 页面元素 - 视频播放器
const videoPlayerContainer = document.getElementById('video-player-container');
const videoLoading = document.getElementById('video-loading');

// 页面元素 - 视频信息
const videoTitle = document.getElementById('video-title');
const uploaderAvatar = document.getElementById('uploader-avatar');
const uploaderName = document.getElementById('uploader-name');
const uploaderLink = document.getElementById('uploader-link');
const followButton = document.getElementById('follow-button');
const likeButton = document.getElementById('like-button');
const likeCount = document.getElementById('like-count');
const viewCount = document.getElementById('view-count');
const uploadTime = document.getElementById('upload-time');
const videoDescription = document.getElementById('video-description');

// 页面元素 - 评论区
const commentCount = document.getElementById('comment-count');
const commentInputContainer = document.getElementById('comment-input-container');
const commentLoginTip = document.getElementById('comment-login-tip');
const commentUserAvatar = document.getElementById('comment-user-avatar');
const commentInput = document.getElementById('comment-input');
const commentSubmit = document.getElementById('comment-submit');
const commentList = document.getElementById('comment-list');
const commentLoading = document.getElementById('comment-loading');
const noCommentsMessage = document.getElementById('no-comments-message');
const commentPagination = document.getElementById('comment-pagination');
const commentPrevPage = document.getElementById('comment-prev-page');
const commentNextPage = document.getElementById('comment-next-page');
const commentPageNumbers = document.getElementById('comment-page-numbers');

// 页面元素 - 推荐视频
const recommendedLoading = document.getElementById('recommended-loading');
const noRecommendedMessage = document.getElementById('no-recommended-message');
const recommendedVideosList = document.getElementById('recommended-videos-list');

// 状态变量
let videoPlayer = null; // ArtPlayer实例
let videoId = ''; // 当前视频ID
let isLiked = false; // 是否已点赞
let isFollowing = false; // 是否已关注
let commentCurrentPage = 1; // 评论当前页码
let commentPageSize = 10; // 评论每页数量
let commentTotalPages = 0; // 评论总页数

/**
 * 初始化页面
 */
async function init() {
    // 从URL获取视频ID
    const urlParams = new URLSearchParams(window.location.pathname.split('/').pop());
    videoId = urlParams.get('id') || window.location.pathname.split('/').pop().replace('hjm', '');
    
    // 检查用户登录状态
    checkLoginStatus();
    
    // 注册事件监听器
    registerEventListeners();
    
    try {
        // 加载视频信息
        await loadVideoInfo();
        
        // 加载评论
        await loadComments();
        
        // 加载推荐视频
        await loadRecommendedVideos();
    } catch (error) {
        console.error('加载页面数据失败:', error);
        showNotification('加载页面数据失败，请刷新重试', 'error');
    }
}

/**
 * 检查用户登录状态
 */
function checkLoginStatus() {
    const currentUser = window.userAPI.getCurrentUser();
    
    if (currentUser) {
        // 已登录，显示用户信息
        loggedIn.classList.remove('hidden');
        notLoggedIn.classList.add('hidden');
        
        userAvatar.src = currentUser.avatar;
        usernameDisplay.textContent = currentUser.username;
        
        // 更新评论区
        commentInputContainer.classList.remove('hidden');
        commentLoginTip.classList.add('hidden');
        commentUserAvatar.src = currentUser.avatar;
    } else {
        // 未登录，显示登录按钮
        loggedIn.classList.add('hidden');
        notLoggedIn.classList.remove('hidden');
        
        // 更新评论区
        commentInputContainer.classList.add('hidden');
        commentLoginTip.classList.remove('hidden');
    }
}

/**
 * 注册所有事件监听器
 */
function registerEventListeners() {
    // 搜索相关
    searchButton.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', e => {
        if (e.key === 'Enter') handleSearch();
    });
    
    // 用户菜单相关
    userMenuButton.addEventListener('click', toggleUserMenu);
    logoutButton.addEventListener('click', handleLogout);
    
    // 点击页面其他位置关闭用户菜单
    document.addEventListener('click', e => {
        if (!userMenuButton.contains(e.target) && !userDropdown.contains(e.target)) {
            userDropdown.classList.add('hidden');
        }
    });
    
    // 视频交互相关
    likeButton.addEventListener('click', handleLike);
    followButton.addEventListener('click', handleFollow);
    
    // 评论相关
    commentSubmit.addEventListener('click', handleCommentSubmit);
    commentPrevPage.addEventListener('click', () => changeCommentPage(commentCurrentPage - 1));
    commentNextPage.addEventListener('click', () => changeCommentPage(commentCurrentPage + 1));
}

/**
 * 处理搜索
 */
function handleSearch() {
    const query = searchInput.value.trim();
    if (query) {
        window.location.href = `/search.html?q=${encodeURIComponent(query)}`;
    }
}

/**
 * 切换用户菜单显示状态
 */
function toggleUserMenu() {
    userDropdown.classList.toggle('hidden');
}

/**
 * 处理退出登录
 */
async function handleLogout() {
    try {
        await window.userAPI.logout();
        window.location.reload();
    } catch (error) {
        showNotification('退出登录失败，请重试', 'error');
    }
}

/**
 * 处理点赞
 */
async function handleLike() {
    // 检查用户是否登录
    const currentUser = window.userAPI.getCurrentUser();
    if (!currentUser) {
        showNotification('请先登录', 'info');
        return;
    }
    
    try {
        // 调用API点赞/取消点赞
        const result = await window.videoAPI.likeVideo(videoId);
        
        // 更新状态
        isLiked = result.isLiked;
        
        // 更新UI
        if (isLiked) {
            likeButton.classList.add('liked');
            showNotification('点赞成功', 'success');
        } else {
            likeButton.classList.remove('liked');
            showNotification('已取消点赞', 'info');
        }
        
        likeCount.textContent = result.likeCount;
    } catch (error) {
        console.error('点赞失败:', error);
        showNotification(error.message || '点赞失败，请重试', 'error');
    }
}

/**
 * 处理关注
 */
async function handleFollow() {
    // 检查用户是否登录
    const currentUser = window.userAPI.getCurrentUser();
    if (!currentUser) {
        showNotification('请先登录', 'info');
        return;
    }
    
    try {
        // 调用API关注/取消关注
        const result = await window.userAPI.followUser(uploaderLink.dataset.userId);
        
        // 更新状态
        isFollowing = result.isFollowing;
        
        // 更新UI
        if (isFollowing) {
            followButton.textContent = '已关注';
            followButton.classList.add('following');
            showNotification('关注成功', 'success');
        } else {
            followButton.textContent = '关注';
            followButton.classList.remove('following');
            showNotification('已取消关注', 'info');
        }
    } catch (error) {
        console.error('关注失败:', error);
        showNotification(error.message || '关注失败，请重试', 'error');
    }
}

/**
 * 处理评论提交
 */
async function handleCommentSubmit() {
    // 检查用户是否登录
    const currentUser = window.userAPI.getCurrentUser();
    if (!currentUser) {
        showNotification('请先登录', 'info');
        return;
    }
    
    // 获取评论内容
    const content = commentInput.value.trim();
    if (!content) {
        showNotification('评论内容不能为空', 'error');
        return;
    }
    
    // 禁用提交按钮
    commentSubmit.disabled = true;
    
    try {
        // 提交评论
        const result = await window.commentAPI.submitComment({
            videoId,
            content
        });
        
        // 清空输入框
        commentInput.value = '';
        
        // 添加新评论到列表顶部
        if (commentCurrentPage === 1) {
            addComment(result.comment, true);
        } else {
            // 如果不在第一页，跳转到第一页
            changeCommentPage(1);
        }
        
        showNotification('评论发表成功', 'success');
    } catch (error) {
        console.error('提交评论失败:', error);
        showNotification(error.message || '提交评论失败，请重试', 'error');
    } finally {
        // 启用提交按钮
        commentSubmit.disabled = false;
    }
}

/**
 * 加载视频信息
 */
async function loadVideoInfo() {
    try {
        // 显示加载状态
        videoLoading.classList.remove('hidden');
        
        // 获取视频信息
        const videoInfo = await window.videoAPI.getVideoDetail(videoId);
        
        // 更新页面标题
        document.title = `${videoInfo.title} - HachimiHub`;
        
        // 更新视频信息
        videoTitle.textContent = videoInfo.title;
        uploaderAvatar.src = videoInfo.uploader.avatar;
        uploaderName.textContent = videoInfo.uploader.username;
        uploaderLink.href = `/userinfo.html?id=${videoInfo.uploader.userId}`;
        uploaderLink.dataset.userId = videoInfo.uploader.userId;
        likeCount.textContent = formatCount(videoInfo.likeCount);
        viewCount.textContent = formatCount(videoInfo.viewCount);
        uploadTime.textContent = formatTimeAgo(new Date(videoInfo.uploadTime));
        videoDescription.textContent = videoInfo.description;
        
        // 检查是否已点赞
        isLiked = videoInfo.isLiked;
        if (isLiked) {
            likeButton.classList.add('liked');
        }
        
        // 检查是否已关注
        isFollowing = videoInfo.isFollowing;
        if (isFollowing) {
            followButton.textContent = '已关注';
            followButton.classList.add('following');
        }
        
        // 初始化视频播放器
        initVideoPlayer(videoInfo.videoUrl);
    } catch (error) {
        console.error('加载视频信息失败:', error);
        showNotification('加载视频信息失败，请刷新重试', 'error');
    }
}

/**
 * 初始化视频播放器
 * @param {string} videoUrl - 视频URL
 */
function initVideoPlayer(videoUrl) {
    const playerOptions = {
        container: '#video-player',
        url: videoUrl,
        theme: 'rgb(177, 119, 118)',
        volume: 0.5,
        isLive: false,
        muted: false,
        autoplay: false,
        pip: true,
        autoSize: true,
        autoMini: true,
        screenshot: true,
        setting: true,
        loop: false,
        flip: true,
        playbackRate: true,
        aspectRatio: true,
        fullscreen: true,
        fullscreenWeb: true,
        subtitleOffset: true,
        miniProgressBar: true,
        mutex: true,
        backdrop: true,
        playsInline: true,
        autoPlayback: true,
        airplay: true,
        lang: 'zh-cn',
        whitelist: ['*']
    };
    
    // 如果存在旧播放器实例，销毁它
    if (videoPlayer) {
        videoPlayer.destroy();
    }
    
    // 创建新播放器实例
    videoPlayer = new Artplayer(playerOptions);
    
    // 监听播放器事件
    videoPlayer.on('ready', () => {
        // 隐藏加载状态
        console.log(videoLoading)

        videoLoading.classList.add('hidden');
    });
    
    videoPlayer.on('play', () => {
        console.log('视频开始播放');
    });
    
    videoPlayer.on('pause', () => {
        console.log('视频暂停');
    });
    
    videoPlayer.on('ended', () => {
        console.log('视频播放结束');
    });
}

/**
 * 加载评论
 */
async function loadComments() {
    try {
        // 显示加载状态
        commentLoading.classList.remove('hidden');
        noCommentsMessage.classList.add('hidden');
        
        // 清空评论列表
        const commentItems = commentList.querySelectorAll('.comment-item');
        commentItems.forEach(item => item.remove());
        
        // 获取评论列表
        const result = await window.commentAPI.getComments({
            videoId,
            page: commentCurrentPage,
            pageSize: commentPageSize
        });
        
        // 更新状态变量
        commentTotalPages = result.pagination.totalPages;
        
        // 更新评论数量
        commentCount.textContent = result.pagination.totalCount;
        
        // 隐藏加载状态
        commentLoading.classList.add('hidden');
        
        // 渲染评论列表
        if (result.comments.length === 0) {
            noCommentsMessage.classList.remove('hidden');
        } else {
            result.comments.forEach(comment => {
                addComment(comment);
            });
        }
        
        // 更新分页控件
        updateCommentPagination();
    } catch (error) {
        console.error('加载评论失败:', error);
        commentLoading.classList.add('hidden');
        showNotification('加载评论失败，请重试', 'error');
    }
}

/**
 * 更新评论分页控件
 */
function updateCommentPagination() {
    if (commentTotalPages <= 1) {
        commentPagination.classList.add('hidden');
        return;
    }
    
    commentPagination.classList.remove('hidden');
    commentPrevPage.disabled = commentCurrentPage === 1;
    commentNextPage.disabled = commentCurrentPage === commentTotalPages;
    
    // 生成页码
    commentPageNumbers.innerHTML = '';
    
    // 确定显示哪些页码
    let startPage = Math.max(1, commentCurrentPage - 2);
    let endPage = Math.min(commentTotalPages, startPage + 4);
    
    if (endPage - startPage < 4) {
        startPage = Math.max(1, endPage - 4);
    }
    
    // 添加第一页
    if (startPage > 1) {
        addPageNumber(1);
        
        if (startPage > 2) {
            // 添加省略号
            const ellipsis = document.createElement('span');
            ellipsis.className = 'px-2 py-1 text-gray-500';
            ellipsis.textContent = '...';
            commentPageNumbers.appendChild(ellipsis);
        }
    }
    
    // 添加中间页码
    for (let i = startPage; i <= endPage; i++) {
        addPageNumber(i);
    }
    
    // 添加最后一页
    if (endPage < commentTotalPages) {
        if (endPage < commentTotalPages - 1) {
            // 添加省略号
            const ellipsis = document.createElement('span');
            ellipsis.className = 'px-2 py-1 text-gray-500';
            ellipsis.textContent = '...';
            commentPageNumbers.appendChild(ellipsis);
        }
        
        addPageNumber(commentTotalPages);
    }
}

/**
 * 添加页码按钮
 * @param {number} pageNum - 页码
 */
function addPageNumber(pageNum) {
    const pageButton = document.createElement('div');
    pageButton.className = `page-number ${pageNum === commentCurrentPage ? 'active' : ''}`;
    pageButton.textContent = pageNum;
    
    pageButton.addEventListener('click', () => {
        if (pageNum !== commentCurrentPage) {
            changeCommentPage(pageNum);
        }
    });
    
    commentPageNumbers.appendChild(pageButton);
}

/**
 * 切换到指定评论页码
 * @param {number} page - 页码
 */
function changeCommentPage(page) {
    if (page < 1 || page > commentTotalPages || page === commentCurrentPage) {
        return;
    }
    
    commentCurrentPage = page;
    loadComments();
}

/**
 * 添加评论到列表
 * @param {Object} comment - 评论数据
 * @param {boolean} prepend - 是否添加到列表顶部
 */
function addComment(comment, prepend = false) {
    noCommentsMessage.classList.add('hidden');
    
    const commentItem = document.createElement('div');
    commentItem.className = 'comment-item flex';
    commentItem.dataset.commentId = comment.commentId;
    
    const commentTime = formatTimeAgo(new Date(comment.createTime));
    
    commentItem.innerHTML = `
        <img src="${comment.user.avatar}" alt="${comment.user.username}" class="comment-avatar">
        <div class="comment-content">
            <div class="flex items-center">
                <span class="comment-username">${comment.user.username}</span>
                <span class="comment-time">${commentTime}</span>
            </div>
            <p class="comment-text">${comment.content}</p>
        </div>
    `;
    
    if (prepend) {
        const firstComment = commentList.querySelector('.comment-item');
        if (firstComment) {
            commentList.insertBefore(commentItem, firstComment);
        } else {
            commentList.appendChild(commentItem);
        }
    } else {
        commentList.appendChild(commentItem);
    }
}

/**
 * 加载推荐视频
 */
async function loadRecommendedVideos() {
    try {
        // 显示加载状态
        recommendedLoading.classList.remove('hidden');
        noRecommendedMessage.classList.add('hidden');
        recommendedVideosList.classList.add('hidden');
        
        // 获取推荐视频列表
        const result = await window.videoAPI.getRecommendedVideos(videoId, 10);
        
        // 隐藏加载状态
        recommendedLoading.classList.add('hidden');
        
        // 渲染推荐视频列表
        if (result.videos.length === 0) {
            noRecommendedMessage.classList.remove('hidden');
        } else {
            renderRecommendedVideos(result.videos);
            recommendedVideosList.classList.remove('hidden');
        }
    } catch (error) {
        console.error('加载推荐视频失败:', error);
        recommendedLoading.classList.add('hidden');
        showNotification('加载推荐视频失败，请重试', 'error');
    }
}

/**
 * 渲染推荐视频列表
 * @param {Array} videos - 视频数据数组
 */
function renderRecommendedVideos(videos) {
    recommendedVideosList.innerHTML = '';
    
    videos.forEach(video => {
        const videoItem = document.createElement('a');
        videoItem.href = `/video/hjm${video.videoId}`;
        videoItem.className = 'recommended-video';
        
        // 格式化时间和播放量
        const uploadTimeFormatted = formatTimeAgo(new Date(video.uploadTime));
        const viewCountFormatted = formatCount(video.viewCount);
        
        videoItem.innerHTML = `
            <div class="recommended-video-thumbnail">
                <img src="${video.coverUrl}" alt="${video.title}">
                <span class="recommended-video-duration">${video.duration}</span>
            </div>
            <div class="recommended-video-info">
                <h3 class="recommended-video-title">${video.title}</h3>
                <div class="recommended-video-uploader">${video.uploader.username}</div>
                <div class="recommended-video-counts">
                    <span>${viewCountFormatted}次观看</span>
                    <span>${uploadTimeFormatted}</span>
                </div>
            </div>
        `;
        
        recommendedVideosList.appendChild(videoItem);
    });
}

/**
 * 显示通知消息
 * @param {string} message - 消息内容
 * @param {string} type - 消息类型：'success', 'error', 或 'info'
 */
function showNotification(message, type = 'info') {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // 添加到页面
    document.body.appendChild(notification);
    
    // 3秒后自动移除
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

/**
 * 格式化数字
 * @param {number} count - 数字
 * @returns {string} 格式化后的字符串
 */
function formatCount(count) {
    if (count >= 100000000) {
        return (count / 100000000).toFixed(1) + '亿';
    } else if (count >= 10000) {
        return (count / 10000).toFixed(1) + '万';
    } else {
        return count.toString();
    }
}

/**
 * 格式化时间为"几天前"的形式
 * @param {Date} date - 日期对象
 * @returns {string} 格式化后的时间字符串
 */
function formatTimeAgo(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
        return '刚刚';
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes}分钟前`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours}小时前`;
    } else if (diffInSeconds < 2592000) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days}天前`;
    } else if (diffInSeconds < 31536000) {
        const months = Math.floor(diffInSeconds / 2592000);
        return `${months}个月前`;
    } else {
        const years = Math.floor(diffInSeconds / 31536000);
        return `${years}年前`;
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init); 