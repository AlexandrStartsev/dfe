package com.arrow.util.nashorn.collections;

public interface NashornIterator<T> {

	public static class Result<T> {
		public T value;
		public boolean done; 
		
		public Result(T value, boolean done) {
			this.value = value;
			this.done = done;
		}
	} 
	
	public Result<T> next();
	
}
