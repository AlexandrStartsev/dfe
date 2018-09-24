package com.arrow.common;

public class EnvironmentInfo {
	public static EnvironmentInfo getInstance() {
		return null;
	}
	
	public String getBaseAExStaticUrl() {
		return "http://localhost:8080/static";
	}
	
	public static String g(final String f) {
		return f;
	}
}
