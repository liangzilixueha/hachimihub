/**
 * search.js - 搜索页面交互逻辑
 */

// 页面元素
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const searchKeywordElement = document.getElementById('search-keyword');
const searchResultCountElement = document.getElementById('search-result-count');
const resultContainer = document.getElementById('result-container');
const emptyResultElement = document.getElementById('empty-result');
const loadingResultElement = document.getElementById('loading-result');
const searchResultsElement = document.getElementById('search-results');
const pageNumbersContainer = document.getElementById('page-numbers');
const prevPageButton = document.getElementById('prev-page');
const nextPageButton = document.getElementById('next-page');

// 用户信息相关元素
const userAvatar = document.getElementById('user-avatar');
const userMenu = document.getElementById('user-menu');
const notLoggedInSection = document.getElementById('not-logged-in');
const loggedInSection = document.getElementById('logged-in');
const usernameElement = document.getElementById('username');
const userLevelElement = document.getElementById('user-level');
const logoutBtn = document.getElementById('logout-btn');

// 状态变量
let currentKeyword = '';
let currentPage = 1;
let totalPages = 1;
let pageSize = 10; // 每页显示的视频数量

/**
 * 初始化函数
 */
async function init() {
    // 从URL中获取搜索关键词
    const urlParams = new URLSearchParams(window.location.search);
    currentKeyword = urlParams.get('keyword') || '';
    
    // 设置搜索输入框的值
    if (currentKeyword) {
        searchInput.value = currentKeyword;
        searchKeywordElement.textContent = currentKeyword;
        
        // 执行搜索
        await performSearch(currentKeyword, currentPage);
    } else {
        // 如果没有关键词，显示空结果
        showEmptyResult();
    }
    
    // 初始化用户状态
    await checkUserLoginStatus();
    
    // 初始化事件监听器
    initEventListeners();
}

/**
 * 初始化事件监听器
 */
function initEventListeners() {
    // 搜索按钮点击事件
    searchButton.addEventListener('click', handleSearch);
    
    // 搜索框回车事件
    searchInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    });
    
    // 分页按钮点击事件
    prevPageButton.addEventListener('click', handlePrevPage);
    nextPageButton.addEventListener('click', handleNextPage);
    
    // 用户头像点击事件 - 显示/隐藏用户菜单
    userAvatar.addEventListener('click', toggleUserMenu);
    
    // 点击页面其他地方隐藏用户菜单
    document.addEventListener('click', (event) => {
        if (!userAvatar.contains(event.target) && !userMenu.contains(event.target)) {
            userMenu.classList.remove('active');
        }
    });
    
    // 退出登录按钮点击事件
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

/**
 * 处理搜索按钮点击
 */
function handleSearch() {
    const keyword = searchInput.value.trim();
    if (keyword) {
        // 更新URL，但不重新加载页面
        const url = new URL(window.location);
        url.searchParams.set('keyword', keyword);
        window.history.pushState({}, '', url);
        
        // 更新关键词显示
        currentKeyword = keyword;
        searchKeywordElement.textContent = keyword;
        
        // 重置到第一页并执行搜索
        currentPage = 1;
        performSearch(keyword, currentPage);
    }
}

/**
 * 执行搜索
 * @param {string} keyword - 搜索关键词
 * @param {number} page - 页码
 */
async function performSearch(keyword, page) {
    // 显示加载中
    showLoadingResult();
    
    try {
        // 调用搜索API
        const searchResult = await window.videoAPI.searchVideos(keyword, page, pageSize);
        
        // 检查搜索结果
        if (!searchResult.success) {
            throw new Error(searchResult.error || '搜索失败');
        }
        
        // 更新结果计数
        searchResultCountElement.textContent = searchResult.pagination.totalVideos || 0;
        
        // 计算总页数
        totalPages = searchResult.pagination.totalPages || 1;
        
        // 如果没有结果
        if (!searchResult.videos || searchResult.videos.length === 0) {
            showEmptyResult();
            return;
        }
        
        // 渲染搜索结果
        renderSearchResults(searchResult.videos);
        
        // 渲染分页
        renderPagination();
        
        // 显示结果区域
        showSearchResults();
    } catch (error) {
        console.error('搜索错误:', error);
        showEmptyResult();
    }
}

/**
 * 渲染搜索结果
 * @param {Array} videos - 视频数组
 */
function renderSearchResults(videos) {
    // 清空结果容器
    resultContainer.innerHTML = '';
    
    // 遍历视频数组，创建卡片
    videos.forEach(video => {
        const videoCard = createVideoCard(video);
        resultContainer.appendChild(videoCard);
    });
}

/**
 * 创建视频卡片
 * @param {Object} video - 视频对象
 * @returns {HTMLElement} - 视频卡片元素
 */
function createVideoCard(video) {
    const card = document.createElement('div');
    card.className = 'video-card bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow';
    
    // 格式化播放量
    const viewCount = formatViewCount(video.watch || 0);
    
    // 格式化时间
    const timeAgo = formatTimeAgo(video.createTime || new Date().toISOString());
    
    card.innerHTML = `
        <div class="relative">
            <img src="${video.coverUrl || 'https://via.placeholder.com/300x200?text=Video'}" alt="${video.title}" class="w-full h-40 object-cover">
            <span class="absolute bottom-1 right-1 bg-black bg-opacity-70 text-white text-xs px-1 rounded">${video.duration || '00:00'}</span>
        </div>
        <div class="p-3">
            <h3 class="text-sm font-medium text-gray-900 truncate">${video.title}</h3>
            <div class="flex items-center mt-2">
                <a href="/user/${video.user?.userId || 'unknown'}" class="flex items-center">
                    <img src="${video.user?.avatar || 'https://via.placeholder.com/24'}" alt="${video.user?.username || '用户'}" class="w-5 h-5 rounded-full mr-1">
                    <span class="text-xs text-gray-600 truncate">${video.user?.username || '未知用户'}</span>
                </a>
            </div>
            <div class="text-xs text-gray-500 mt-1">
                <span>${viewCount}播放</span>
                <span class="ml-2">${timeAgo}</span>
            </div>
        </div>
    `;
    
    // 添加点击事件，跳转到视频页面
    card.addEventListener('click', () => {
        window.location.href = `/video/hjm${video.id}`;
    });
    
    return card;
}

/**
 * 渲染分页控件
 */
function renderPagination() {
    // 清空页码容器
    pageNumbersContainer.innerHTML = '';
    
    // 设置上一页按钮状态
    prevPageButton.disabled = currentPage <= 1;
    
    // 设置下一页按钮状态
    nextPageButton.disabled = currentPage >= totalPages;
    
    // 确定要显示的页码范围
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
    // 如果页数不足5页，调整起始页
    if (endPage - startPage < 4) {
        startPage = Math.max(1, endPage - 4);
    }
    
    // 添加第一页按钮（如果不在范围内）
    if (startPage > 1) {
        addPageButton(1);
        
        // 如果起始页不是第二页，添加省略号
        if (startPage > 2) {
            addEllipsis();
        }
    }
    
    // 添加中间的页码按钮
    for (let i = startPage; i <= endPage; i++) {
        addPageButton(i);
    }
    
    // 添加最后一页按钮（如果不在范围内）
    if (endPage < totalPages) {
        // 如果结束页不是倒数第二页，添加省略号
        if (endPage < totalPages - 1) {
            addEllipsis();
        }
        
        addPageButton(totalPages);
    }
}

/**
 * 添加页码按钮
 * @param {number} pageNumber - 页码
 */
function addPageButton(pageNumber) {
    const button = document.createElement('button');
    button.textContent = pageNumber;
    button.className = pageNumber === currentPage ? 'active' : '';
    button.addEventListener('click', () => goToPage(pageNumber));
    pageNumbersContainer.appendChild(button);
}

/**
 * 添加省略号
 */
function addEllipsis() {
    const ellipsis = document.createElement('button');
    ellipsis.textContent = '...';
    ellipsis.className = 'cursor-default';
    ellipsis.disabled = true;
    pageNumbersContainer.appendChild(ellipsis);
}

/**
 * 跳转到指定页
 * @param {number} pageNumber - 页码
 */
function goToPage(pageNumber) {
    if (pageNumber !== currentPage && pageNumber >= 1 && pageNumber <= totalPages) {
        currentPage = pageNumber;
        performSearch(currentKeyword, currentPage);
        
        // 滚动到页面顶部
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

/**
 * 处理上一页按钮点击
 */
function handlePrevPage() {
    if (currentPage > 1) {
        goToPage(currentPage - 1);
    }
}

/**
 * 处理下一页按钮点击
 */
function handleNextPage() {
    if (currentPage < totalPages) {
        goToPage(currentPage + 1);
    }
}

/**
 * 显示加载中状态
 */
function showLoadingResult() {
    emptyResultElement.classList.add('hidden');
    searchResultsElement.classList.add('hidden');
    loadingResultElement.classList.remove('hidden');
}

/**
 * 显示搜索结果
 */
function showSearchResults() {
    emptyResultElement.classList.add('hidden');
    loadingResultElement.classList.add('hidden');
    searchResultsElement.classList.remove('hidden');
}

/**
 * 显示空结果状态
 */
function showEmptyResult() {
    searchResultsElement.classList.add('hidden');
    loadingResultElement.classList.add('hidden');
    emptyResultElement.classList.remove('hidden');
}

/**
 * 检查用户登录状态
 */
async function checkUserLoginStatus() {
    try {
        const userInfo = await window.authAPI.getCurrentUser()
        
        if (userInfo && userInfo.user_id) {
            // 用户已登录
            updateUserUI(userInfo);
        } else {
            // 用户未登录
            showNotLoggedInUI();
        }
    } catch (error) {
        console.error('检查登录状态失败:', error);
        showNotLoggedInUI();
    }
}

/**
 * 更新用户UI
 * @param {Object} userInfo - 用户信息
 */
function updateUserUI(userInfo) {
    // 隐藏未登录区域，显示已登录区域
    if (notLoggedInSection) notLoggedInSection.classList.add('hidden');
    if (loggedInSection) loggedInSection.classList.remove('hidden');
    
    // 更新用户名和等级
    if (usernameElement) usernameElement.textContent = userInfo.username || '用户';
    if (userLevelElement) userLevelElement.textContent = `等级: ${userInfo.level || 1}`;
    
    // 更新头像
    const avatarImg = userAvatar.querySelector('img');
    if (avatarImg && userInfo.avatar) {
        avatarImg.src = userInfo.avatar;
    }
}

/**
 * 显示未登录的UI
 */
function showNotLoggedInUI() {
    // 显示未登录区域，隐藏已登录区域
    if (notLoggedInSection) notLoggedInSection.classList.remove('hidden');
    if (loggedInSection) loggedInSection.classList.add('hidden');
    
    // 恢复默认头像
    const avatarImg = userAvatar.querySelector('img');
    if (avatarImg) {
        avatarImg.src = 'https://via.placeholder.com/100?text=User';
    }
}

/**
 * 切换用户菜单显示/隐藏
 */
function toggleUserMenu() {
    userMenu.classList.toggle('active');
    userMenu.classList.toggle('hidden');
}

/**
 * 处理退出登录
 * @param {Event} event - 事件对象
 */
async function handleLogout(event) {
    event.preventDefault();
    
    try {
        const success = await window.userAPI.logout();
        
        if (success) {
            // 退出成功，更新UI
            showNotLoggedInUI();
            toggleUserMenu(); // 隐藏菜单
            
            // 显示成功消息
            showMessage('退出登录成功', 'success');
        } else {
            // 退出失败
            showMessage('退出登录失败，请重试', 'error');
        }
    } catch (error) {
        console.error('退出登录错误:', error);
        showMessage('退出登录时发生错误', 'error');
    }
}

/**
 * 显示消息提示
 * @param {string} message - 消息内容
 * @param {string} type - 消息类型：'info', 'success', 'error', 'warning'
 */
function showMessage(message, type = 'info') {
    // 创建消息元素
    const messageElement = document.createElement('div');
    let bgColor = 'bg-blue-500';
    
    if (type === 'success') {
        bgColor = 'bg-green-500';
    } else if (type === 'error') {
        bgColor = 'bg-red-500';
    } else if (type === 'warning') {
        bgColor = 'bg-yellow-500';
    }
    
    messageElement.className = `fixed top-4 right-4 ${bgColor} text-white px-4 py-2 rounded shadow-lg z-50 animate-fade-in`;
    messageElement.textContent = message;
    
    // 添加到页面
    document.body.appendChild(messageElement);
    
    // 3秒后自动移除
    setTimeout(() => {
        messageElement.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(messageElement);
        }, 300);
    }, 3000);
}

/**
 * 格式化播放量
 * @param {number} count - 播放量
 * @returns {string} - 格式化后的字符串
 */
function formatViewCount(count) {
    if (count >= 10000) {
        return (count / 10000).toFixed(1) + '万';
    }
    return count.toString();
}

/**
 * 格式化时间为"多久前"的形式
 * @param {string} dateString - ISO日期字符串
 * @returns {string} - 格式化后的时间字符串
 */
function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffSeconds = Math.floor((now - date) / 1000);
    
    if (diffSeconds < 60) {
        return '刚刚';
    }
    
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) {
        return `${diffMinutes}分钟前`;
    }
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) {
        return `${diffHours}小时前`;
    }
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) {
        return `${diffDays}天前`;
    }
    
    const diffWeeks = Math.floor(diffDays / 7);
    if (diffWeeks < 4) {
        return `${diffWeeks}周前`;
    }
    
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) {
        return `${diffMonths}个月前`;
    }
    
    const diffYears = Math.floor(diffDays / 365);
    return `${diffYears}年前`;
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init); 