from flask import Blueprint, request, jsonify
from mysql import MySql
import logging
import os
from dotenv import load_dotenv

# 加载.env文件中的环境变量
load_dotenv('config.env')

# 创建蓝图
user_bp = Blueprint('user', __name__)

# 从环境变量中获取数据库配置
db_host = os.getenv('DB_HOST')
db_name = os.getenv('DB_NAME')
db_user = os.getenv('DB_USER')
db_password = os.getenv('DB_PASSWORD')
db_port = int(os.getenv('DB_PORT'))

# 数据库连接
db = MySql(db_host, db_name, db_user, db_password, db_port)
db.execute_sql_file('init.sql')

@user_bp.route('/register', methods=['POST'])
def register():
    """用户注册接口"""
    try:
        data = request.get_json()
        # 检查必要字段
        print(data)
        required_fields = ['email','username','password','confirmPassword']
        for field in required_fields:
            if field not in data:
                return jsonify({'code': 400, 'message': f'缺少必要字段: {field}'}), 400

        # 检查用户名是否已存在
        if db.fetchOne("SELECT id FROM userinfo WHERE email = %s", [data['username']]):
            return jsonify({'code': 400, 'message': '用户名已存在'}), 400

        # 检查邮箱是否已存在
        if db.fetchOne("SELECT id FROM userinfo WHERE email = %s", [data['email']]):
            return jsonify({'code': 400, 'message': '邮箱已存在'}), 400

        # 插入新用户
        user_data = {
            'username': data['username'],
            'pwd': data['password'],  # 注意：实际应用中应该先加密密码
            'email': data['email'],
            'sex': data.get('sex', 'M'),  # 可选字段，默认男性
            'bio': data.get('bio', '')    # 可选字段，默认空
        }
        db.insert('userinfo', user_data)
        db.commit()

        return jsonify({'code': 200, 'message': '注册成功'}), 200

    except Exception as e:
        db.rollback()
        logging.error(f"注册失败: {str(e)}")
        return jsonify({'code': 500, 'message': '服务器错误'}), 500

@user_bp.route('/login', methods=['POST'])
def login():
    """用户登录接口"""
    try:
        data = request.get_json()
        username = data.get('account')
        pwd = data.get('password')
        print(data)
        if not username or not pwd:
            return jsonify({'code': 400, 'message': '用户名和密码不能为空'}), 400

        # 验证用户
        user = db.fetchOne(
            "SELECT id, username, email, pwd FROM userinfo WHERE email = %s",
            [username]
        )

        if not user or user['pwd'] != pwd:  # 注意：实际应用中应该使用加密比较
            return jsonify({'code': 401, 'message': '用户名或密码错误'}), 401

        # 生成token（示例，实际应用中应该使用更安全的方式）
        import uuid
        token = str(uuid.uuid4())
        
        # 保存token到数据库
        token_data = {
            'user_id': user['id'],
            'token': token,
            'expire_time': '2025-12-31 23:59:59'  # 示例过期时间
        }
        db.insert('cookie', token_data)
        db.commit()

        return jsonify({
            'code': 200,
            'message': '登录成功',
            'data': {
                'token': token,
                'user_id': user['id'],
                'username': user['username']
            }
        }), 200

    except Exception as e:
        db.rollback()
        logging.error(f"登录失败: {str(e)}")
        return jsonify({'code': 500, 'message': '服务器错误'}), 500 
    
@user_bp.route('/user')
def user():
    #根据传来的/user?id={id},查询数据
    user_id = request.args.get('id')
    if not user_id:
        return jsonify({'code': 400, 'message': '用户ID不能为空'}), 400
    
    try:
        # 查询用户基本信息
        user_data = db.fetchOne(
            "SELECT id, username, avatar_url, bio, register_time, sex, email FROM userinfo WHERE id = %s",
            [user_id]
        )
        
        if not user_data:
            return jsonify({'code': 404, 'message': '用户不存在'}), 404
        
        # 组合返回数据
        response_data = {
            'userId': user_data['id'],
            'username': user_data['username'],
            'avatar': user_data['avatar_url'],
            'bio': user_data['bio'],
            'registerTime': user_data['register_time'].strftime('%Y-%m-%d %H:%M:%S'),
            'sex': user_data['sex'],
            'email': user_data['email']
        }
        
        return jsonify({'code': 200, 'message': '获取成功', 'data': response_data}), 200
        
    except Exception as e:
        logging.error(f"获取用户信息失败: {str(e)}")
        return jsonify({'code': 500, 'message': '服务器错误'}), 500
    
@user_bp.route('/user/userinfoEdit',methods=['POST'])
def editUserBaseInfo():
    #接受来自前端的参数，根据id更新userinfo表中的数据
    try:
        # 获取请求数据
        data = request.get_json()
        user_id = data.get('userId')
        bio = data.get('bio')
        username = data.get('username')
        
        # 验证必要参数
        if not user_id:
            return jsonify({'code': 400, 'message': '用户ID不能为空'}), 400
            
        # 构建更新数据
        update_data = {}
        if bio is not None:
            update_data['bio'] = bio
        if username is not None:
            update_data['username'] = username
            
        # 如果没有要更新的数据，直接返回成功
        if not update_data:
            return jsonify({'code': 200, 'message': '没有需要更新的数据'}), 200
            
        # 构建WHERE条件
        where = f"id = {user_id}"
        
        # 执行更新操作
        affected_rows = db.update('userinfo', update_data, where)
        db.commit()
        
        if affected_rows > 0:
            return jsonify({'code': 200, 'message': '用户信息更新成功'}), 200
        else:
            return jsonify({'code': 404, 'message': '用户不存在或没有数据被更新'}), 404
            
    except Exception as e:
        logging.error(f"更新用户信息失败: {str(e)}")
        return jsonify({'code': 500, 'message': f'服务器错误: {str(e)}'}), 500
    
@user_bp.route('/user/publicVideos',methods=['GET'])
def UserpublicVideos():
    """获取用户的公开视频列表"""
    try:
        # 获取查询参数
        user_id = request.args.get('userId')
        page = int(request.args.get('page', 1))
        page_size = int(request.args.get('pageSize', 12))
        sort = request.args.get('sort', 'newest')
        
        # 验证必要参数
        if not user_id:
            return jsonify({'code': 400, 'message': '用户ID不能为空'}), 400
            
        # 计算偏移量
        offset = (page - 1) * page_size
        
        # 构建排序条件
        order_by = "create_time DESC"  # 默认按创建时间降序
        if sort == 'oldest':
            order_by = "create_time ASC"
        elif sort == 'popular':
            order_by = "watch DESC, love DESC"
            
        # 查询视频总数
        count_result = db.fetchOne(
            "SELECT COUNT(*) as total FROM videoinfo WHERE upload_user = %s AND isdel = 0 AND ischeck = 1",
            [user_id]
        )
        total_videos = count_result['total'] if count_result else 0
        total_pages = (total_videos + page_size - 1) // page_size
        
        # 查询视频列表
        videos = db.fetchAll(
            f"""
            SELECT id, title, bio, video_url, cover_url, duration, create_time, love, watch, collect 
            FROM videoinfo 
            WHERE upload_user = %s AND isdel = 0 AND ischeck = 1 
            ORDER BY {order_by}
            LIMIT %s, %s
            """,
            [user_id, offset, page_size]
        )
        
        # 格式化视频数据
        formatted_videos = []
        for video in videos:
            formatted_videos.append({
                'id': video['id'],
                'title': video['title'],
                'bio': video['bio'],
                'videoUrl': video['video_url'],
                'coverUrl': video['cover_url'],
                'duration': video['duration'],
                'createTime': video['create_time'].strftime('%Y-%m-%d %H:%M:%S'),
                'love': video['love'],
                'watch': video['watch'],
                'collect': video['collect']
            })
        
        # 返回结果
        return jsonify({
            'code': 200,
            'message': '获取成功',
            'data': {
                'videos': formatted_videos,
                'pagination': {
                    'currentPage': page,
                    'pageSize': page_size,
                    'totalPages': total_pages,
                    'totalVideos': total_videos
                }
            }
        }), 200
        
    except Exception as e:
        logging.error(f"获取用户视频失败: {str(e)}")
        return jsonify({'code': 500, 'message': f'服务器错误: {str(e)}'}), 500
    
@user_bp.route('/user/allVideos',methods=['GET'])
def UserAllVideos():
    """获取用户的所有视频列表（包括未审核和已删除的视频）"""
    try:
        # 获取查询参数
        user_id = request.args.get('userId')
        page = int(request.args.get('page', 1))
        page_size = int(request.args.get('pageSize', 12))
        sort = request.args.get('sort', 'newest')
        
        # 验证必要参数
        if not user_id:
            return jsonify({'code': 400, 'message': '用户ID不能为空'}), 400
            
        # 计算偏移量
        offset = (page - 1) * page_size
        
        # 构建排序条件
        order_by = "create_time DESC"  # 默认按创建时间降序
        if sort == 'oldest':
            order_by = "create_time ASC"
        elif sort == 'popular':
            order_by = "watch DESC, love DESC"
            
        # 查询视频总数
        count_result = db.fetchOne(
            "SELECT COUNT(*) as total FROM videoinfo WHERE upload_user = %s",
            [user_id]
        )
        total_videos = count_result['total'] if count_result else 0
        total_pages = (total_videos + page_size - 1) // page_size
        
        # 查询视频列表
        videos = db.fetchAll(
            f"""
            SELECT id, title, bio, video_url, cover_url, duration, create_time, love, watch, collect, isdel, ischeck 
            FROM videoinfo 
            WHERE upload_user = %s 
            ORDER BY {order_by}
            LIMIT %s, %s
            """,
            [user_id, offset, page_size]
        )
        
        # 格式化视频数据
        formatted_videos = []
        for video in videos:
            formatted_videos.append({
                'id': video['id'],
                'title': video['title'],
                'bio': video['bio'],
                'videoUrl': video['video_url'],
                'coverUrl': video['cover_url'],
                'duration': video['duration'],
                'createTime': video['create_time'].strftime('%Y-%m-%d %H:%M:%S'),
                'love': video['love'],
                'watch': video['watch'],
                'collect': video['collect'],
                'isDeleted': video['isdel'] == 1,
                'isChecked': video['ischeck'] == 1
            })
        
        # 返回结果
        return jsonify({
            'code': 200,
            'message': '获取成功',
            'data': {
                'videos': formatted_videos,
                'pagination': {
                    'currentPage': page,
                    'pageSize': page_size,
                    'totalPages': total_pages,
                    'totalVideos': total_videos
                }
            }
        }), 200
        
    except Exception as e:
        logging.error(f"获取用户视频失败: {str(e)}")
        return jsonify({'code': 500, 'message': f'服务器错误: {str(e)}'}), 500