from flask import Blueprint, jsonify, request
from mysql import MySql

video_bp = Blueprint('video', __name__)

# 初始化数据库连接
db = MySql('127.0.0.1', 'hachimi', 'hachimi', 'Li8jXNhXnKRLR4EX')

@video_bp.route('/video', methods=['GET'])
def get_video_info():
    try:
        video_id = request.args.get('id')
        if not video_id:
            return jsonify({'error': '缺少视频ID参数'}), 400

        # 查询视频信息
        sql = """
            SELECT v.*, u.username, u.avatar_url as uploader_avatar
            FROM videoinfo v
            JOIN userinfo u ON v.upload_user = u.id
            WHERE v.id = %s AND v.isdel = 0
        """
        video = db.fetchOne(sql, (video_id,))
        
        if not video:
            return jsonify({'error': '视频不存在'}), 404

        # 构建返回数据
        response_data = {
            'id': video['id'],
            'title': video['title'],
            'description': video['bio'],
            'videoUrl': video['video_url'],
            'coverUrl': video['cover_url'],
            'uploadTime': video['create_time'].strftime('%Y-%m-%d %H:%M:%S'),
            'likeCount': video['love'],
            'viewCount': video['watch'],
            'collectCount': video['collect'],
            'uploader': {
                'userId': video['upload_user'],
                'username': video['username'],
                'avatar': video['uploader_avatar']
            }
        }

        return jsonify(response_data)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@video_bp.route('/videoComment', methods=['GET'])
def get_video_comments():
    try:
        video_id = request.args.get('id')
        page = int(request.args.get('page', 1))
        page_size = int(request.args.get('pageSize', 10))
        sort = request.args.get('sort', 'latest')

        if not video_id:
            return jsonify({'error': '缺少视频ID参数'}), 400

        # 计算偏移量
        offset = (page - 1) * page_size

        # 构建排序条件
        order_by = "c.create_time DESC" if sort == 'latest' else "c.love DESC"

        # 查询评论总数
        count_sql = """
            SELECT COUNT(*) as total
            FROM comment c
            WHERE c.video_id = %s AND c.isdel = 0
        """
        total_count = db.fetchOne(count_sql, (video_id,))['total']
        total_pages = (total_count + page_size - 1) // page_size

        # 查询评论列表
        sql = """
            SELECT 
                c.id as commentId,
                c.content,
                c.create_time,
                c.parent_id,
                u.id as userId,
                u.username,
                u.avatar_url as avatar
            FROM comment c
            JOIN userinfo u ON c.user_id = u.id
            WHERE c.video_id = %s AND c.isdel = 0
            ORDER BY {order_by}
            LIMIT %s OFFSET %s
        """.format(order_by=order_by)

        comments = db.fetchAll(sql, (video_id, page_size, offset))

        # 格式化评论数据
        formatted_comments = []
        for comment in comments:
            formatted_comments.append({
                'commentId': comment['commentId'],
                'content': comment['content'],
                'createTime': comment['create_time'].strftime('%Y-%m-%d %H:%M:%S'),
                'parentId': comment['parent_id'],
                'user': {
                    'userId': comment['userId'],
                    'username': comment['username'],
                    'avatar': comment['avatar']
                }
            })

        return jsonify({
            'comments': formatted_comments,
            'pagination': {
                'currentPage': page,
                'pageSize': page_size,
                'totalPages': total_pages,
                'totalCount': total_count
            }
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@video_bp.route('/video/addComment', methods=['POST'])
def add_comment():
    try:
        data = request.get_json()
        print(data)
        video_id = data.get('videoId')
        content = data.get('content')
        user_id = data.get('userId')  # 从请求中获取用户ID
        parent_id = data.get('parentId', 0)  # 可选参数，默认为0（一级评论）

        if not all([video_id, content, user_id]):
            return jsonify({'error': '缺少必要参数'}), 400

        # 插入评论
        insert_sql = """
            INSERT INTO comment (video_id, user_id, content, parent_id)
            VALUES (%s, %s, %s, %s)
        """
        db.doSql(insert_sql, (video_id, user_id, content, parent_id))
        db.commit()
        # 获取新插入的评论信息
        select_sql = """
            SELECT 
                c.id as commentId,
                c.content,
                c.create_time,
                c.parent_id,
                u.id as userId,
                u.username,
                u.avatar_url as avatar
            FROM comment c
            JOIN userinfo u ON c.user_id = u.id
            WHERE c.video_id = %s 
            AND c.user_id = %s 
            AND c.content = %s
            ORDER BY c.id DESC
            LIMIT 1
        """
        new_comment = db.fetchOne(select_sql, (video_id, user_id, content))
        
        if not new_comment:
            return jsonify({'error': '评论创建失败'}), 500

        # 格式化返回数据
        formatted_comment = {
            'commentId': new_comment['commentId'],
            'content': new_comment['content'],
            'createTime': new_comment['create_time'].strftime('%Y-%m-%d %H:%M:%S'),
            'parentId': new_comment['parent_id'],
            'user': {
                'userId': new_comment['userId'],
                'username': new_comment['username'],
                'avatar': new_comment['avatar']
            }
        }

        return jsonify({
            'success': True,
            'comment': formatted_comment
        })

    except Exception as e:
        print(e)
        return jsonify({'error': str(e)}), 500
