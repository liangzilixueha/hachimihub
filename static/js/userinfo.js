/**
 * userinfo.js - 用户信息页面交互逻辑
 */

// 页面元素
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const userMenuButton = document.getElementById('user-menu-button');
const userDropdown = document.getElementById('user-dropdown');
const loggedInView = document.getElementById('logged-in-view');
const notLoggedInView = document.getElementById('not-logged-in-view');
const userAvatar = document.getElementById('user-avatar');
const usernameDisplay = document.getElementById('username-display');
const logoutButton = document.getElementById('logout-button');

// 个人信息元素
const profileAvatar = document.getElementById('profile-avatar');
const profileUsername = document.getElementById('profile-username');
const profileId = document.getElementById('profile-id');
const profileRegisterTime = document.getElementById('profile-register-time');
const profileBio = document.getElementById('profile-bio');
const profileVideoCount = document.getElementById('profile-video-count');
const profileLikeCount = document.getElementById('profile-like-count');
const profileViewCount = document.getElementById('profile-view-count');

// 视频列表元素
const videosLoading = document.getElementById('videos-loading');
const noVideosMessage = document.getElementById('no-videos-message');
const userVideos = document.getElementById('user-videos');
const sortLatest = document.getElementById('sort-latest');
const sortPopular = document.getElementById('sort-popular');
const pagination = document.getElementById('pagination');
const prevPageButton = document.getElementById('prev-page');
const nextPageButton = document.getElementById('next-page');
const pageNumbers = document.getElementById('page-numbers');

// 状态变量
let currentUserId = null;
let currentPage = 1;
let pageSize = 10;
let totalPages = 0;
let totalVideos = 0;
let sortBy = 'latest'; // 'latest' 或 'popular'

/**
 * 初始化页面
 */
async function init() {
    // 注册事件监听器
    searchButton.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', e => {
        if (e.key === 'Enter') handleSearch();
    });
    
    if (userMenuButton) {
        userMenuButton.addEventListener('click', toggleUserMenu);
    }
    
    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    }
    
    // 排序按钮
    sortLatest.addEventListener('click', () => changeSort('latest'));
    sortPopular.addEventListener('click', () => changeSort('popular'));
    
    // 分页按钮
    prevPageButton.addEventListener('click', () => changePage(currentPage - 1));
    nextPageButton.addEventListener('click', () => changePage(currentPage + 1));
    
    // 点击页面其他位置关闭用户菜单
    document.addEventListener('click', e => {
        if (userMenuButton && !userMenuButton.contains(e.target) && !userDropdown.contains(e.target)) {
            userDropdown.classList.add('hidden');
        }
    });
    
    // 检查用户登录状态
    checkLoginStatus();
    
    // 获取URL中的用户ID
    const userId = getUserIdFromUrl();
    if (userId) {
        currentUserId = userId;
        await loadUserProfile(userId);
        await loadUserVideos(userId);
    } else {
        // 如果URL中没有用户ID，显示错误信息
        showError('用户ID无效，请检查URL');
    }
}

/**
 * 从URL中获取用户ID
 * @returns {string|null} 用户ID或null
 */
function getUserIdFromUrl() {
    // 假设URL格式为 /hachimi/123456 或 /hachimihub/hachimi/123456
    const path = window.location.pathname;
    const matches = path.match(/\/hachimi\/([^\/]+)/);
    return 123
    return matches ? matches[1] : null;
}

/**
 * 检查用户登录状态
 */
function checkLoginStatus() {
    const currentUser = window.authAPI.getCurrentUser();
    
    if (currentUser) {
        // 用户已登录
        loggedInView.classList.remove('hidden');
        notLoggedInView.classList.add('hidden');
        
        // 更新用户信息
        userAvatar.src = currentUser.avatar;
        usernameDisplay.textContent = currentUser.username;
    } else {
        // 用户未登录
        loggedInView.classList.add('hidden');
        notLoggedInView.classList.remove('hidden');
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
        showError('退出登录失败，请重试');
    }
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
 * 加载用户个人资料
 * @param {string} userId - 用户ID
 */
async function loadUserProfile(userId) {
    try {
        // 显示加载状态
        profileUsername.textContent = '加载中...';
        profileId.textContent = 'ID: 加载中...';
        profileRegisterTime.textContent = '注册时间: 加载中...';
        profileBio.textContent = '加载中...';
        profileVideoCount.textContent = '-';
        profileLikeCount.textContent = '-';
        profileViewCount.textContent = '-';
        
        // 获取用户信息
        const userData = await window.userAPI.getUserDetails(userId);
        
        // 更新页面标题
        document.title = `${userData.username} 的个人主页 - HachimiHub`;
        
        // 更新用户基本信息
        profileAvatar.src = userData.avatar;
        profileUsername.textContent = userData.username;
        profileId.textContent = `ID: ${userData.userId}`;
        profileRegisterTime.textContent = `注册时间: ${userData.registerTime}`;
        
        // 更新用户简介
        profileBio.textContent = userData.bio || '这个人很懒，还没有填写个人简介...';
        
        // 更新统计数据，带有计数动画效果
        setTimeout(() => {
            countUp(profileVideoCount, userData.stats.videoCount);
            countUp(profileLikeCount, userData.stats.likeCount);
            countUp(profileViewCount, userData.stats.viewCount);
        }, 300);
        
    } catch (error) {
        console.error('加载用户资料失败:', error);
        showError('获取用户信息失败，请刷新页面重试');
    }
}

/**
 * 加载用户视频列表
 * @param {string} userId - 用户ID
 */
async function loadUserVideos(userId) {
    try {
        // 显示加载状态
        videosLoading.classList.remove('hidden');
        noVideosMessage.classList.add('hidden');
        userVideos.classList.add('hidden');
        pagination.classList.add('hidden');
        
        // 获取用户视频列表
        const result = await window.userAPI.getUserVideos(userId, {
            page: currentPage,
            pageSize,
            sort: sortBy
        });
        
        // 更新状态变量
        totalPages = result.pagination.totalPages;
        totalVideos = result.pagination.totalVideos;
        
        // 隐藏加载状态
        videosLoading.classList.add('hidden');
        
        // 如果没有视频，显示提示信息
        if (result.videos.length === 0) {
            noVideosMessage.classList.remove('hidden');
            return;
        }
        
        // 渲染视频列表
        renderVideoList(result.videos);
        
        // 更新分页控件
        renderPagination();
    } catch (error) {
        console.error('加载用户视频失败:', error);
        videosLoading.classList.add('hidden');
        showError('获取视频列表失败，请刷新页面重试');
    }
}

/**
 * 渲染视频列表
 * @param {Array} videos - 视频数据数组
 */
function renderVideoList(videos) {
    userVideos.innerHTML = '';
    
    videos.forEach(video => {
        const videoCard = document.createElement('div');
        videoCard.className = 'video-card bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300';
        
        // 格式化时间
        const uploadTimeFormatted = formatTimeAgo(new Date(video.uploadTime));
        
        // 格式化播放量
        const viewCountFormatted = formatCount(video.viewCount);
        
        videoCard.innerHTML = `
            <div class="relative">
                <img src="${video.coverUrl}" alt="${video.title}" class="w-full h-32 object-cover">
                <span class="absolute bottom-1 right-1 bg-black bg-opacity-70 text-white text-xs px-1 rounded">
                    ${video.duration}
                </span>
            </div>
            <div class="p-3">
                <h3 class="text-sm font-medium line-clamp-2 h-10" title="${video.title}">${video.title}</h3>
                <div class="flex justify-between items-center mt-2">
                    <div class="text-xs text-gray-500">${uploadTimeFormatted}</div>
                    <div class="text-xs text-gray-500">${viewCountFormatted}次播放</div>
                </div>
            </div>
        `;
        
        // 添加点击事件，跳转到视频详情页
        videoCard.addEventListener('click', () => {
            window.location.href = `/video/hjm${video.videoId}`;
        });
        
        userVideos.appendChild(videoCard);
    });
    
    userVideos.classList.remove('hidden');
}

/**
 * 渲染分页控件
 */
function renderPagination() {
    if (totalPages <= 1) {
        pagination.classList.add('hidden');
        return;
    }
    
    // 显示分页控件
    pagination.classList.remove('hidden');
    
    // 设置上一页、下一页按钮状态
    prevPageButton.disabled = currentPage === 1;
    nextPageButton.disabled = currentPage === totalPages;
    
    // 生成页码
    pageNumbers.innerHTML = '';
    
    // 确定显示哪些页码
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
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
            pageNumbers.appendChild(ellipsis);
        }
    }
    
    // 添加中间页码
    for (let i = startPage; i <= endPage; i++) {
        addPageNumber(i);
    }
    
    // 添加最后一页
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            // 添加省略号
            const ellipsis = document.createElement('span');
            ellipsis.className = 'px-2 py-1 text-gray-500';
            ellipsis.textContent = '...';
            pageNumbers.appendChild(ellipsis);
        }
        
        addPageNumber(totalPages);
    }
}

/**
 * 添加页码按钮
 * @param {number} pageNum - 页码
 */
function addPageNumber(pageNum) {
    const pageButton = document.createElement('div');
    pageButton.className = `page-number ${pageNum === currentPage ? 'active' : ''}`;
    pageButton.textContent = pageNum;
    
    pageButton.addEventListener('click', () => {
        if (pageNum !== currentPage) {
            changePage(pageNum);
        }
    });
    
    pageNumbers.appendChild(pageButton);
}

/**
 * 切换到指定页码
 * @param {number} page - 页码
 */
function changePage(page) {
    if (page < 1 || page > totalPages || page === currentPage) {
        return;
    }
    
    currentPage = page;
    loadUserVideos(currentUserId);
    
    // 滚动到视频列表顶部
    userVideos.scrollIntoView({ behavior: 'smooth' });
}

/**
 * 切换排序方式
 * @param {string} sort - 排序方式：'latest' 或 'popular'
 */
function changeSort(sort) {
    if (sort === sortBy) {
        return;
    }
    
    // 更新排序按钮样式
    if (sort === 'latest') {
        sortLatest.classList.remove('bg-gray-200', 'text-gray-700');
        sortLatest.classList.add('bg-pink-600', 'text-white');
        
        sortPopular.classList.remove('bg-pink-600', 'text-white');
        sortPopular.classList.add('bg-gray-200', 'text-gray-700');
    } else {
        sortPopular.classList.remove('bg-gray-200', 'text-gray-700');
        sortPopular.classList.add('bg-pink-600', 'text-white');
        
        sortLatest.classList.remove('bg-pink-600', 'text-white');
        sortLatest.classList.add('bg-gray-200', 'text-gray-700');
    }
    
    sortBy = sort;
    currentPage = 1; // 重置为第一页
    loadUserVideos(currentUserId);
}

/**
 * 数字增长动画
 * @param {HTMLElement} element - 显示数字的元素
 * @param {number} target - 目标数字
 * @param {number} duration - 动画持续时间（毫秒）
 */
function countUp(element, target, duration = 1500) {
    const startTime = performance.now();
    const startValue = 0;
    
    function updateValue(currentTime) {
        const elapsedTime = currentTime - startTime;
        
        if (elapsedTime > duration) {
            element.textContent = formatCount(target);
            return;
        }
        
        const progress = elapsedTime / duration;
        const easedProgress = 1 - Math.pow(1 - progress, 3); // 缓动效果
        const currentValue = Math.floor(startValue + (target - startValue) * easedProgress);
        
        element.textContent = formatCount(currentValue);
        requestAnimationFrame(updateValue);
    }
    
    requestAnimationFrame(updateValue);
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

/**
 * 显示错误提示
 * @param {string} message - 错误信息
 */
function showError(message) {
    // 创建错误提示元素
    const errorElement = document.createElement('div');
    errorElement.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50 animate-fade-in';
    errorElement.textContent = message;
    
    // 添加到页面
    document.body.appendChild(errorElement);
    
    // 3秒后自动移除
    setTimeout(() => {
        errorElement.classList.add('animate-fade-out');
        setTimeout(() => {
            document.body.removeChild(errorElement);
        }, 300);
    }, 3000);
}

/**
 * 显示成功提示
 * @param {string} message - 成功信息
 */
function showSuccess(message) {
    // 创建成功提示元素
    const successElement = document.createElement('div');
    successElement.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50 animate-fade-in';
    successElement.textContent = message;
    
    // 添加到页面
    document.body.appendChild(successElement);
    
    // 3秒后自动移除
    setTimeout(() => {
        successElement.classList.add('animate-fade-out');
        setTimeout(() => {
            document.body.removeChild(successElement);
        }, 300);
    }, 3000);
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init); 