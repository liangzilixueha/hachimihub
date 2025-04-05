/**
 * uploadvideo.js - 视频上传页面交互逻辑
 */

// 页面元素 - 视频上传
const videoDropArea = document.getElementById('video-drop-area');
const videoFileInput = document.getElementById('video-file');
const videoPreviewContainer = document.getElementById('video-preview-container');
const videoPreview = document.getElementById('video-preview');
const videoLoading = document.getElementById('video-loading');
const videoFileName = document.getElementById('video-file-name');
const changeVideoButton = document.getElementById('change-video');

// 页面元素 - 视频信息
const videoTitleInput = document.getElementById('video-title');
const titleCounter = document.getElementById('title-counter');
const titleError = document.getElementById('title-error');
const videoDescriptionInput = document.getElementById('video-description');
const descriptionCounter = document.getElementById('description-counter');
const videoCategorySelect = document.getElementById('video-category');
const tagInput = document.getElementById('tag-input');
const tagsContainer = document.getElementById('tags-container');

// 页面元素 - 封面
const autoCoverRadio = document.getElementById('auto-cover');
const customCoverRadio = document.getElementById('custom-cover');
const autoThumbnails = document.getElementById('auto-thumbnails');
const customUpload = document.getElementById('custom-upload');
const coverDropArea = document.getElementById('cover-drop-area');
const coverFileInput = document.getElementById('cover-file');
const coverPreview = document.getElementById('cover-preview');

// 页面元素 - 上传按钮和状态
const uploadButton = document.getElementById('upload-button');
const uploadStatus = document.getElementById('upload-status');
const uploadingState = document.getElementById('uploading-state');
const uploadSuccess = document.getElementById('upload-success');
const uploadError = document.getElementById('upload-error');
const uploadProgress = document.getElementById('upload-progress');
const uploadPercent = document.getElementById('upload-percent');
const errorMessage = document.getElementById('error-message');
const retryUploadButton = document.getElementById('retry-upload');
const viewVideoLink = document.getElementById('view-video-link');

// 页面元素 - 封面裁剪
const cropModal = document.getElementById('crop-modal');
const cropImage = document.getElementById('crop-image');
const closeCropModal = document.getElementById('close-crop-modal');
const cancelCropButton = document.getElementById('cancel-crop');
const confirmCropButton = document.getElementById('confirm-crop');

// 状态变量
let videoFile = null;
let videoUrl = null;
let coverSource = 'auto'; // 'auto' 或 'custom'
let customCoverFile = null;
let customCoverUrl = null;
let thumbnails = [];
let selectedThumbnailIndex = -1;
let tags = [];
let cropper = null;
let uploadedVideoId = null;

/**
 * 初始化页面
 */
function init() {
    // 注册事件监听器
    registerEventListeners();
    
    // 验证表单状态，初始化时禁用上传按钮
    validateForm();
}

/**
 * 注册所有事件监听器
 */
function registerEventListeners() {
    // 视频拖放和选择
    videoDropArea.addEventListener('click', () => videoFileInput.click());
    videoFileInput.addEventListener('change', handleVideoFileSelect);
    
    videoDropArea.addEventListener('dragover', e => {
        e.preventDefault();
        videoDropArea.classList.add('drag-over');
    });
    
    videoDropArea.addEventListener('dragleave', () => {
        videoDropArea.classList.remove('drag-over');
    });
    
    videoDropArea.addEventListener('drop', e => {
        e.preventDefault();
        videoDropArea.classList.remove('drag-over');
        
        if (e.dataTransfer.files.length) {
            handleVideoFile(e.dataTransfer.files[0]);
        }
    });
    
    changeVideoButton.addEventListener('click', () => {
        videoFileInput.click();
    });
    
    // 视频信息输入
    videoTitleInput.addEventListener('input', () => {
        const length = videoTitleInput.value.length;
        titleCounter.textContent = `${length}/50`;
        
        if (length < 5) {
            titleError.textContent = '标题至少需要5个字符';
            titleError.classList.remove('hidden');
        } else {
            titleError.classList.add('hidden');
        }
        
        validateForm();
    });
    
    videoDescriptionInput.addEventListener('input', () => {
        const length = videoDescriptionInput.value.length;
        descriptionCounter.textContent = `${length}/300`;
    });
    
    // 封面选择
    autoCoverRadio.addEventListener('change', () => {
        if (autoCoverRadio.checked) {
            coverSource = 'auto';
            autoThumbnails.classList.remove('hidden');
            customUpload.classList.add('hidden');
            
            // 如果有自动生成的缩略图，显示选中的那个
            if (thumbnails.length > 0 && selectedThumbnailIndex >= 0) {
                coverPreview.src = thumbnails[selectedThumbnailIndex];
            }
            
            validateForm();
        }
    });
    
    customCoverRadio.addEventListener('change', () => {
        if (customCoverRadio.checked) {
            coverSource = 'custom';
            autoThumbnails.classList.add('hidden');
            customUpload.classList.remove('hidden');
            
            // 如果有自定义封面，显示它
            if (customCoverUrl) {
                coverPreview.src = customCoverUrl;
            } else {
                coverPreview.src = '/static/img/default-cover.png';
            }
            
            validateForm();
        }
    });
    
    // 自定义封面上传
    coverDropArea.addEventListener('click', () => coverFileInput.click());
    coverFileInput.addEventListener('change', handleCoverFileSelect);
    
    coverDropArea.addEventListener('dragover', e => {
        e.preventDefault();
        coverDropArea.classList.add('drag-over');
    });
    
    coverDropArea.addEventListener('dragleave', () => {
        coverDropArea.classList.remove('drag-over');
    });
    
    coverDropArea.addEventListener('drop', e => {
        e.preventDefault();
        coverDropArea.classList.remove('drag-over');
        
        if (e.dataTransfer.files.length) {
            handleCoverFile(e.dataTransfer.files[0]);
        }
    });
    // 标签输入
    tagInput?.addEventListener('keydown', e => {
        if (e.key === 'Enter' && tagInput.value.trim()) {
            e.preventDefault();
            addTag(tagInput.value.trim());
            tagInput.value = '';
        }
    });
    
    // 上传按钮
    uploadButton.addEventListener('click', startUpload);
    
    // 重试按钮
    retryUploadButton.addEventListener('click', () => {
        // 隐藏错误状态，显示上传状态
        uploadError.classList.add('hidden');
        uploadingState.classList.remove('hidden');
        
        // 重新开始上传
        startUpload();
    });
    
    // 裁剪模态框
    closeCropModal.addEventListener('click', closeCropperModal);
    cancelCropButton.addEventListener('click', closeCropperModal);
    confirmCropButton.addEventListener('click', applyCrop);
}

/**
 * 处理视频文件选择
 * @param {Event} event - 文件选择事件
 */
function handleVideoFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        handleVideoFile(file);
    }
}

/**
 * 处理选择的视频文件
 * @param {File} file - 视频文件
 */
function handleVideoFile(file) {
    // 检查文件类型
    if (!file.type.startsWith('video/')) {
        showNotification('请选择有效的视频文件', 'error');
        return;
    }
    
    // 检查文件大小 (100MB)
    if (file.size > 100 * 1024 * 1024) {
        showNotification('视频文件不能超过100MB', 'error');
        return;
    }
    
    // 保存文件引用
    videoFile = file;
    
    // 显示文件名
    videoFileName.textContent = file.name;
    
    // 显示预览
    videoPreviewContainer.classList.remove('hidden');
    videoDropArea.classList.add('hidden');
    videoLoading.classList.remove('hidden');
    
    // 创建视频URL
    if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
    }
    videoUrl = URL.createObjectURL(file);
    
    // 设置视频预览
    videoPreview.src = videoUrl;
    videoPreview.onloadeddata = () => {
        videoLoading.classList.add('hidden');
        
        // 生成视频缩略图
        generateThumbnails();
        
        // 验证表单
        validateForm();
    };
    
    videoPreview.onerror = () => {
        videoLoading.classList.add('hidden');
        showNotification('无法预览视频，请选择其他格式', 'error');
    };
}

/**
 * 生成视频缩略图
 */
function generateThumbnails() {
    // 清空现有缩略图
    thumbnails = [];
    selectedThumbnailIndex = -1;
    
    // 生成3个缩略图位置，等待视频加载完成
    autoThumbnails.innerHTML = '';
    for (let i = 0; i < 3; i++) {
        const thumbDiv = document.createElement('div');
        thumbDiv.className = 'thumbnail-item border-2 border-gray-200 rounded-md overflow-hidden aspect-video animate-pulse bg-gray-300';
        autoThumbnails.appendChild(thumbDiv);
    }
    
    // 视频加载完成后，生成缩略图
    if (videoPreview.readyState >= 3) {
        createThumbnails();
    } else {
        videoPreview.addEventListener('canplay', createThumbnails, { once: true });
    }
}

/**
 * 创建视频缩略图
 */
function createThumbnails() {
    const totalDuration = videoPreview.duration;
    
    // 清空现有缩略图
    autoThumbnails.innerHTML = '';
    
    // 生成3个缩略图，在不同时间点
    for (let i = 0; i < 3; i++) {
        // 使用 10%, 50%, 90% 的时间点
        const timePoint = totalDuration * (i * 0.4 + 0.1);
        
        // 创建缩略图容器
        const thumbDiv = document.createElement('div');
        thumbDiv.className = 'thumbnail-item border-2 border-gray-200 rounded-md overflow-hidden aspect-video';
        thumbDiv.dataset.index = i;
        
        // 创建缩略图
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 320;
        canvas.height = 180;
        
        // 设置视频时间点并绘制图像
        videoPreview.currentTime = timePoint;
        
        // 使用事件监听视频时间更新
        videoPreview.addEventListener('seeked', function createThumb() {
            // 绘制当前帧到canvas
            ctx.drawImage(videoPreview, 0, 0, canvas.width, canvas.height);
            
            // 将canvas转换为图片URL
            const imageUrl = canvas.toDataURL('image/jpeg');
            
            // 创建图片元素
            const img = document.createElement('img');
            img.src = imageUrl;
            img.className = 'w-full h-full object-cover';
            thumbDiv.appendChild(img);
            
            // 保存缩略图URL
            thumbnails[i] = imageUrl;
            
            // 添加点击事件
            thumbDiv.addEventListener('click', () => {
                // 移除之前选中的样式
                document.querySelectorAll('.thumbnail-item.selected').forEach(el => {
                    el.classList.remove('selected');
                });
                
                // 添加选中样式
                thumbDiv.classList.add('selected');
                
                // 更新预览
                coverPreview.src = imageUrl;
                
                // 更新选中索引
                selectedThumbnailIndex = i;
                
                // 确保选择自动封面
                autoCoverRadio.checked = true;
                coverSource = 'auto';
                
                validateForm();
            });
            
            // 自动选择第一个缩略图
            if (i === 0) {
                thumbDiv.click();
            }
            
            // 移除事件监听
            videoPreview.removeEventListener('seeked', createThumb);
        }, { once: true });
        
        // 添加到容器
        autoThumbnails.appendChild(thumbDiv);
    }
}

/**
 * 处理封面文件选择
 * @param {Event} event - 文件选择事件
 */
function handleCoverFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        handleCoverFile(file);
    }
}

/**
 * 处理选择的封面文件
 * @param {File} file - 图片文件
 */
function handleCoverFile(file) {
    // 检查文件类型
    if (!file.type.startsWith('image/')) {
        showNotification('请选择有效的图片文件', 'error');
        return;
    }
    
    // 检查文件大小 (5MB)
    if (file.size > 5 * 1024 * 1024) {
        showNotification('图片文件不能超过5MB', 'error');
        return;
    }
    
    // 保存文件引用
    customCoverFile = file;
    
    // 创建图片URL
    if (customCoverUrl) {
        URL.revokeObjectURL(customCoverUrl);
    }
    customCoverUrl = URL.createObjectURL(file);
    
    // 打开裁剪模态框
    openCropperModal(customCoverUrl);
}

/**
 * 打开裁剪模态框
 * @param {string} imageUrl - 图片URL
 */
function openCropperModal(imageUrl) {
    // 显示模态框
    cropModal.classList.remove('hidden');
    
    // 设置图片
    cropImage.src = imageUrl;
    
    // 等待图片加载
    cropImage.onload = () => {
        // 销毁现有的裁剪器
        if (cropper) {
            cropper.destroy();
        }
        
        // 创建新的裁剪器
        cropper = new Cropper(cropImage, {
            aspectRatio: 16 / 9,
            viewMode: 1,
            autoCropArea: 1,
            zoomable: false
        });
    };
}

/**
 * 关闭裁剪模态框
 */
function closeCropperModal() {
    cropModal.classList.add('hidden');
    
    if (cropper) {
        cropper.destroy();
        cropper = null;
    }
}

/**
 * 应用裁剪
 */
function applyCrop() {
    if (!cropper) return;
    
    // 获取裁剪后的图片
    const canvas = cropper.getCroppedCanvas({
        width: 1280,
        height: 720,
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high'
    });
    
    if (!canvas) {
        showNotification('裁剪失败，请重试', 'error');
        return;
    }
    
    // 转换为数据URL
    const croppedImageUrl = canvas.toDataURL('image/jpeg');
    
    // 更新封面预览
    coverPreview.src = croppedImageUrl;
    
    // 保存裁剪后的图片URL
    customCoverUrl = croppedImageUrl;
    
    // 关闭模态框
    closeCropperModal();
    
    // 确保选择自定义封面
    customCoverRadio.checked = true;
    coverSource = 'custom';
    
    validateForm();
}

/**
 * 添加标签
 * @param {string} tagText - 标签文本
 */
function addTag(tagText) {
    // 验证标签长度
    if (tagText.length > 20) {
        showNotification('标签不能超过20个字符', 'error');
        return;
    }
    
    // 验证标签数量
    if (tags.length >= 10) {
        showNotification('最多只能添加10个标签', 'error');
        return;
    }
    
    // 验证标签是否已存在
    if (tags.includes(tagText)) {
        showNotification('该标签已存在', 'info');
        return;
    }
    
    // 添加标签
    tags.push(tagText);
    
    // 创建标签元素
    const tagElement = document.createElement('div');
    tagElement.className = 'tag';
    tagElement.innerHTML = `
        <span>${tagText}</span>
        <span class="tag-close" data-tag="${tagText}">×</span>
    `;
    
    // 添加删除事件
    const closeButton = tagElement.querySelector('.tag-close');
    closeButton.addEventListener('click', () => {
        // 从数组中删除
        tags = tags.filter(t => t !== tagText);
        
        // 从DOM中删除
        tagElement.remove();
    });
    
    // 添加到容器
    tagsContainer.appendChild(tagElement);
}

/**
 * 验证表单
 */
function validateForm() {
    // 检查是否有视频
    const hasVideo = videoFile !== null;
    
    // 检查标题
    const hasValidTitle = videoTitleInput.value.trim().length >= 5;
    
    // 检查封面
    let hasValidCover = false;
    if (coverSource === 'auto') {
        hasValidCover = selectedThumbnailIndex >= 0;
    } else {
        hasValidCover = customCoverUrl !== null;
    }
    
    // 只有满足所有条件才启用上传按钮
    uploadButton.disabled = !(hasVideo && hasValidTitle && hasValidCover);
}

/**
 * 开始上传过程
 */
async function startUpload() {
    // 禁用上传按钮，防止重复点击
    uploadButton.disabled = true;
    
    // 显示上传状态
    uploadStatus.classList.remove('hidden');
    uploadingState.classList.remove('hidden');
    uploadSuccess.classList.add('hidden');
    uploadError.classList.add('hidden');
    
    try {
        // 准备封面数据
        let coverData;
        if (coverSource === 'auto') {
            coverData = thumbnails[selectedThumbnailIndex];
        } else {
            coverData = customCoverUrl;
        }
        
        // 准备上传数据
        const formData = {
            title: videoTitleInput.value.trim(),
            description: videoDescriptionInput.value.trim(),
            category: videoCategorySelect.value,
            tags: tags,
            coverData: coverData,
            videoFile: videoFile
        };
        
        // 模拟上传进度
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += Math.random() * 5;
            if (progress > 100) progress = 100;
            
            uploadProgress.style.width = `${progress}%`;
            uploadPercent.textContent = Math.round(progress);
            
            if (progress === 100) clearInterval(progressInterval);
        }, 300);
        
        // 模拟API调用延迟
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 假设这是从服务器返回的视频ID
        uploadedVideoId = 'vid_' + Math.random().toString(36).substr(2, 9);
        
        // 清除进度条动画
        clearInterval(progressInterval);
        
        // 更新链接
        viewVideoLink.href = `videoinfo.html?id=${uploadedVideoId}`;
        
        // 显示成功状态
        uploadingState.classList.add('hidden');
        uploadSuccess.classList.remove('hidden');
        
    } catch (error) {
        console.error('上传失败:', error);
        
        // 显示错误状态
        uploadingState.classList.add('hidden');
        uploadError.classList.remove('hidden');
        errorMessage.textContent = error.message || '上传过程中发生错误，请重试';
        
        // 重新启用上传按钮
        uploadButton.disabled = false;
    }
}

/**
 * 显示通知
 * @param {string} message - 通知消息
 * @param {string} type - 通知类型 (success, error, info)
 */
function showNotification(message, type = 'info') {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // 添加到页面
    document.body.appendChild(notification);
    
    // 自动移除
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// 在DOM加载完成后初始化页面
document.addEventListener('DOMContentLoaded', init); 