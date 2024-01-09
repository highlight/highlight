from highlight_io.integrations.redis import RedisIntegration


def test_redis():
    integration = RedisIntegration()
    integration.enable()
    integration.disable()
