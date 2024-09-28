import redis

# Connect to the Redis server
redis_url = "redis://:Fuvf8LJKMb6uyjtjZSTdlikACNNjEr0n2Or6rZNZHLeZp7njgcAqrtEdQISAtiGL@157.173.105.31:6379/0"
r = redis.from_url(redis_url)

# Example: Get all keys
r.flushdb()
# import pymysql

# # Database connection details
# db_config = {
#     'user': 'mysql',  # Username from the URL
#     'password': '3w8gmNoTACqqaiwLyI5pdJVo3aS6eAAQA4WbWaLFd8FWY15MqXtKLcEB1QWShd2w',  # Password
#     'host': '157.173.105.31',  # Host
#     'database': 'default',  # Database name
#     'port': 3306
# }

# # Connect to the MySQL database
# connection = pymysql.connect(**db_config)
# cursor = connection.cursor()

# try:
#     # Query to get all tables in the database
#     cursor.execute("SHOW TABLES;")
#     tables = cursor.fetchall()

#     # Print each table name
#     for table in tables:
#         print(table[])

# finally:
#     # Close the cursor and connection
#     cursor.close()
#     connection.close()
