/**
 * 导航栏功能处理
 * 用于处理所有页面中的导航栏功能，包括用户登录状态、搜索功能等
 */
const userAvatar = document.getElementById('user-avatar');
const userMenu = document.getElementById('user-menu');
const notLoggedIn = document.getElementById('not-logged-in');
const loggedIn = document.getElementById('logged-in');
const username = document.getElementById('username');
const userLevel = document.getElementById('user-level');
const logoutBtn = document.getElementById('logout-btn');
const searchInput = document.querySelector('input[type="text"]');
const searchButton = document.querySelector('button[aria-label="搜索"]');
const 个人中心 = document.getElementById('userinfo');
document.addEventListener('DOMContentLoaded', function() {
    // 获取导航栏元素
    // 检查用户登录状态
    checkLoginStatus();

    // 用户头像点击事件
    if (userAvatar) {
        userAvatar.addEventListener('click', function() {
            if (userMenu.classList.contains('active')){
                userMenu.classList.remove('active');
                userMenu.classList.add('hidden')
            }else{
                userMenu.classList.remove('hidden');
                userMenu.classList.add('active')
            }
        });
    }

    // 点击页面其他地方关闭用户菜单
    document.addEventListener('click', function(event) {
        if (userMenu && !userMenu.contains(event.target) && !userAvatar.contains(event.target)) {
            userMenu.classList.remove('active');
            userMenu.classList.remove('hidden');
        }
    });

    // 搜索功能
    if (searchInput && searchButton) {
        searchButton.addEventListener('click', function() {
            const query = searchInput.value.trim();
            if (query) {
                window.location.href = `/search?keyword=${encodeURIComponent(query)}`;
            }
        });

        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const query = searchInput.value.trim();
                if (query) {
                    window.location.href = `/search?keyword=${encodeURIComponent(query)}`;
                }
            }
        });
    }

    // 退出登录
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            logout();
        });
    }

    // 检查用户登录状态
    function checkLoginStatus() {
        // 从localStorage获取用户信息
        const userInfo = window.authAPI.getCurrentUser();
        if (userInfo && userInfo.token) {
            // 用户已登录
            if (notLoggedIn) notLoggedIn.classList.add('hidden');
            if (loggedIn) loggedIn.classList.remove('hidden');
            if (username) username.textContent = userInfo.username || '用户';
            if (userLevel) userLevel.textContent = `等级: ${userInfo.level || 1}`;
            
            // 更新用户头像
            if (userAvatar && userInfo.avatar) {
                const avatarImg = userAvatar.querySelector('img');
                if (avatarImg) {
                    avatarImg.src = userInfo.avatar;
                }
            }
            console.log(个人中心)
            if (个人中心){
                个人中心.href="/user/"+userInfo.user_id
            }
        } else {
            // 用户未登录
            if (notLoggedIn) notLoggedIn.classList.remove('hidden');
            if (loggedIn) loggedIn.classList.add('hidden');
        }
    }

    // 退出登录函数
    function logout() {
        // 清除本地存储的用户信息
        localStorage.removeItem('user_id');
        localStorage.removeItem('hachimitoken');
        localStorage.removeItem('username');
        // 刷新页面
        window.location.reload();
    }
}); 