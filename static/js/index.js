/**
 * index.js - 首页交互逻辑
 */

const sidebarDrawer = document.getElementById('sidebar-drawer');
const sidebarToggle = document.querySelector('.sidebar-toggle');
const featuredSwiperContainer = document.querySelector('.featured-swiper');
const randomVideosContainer = document.querySelector('.random-videos-container');
const loadMoreRandomBtn = document.getElementById('load-more-random');
let swiper;

// 初始化函数
async function init() {
    // 初始化用户状态
    await checkUserLoginStatus();
    
    // 初始化事件监听器
    initEventListeners();
    
    // 加载热门视频到轮播图
    await loadHotVideosToSwiper();
    
    // 加载随机推荐视频
    await loadRandomVideos();
}

// 初始化轮播图
function initSwiper() {
    if (swiper) {
        swiper.destroy(true, true);
    }
    
    swiper = new Swiper('.featured-swiper', {
        loop: true,
        autoplay: {
            delay: 5000,
            disableOnInteraction: false,
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
            dynamicBullets: true,
            renderBullet: function (index, className) {
                return '<span class="' + className + '"></span>';
            },
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        effect: 'fade',
        fadeEffect: {
            crossFade: true
        },
        speed: 800,
        grabCursor: true,
        lazy: true,
        keyboard: {
            enabled: true,
            onlyInViewport: true,
        },
        observer: true,
        observeParents: true
    });
}

// 初始化事件监听器
function initEventListeners() {
    
    // 搜索事件
    searchInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    });
    
    if (searchButton) {
        searchButton.addEventListener('click', handleSearch);
    }
    
    // 侧边栏切换事件
    sidebarToggle.addEventListener('click', toggleSidebar);
    
    // 加载更多随机视频事件
    if (loadMoreRandomBtn) {
        loadMoreRandomBtn.addEventListener('click', handleLoadMoreRandom);
    }
}

// 检查用户登录状态
async function checkUserLoginStatus() {
    try {
        const userInfo = await window.authAPI.isLoggedIn();
        console.log(userInfo)
    } catch (error) {
        console.error('检查登录状态失败:', error);
        showNotLoggedInUI();
    }
}

// 更新用户UI
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

// 显示未登录的UI
function showNotLoggedInUI() {
    // 显示未登录区域，隐藏已登录区域
    if (notLoggedInSection) notLoggedInSection.classList.remove('hidden');
    if (loggedInSection) loggedInSection.classList.add('hidden');
    
    // 恢复默认头像
    const avatarImg = userAvatar.querySelector('img');
    if (avatarImg) {
        avatarImg.src = 'img/default-avatar.png';
    }
}

// 切换用户菜单显示/隐藏
function toggleUserMenu() {
    if (userMenu.classList.contains('active')) {
        userMenu.classList.remove('active');
        userMenu.classList.add('hidden');
    } else {
        userMenu.classList.remove('hidden');
        userMenu.classList.add('active');
    }
}

// 处理退出登录
async function handleLogout(event) {
    event.preventDefault();
    
    try {
        const success = await window.authAPI.logout();
        
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

// 处理搜索
function handleSearch() {
    const keyword = searchInput.value.trim();
    if (keyword) {
        // 跳转到搜索结果页面
        window.location.href = `/search?keyword=${encodeURIComponent(keyword)}`;
    }
}

// 切换侧边栏
function toggleSidebar() {
    sidebarDrawer.classList.toggle('open');
    // 更新图标旋转状态
    const icon = sidebarToggle.querySelector('svg');
    if (sidebarDrawer.classList.contains('open')) {
        icon.classList.remove('rotate-180');
    } else {
        icon.classList.add('rotate-180');
    }
}

// 加载热门视频到轮播图
async function loadHotVideosToSwiper() {
    try {
        // 获取轮播图容器
        const swiperWrapper = document.querySelector('.swiper-wrapper');
        
        if (!swiperWrapper) return;
        
        // 请求热门视频
        const result = await window.videoAPI.hotVideos(5);
        
        // 移除加载中的轮播项
        swiperWrapper.innerHTML = '';
        
        if (result.success && result.videos && result.videos.length > 0) {
            // 添加轮播项
            result.videos.forEach(video => {
                const slide = createVideoSlide(video);
                swiperWrapper.appendChild(slide);
            });
        } else {
            // 如果没有视频或请求失败，显示提示信息
            const noVideoSlide = document.createElement('div');
            noVideoSlide.className = 'swiper-slide';
            noVideoSlide.innerHTML = `
                <div class="loading-slide">
                    <div class="loading-content">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <p class="mt-4 text-gray-600">${result.success ? '暂无热门视频' : (result.error || '加载失败，请刷新重试')}</p>
                    </div>
                </div>
            `;
            swiperWrapper.appendChild(noVideoSlide);
        }
        
        // 确保DOM已更新后再初始化Swiper
        setTimeout(() => {
            initSwiper();
            console.log('轮播图初始化完成');
        }, 100);
    } catch (error) {
        console.error('加载热门视频失败:', error);
        
        // 显示错误信息
        const swiperWrapper = document.querySelector('.swiper-wrapper');
        if (swiperWrapper) {
            swiperWrapper.innerHTML = `
                <div class="swiper-slide">
                    <div class="loading-slide">
                        <div class="loading-content">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-red-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p class="mt-4 text-red-500">加载热门视频失败，请刷新重试</p>
                        </div>
                    </div>
                </div>
            `;
            
            // 初始化轮播图
            setTimeout(() => {
                initSwiper();
            }, 100);
        }
    }
}

// 创建视频轮播项
function createVideoSlide(video) {
    // 创建轮播项元素
    const slide = document.createElement('div');
    slide.className = 'swiper-slide';
    
    // 格式化播放量
    const viewCount = formatViewCount(video.viewCount || 0);
    
    // 视频封面URL
    const coverUrl = video.coverUrl || 'https://via.placeholder.com/1200x400';
    
    // 设置轮播项内容
    slide.innerHTML = `
        <a href="/video/hjm${video.id}" class="block relative h-full w-full">
            <!-- 模糊背景 -->
            <div class="slide-bg" style="background-image: url('${coverUrl}');"></div>
            
            <!-- 前景图片容器 -->
            <div class="slide-image-container">
                <img src="${coverUrl}" alt="${video.title}" class="slide-image">
            </div>
            
            <!-- 视频信息 -->
            <div class="slide-content">
                <h3 class="slide-title">${video.title}</h3>
                <div class="slide-info">
                    <img src="${video.uploader?.avatar || 'https://via.placeholder.com/30'}" alt="${video.uploader?.username || '用户'}">
                    <div class="flex flex-col">
                        <span class="text-white text-opacity-90">${video.uploader?.username || '未知用户'}</span>
                        <span class="text-xs text-white text-opacity-70">${viewCount} 次播放</span>
                    </div>
                </div>
            </div>
        </a>
    `;
    
    return slide;
}

// 格式化播放量
function formatViewCount(count) {
    if (count >= 10000) {
        return (count / 10000).toFixed(1) + '万';
    }
    return count.toString();
}

// 格式化时间为相对时间
function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffDay > 30) {
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return `${month}月${day}日`;
    } else if (diffDay > 0) {
        return `${diffDay}天前`;
    } else if (diffHour > 0) {
        return `${diffHour}小时前`;
    } else if (diffMin > 0) {
        return `${diffMin}分钟前`;
    } else {
        return '刚刚';
    }
}

// 显示消息提示
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

// 创建默认头像图片（如果不存在）
function createDefaultAvatarIfNeeded() {
    const defaultAvatarPath = 'img/default-avatar.png';
    
    // 检查默认头像是否存在
    fetch(defaultAvatarPath, { method: 'HEAD' })
        .then(response => {
            if (!response.ok) {
                console.warn('默认头像不存在，使用占位图像');
                // 使用一个简单的占位头像
                const avatarImg = userAvatar.querySelector('img');
                if (avatarImg) {
                    avatarImg.src = 'https://via.placeholder.com/100?text=User';
                }
            }
        })
        .catch(() => {
            console.warn('无法检查默认头像，使用占位图像');
            const avatarImg = userAvatar.querySelector('img');
            if (avatarImg) {
                avatarImg.src = 'https://via.placeholder.com/100?text=User';
            }
        });
}

// 处理加载更多随机视频
function handleLoadMoreRandom() {
    loadRandomVideos(5, true); // 加载5个更多的视频并追加
}

// 加载随机视频
async function loadRandomVideos(limit = 5, append = false) {
    if (!randomVideosContainer) return;
    
    // 如果不是追加模式，显示加载状态
    if (!append) {
        const loadingState = randomVideosContainer.querySelector('.loading-state');
        if (loadingState) {
            // 清空容器，仅保留加载状态
            randomVideosContainer.innerHTML = '';
            randomVideosContainer.appendChild(loadingState);
        }
    } else {
        // 追加模式，修改按钮文本为加载中
        if (loadMoreRandomBtn) {
            loadMoreRandomBtn.textContent = '加载中...';
            loadMoreRandomBtn.disabled = true;
        }
    }
    
    try {
        // 请求随机视频
        const result = await window.videoAPI.randomVideos(limit);
        
        // 如果不是追加模式，移除加载状态
        if (!append) {
            randomVideosContainer.innerHTML = '';
        } else {
            // 恢复按钮状态
            if (loadMoreRandomBtn) {
                loadMoreRandomBtn.textContent = '查看更多';
                loadMoreRandomBtn.disabled = false;
            }
        }
        
        if (result.success && result.videos && result.videos.length > 0) {
            // 添加视频卡片
            result.videos.forEach(video => {
                const videoCard = createVideoCard(video);
                randomVideosContainer.appendChild(videoCard);
            });
        } else {
            // 如果没有视频或请求失败
            if (!append || randomVideosContainer.children.length === 0) {
                // 仅在非追加模式或容器为空时显示提示
                const emptyMessage = document.createElement('div');
                emptyMessage.className = 'col-span-5 text-center py-8';
                emptyMessage.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <p class="mt-4 text-gray-600">${result.success ? '暂无推荐视频' : (result.error || '加载失败，请刷新重试')}</p>
                `;
                randomVideosContainer.appendChild(emptyMessage);
                
                // 隐藏加载更多按钮
                if (loadMoreRandomBtn) {
                    loadMoreRandomBtn.style.display = 'none';
                }
            }
        }
    } catch (error) {
        console.error('加载随机视频失败:', error);
        
        // 如果不是追加模式或容器为空
        if (!append || randomVideosContainer.children.length === 0) {
            randomVideosContainer.innerHTML = `
                <div class="col-span-5 text-center py-8">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-red-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p class="mt-4 text-red-500">加载推荐视频失败，请刷新重试</p>
                </div>
            `;
            
            // 隐藏加载更多按钮
            if (loadMoreRandomBtn) {
                loadMoreRandomBtn.style.display = 'none';
            }
        } else {
            // 追加模式，恢复按钮状态
            if (loadMoreRandomBtn) {
                loadMoreRandomBtn.textContent = '查看更多';
                loadMoreRandomBtn.disabled = false;
            }
        }
    }
}

// 创建视频卡片
function createVideoCard(video) {
    // 创建卡片元素
    const card = document.createElement('div');
    card.className = 'video-card bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow';
    
    // 格式化播放量
    const viewCount = formatViewCount(video.viewCount || 0);
    
    // 格式化时间
    const timeAgo = formatTimeAgo(video.createTime || new Date().toISOString());
    
    // 格式化时长
    const duration = formatDuration(video.duration || 0);
    
    // 设置卡片内容
    card.innerHTML = `
        <a href="/video/hjm${video.id}">
            <div class="relative">
                <img src="${video.coverUrl || 'https://via.placeholder.com/300x200?text=Video'}" alt="${video.title}" class="w-full h-40 object-cover">
                <span class="absolute bottom-1 right-1 bg-black bg-opacity-70 text-white text-xs px-1 rounded">${duration}</span>
            </div>
            <div class="p-3">
                <h3 class="text-sm font-medium text-gray-900 truncate">${video.title}</h3>
                <div class="flex items-center mt-2">
                    <a href="/userinfo.html?id=${video.uploader?.userId || 'unknown'}" class="flex items-center">
                        <img src="${video.uploader?.avatar || 'https://via.placeholder.com/24'}" alt="${video.uploader?.username || '用户'}" class="w-5 h-5 rounded-full mr-1">
                        <span class="text-xs text-gray-600 truncate">${video.uploader?.username || '未知用户'}</span>
                    </a>
                </div>
                <div class="text-xs text-gray-500 mt-1">
                    <span>${viewCount}播放</span>
                    <span class="ml-2">${timeAgo}</span>
                </div>
            </div>
        </a>
    `;
    
    return card;
}

// 格式化时长
function formatDuration(seconds) {
    if (!seconds) return '00:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    createDefaultAvatarIfNeeded();
    init();
}); 