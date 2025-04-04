from flask import Blueprint, request, jsonify
from mysql import MySql
import logging

# 创建蓝图
user_bp = Blueprint('user', __name__)

# 数据库连接
db = MySql('127.0.0.1', 'hachimi', 'hachimi', 'Li8jXNhXnKRLR4EX')
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
        if not username or not pwd:
            return jsonify({'code': 400, 'message': '用户名和密码不能为空'}), 400

        # 验证用户
        user = db.fetchOne(
            "SELECT id, username, pwd FROM userinfo WHERE username = %s",
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