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