/*创建一个userinfo表，包含自增主键id,sex char(1),个人介绍,个人头像地址,注册时间,最后上线时间,用户名称,用户密码,用户邮箱*/

-- Create userinfo table
CREATE TABLE IF NOT EXISTS userinfo (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sex CHAR(1) COMMENT 'M for male, F for female',
    bio TEXT COMMENT 'User introduction',
    avatar_url VARCHAR(255) COMMENT 'Avatar image URL',
    register_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Registration time',
    last_online DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Last online time',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT 'Username',
    pwd VARCHAR(100) NOT NULL COMMENT 'Password (hashed)',
    email VARCHAR(100) NOT NULL UNIQUE COMMENT 'Email address'
) COMMENT='User information table';

-- Create cookie table
-- 包含用户id,和对应的token,作为浏览器的表示
CREATE TABLE IF NOT EXISTS cookie (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL COMMENT 'User ID',
    token VARCHAR(100) NOT NULL UNIQUE COMMENT 'Browser token',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Token creation time',
    expire_time DATETIME NOT NULL COMMENT 'Token expiration time',
    FOREIGN KEY (user_id) REFERENCES userinfo(id) ON DELETE CASCADE
) COMMENT='User browser tokens table';

-- 创建一个视频表
-- 包含唯一自增id,upload_user,create_time,love 喜欢数量,watch 观看数,collect,isdel,ischeck
CREATE TABLE IF NOT EXISTS videoinfo (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '唯一hjm{id}',
    upload_user INT NOT NULL COMMENT '上传用户ID',
    title VARCHAR(255) NOT NULL COMMENT '视频标题',
    bio TEXT COMMENT '视频描述',
    video_url VARCHAR(255) NOT NULL COMMENT '视频文件URL',
    cover_url VARCHAR(255) NOT NULL COMMENT '封面图片URL',
    duration INT DEFAULT 0 COMMENT '视频时长(秒)',
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    love INT DEFAULT 0 COMMENT '喜欢数量',
    watch INT DEFAULT 0 COMMENT '观看次数',
    collect INT DEFAULT 0 COMMENT '收藏数量',
    isdel TINYINT(1) DEFAULT 0 COMMENT '是否删除 0:未删除 1:已删除',
    ischeck TINYINT(1) DEFAULT 0 COMMENT '是否审核 0:未审核 1:已审核'
) COMMENT='视频表';

-- 评论表
-- 唯一评论识别id,评论在何视频下video_id，由谁发出评论user_id,评论内容,评论是否被删除,发布评论时间,是否为回复评论(0为一级评论,x为是x下的回复)
CREATE TABLE IF NOT EXISTS comment (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '评论ID',
    video_id INT NOT NULL COMMENT '视频ID',
    user_id INT NOT NULL COMMENT '评论用户ID',
    content TEXT NOT NULL COMMENT '评论内容',
    isdel TINYINT(1) DEFAULT 0 COMMENT '是否删除 0:未删除 1:已删除',
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '评论时间',
    parent_id INT DEFAULT 0 COMMENT '父评论ID，0为一级评论'
) COMMENT='视频评论表';