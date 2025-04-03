/**
 * login.js - 登录页面交互逻辑
 */

// 页面元素
const loginTab = document.getElementById('login-tab');
const registerTab = document.getElementById('register-tab');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginCaptchaImg = document.getElementById('login-captcha-img');
const registerCaptchaImg = document.getElementById('register-captcha-img');

// 表单元素
const loginAccountInput = document.getElementById('login-account');
const loginPasswordInput = document.getElementById('login-password');
const loginCaptchaInput = document.getElementById('login-captcha');
const registerAccountInput = document.getElementById('register-account');
const registerUsernameInput = document.getElementById('register-username');
const registerPasswordInput = document.getElementById('register-password');
const registerConfirmPasswordInput = document.getElementById('register-confirm-password');
const registerCaptchaInput = document.getElementById('register-captcha');

// 状态变量
let currentTab = 'login'; // 当前选中的标签：'login' 或 'register'

/**
 * 初始化页面
 */
function init() {
    // 注册事件监听器
    loginTab.addEventListener('click', () => switchTab('login'));
    registerTab.addEventListener('click', () => switchTab('register'));
    
    // 表单提交
    loginForm.querySelector('form').addEventListener('submit', handleLoginSubmit);
    registerForm.querySelector('form').addEventListener('submit', handleRegisterSubmit);
    
}

/**
 * 切换登录/注册标签
 * @param {string} tab - 要切换到的标签：'login' 或 'register'
 */
function switchTab(tab) {
    if (currentTab === tab) return;
    
    currentTab = tab;
    
    if (tab === 'login') {
        // 切换到登录标签
        loginTab.classList.add('text-pink-600', 'border-b-2', 'border-pink-600');
        loginTab.classList.remove('text-gray-500');
        registerTab.classList.add('text-gray-500');
        registerTab.classList.remove('text-pink-600', 'border-b-2', 'border-pink-600');
        
        // 显示登录表单，隐藏注册表单
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');

    } else {
        // 切换到注册标签
        registerTab.classList.add('text-pink-600', 'border-b-2', 'border-pink-600');
        registerTab.classList.remove('text-gray-500');
        loginTab.classList.add('text-gray-500');
        loginTab.classList.remove('text-pink-600', 'border-b-2', 'border-pink-600');
        
        // 显示注册表单，隐藏登录表单
        registerForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
        
    }
}


/**
 * 处理登录表单提交
 * @param {Event} event - 表单提交事件
 */
async function handleLoginSubmit(event) {
    event.preventDefault();
    
    // 获取表单数据
    const loginData = {
        account: loginAccountInput.value.trim(),
        password: loginPasswordInput.value
    };
    
    // 简单验证
    if (!loginData.account) {
        showError('请输入邮箱');
        return;
    }
    
    if (!loginData.password) {
        showError('请输入密码');
        return;
    }

    
    try {
        // 禁用提交按钮，显示加载状态
        const submitButton = loginForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = '登录中...';
        
        // 发送登录请求
        const result = await window.authAPI.login(loginData);
        // 登录成功
        showSuccess(result.message || '登录成功');
        localStorage.setItem('hachimitoken', result.data.token);
        localStorage.setItem('user_id', result.data.user_id);
        localStorage.setItem('username', result.data.username);
        // 跳转到首页或其他页面
        setTimeout(() => {
            window.location.href = '/';
        }, 500);
    } catch (error) {
        // 显示错误信息
        showError(error.message || '登录失败，请重试');
    } finally {
        // 恢复提交按钮
        const submitButton = loginForm.querySelector('button[type="submit"]');
        submitButton.disabled = false;
        submitButton.textContent = '登录';
    }
}

/**
 * 处理注册表单提交
 * @param {Event} event - 表单提交事件
 */
async function handleRegisterSubmit(event) {
    event.preventDefault();
    
    // 获取表单数据
    const registerData = {
        email: registerAccountInput.value.trim(),
        username: registerUsernameInput.value.trim(),
        password: registerPasswordInput.value,
        confirmPassword: registerConfirmPasswordInput.value
    };
    
    // 简单验证
    if (!registerData.email) {
        showError('请输入账号');
        return;
    }
    
    if (!registerData.username) {
        showError('请输入用户名');
        return;
    }
    
    if (!registerData.password) {
        showError('请输入密码');
        return;
    }
    
    if (registerData.password !== registerData.confirmPassword) {
        showError('两次输入的密码不一致');
        return;
    }
    
    try {
        // 禁用提交按钮，显示加载状态
        const submitButton = registerForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = '注册中...';
        
        // 发送注册请求
        const result = await window.authAPI.register(registerData);
        
        // 注册成功
        showSuccess(result.message || '注册成功');
        
        // 清空表单
        registerForm.querySelector('form').reset();
        
        // 切换到登录标签
        setTimeout(() => {
            switchTab('login');
        }, 1500);
    } catch (error) {
        // 显示错误信息
        showError(error.message || '注册失败，请重试');
    } finally {
        // 恢复提交按钮
        const submitButton = registerForm.querySelector('button[type="submit"]');
        submitButton.disabled = false;
        submitButton.textContent = '注册';
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