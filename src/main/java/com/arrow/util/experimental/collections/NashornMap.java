package com.arrow.util.experimental.collections;

import static jdk.nashorn.internal.runtime.Context.getGlobal;

import java.util.HashMap;
import java.util.Map;
import java.util.function.BiConsumer;

import jdk.nashorn.api.scripting.ScriptObjectMirror;
import jdk.nashorn.internal.runtime.ScriptRuntime;


@SuppressWarnings({ "restriction" })
public class NashornMap<K, V> {

	public final static JSPrototype prototype = new JSPrototype();
	
	public static class LinkedEntry<K, V> {
		public K key;
		public V value;
		public LinkedEntry<K, V> next, prev;
		public LinkedEntry(K key, V value) { 
			this.key = key;
			this.value = value;
			this.next = null;
		}
	}

	protected Map<K, LinkedEntry<K, V>> map = new HashMap<>();
	protected LinkedEntry<K, V> first = null, last = null;
	public int size = 0;
	public final Object constructor;
	
	public NashornMap() { 
		this.constructor = prototype.constructor; 
	}
	
	// TODO: fill map if obj is "iterable", aka [[k, v], [k, v], ...], has forEach or so, but since browser support for this is questionable it s unlikely to be used  
	public NashornMap(ScriptObjectMirror obj) { 
		this.constructor = prototype.constructor; 
		throw new UnsupportedOperationException();
	}
	
	public void clear() {
		this.size = 0;
		this.map.clear();
		this.first = this.last = null;
	}
	
	public boolean delete(K key) {
		LinkedEntry<K, V> e = this.map.remove(key);
		this.size = this.map.size();
		if(e != null) {
			if(e == this.last) this.last = e.prev;
			if(e == this.first) this.first = e.next;
			if(e.prev != null) e.prev.next = e.next;
			if(e.next != null) e.next.prev = e.prev;
		}
		return e != null;
	}
	
	public int _size() {
		return this.size;
	}	
	
	public V get(K key) {
		LinkedEntry<K, V> e = this.map.get(key);
		return e == null ? (V)ScriptRuntime.UNDEFINED : e.value;
	}
	
	public boolean has(K key) {
		return this.map.containsKey(key);
	}
	
	
	public void forEach(ScriptObjectMirror action) {
		this.forEach(action, getGlobal());
    }
	
	public void forEach(ScriptObjectMirror action, Object ctx) {
		for( LinkedEntry<K, V> e = this.first; e != null; e = e.next ) {
			action.call(ctx, e.value, e.key);
		}
    }
	
	public void forEach(BiConsumer<V, K> action) {
		for( LinkedEntry<K, V> e = this.first; e != null; e = e.next ) {
			action.accept(e.value, e.key);
		}
    }
	
	public NashornMap<K, V> set(K key, V value) {
		LinkedEntry<K, V> e = new LinkedEntry<>(key, value);
		this.map.put(key, e);
		this.size = this.map.size();
		e.prev = this.last;
		if(this.last != null) this.last.next = e;
		if(this.first == null) this.first = e;
		this.last = e;
		return this;
	}	
	
	public NashornIterator<Object []> entries() {
		return new NashornIterator<Object[]>() {
			LinkedEntry<K, V> e = null;
			boolean started = false;
			
			@Override
			public Result<Object[]> next() {
				if(!this.started) {
					this.e = NashornMap.this.first;
					this.started = true;
				}
				Result<Object []> ret;
				if(this.e == null)
					ret = new Result<>(null, true);
				else {
					ret = new Result<>(new Object[] {this.e.key, this.e.value}, false);
					this.e = this.e.next;
				}
				return ret;
			}
		};
	}
	
	public NashornIterator<K> keys() {
		return new NashornIterator<K>() {
			LinkedEntry<K, V> e = null;
			boolean started = false;
			
			@Override
			public Result<K> next() {
				if(!this.started) {
					this.e = NashornMap.this.first;
					this.started = true;
				}
				Result<K> ret;
				if(this.e == null)
					ret = new Result<>(null, true);
				else {
					ret = new Result<>(this.e.key, false);
					this.e = this.e.next;
				}
				return ret;
			}
		};		
	}
	
	public NashornIterator<V> values() {
		return new NashornIterator<V>() {
			LinkedEntry<K, V> e = null;
			boolean started = false;
			
			@Override
			public Result<V> next() {
				if(!this.started) {
					this.e = NashornMap.this.first;
					this.started = true;
				}
				Result<V> ret;
				if(this.e == null)
					ret = new Result<>(null, true);
				else {
					ret = new Result<>(this.e.value, false);
					this.e = this.e.next;
				}
				return ret;
			}
		};			
	}
}