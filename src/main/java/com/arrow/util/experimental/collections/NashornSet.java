package com.arrow.util.experimental.collections;

import static jdk.nashorn.internal.runtime.Context.getGlobal;

import java.util.function.BiConsumer;
import java.util.function.Consumer;

import com.arrow.util.experimental.collections.NashornMap.LinkedEntry;

import jdk.nashorn.api.scripting.ScriptObjectMirror;

@SuppressWarnings("restriction")
public class NashornSet<K> {

	public final static JSPrototype prototype = new JSPrototype();

	private NashornMap<K, Object> map = new NashornMap<>();
	public int size = 0;
	public final Object constructor;
	
	public NashornSet() {
		this.constructor = prototype.constructor; 
	}
	
	@SuppressWarnings("unchecked")
	public NashornSet(Object obj) {
		this.constructor = prototype.constructor; 
		if(obj instanceof ScriptObjectMirror) {
			((ScriptObjectMirror)obj).forEach(new BiConsumer<String, Object>() {
				@Override
				public void accept(String t, Object u) {
					NashornSet.this.add((K)u);
				}
			});
		}
		if(obj instanceof NashornSet) {
			((NashornSet<K>)obj).map.map.keySet().forEach(new Consumer<K>() {
				@Override
				public void accept(K t) {
					NashornSet.this.add(t);
				}
			});
		}
	} 
	
	public NashornSet<K> add(K key) {
		this.map.set(key, key);
		this.size = this.map.size; 
		return this;
	}
	
	public void clear() {
		this.map.clear();
		this.size = this.map.size; 
	}
	
	public boolean delete(K key) {
		boolean ret = this.map.delete(key);
		this.size = this.map.size; 
		return ret;
	}
	
	public int _size() {
		return this.size;
	}
	
	public boolean remove(K key) {
		return delete(key);
	}	
	
	public NashornIterator<K> entries() {
		return this.map.keys();
	}
	
	public boolean has(K key) {
		return this.map.has(key);
	}
	
	public NashornIterator<K> values() {
		return entries();
	}
	
	public NashornIterator<K> keys() {
		return entries();
	}	
	
	public void forEach(ScriptObjectMirror action) {
		this.forEach(action, getGlobal());
    }	

	public void forEach(ScriptObjectMirror action, Object ctx) {
		for( LinkedEntry<K, Object> e = this.map.first; e != null; e = e.next ) {
			action.call(ctx, e.key);
		}
    }	
	
	public void forEach(Consumer<K> action) {
		for( LinkedEntry<K, Object> e = this.map.first; e != null; e = e.next ) {
			action.accept(e.key);
		}
    }		
}