/**
 * edit.js - 个人设置页面交互逻辑
 */

// 页面元素 - 顶部导航
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const userMenuButton = document.getElementById('user-menu-button');
const userDropdown = document.getElementById('user-dropdown');
const userAvatar = document.getElementById('user-avatar');
const usernameDisplay = document.getElementById('username-display');
const logoutButton = document.getElementById('logout-button');

// 页面元素 - 选项卡
const profileTab = document.getElementById('profile-tab');
const videosTab = document.getElementById('videos-tab');
const securityTab = document.getElementById('security-tab');
const profileSection = document.getElementById('profile-section');
const videosSection = document.getElementById('videos-section');
const securitySection = document.getElementById('security-section');

// 页面元素 - 个人信息表单
const profileForm = document.getElementById('profile-form');
const previewAvatar = document.getElementById('preview-avatar');
const avatarUploadButton = document.getElementById('avatar-upload-button');
const avatarInput = document.getElementById('avatar-input');
const usernameInput = document.getElementById('username');
const bioInput = document.getElementById('bio');

// 页面元素 - 视频管理
const videoSort = document.getElementById('video-sort');
const myVideosLoading = document.getElementById('my-videos-loading');
const noMyVideosMessage = document.getElementById('no-my-videos-message');
const myVideosList = document.getElementById('my-videos-list');
const myVideosPagination = document.getElementById('my-videos-pagination');
const myVideosPrevPage = document.getElementById('my-videos-prev-page');
const myVideosNextPage = document.getElementById('my-videos-next-page');
const myVideosPageNumbers = document.getElementById('my-videos-page-numbers');

// 页面元素 - 账号安全
const passwordForm = document.getElementById('password-form');
const currentPasswordInput = document.getElementById('current-password');
const newPasswordInput = document.getElementById('new-password');
const confirmPasswordInput = document.getElementById('confirm-password');
const logoutAccountButton = document.getElementById('logout-account-button');

// 页面元素 - 弹窗
const editCoverModal = document.getElementById('edit-cover-modal');
const closeCoverModal = document.getElementById('close-cover-modal');
const previewCover = document.getElementById('preview-cover');
const coverUploadButton = document.getElementById('cover-upload-button');
const coverInput = document.getElementById('cover-input');
const cancelCoverEdit = document.getElementById('cancel-cover-edit');
const saveCoverEdit = document.getElementById('save-cover-edit');

const deleteVideoModal = document.getElementById('delete-video-modal');
const closeDeleteModal = document.getElementById('close-delete-modal');
const deleteVideoTitle = document.getElementById('delete-video-title');
const cancelDelete = document.getElementById('cancel-delete');
const confirmDelete = document.getElementById('confirm-delete');

// 状态变量
let currentAvatar = null; // 当前选择的头像文件
let currentCover = null; // 当前选择的封面文件
let currentPage = 1; // 当前页码
let pageSize = 5; // 每页显示数量
let totalPages = 0; // 总页数
let sortBy = 'latest'; // 排序方式：'latest' 或 'popular'

/**
 * 初始化页面
 */
async function init() {
    // 检查用户登录状态
    checkLoginStatus();
    
    // 注册事件监听器
    registerEventListeners();
    
    // 加载个人信息
    await loadUserProfile();
    
    // 加载用户视频
    await loadMyVideos();
}

/**
 * 检查用户登录状态
 */
function checkLoginStatus() {
    const currentUser = window.authAPI.getCurrentUser();
    
    // if (!currentUser) {
    //     // 未登录，跳转到登录页面
    //     window.location.href = '/login.html';
    //     return;
    // }
    
    // 已登录，更新用户信息
    try {
        userAvatar.src = currentUser.avatar;
        usernameDisplay.textContent = currentUser.username;
    } catch (error) {
        
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
    console.log('注册')
    // 选项卡切换
    profileTab.addEventListener('click', () => switchTab('profile'));
    videosTab.addEventListener('click', () => switchTab('videos'));
    securityTab.addEventListener('click', () => switchTab('security'));
    
    // 个人信息表单相关
    profileForm.addEventListener('submit', handleProfileSubmit);
    avatarUploadButton.addEventListener('click', () => avatarInput.click());
    avatarInput.addEventListener('change', handleAvatarChange);
    
    // 视频管理相关
    videoSort.addEventListener('change', handleVideoSortChange);
    myVideosPrevPage.addEventListener('click', () => changePage(currentPage - 1));
    myVideosNextPage.addEventListener('click', () => changePage(currentPage + 1));
    
    // 账号安全相关
    passwordForm.addEventListener('submit', handlePasswordSubmit);
    logoutAccountButton.addEventListener('click', handleLogout);
    
    // 视频封面编辑弹窗相关
    closeCoverModal.addEventListener('click', closeEditCoverModal);
    coverUploadButton.addEventListener('click', () => coverInput.click());
    coverInput.addEventListener('change', handleCoverChange);
    cancelCoverEdit.addEventListener('click', closeEditCoverModal);
    saveCoverEdit.addEventListener('click', handleSaveCover);
    
    // 删除视频弹窗相关
    closeDeleteModal.addEventListener('click', closeDeleteVideoModal);
    cancelDelete.addEventListener('click', closeDeleteVideoModal);
    confirmDelete.addEventListener('click', handleDeleteVideo);
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
        window.location.href = '/login.html';
    } catch (error) {
        showNotification('退出登录失败，请重试', 'error');
    }
}

/**
 * 切换选项卡
 * @param {string} tab - 选项卡名称：'profile', 'videos', 或 'security'
 */
function switchTab(tab) {
    // 移除所有选项卡的激活状态
    profileTab.classList.remove('text-pink-600', 'border-b-2', 'border-pink-600');
    profileTab.classList.add('text-gray-500');
    videosTab.classList.remove('text-pink-600', 'border-b-2', 'border-pink-600');
    videosTab.classList.add('text-gray-500');
    securityTab.classList.remove('text-pink-600', 'border-b-2', 'border-pink-600');
    securityTab.classList.add('text-gray-500');
    
    // 隐藏所有内容区域
    profileSection.classList.add('hidden');
    videosSection.classList.add('hidden');
    securitySection.classList.add('hidden');
    // 激活选中的选项卡
    if (tab === 'profile') {
        profileTab.classList.remove('text-gray-500');
        profileTab.classList.add('text-pink-600', 'border-b-2', 'border-pink-600');
        profileSection.classList.remove('hidden');
    } else if (tab === 'videos') {
        videosTab.classList.remove('text-gray-500');
        videosTab.classList.add('text-pink-600', 'border-b-2', 'border-pink-600');
        videosSection.classList.remove('hidden');
    } else if (tab === 'security') {
        securityTab.classList.remove('text-gray-500');
        securityTab.classList.add('text-pink-600', 'border-b-2', 'border-pink-600');
        securitySection.classList.remove('hidden');
    }
}

/**
 * 加载用户个人资料
 */
async function loadUserProfile() {
    try {
        // 获取当前用户
        const currentUser = window.authAPI.getCurrentUser();
        if (!currentUser) return;
        
        // 获取用户详细信息
        const userDetails = await getUserDetails(currentUser.userId);
        
        // 更新表单
        previewAvatar.src = userDetails.avatar;
        usernameInput.value = userDetails.username;
        bioInput.value = userDetails.bio || '';
    } catch (error) {
        console.error('加载用户资料失败:', error);
        showNotification('加载用户资料失败，请刷新页面重试', 'error');
    }
}

/**
 * 处理头像更改
 * @param {Event} event - 文件输入事件
 */
function handleAvatarChange(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // 验证文件类型
    if (!file.type.match('image/*')) {
        showNotification('请上传图片文件', 'error');
        return;
    }
    
    // 验证文件大小 (最大2MB)
    if (file.size > 2 * 1024 * 1024) {
        showNotification('图片大小不能超过2MB', 'error');
        return;
    }
    
    // 创建图片预览
    const reader = new FileReader();
    reader.onload = function(e) {
        previewAvatar.src = e.target.result;
        // 添加预览动画
        previewAvatar.classList.add('animate-pulse');
        setTimeout(() => {
            previewAvatar.classList.remove('animate-pulse');
        }, 1000);
    };
    reader.readAsDataURL(file);
    
    // 保存文件引用
    currentAvatar = file;
}

/**
 * 处理个人资料表单提交
 * @param {Event} event - 表单提交事件
 */
async function handleProfileSubmit(event) {
    event.preventDefault();
    
    try {
        // 获取表单数据
        const username = usernameInput.value.trim();
        const bio = bioInput.value.trim();
        
        if (!username) {
            showNotification('用户名不能为空', 'error');
            return;
        }
        
        // 显示加载状态
        const submitButton = profileForm.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = '保存中...';
        
        // 模拟API请求
        console.log('更新个人资料:', { username, bio });
        
        // 这里应该调用实际的API更新个人资料
        // 如果有头像文件，也需要上传
        if (currentAvatar) {
            console.log('更新头像:', currentAvatar.name);
        }
        
        // 模拟延迟
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 更新页面显示的用户名
        usernameDisplay.textContent = username;
        
        // 显示成功消息
        showNotification('个人资料更新成功', 'success');
        
        // 添加成功动画
        profileForm.classList.add('animate-pulse');
        setTimeout(() => {
            profileForm.classList.remove('animate-pulse');
        }, 1000);
    } catch (error) {
        console.error('更新个人资料失败:', error);
        showNotification('更新个人资料失败，请重试', 'error');
    } finally {
        // 恢复按钮状态
        const submitButton = profileForm.querySelector('button[type="submit"]');
        submitButton.disabled = false;
        submitButton.textContent = originalText;
    }
}

/**
 * 加载用户视频
 */
async function loadMyVideos() {
    try {
        // 显示加载状态
        myVideosLoading.classList.remove('hidden');
        noMyVideosMessage.classList.add('hidden');
        myVideosList.classList.add('hidden');
        myVideosPagination.classList.add('hidden');
        
        // 获取视频列表
        const result = await window.videoAPI.getMyVideos({
            page: currentPage,
            pageSize,
            sort: sortBy
        });
        
        // 更新状态变量
        totalPages = result.pagination.totalPages;
        
        // 隐藏加载状态
        myVideosLoading.classList.add('hidden');
        
        // 如果没有视频，显示提示信息
        if (result.videos.length === 0) {
            noMyVideosMessage.classList.remove('hidden');
            return;
        }
        
        // 渲染视频列表
        renderMyVideos(result.videos);
        
        // 更新分页控件
        renderMyVideosPagination();
    } catch (error) {
        console.error('加载视频列表失败:', error);
        myVideosLoading.classList.add('hidden');
        showNotification('加载视频列表失败，请刷新页面重试', 'error');
    }
}

/**
 * 渲染用户视频列表
 * @param {Array} videos - 视频数据数组
 */
function renderMyVideos(videos) {
    myVideosList.innerHTML = '';
    
    videos.forEach(video => {
        const videoCard = document.createElement('div');
        videoCard.className = 'video-manage-card bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 flex';
        
        // 格式化时间和播放量
        const uploadTimeFormatted = formatTimeAgo(new Date(video.uploadTime));
        const viewCountFormatted = formatCount(video.viewCount);
        
        videoCard.innerHTML = `
            <div class="flex-shrink-0">
                <div class="relative w-48 h-28">
                    <img src="${video.coverUrl}" alt="${video.title}" class="w-full h-full object-cover">
                    <span class="absolute bottom-1 right-1 bg-black bg-opacity-70 text-white text-xs px-1 rounded">
                        ${video.duration}
                    </span>
                    ${video.status === 'processing' ? 
                        `<div class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <span class="text-white text-xs px-2 py-1 bg-yellow-500 rounded">处理中</span>
                        </div>` : ''}
                </div>
            </div>
            <div class="flex-grow p-4 flex flex-col justify-between">
                <div>
                    <h3 class="text-sm font-medium line-clamp-2" title="${video.title}">${video.title}</h3>
                    <div class="mt-1 flex items-center text-xs text-gray-500">
                        <span class="mr-3">${uploadTimeFormatted}</span>
                        <span>${viewCountFormatted}次播放</span>
                    </div>
                </div>
                <div class="flex justify-end space-x-2 video-manage-actions">
                    <button class="video-action-button px-3 py-1 text-xs border border-gray-300 rounded-md hover:bg-gray-50" onclick="openEditCoverModal('${video.videoId}', '${video.coverUrl}', '${video.title}')">
                        修改封面
                    </button>
                    <button class="video-action-button px-3 py-1 text-xs bg-red-600 text-white rounded-md hover:bg-red-700" onclick="openDeleteVideoModal('${video.videoId}', '${video.title}')">
                        删除视频
                    </button>
                </div>
            </div>
        `;
        
        myVideosList.appendChild(videoCard);
    });
    
    myVideosList.classList.remove('hidden');
}

/**
 * 渲染分页控件
 */
function renderMyVideosPagination() {
    if (totalPages <= 1) {
        myVideosPagination.classList.add('hidden');
        return;
    }
    
    // 显示分页控件
    myVideosPagination.classList.remove('hidden');
    
    // 设置上一页、下一页按钮状态
    myVideosPrevPage.disabled = currentPage === 1;
    myVideosNextPage.disabled = currentPage === totalPages;
    
    // 生成页码
    myVideosPageNumbers.innerHTML = '';
    
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
            myVideosPageNumbers.appendChild(ellipsis);
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
            myVideosPageNumbers.appendChild(ellipsis);
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
    
    myVideosPageNumbers.appendChild(pageButton);
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
    loadMyVideos();
    
    // 滚动到视频列表顶部
    myVideosList.scrollIntoView({ behavior: 'smooth' });
}

/**
 * 处理视频排序方式更改
 */
function handleVideoSortChange() {
    const newSortBy = videoSort.value;
    if (newSortBy !== sortBy) {
        // 添加过渡动画
        myVideosList.style.opacity = '0';
        setTimeout(() => {
            sortBy = newSortBy;
            currentPage = 1; // 重置为第一页
            loadMyVideos();
            myVideosList.style.opacity = '1';
        }, 300);
    }
}

/**
 * 打开编辑封面弹窗
 * @param {string} videoId - 视频ID
 * @param {string} coverUrl - 封面图片URL
 * @param {string} title - 视频标题
 */
function openEditCoverModal(videoId, coverUrl, title) {
    // 重置状态
    currentCover = null;
    coverInput.value = '';
    
    // 设置弹窗内容
    previewCover.src = coverUrl;
    saveCoverEdit.dataset.videoId = videoId;
    
    // 显示弹窗
    editCoverModal.classList.remove('hidden');
}

/**
 * 关闭编辑封面弹窗
 */
function closeEditCoverModal() {
    editCoverModal.classList.add('hidden');
}

/**
 * 处理封面更改
 * @param {Event} event - 文件输入事件
 */
function handleCoverChange(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // 验证文件类型
    if (!file.type.match('image/*')) {
        showNotification('请上传图片文件', 'error');
        return;
    }
    
    // 验证文件大小 (最大2MB)
    if (file.size > 2 * 1024 * 1024) {
        showNotification('图片大小不能超过2MB', 'error');
        return;
    }
    
    // 显示预览
    previewCover.src = URL.createObjectURL(file);
    
    // 保存文件引用
    currentCover = file;
}

/**
 * 处理保存封面
 */
async function handleSaveCover() {
    try {
        if (!currentCover) {
            showNotification('请选择一个新的封面图片', 'error');
            return;
        }
        
        const videoId = saveCoverEdit.dataset.videoId;
        
        // 显示加载状态
        saveCoverEdit.disabled = true;
        saveCoverEdit.textContent = '保存中...';
        
        // 添加加载动画
        previewCover.classList.add('animate-pulse');
        
        // 调用API更新封面
        const result = await window.videoAPI.updateVideoCover(videoId, currentCover);
        
        // 关闭弹窗
        closeEditCoverModal();
        
        // 重新加载视频列表
        await loadMyVideos();
        
        // 显示成功消息
        showNotification('视频封面更新成功', 'success');
    } catch (error) {
        console.error('更新视频封面失败:', error);
        showNotification(error.message || '更新视频封面失败，请重试', 'error');
    } finally {
        // 恢复按钮状态
        saveCoverEdit.disabled = false;
        saveCoverEdit.textContent = '保存';
        previewCover.classList.remove('animate-pulse');
    }
}

/**
 * 打开删除视频确认弹窗
 * @param {string} videoId - 视频ID
 * @param {string} title - 视频标题
 */
function openDeleteVideoModal(videoId, title) {
    // 设置弹窗内容
    deleteVideoTitle.textContent = title;
    confirmDelete.dataset.videoId = videoId;
    
    // 显示弹窗
    deleteVideoModal.classList.remove('hidden');
}

/**
 * 关闭删除视频确认弹窗
 */
function closeDeleteVideoModal() {
    deleteVideoModal.classList.add('hidden');
}

/**
 * 处理删除视频
 */
async function handleDeleteVideo() {
    try {
        const videoId = confirmDelete.dataset.videoId;
        
        // 显示加载状态
        confirmDelete.disabled = true;
        confirmDelete.textContent = '删除中...';
        
        // 调用API删除视频
        await window.videoAPI.deleteVideo(videoId);
        
        // 关闭弹窗
        closeDeleteVideoModal();
        
        // 重新加载视频列表
        await loadMyVideos();
        
        // 显示成功消息
        showNotification('视频删除成功', 'success');
    } catch (error) {
        console.error('删除视频失败:', error);
        showNotification(error.message || '删除视频失败，请重试', 'error');
    } finally {
        // 恢复按钮状态
        confirmDelete.disabled = false;
        confirmDelete.textContent = '确认删除';
    }
}

/**
 * 处理密码修改表单提交
 * @param {Event} event - 表单提交事件
 */
async function handlePasswordSubmit(event) {
    event.preventDefault();
    
    try {
        // 获取表单数据
        const currentPassword = currentPasswordInput.value;
        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        // 验证数据
        if (!currentPassword) {
            showNotification('请输入当前密码', 'error');
            return;
        }
        
        if (!newPassword) {
            showNotification('请输入新密码', 'error');
            return;
        }
        
        if (newPassword.length < 8) {
            showNotification('新密码长度至少为8位', 'error');
            return;
        }
        
        if (!/[a-zA-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
            showNotification('新密码必须包含字母和数字', 'error');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            showNotification('两次输入的密码不一致', 'error');
            return;
        }
        
        // 模拟API请求
        console.log('修改密码:', { currentPassword, newPassword });
        
        // 这里应该调用实际的API修改密码
        
        // 模拟延迟
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 重置表单
        passwordForm.reset();
        
        // 显示成功消息
        showNotification('密码修改成功', 'success');
    } catch (error) {
        console.error('修改密码失败:', error);
        showNotification('修改密码失败，请重试', 'error');
    }
}

/**
 * 显示通知消息
 * @param {string} message - 消息内容
 * @param {string} type - 消息类型：'success', 'error', 或 'info'
 */
function showNotification(message, type = 'info') {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `notification notification-${type} transform transition-all duration-300 translate-x-full`;
    notification.textContent = message;
    
    // 添加到页面
    document.body.appendChild(notification);
    
    // 触发重排以启用动画
    notification.offsetHeight;
    
    // 显示动画
    notification.classList.remove('translate-x-full');
    
    // 3秒后自动移除
    setTimeout(() => {
        notification.classList.add('translate-x-full');
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

// 暴露一些函数到全局作用域，以便HTML元素的事件处理
window.openEditCoverModal = openEditCoverModal;
window.openDeleteVideoModal = openDeleteVideoModal;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init); 