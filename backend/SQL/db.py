import pymysql

MYSQL_HOST = "127.0.0.1"
MYSQL_PORT = 3312
MYSQL_USER = "root"
MYSQL_PASSWORD = ""
MYSQL_DATABASE = "quanlycuahangdouong"


def get_connection():
    connection = pymysql.connect(
        host=MYSQL_HOST,
        port=MYSQL_PORT,
        user=MYSQL_USER,
        password=MYSQL_PASSWORD,
        database=MYSQL_DATABASE,
        cursorclass=pymysql.cursors.DictCursor,
    )
    return connection