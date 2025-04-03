/**
 * index.js - 首页交互逻辑
 */

// 页面元素
const userAvatar = document.getElementById('user-avatar');
const userMenu = document.getElementById('user-menu');
const notLoggedInSection = document.getElementById('not-logged-in');
const loggedInSection = document.getElementById('logged-in');
const usernameElement = document.getElementById('username');
const userLevelElement = document.getElementById('user-level');
const logoutBtn = document.getElementById('logout-btn');
const searchInput = document.querySelector('input[placeholder="搜索视频..."]');
const searchButton = document.querySelector('button[aria-label="搜索"]');
const sidebarDrawer = document.getElementById('sidebar-drawer');
const sidebarToggle = document.querySelector('.sidebar-toggle');
const featuredSwiperContainer = document.querySelector('.featured-swiper');

// 初始化函数
async function init() {
    // 初始化轮播图
    initSwiper();
    
    // 初始化用户状态
    await checkUserLoginStatus();
    
    // 初始化事件监听器
    initEventListeners();
}

// 初始化轮播图
function initSwiper() {
    new Swiper('.featured-swiper', {
        loop: true,
        autoplay: {
            delay: 5000,
            disableOnInteraction: false,
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        effect: 'fade',
        fadeEffect: {
            crossFade: true
        }
    });
}

// 初始化事件监听器
function initEventListeners() {
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
}

// 检查用户登录状态
async function checkUserLoginStatus() {
    try {
        const userInfo = await window.userAPI.getUserInfo();
        
        if (userInfo && userInfo.userId) {
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
    userMenu.classList.toggle('active');
    userMenu.classList.toggle('hidden');
}

// 处理退出登录
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

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    createDefaultAvatarIfNeeded();
    init();
}); 