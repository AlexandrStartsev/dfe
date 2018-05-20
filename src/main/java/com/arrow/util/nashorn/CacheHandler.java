package com.arrow.util.nashorn;

import java.util.concurrent.Callable;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.function.Function;

import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;

public class CacheHandler {

	private final Cache<String, Object> cache;
	private final static ConcurrentHashMap<String, CacheHandler> sharedCache = new ConcurrentHashMap<>(); 
	
	public CacheHandler() {
		this.cache = CacheBuilder.newBuilder().build();
	}
	
	public CacheHandler(String maxSize) {
		this.cache = CacheBuilder.newBuilder().maximumSize(Long.valueOf(maxSize).longValue()).build();
	}
	
	public CacheHandler(String maxSize, String lifeSpan) {
		this.cache = CacheBuilder.newBuilder().expireAfterWrite(Long.valueOf(lifeSpan).longValue(), TimeUnit.MINUTES)
											.maximumSize(Long.valueOf(maxSize).longValue()).build();
	}
	
	public static CacheHandler sharedCache(String name, String maxSize, String lifeSpan) {
		return CacheHandler.sharedCache.computeIfAbsent(name, new Function<String, CacheHandler>() {
			@Override
			public CacheHandler apply(String t) {
				return new CacheHandler(maxSize, lifeSpan);
			}
		});
	} 
	
	public Object get(String key) throws ExecutionException {
		return this.cache.getIfPresent(key);
	}

	public Object get(String key, Callable<Object> callable) throws ExecutionException {
		return this.cache.get(key, callable);
	}

	@SuppressWarnings("restriction")
	public Object get(String key, jdk.nashorn.api.scripting.ScriptObjectMirror callable, Object _this) throws ExecutionException {
		return callable == null ? this.cache.getIfPresent(key) : 
			this.cache.get(key, new Callable<Object>() {
				@Override
				public Object call() throws Exception {
					return callable.call(_this);
				}
			});
	}
	
	public boolean set(String key, Object value) {
		return put(key, value);
	}
	
	public boolean put(String key, Object value) {
		this.cache.put(key, value);
		return true;
	}
	
	public boolean has(String key) {
		return this.cache.getIfPresent(key) != null;
	}
	
	public void invalidate(String key) {
		this.cache.invalidate(key);
	}
	
	public void clear() {
		this.cache.invalidateAll();
	}
}
