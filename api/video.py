import os
from flask import Blueprint, jsonify, request
from mysql import MySql
from dotenv import load_dotenv
import logging

# 加载.env文件中的环境变量
load_dotenv('config.env')

video_bp = Blueprint('video', __name__)

# 从环境变量中获取数据库配置
db_host = os.getenv('DB_HOST')
db_name = os.getenv('DB_NAME')
db_user = os.getenv('DB_USER')
db_password = os.getenv('DB_PASSWORD')
db_port = int(os.getenv('DB_PORT'))

# 数据库连接
db = MySql(db_host, db_name, db_user, db_password, db_port)

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

@video_bp.route('/video/searchVideos', methods=['GET'])
def searchVideos():
    """搜索视频接口"""
    try:
        # 获取查询参数
        keyword = request.args.get('keyword', '')
        page = int(request.args.get('page', 1))
        page_size = int(request.args.get('pageSize', 10))
        sort = request.args.get('sort', 'newest')
        
        # 验证参数
        if not keyword:
            return jsonify({'code': 400, 'message': '搜索关键词不能为空'}), 400
            
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
            "SELECT COUNT(*) as total FROM videoinfo WHERE (title LIKE %s OR bio LIKE %s) AND isdel = 0 AND ischeck = 1",
            [f'%{keyword}%', f'%{keyword}%']
        )
        total_videos = count_result['total'] if count_result else 0
        total_pages = (total_videos + page_size - 1) // page_size
        
        # 查询视频列表
        videos = db.fetchAll(
            f"""
            SELECT v.id, v.title, v.bio, v.video_url, v.cover_url, v.duration, v.create_time, 
                   v.love, v.watch, v.collect, v.upload_user, u.username, u.avatar_url
            FROM videoinfo v
            LEFT JOIN userinfo u ON v.upload_user = u.id
            WHERE (v.title LIKE %s OR v.bio LIKE %s) AND v.isdel = 0 AND v.ischeck = 1
            ORDER BY {order_by}
            LIMIT %s, %s
            """,
            [f'%{keyword}%', f'%{keyword}%', offset, page_size]
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
                'user': {
                    'userId': video['upload_user'],
                    'username': video['username'],
                    'avatar': video['avatar_url']
                }
            })
        
        # 返回结果
        return jsonify({
            'code': 200,
            'message': '搜索成功',
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
        logging.error(f"搜索视频失败: {str(e)}")
        return jsonify({'code': 500, 'message': f'服务器错误: {str(e)}'}), 500
    
@video_bp.route('/video/hotVideos', methods=['GET'])
def hotVideos():
    try:
        # 获取参数，限制最多返回10个视频
        limit = min(int(request.args.get('limit', 10)), 10)
        
        # 查询近七日播放量最高的视频
        sql = """
            SELECT v.id, v.title, v.bio, v.video_url, v.cover_url, v.duration, v.create_time, 
                   v.love, v.watch, v.collect, v.upload_user, u.username, u.avatar_url
            FROM videoinfo v
            LEFT JOIN userinfo u ON v.upload_user = u.id
            WHERE v.isdel = 0 AND v.ischeck = 1
            AND v.create_time >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            ORDER BY v.watch DESC
            LIMIT %s
        """
        
        videos = db.fetchAll(sql, (limit,))
        
        # 格式化视频数据
        formatted_videos = []
        for video in videos:
            formatted_videos.append({
                'id': video['id'],
                'title': video['title'],
                'description': video['bio'],
                'videoUrl': video['video_url'],
                'coverUrl': video['cover_url'],
                'duration': video['duration'],
                'createTime': video['create_time'].strftime('%Y-%m-%d %H:%M:%S'),
                'likeCount': video['love'],
                'viewCount': video['watch'],
                'collectCount': video['collect'],
                'uploader': {
                    'userId': video['upload_user'],
                    'username': video['username'],
                    'avatar': video['avatar_url']
                }
            })
        
        return jsonify({
            'code': 200,
            'message': '获取热门视频成功',
            'data': formatted_videos
        }), 200
        
    except Exception as e:
        logging.error(f"获取热门视频失败: {str(e)}")
        return jsonify({'code': 500, 'message': f'服务器错误: {str(e)}'}), 500
    
@video_bp.route('/video/randomVideos', methods=['GET'])
def randomVideos():
    try:
        # 获取参数，限制最多返回10个视频
        limit = min(int(request.args.get('limit', 10)), 10)
        
        # 查询近七日内的随机视频
        sql = """
            SELECT v.id, v.title, v.bio, v.video_url, v.cover_url, v.duration, v.create_time, 
                   v.love, v.watch, v.collect, v.upload_user, u.username, u.avatar_url
            FROM videoinfo v
            LEFT JOIN userinfo u ON v.upload_user = u.id
            WHERE v.isdel = 0 AND v.ischeck = 1
            AND v.create_time >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            ORDER BY RAND()
            LIMIT %s
        """
        
        videos = db.fetchAll(sql, (limit,))
        
        # 格式化视频数据
        formatted_videos = []
        for video in videos:
            formatted_videos.append({
                'id': video['id'],
                'title': video['title'],
                'description': video['bio'],
                'videoUrl': video['video_url'],
                'coverUrl': video['cover_url'],
                'duration': video['duration'],
                'createTime': video['create_time'].strftime('%Y-%m-%d %H:%M:%S'),
                'likeCount': video['love'],
                'viewCount': video['watch'],
                'collectCount': video['collect'],
                'uploader': {
                    'userId': video['upload_user'],
                    'username': video['username'],
                    'avatar': video['avatar_url']
                }
            })
        
        return jsonify({
            'success': True,
            'videos': formatted_videos,
            'message': '获取随机视频成功'
        })
        
    except Exception as e:
        logging.error(f"获取随机视频失败: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'服务器错误: {str(e)}'
        }), 500