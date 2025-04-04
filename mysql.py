import pymysql
from pymysql.cursors import DictCursor
import logging

# 配置日志
logging.basicConfig(
    level=logging.INFO,  # 设置日志级别
    format='%(asctime)s - %(levelname)s - %(message)s',  # 设置日志格式
    handlers=[
        # logging.FileHandler('mysql.log'),  # 输出到文件
        logging.StreamHandler()  # 输出到控制台
    ]
)

class MySql:
    def __init__(self, host, dbname, username, pwd, port=3306, charset='utf8mb4'):
        """
        初始化MySQL连接
        :param host: 数据库主机地址
        :param dbname: 数据库名称
        :param username: 用户名
        :param pwd: 密码
        :param port: 端口号，默认3306
        :param charset: 字符集，默认utf8mb4
        """
        self.host = host
        self.dbname = dbname
        self.username = username
        self.pwd = pwd
        self.port = port
        self.charset = charset
        self.conn = None
        self.cursor = None
        self.connect()

    def connect(self):
        """建立数据库连接"""
        try:
            self.conn = pymysql.connect(
                host=self.host,
                port=self.port,
                user=self.username,
                password=self.pwd,
                database=self.dbname,
                charset=self.charset,
                cursorclass=DictCursor
            )
            self.cursor = self.conn.cursor()
            logging.info("数据库连接成功")
        except Exception as e:
            logging.error(f"数据库连接失败: {str(e)}")
            raise

    def close(self):
        """关闭数据库连接"""
        if self.cursor:
            self.cursor.close()
        if self.conn:
            self.conn.close()
        logging.info("数据库连接已关闭")

    def commit(self):
        """提交事务"""
        try:
            self.conn.commit()
            logging.info("事务提交成功")
        except Exception as e:
            self.conn.rollback()
            logging.error(f"事务提交失败: {str(e)}")
            raise

    def rollback(self):
        """回滚事务"""
        try:
            self.conn.rollback()
            logging.info("事务回滚成功")
        except Exception as e:
            logging.error(f"事务回滚失败: {str(e)}")
            raise

    def doSql(self, sql, params=None):
        """
        执行SQL语句
        :param sql: SQL语句
        :param params: 参数列表或字典
        :return: 执行结果
        """
        self.connect()
        try:
            if params:
                self.cursor.execute(sql, params)
            else:
                self.cursor.execute(sql)
            return self.cursor
        except Exception as e:
            logging.error(f"SQL执行失败: {str(e)}")
            self.rollback()
            raise

    def fetchOne(self, sql, params=None):
        """
        获取单条记录
        :param sql: SQL语句
        :param params: 参数列表或字典
        :return: 单条记录
        """
        try:
            self.doSql(sql, params)
            res=self.cursor.fetchone()
            print(f"fetchOne{res}")
            return res
        except Exception as e:
            logging.error(f"获取单条记录失败: {str(e)}")
            raise

    def fetchAll(self, sql, params=None):
        """
        获取所有记录
        :param sql: SQL语句
        :param params: 参数列表或字典
        :return: 所有记录
        """
        try:
            self.doSql(sql, params)
            return self.cursor.fetchall()
        except Exception as e:
            logging.error(f"获取所有记录失败: {str(e)}")
            raise

    def insert(self, table, data):
        """
        插入数据
        :param table: 表名
        :param data: 数据字典
        :return: 插入的行数
        """
        try:
            keys = ', '.join(data.keys())
            values = ', '.join(['%s'] * len(data))
            sql = f"INSERT INTO {table} ({keys}) VALUES ({values})"
            return self.doSql(sql, list(data.values())).rowcount
        except Exception as e:
            logging.error(f"插入数据失败: {str(e)}")
            raise

    def update(self, table, data, where):
        """
        更新数据
        :param table: 表名
        :param data: 更新的数据字典
        :param where: WHERE条件
        :return: 影响的行数
        """
        try:
            set_clause = ', '.join([f"{k} = %s" for k in data.keys()])
            sql = f"UPDATE {table} SET {set_clause} WHERE {where}"
            print(sql,list(data.values()))
            return self.doSql(sql, list(data.values())).rowcount
        except Exception as e:
            logging.error(f"更新数据失败: {str(e)}")
            raise

    def delete(self, table, where):
        """
        删除数据
        :param table: 表名
        :param where: WHERE条件
        :return: 影响的行数
        """
        try:
            sql = f"DELETE FROM {table} WHERE {where}"
            return self.doSql(sql).rowcount
        except Exception as e:
            logging.error(f"删除数据失败: {str(e)}")
            raise

    def execute_sql_file(self, file_path):
        """
        执行SQL文件
        :param file_path: SQL文件路径
        """
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                sql_commands = f.read().split(';')
                for command in sql_commands:
                    if command.strip():
                        self.doSql(command)
            self.commit()
            logging.info(f"成功执行SQL文件: {file_path}")
        except Exception as e:
            self.rollback()
            logging.error(f"执行SQL文件失败: {str(e)}")
            raise

    def __enter__(self):
        """支持上下文管理器"""
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        """支持上下文管理器"""
        self.close()