package redis

import (
	"context"

	"github.com/bhav-07/haven/config"
	"github.com/go-redis/redis/v8"
	"github.com/gofiber/fiber/v2/log"
)

var RedisClient *redis.Client
var PubSubConnection *redis.PubSub

func InitializeRedis() {

	ctx := context.Background()
	RedisClient = redis.NewClient(config.GetRedisConfig())

	PubSubConnection = RedisClient.Subscribe(ctx)

	if err := RedisClient.Ping(ctx).Err(); err != nil {
		panic(err)
	}
	log.Info("Redis connected successfully")
}
