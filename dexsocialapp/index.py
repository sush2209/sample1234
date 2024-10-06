import redis

# Connect to Redis
redis_client = redis.StrictRedis(
    host='157.173.105.31',  # Redis server IP
    port=6379,              # Redis server port for 'default' cache
    password='Fuvf8LJKMb6uyjtjZSTdlikACNNjEr0n2Or6rZNZHLeZp7njgcAqrtEdQISAtiGL',  # Password for 'default' Redis cache
    db=0                    # Database number for 'default' cache
)

# Flush the database
try:
    redis_client.flushdb()
    print("Redis database flushed successfully.")
except Exception as e:
    print(f"An error occurred: {e}")
