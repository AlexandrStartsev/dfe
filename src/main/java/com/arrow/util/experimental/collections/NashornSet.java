package com.arrow.util.experimental.collections;

import java.util.function.Consumer;

import com.arrow.util.experimental.collections.NashornMap.LinkedEntry;

public class NashornSet<K> {

	private NashornMap<K, Object> map = new NashornMap<>();

	public NashornSet() {}
	
	public NashornSet<K> add(K key) {
		this.map.set(key, key);
		return this;
	}
	
	public void clear() {
		this.map.clear();
	}
	
	public int size() {
		return this.map.size;
	}

	public boolean delete(K key) {
		boolean ret = this.map.delete(key);
		return ret;
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
	
	public void forEach(Consumer<K> action) {
		for( LinkedEntry<K, Object> e = this.map.first; e != null; e = e.next ) {
			action.accept(e.key);
		}
    }	

}
