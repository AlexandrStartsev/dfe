package com.arrow.util.experimental;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;

public class CacheHandler {

	private final Cache<String, Object> cache;
	
	private final static Map<String, CacheHandler> sharedCache = new ConcurrentHashMap<>(); 
	
	public CacheHandler(String maxSize, String lifeSpan) {
		this.cache = CacheBuilder.newBuilder().expireAfterWrite(Long.valueOf(lifeSpan).longValue(), TimeUnit.MINUTES)
											.maximumSize(Long.valueOf(maxSize).longValue()).build();
	}
	
	public static CacheHandler sharedCache(String name, String maxSize, String lifeSpan) {
		return CacheHandler.sharedCache.getOrDefault(name, new CacheHandler(maxSize, lifeSpan));
	} 
	
	public Object get(String key) {
		return this.cache.getIfPresent(key);
	}
	
	public boolean set(String key, Object value) {
		return put(key, value);
	}
	
	public boolean put(String key, Object value) {
		this.cache.put(key, value);
		return true;
	}
}
